# Deploy do FrontEnd na Vercel

App **Vite + React** (SPA, HashRouter). Consome o **BackEnd** (projeto Vercel separado) via
`VITE_API_URL`. O passo a passo completo (BackEnd + FrontEnd + Neon) esta em `../DEPLOY.md`.

## Resumo

1. Faca o deploy do **BackEnd** primeiro e copie a URL dele.
2. Na Vercel, crie o projeto do FrontEnd com **Root Directory = `FrontEnd`** (preset Vite).
3. Em Environment Variables, defina:
   - `VITE_API_URL` = URL do BackEnd (ex.: `https://oiaa-backend.vercel.app`).
4. Deploy.

## Modos

- **Com `VITE_API_URL`** apontando para o BackEnd (e o BackEnd com `DATABASE_URL`):
  MODO API — times/notas persistem no Neon e o placar e compartilhado.
- **Sem `VITE_API_URL`** (ou BackEnd indisponivel): MODO LOCAL — seed + `localStorage`
  por navegador (bom para demo). O app detecta sozinho.

## Local

```bash
cd FrontEnd
npm install
npm run dev      # http://localhost:5173 (modo local, sem backend)
npm run build    # gera dist/
```

Para apontar o dev a um BackEnd, crie `.env.local` com `VITE_API_URL=...`.
