import type { Recipe } from '../types.ts';

/**
 * Generic recipe for self-hosted llama.cpp / vLLM / sglang servers exposing
 * the OpenAI-compatible /v1/* endpoint.
 *
 * Designed for users running open-weight chat models (Qwen, MiniMax, Mistral,
 * DeepSeek, Llama, etc.) on their own hardware — laptop, workstation, or
 * private GPU server — without going through a managed API.
 *
 * Default base_url is http://localhost:8080/v1 (the llama-server default).
 * Point at a remote host by adding `provider_base_urls.llamacpp` to
 * `~/.gbrain/config.json` (env vars are not auto-read for base_url).
 *
 * `/v1/models` is usually unauthenticated on llama-server, but
 * `/v1/chat/completions` may require a Bearer token if you've enabled
 * `--api-key` on the server. Set LLAMACPP_API_KEY when needed; gbrain
 * resolves it via the auto `<RECIPE_ID>_API_KEY` convention.
 *
 * llama-server does NOT serve embedding models in the same process as
 * chat models. Run a separate embedding provider (Ollama BGE-M3 is a
 * solid local choice).
 */
export const llamacpp: Recipe = {
  id: 'llamacpp',
  name: 'llama.cpp / vLLM (self-hosted OpenAI-compatible)',
  tier: 'openai-compat',
  implementation: 'openai-compatible',
  base_url_default: 'http://localhost:8080/v1',
  auth_env: {
    required: [],
    optional: ['LLAMACPP_API_KEY'],
  },
  touchpoints: {
    expansion: {
      models: [
        'Qwen3.5-35B-A3B-MXFP4_MOE.gguf',
        'MiniMax-M2.5-UD-IQ2_XXS-00001-of-00003.gguf',
      ],
      cost_per_1m_tokens_usd: 0,
      price_last_verified: '2026-05-06',
    },
    chat: {
      models: [
        'Qwen3.5-35B-A3B-MXFP4_MOE.gguf',
        'MiniMax-M2.5-UD-IQ2_XXS-00001-of-00003.gguf',
      ],
      supports_tools: true,
      supports_subagent_loop: false,
      supports_prompt_cache: false,
      max_context_tokens: 262144,
      cost_per_1m_input_usd: 0,
      cost_per_1m_output_usd: 0,
      price_last_verified: '2026-05-06',
    },
  },
  aliases: {
    'qwen3.5-35b': 'Qwen3.5-35B-A3B-MXFP4_MOE.gguf',
    'qwen35-35b': 'Qwen3.5-35B-A3B-MXFP4_MOE.gguf',
    'minimax-m2.5': 'MiniMax-M2.5-UD-IQ2_XXS-00001-of-00003.gguf',
  },
  setup_hint:
    'Add `base_urls.llamacpp` in ~/.gbrain/config.json (or provider_base_urls.llamacpp in gbrain.yml) to point at your llama-server endpoint. Use --chat-model llamacpp:qwen3.5-35b for the friendly alias. Set LLAMACPP_API_KEY env var if your server enforces Bearer auth.',
};
