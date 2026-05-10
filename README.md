# Industrials Finance Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_PMOfyrgONHJvMljlGnoGjmFRGugT)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Finance API keys

Use `.env.example` as the safe template:

```bash
cp .env.example .env.local
```

Paste real keys only into `.env.local`. The file is ignored by git, so it stays local and should not be committed.

Keep the finance credentials server-only:

- Use `FINNHUB_API_KEY` for the free primary live quote and forecast feed.
- Use `ALPHA_VANTAGE_API_KEY` as the free fallback.
- Use `FACTSET_USERNAME_SERIAL` and `FACTSET_API_KEY` only if your FactSet account gets the needed entitlements.
- Do not prefix these with `NEXT_PUBLIC_`.
- Never paste real keys into React components, client-side code, screenshots, or committed files.

The dashboard is structured around confidential API-backed projections and market data, with curated fallback data available while keys are missing.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/maxschmieder05-create/v0-salesops-dashboard" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
