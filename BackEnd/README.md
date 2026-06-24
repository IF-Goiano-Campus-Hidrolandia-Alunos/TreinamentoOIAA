# BackEnd — API do Desafio de IA (OIAA)

API serverless (Vercel Functions) com persistencia em **Neon Postgres**. E consumida pelo
`FrontEnd/` (Vite) atraves da variavel `VITE_API_URL`. Deploy como um projeto Vercel proprio.

## Endpoints

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| GET | `/api/teams` | — | Lista os times (cru). O ranking/nota e calculado no FrontEnd. |
| POST | `/api/teams` | — | Cria time `{ name, tutor, members[] }` (aberto aos alunos). |
| DELETE | `/api/teams?id=...` | `x-admin-token` | Remove um time. |
| POST | `/api/scores` | `x-admin-token` | Lanca/atualiza nota `{ teamId, memberId, pillar, stage, points }`. |

- Sem `DATABASE_URL` configurado, as Functions respondem **503** (o FrontEnd entao usa o modo local).
- CORS liberado (ou restrito a `ALLOWED_ORIGIN`) para o FrontEnd poder chamar de outro dominio.

## Banco (Neon)

As tabelas sao criadas automaticamente (`CREATE TABLE IF NOT EXISTS`):

```sql
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, tutor TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '[]'::jsonb
);
```

## Variaveis de ambiente

Veja `.env.example`: `DATABASE_URL` (Neon pooled), `ADMIN_TOKEN`, `ALLOWED_ORIGIN` (opcional).

O passo a passo completo de deploy (Vercel + Neon) esta em `../DEPLOY.md` na raiz do repo.
