# Desafio de IA (OIAA) — Plataforma Web

Plataforma oficial do Desafio Tecnico de Inteligencia Artificial do IF Goiano — Campus Hidrolandia.
Apresenta os tres pilares (NLP, Visao Computacional, Aprendizado de Maquina), a estrutura de codigo
da 2a Fase e o placar de pontuacao da 3a Fase.

> Status: **backend + esqueleto de UI** prontos e deployaveis. O front definitivo (visual cyberpunk
> completo com shadcn/ui) sera entregue na proxima etapa — ver `PROMPT_FRONTEND.md` na raiz do repo.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (tokens shadcn/ui, `components.json` configurado)
- API Routes (serverless) como backend
- lucide-react (icones)

## Rodar localmente

```bash
cd web
npm install
cp .env.example .env.local   # opcional: defina ADMIN_TOKEN para testar escrita no placar
npm run dev                  # http://localhost:3000
npm run build                # build de producao (verificacao)
```

## Estrutura

```
web/
  app/
    page.tsx                 # Home / landing (3 fases + cards dos pilares)
    challenges/page.tsx      # Abas dos 3 desafios (texto real dos notebooks)
    code/page.tsx            # Estrutura de codigo (import block + esqueleto)
    leaderboard/page.tsx     # Placar (ordenacao + busca)
    api/
      challenges/route.ts        # GET conteudo dos desafios
      code/[pillar]/route.ts     # GET codigo por pilar (nlp|vc|am)
      leaderboard/route.ts       # GET lista; POST/DELETE (admin)
  lib/
    types.ts                 # tipos compartilhados
    challenges.ts            # conteudo dos desafios (Fase 1)
    code-snippets.ts         # import blocks reais + esqueletos (Fase 2)
    leaderboard-store.ts     # store do placar + ranking/sort/busca/CRUD
    accents.ts               # classes Tailwind por pilar
    utils.ts                 # cn()
  data/leaderboard.json      # seed do placar
  components/                # nav, code-block, tabs, tabela, ui/ (shadcn-style)
```

## API

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/api/challenges` | Conteudo dos 3 desafios |
| GET | `/api/code/:pillar` | Codigo do pilar (`nlp`,`vc`,`am`) |
| GET | `/api/leaderboard?search=&sortBy=total&order=desc` | Placar ranqueado |
| POST | `/api/leaderboard` | Cria/atualiza grupo (header `x-admin-token`) |
| DELETE | `/api/leaderboard?id=grupo-x` | Remove grupo (header `x-admin-token`) |

Exemplo de escrita:

```bash
curl -X POST http://localhost:3000/api/leaderboard \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"group":"Omega","members":["Ana","Caua"],"phase1":9.5,"phase2":8.0}'
```

## Persistencia (importante)

O store do placar e **in-memory** (semeado de `data/leaderboard.json`). Em serverless (Vercel) a
memoria nao persiste entre cold starts/instancias — leituras funcionam, escritas valem so na instancia
ativa. Para persistencia real, trocar `lib/leaderboard-store.ts` por um adaptador (Vercel KV ou
Neon/Postgres) mantendo as mesmas assinaturas. Ver `DEPLOY.md`.

## Deploy

Ver `DEPLOY.md`. Resumo: importar o repo na Vercel, **Root Directory = `web`**, framework Next.js,
definir `ADMIN_TOKEN`, Deploy.
