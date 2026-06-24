# Deploy na Vercel

## Passo a passo

1. **Suba o repo** para o GitHub (`https://github.com/IF-Goiano-Campus-Hidrolandia-Alunos/TreinamentoOIAA.git`).
   O app web vive na subpasta `web/` (os notebooks Kaggle ficam na raiz).
2. **Importe na Vercel**: New Project -> selecione o repo.
3. **Root Directory = `web`** (essencial — o app nao esta na raiz do repo).
   Framework Preset: **Next.js** (detectado automaticamente).
4. **Environment Variables**:
   - `ADMIN_TOKEN` = um valor forte (ex.: `openssl rand -base64 24`).
     Necessario para POST/DELETE no placar; sem ele, as leituras funcionam mas escritas retornam 503.
5. **Deploy**.

## Build

- Build command: `next build` (padrao)
- Output: gerenciado pela Vercel (Next.js)
- Node: 18+ (a Vercel usa 20.x por padrao; o projeto roda em Node 24 localmente)

## Persistencia do placar (proximo passo, opcional)

Hoje o placar e in-memory (seed em `data/leaderboard.json`). Para que as escritas persistam em
producao, escolha UM adaptador e implemente as mesmas funcoes de `lib/leaderboard-store.ts`
(`listRanked`, `getEntry`, `upsertEntry`, `removeEntry`):

- **Vercel KV** (Redis gerenciado) — mais simples: `npm i @vercel/kv`, criar store no painel, guardar
  o array sob uma chave.
- **Neon/Postgres** — segue o padrao ja usado em outros projetos do vault
  (`workflows/deploy-plataforma-web-vercel-neon`): `DATABASE_URL` (pooled) +
  `DATABASE_URL_UNPOOLED` (migracao), `sslmode=require`.

## Checklist

- [ ] Root Directory = `web`
- [ ] `ADMIN_TOKEN` definido em Production
- [ ] `npm run build` passa localmente
- [ ] (opcional) adaptador de persistencia configurado
