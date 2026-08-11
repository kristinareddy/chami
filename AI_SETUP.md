# Chami AI Setup

## Current status

v24 retains the controlled AI architecture introduced in v17, but AI is **disabled by default**.

This is intentional. GitHub Pages is static hosting and must never contain an OpenAI API key.

Without a server endpoint, Chami uses its deterministic local story/explanation fallback and remains fully functional.

The v24 phonics engine and scaffold decisions are fully local and deterministic. They do not require AI, send child data to a model, or allow generated content to alter decoding evidence.

## To enable real AI later

1. Deploy the `server/` gateway on a server/serverless platform.
2. Set `OPENAI_API_KEY` as a server-side environment variable.
3. Set `OPENAI_MODEL` to a model available to that OpenAI project.
4. Restrict `ALLOWED_ORIGIN` to the Chami site.
5. Update `config/family.js`:
   - `ai.enabled = true`
   - `ai.endpoint = "https://YOUR-SERVER/api/chami-ai"`
6. Test fallback behavior by temporarily disconnecting from the network.

## Security rule

Never put `OPENAI_API_KEY` in:
- `index.html`,
- JavaScript,
- GitHub repository files,
- the PWA manifest,
- localStorage.

## Product direction

Do not add unrestricted child chat. Add narrowly-scoped AI abilities one at a time and evaluate whether each one improves learning.
