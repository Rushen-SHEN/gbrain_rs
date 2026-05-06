# Deployment Profiles

This repository is public. Treat machine-specific setup as documentation, not as
tracked runtime state. Never commit secrets, real API keys, or user-specific shell
profiles. Avoid hard-coding absolute home-directory paths in public docs unless they
are placeholders.

## Branch note

Upstream `main` remains the generic cloud-first reference path.

This fork's `feat/local-embedding` branch is different: it preserves two operator
profiles side-by-side instead of collapsing them into one default:

- `Macmini` — local-first
- `MacbookPro-Work` — hybrid (`local embedding + cloud chat / expansion`)

## Supported profiles

### `Macmini`

Original long-lived profile.

- Deployment style: local-first
- Brain engine: operator-chosen local deployment
- Embeddings: Ollama `bge-m3` (`1024d`)
- Chat: `llamacpp:qwen3.5-35b`
- Expansion: `llamacpp:qwen3.5-35b`
- Agent assumption: do not replace this with upstream's cloud-first defaults

### `MacbookPro-Work`

New hybrid profile for laptop operation.

- Deployment style: hybrid
- Brain engine: local PGLite
- Vault repo: standalone git repo, sibling to the main workspace
- Embeddings: local Ollama `bge-m3` at `1024` dimensions
- Chat / expansion: cloud LLMs
- MCP transport: local stdio via `gbrain serve`

## Compatibility rules

When updating setup docs, agent instructions, or helper scripts:

1. Keep both profiles documented. Do not overwrite one profile with the other.
2. Keep upstream `main` assumptions separate from this fork's assumptions. Do not
   copy "cloud-first by default" from upstream into the fork's host-profile docs.
3. Label profile-specific behavior by host name (`Macmini`, `MacbookPro-Work`) so
   agents know which path they are editing.
4. Keep public docs sanitized:
   - no real API keys
   - no private bearer tokens
   - no machine-local secret file locations
   - no personal data from private vault pages
5. If a machine needs a local path in a private deployment, express it as a pattern
   in public docs, for example `~/Dev-Projects/Vault_Work`, not as a secret-bearing
   environment dump.

## Guidance for agents

Before editing installation docs or agent bootstrap files:

1. Read this file.
2. Decide which profile the task applies to.
3. Make additive edits when the task is profile-specific.
4. If a shared default would break the other profile, document the divergence instead
   of collapsing the two paths into one.
