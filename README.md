# Tetrosius

Tetrosius is a browser-based puzzle prototype built with plain HTML, CSS, and JavaScript.

## Local development

Requirements:
- Node.js 18+

Commands:

```bash
npm install
npm run dev
```

Tests:

```bash
npm test
```

## Cloudflare Pages

This project can be deployed to Cloudflare Pages as a static site.

Recommended settings:
- Framework preset: `None`
- Build command: leave empty or use `exit 0`
- Build output directory: `.`
- Root directory: `/`

After connecting the repository, Cloudflare Pages will serve `index.html` directly.

## Files not intended for Git

The following are excluded in `.gitignore`:
- `docs/`
- `Specification_draft.md`
