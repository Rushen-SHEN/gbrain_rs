import { describe, test, expect, beforeEach, mock } from 'bun:test';

const compatibleCalls: Array<{ name: string; baseURL: string; apiKey: string }> = [];
const languageModelCalls: string[] = [];

mock.module('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: ({ name, baseURL, apiKey }: { name: string; baseURL: string; apiKey: string }) => {
    compatibleCalls.push({ name, baseURL, apiKey });
    return {
      languageModel: (modelId: string) => {
        languageModelCalls.push(modelId);
        return { provider: name, modelId };
      },
      textEmbeddingModel: (_modelId: string) => ({ provider: name }),
    };
  },
}));

mock.module('ai', () => ({
  generateText: async () => ({
    text: 'pong',
    content: [{ type: 'text', text: 'pong' }],
    finishReason: 'stop',
    usage: { inputTokens: 1, outputTokens: 1 },
    providerMetadata: {},
  }),
  generateObject: async () => ({
    object: { queries: ['rewrite one', 'rewrite two'] },
  }),
  embed: async () => ({ embedding: [] }),
  embedMany: async () => ({ embeddings: [] }),
}));

const {
  configureGateway,
  resetGateway,
  isAvailable,
  chat,
  expand,
} = await import('../../src/core/ai/gateway.ts');
const { resolveRecipe } = await import('../../src/core/ai/model-resolver.ts');
const { getRecipe } = await import('../../src/core/ai/recipes/index.ts');

describe('llamacpp recipe + optional auth regression', () => {
  beforeEach(() => {
    compatibleCalls.length = 0;
    languageModelCalls.length = 0;
    resetGateway();
  });

  test('recipe is registered with chat and expansion touchpoints', () => {
    const recipe = getRecipe('llamacpp');
    expect(recipe).toBeDefined();
    expect(recipe!.touchpoints.chat).toBeDefined();
    expect(recipe!.touchpoints.expansion).toBeDefined();
    expect(recipe!.auth_env?.optional).toContain('LLAMACPP_API_KEY');
  });

  test('friendly alias resolves to canonical qwen model id', () => {
    const { parsed } = resolveRecipe('llamacpp:qwen3.5-35b');
    expect(parsed.modelId).toBe('Qwen3.5-35B-A3B-MXFP4_MOE.gguf');
  });

  test('chat and expansion are available without a required key', () => {
    configureGateway({
      chat_model: 'llamacpp:qwen3.5-35b',
      expansion_model: 'llamacpp:qwen3.5-35b',
      env: {},
    });
    expect(isAvailable('chat')).toBe(true);
    expect(isAvailable('expansion')).toBe(true);
  });

  test('chat uses LLAMACPP_API_KEY when present', async () => {
    configureGateway({
      chat_model: 'llamacpp:qwen3.5-35b',
      env: { LLAMACPP_API_KEY: 'llamacpp-secret' },
    });

    await chat({
      messages: [{ role: 'user', content: 'ping' }],
    });

    expect(compatibleCalls).toHaveLength(1);
    expect(compatibleCalls[0]).toEqual({
      name: 'llamacpp',
      baseURL: 'http://localhost:8080/v1',
      apiKey: 'llamacpp-secret',
    });
    expect(languageModelCalls).toEqual(['Qwen3.5-35B-A3B-MXFP4_MOE.gguf']);
  });

  test('expansion uses LLAMACPP_API_KEY when present', async () => {
    configureGateway({
      expansion_model: 'llamacpp:qwen3.5-35b',
      env: { LLAMACPP_API_KEY: 'llamacpp-secret' },
    });

    const queries = await expand('ping');

    expect(queries).toEqual(['ping', 'rewrite one', 'rewrite two']);
    expect(compatibleCalls).toHaveLength(1);
    expect(compatibleCalls[0]).toEqual({
      name: 'llamacpp',
      baseURL: 'http://localhost:8080/v1',
      apiKey: 'llamacpp-secret',
    });
    expect(languageModelCalls).toEqual(['Qwen3.5-35B-A3B-MXFP4_MOE.gguf']);
  });
});
