# Guia de Deploy — Vercel + Neon

Este projeto tem **dois apps** que viram **dois projetos na Vercel**, ligados por uma variavel:

```
FrontEnd (Vite)  ──fetch(VITE_API_URL)──>  BackEnd (Functions)  ──>  Neon Postgres
```

Ordem recomendada: **1) Neon → 2) BackEnd → 3) FrontEnd**. Leva ~15 min.

---

## 1. Neon (banco de dados)

1. Crie uma conta em https://neon.tech e um projeto (ex.: `desafio-ia-oiaa`).
2. No projeto, abra **Connection Details** e copie a connection string **Pooled**
   (o host tem `-pooler`). Ela deve terminar com `?sslmode=require`. Exemplo:
   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Guarde essa string — sera o `DATABASE_URL` do BackEnd.
4. Nao precisa criar tabelas: o BackEnd cria `teams` e `members` sozinho na 1a chamada.

> Dica: o Neon tem um SQL Editor. Voce nao precisa dele agora, mas e por ali que da pra
> conferir os dados depois (ex.: `SELECT * FROM teams;`).

---

## 2. BackEnd (projeto Vercel #1)

1. Suba o repositorio para o GitHub (veja a secao "Git" no fim).
2. Na Vercel: **Add New… → Project** e importe o repositorio.
3. Em **Configure Project**:
   - **Root Directory**: clique em *Edit* e selecione **`BackEnd`**.
   - **Framework Preset**: **Other** (nao ha build; sao so functions em `/api`).
   - Build Command / Output: deixe em branco (padrao).
4. **Environment Variables** (aba Environment Variables):
   | Nome | Valor |
   |---|---|
   | `DATABASE_URL` | a string **pooled** do Neon (passo 1) |
   | `ADMIN_TOKEN` | um token forte; sera exigido para lancar nota/excluir time. Para casar com o painel do front, use `capivara-2026` (ou troque tambem no front) |
   | `ALLOWED_ORIGIN` | (opcional) a URL do FrontEnd, ex.: `https://desafio-ia.vercel.app`. Vazio = libera qualquer origem |
5. **Deploy**. Ao terminar, copie a URL do projeto (ex.: `https://oiaa-backend.vercel.app`).
6. Teste rapido: abra `https://SEU-BACKEND.vercel.app/api/teams` no navegador.
   - Deve retornar `{"teams":[]}` (ou com times). Se vier `{"error":"no-db"}`, o `DATABASE_URL` nao foi lido.

---

## 3. FrontEnd (projeto Vercel #2)

1. Na Vercel: **Add New… → Project** e importe o **mesmo** repositorio de novo.
2. Em **Configure Project**:
   - **Root Directory**: **`FrontEnd`**.
   - **Framework Preset**: **Vite** (detectado). Output: `dist` (padrao).
3. **Environment Variables**:
   | Nome | Valor |
   |---|---|
   | `VITE_API_URL` | a URL do BackEnd do passo 2 (ex.: `https://oiaa-backend.vercel.app`), **sem barra no final** |
4. **Deploy**.
5. (Opcional, recomendado) Volte no projeto do **BackEnd** e ajuste `ALLOWED_ORIGIN` para a URL
   final do FrontEnd; faca **Redeploy** do BackEnd.

---

## 4. Conferindo a integracao

- Abra o FrontEnd publicado. Va em **Times** e crie um time.
- Abra **Placar**: o time deve aparecer. Recarregue a pagina — se continuar la, esta
  persistindo no Neon (MODO API). Se sumir ao trocar de navegador, voce ainda esta em MODO
  LOCAL (cheque `VITE_API_URL` no front e `DATABASE_URL` no back).
- Va em **Tutor (`/admin`)**, entre com o token (`capivara-2026` por padrao) e lance uma nota.
  - O token digitado precisa ser **igual** ao `ADMIN_TOKEN` do BackEnd, senao retorna "nao autorizado".

## Resumo das variaveis

| Projeto | Variavel | Para que serve |
|---|---|---|
| BackEnd | `DATABASE_URL` | conexao Neon (ativa a persistencia) |
| BackEnd | `ADMIN_TOKEN` | autoriza lancar nota / excluir time |
| BackEnd | `ALLOWED_ORIGIN` | (opcional) restringe o CORS ao dominio do FrontEnd |
| FrontEnd | `VITE_API_URL` | URL do BackEnd que o front consome |

## Problemas comuns

- **Placar vazio / nao persiste**: faltou `DATABASE_URL` no BackEnd ou `VITE_API_URL` no FrontEnd.
- **"nao autorizado" ao lancar nota**: `ADMIN_TOKEN` (BackEnd) diferente do token digitado no `/admin`.
- **Erro de CORS no console**: defina `ALLOWED_ORIGIN` no BackEnd com a URL exata do FrontEnd (ou deixe vazio).
- **Mudou o Root Directory errado**: BackEnd = `BackEnd`, FrontEnd = `FrontEnd`.
