<p align="center">
  <img src="capivara-icon/capivara.png" alt="Mascote Capivara OIAA 2026" width="280px" style="border-radius: 12px; border: 2px solid #00ffcc;" />
</p>

<h1 align="center">Treinamento OIAA - Desafio de Inteligencia Artificial</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Neon-00e599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

<p align="center">
  <strong>Plataforma oficial de gerenciamento e pontuacao para o Desafio Tecnico de Inteligencia Artificial (OIAA) do IF Goiano - Campus Hidrolandia.</strong>
</p>

<p align="center">
  <a href="#arquitetura">Arquitetura</a> •
  <a href="#estrutura-de-pastas">Estrutura</a> •
  <a href="#estrutura-dos-desafios-5-etapas">Desafios</a> •
  <a href="#gerenciamento-de-equipes-e-notas">Equipes e Notas</a> •
  <a href="#como-executar-localmente">Como Executar</a> •
  <a href="#deploy">Deploy</a> •
  <a href="#autor">Autor</a>
</p>

<hr />

A plataforma gerencia o progresso dos alunos nos tres pilares academicos do desafio:

<table align="center">
  <tr>
    <td align="center"><b>Linguagem Natural (NLP)</b></td>
    <td align="center"><b>Visao Computacional (VC)</b></td>
    <td align="center"><b>Aprendizado de Maquina (AM)</b></td>
  </tr>
  <tr>
    <td>Resgate de palavras perdidas em livros antigos.</td>
    <td>Classificacao de placas de transito (Pare vs. Velocidade).</td>
    <td>Sistema de recomendacao de filmes (estilo Netflix/YouTube/TikTok).</td>
  </tr>
</table>

## Arquitetura

O projeto e dividido em **dois apps que se conversam**, cada um com seu deploy na Vercel:

- **`FrontEnd/`** — SPA em **Vite + React + TypeScript + Tailwind** (UI cyberpunk, animacoes, placar, painel do tutor). Consome a API do BackEnd pela variavel `VITE_API_URL`.
- **`BackEnd/`** — API **serverless (Vercel Functions)** com persistencia em **Neon Postgres**. Expoe os times e o lancamento de notas.

O FrontEnd tem **fallback automatico**: se a API nao estiver configurada/disponivel, ele roda em **modo local** (dados em `localStorage`), continuando 100% navegavel para demonstracao.

```
FrontEnd  --(fetch VITE_API_URL/api/*)-->  BackEnd  --(SQL)-->  Neon Postgres
```

## Estrutura de pastas

```text
TreinamentoOIAA/
├── BackEnd/                     # API serverless (Vercel Functions + Neon)
│   ├── api/
│   │   ├── _db.ts               # acesso ao Neon + CORS + validacao
│   │   ├── teams.ts             # GET lista / POST cria / DELETE remove
│   │   └── scores.ts            # POST lanca nota (x-admin-token)
│   ├── lib/types.ts             # tipos do dominio (Team, Member, ScoreEntry)
│   ├── .env.example             # DATABASE_URL, ADMIN_TOKEN, ALLOWED_ORIGIN
│   ├── package.json
│   └── README.md
│
├── FrontEnd/                    # SPA Vite + React (UI oficial)
│   ├── src/app/
│   │   ├── pages/               # Home, Challenges, Trilha, Code, Teams, Leaderboard, Admin
│   │   ├── components/          # NavBar, Footer, cards, UI (Radix/shadcn)
│   │   └── lib/                 # challenges, stages, scoring, teams-store (dual-mode)
│   ├── src/imports/capivara.png # mascote (usado no hero da Home)
│   ├── .env.example             # VITE_API_URL
│   └── package.json
│
├── capivara-icon/               # mascote do projeto
├── *.py                         # notebooks Kaggle da 1a fase (material dos desafios)
├── PROMPT_FRONTEND.md           # prompt usado para gerar a UI
├── PROMPT_TRILHA_ETAPAS.md      # prompt detalhado da trilha das 5 etapas
├── DEPLOY.md                    # passo a passo de deploy (Vercel + Neon)
└── README.md                    # este arquivo
```

## Estrutura dos Desafios (5 Etapas)

Cada pilar (NLP, VC, AM) tem 5 etapas, cada uma valendo pontos por integrante:

<ol>
  <li><b>Teoria (10 pts)</b>: explicacoes, resumos e conceituacao.</li>
  <li><b>Treino com Auxilio (15 pts)</b>: pipeline guiado com dicas.</li>
  <li><b>Treino sem Auxilio (20 pts)</b>: reproducao autonoma.</li>
  <li><b>Preencher Lacunas (25 pts)</b>: completar o codigo marcado com <code># [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]</code>.</li>
  <li><b>IA do Zero (30 pts)</b>: construir a solucao (modo "com blocos" e modo "do zero").</li>
</ol>

Total: **100 pts por pilar**, **300 pts por integrante**.

## Gerenciamento de Equipes e Notas

- **Time**: nome + integrantes (recomendado 3) + 1 tutor.
- **Nota individual**: soma dos pontos do aluno, normalizada de 0 a 100.
- **Nota do grupo**: media das notas individuais dos integrantes.
- **Tutor**: cadastrado no time, mas **nunca** entra na media do grupo.
- **Painel do Tutor (`/admin`)**: lanca notas (com validacao do limite por etapa) e remove times. Protegido por token (`x-admin-token`).

## Como Executar Localmente

Pre-requisito: Node.js 18+.

```bash
# FrontEnd (roda sozinho em modo local/demo)
cd FrontEnd
npm install
npm run dev        # http://localhost:5173
```

Para testar com o BackEnd real, crie `FrontEnd/.env.local` com `VITE_API_URL=<url-do-backend>`
e configure o BackEnd com `DATABASE_URL` (Neon) — veja [DEPLOY.md](DEPLOY.md).

## Endpoints da API (BackEnd)

| Metodo | Endpoint | Auth | Descricao |
|:---|:---|:---|:---|
| GET | `/api/teams` | — | Lista os times (ranking calculado no FrontEnd). |
| POST | `/api/teams` | — | Cria um time `{ name, tutor, members[] }`. |
| DELETE | `/api/teams?id=...` | `x-admin-token` | Remove um time. |
| POST | `/api/scores` | `x-admin-token` | Lanca/atualiza nota `{ teamId, memberId, pillar, stage, points }`. |

## Deploy

Passo a passo completo (Neon + dois projetos Vercel + variaveis) em **[DEPLOY.md](DEPLOY.md)**.

---

<h2 align="center">Autor</h2>

<p align="center">
  <a href="https://github.com/ThyagoToledo">
    <img src="https://github.com/ThyagoToledo.png" width="120px" height="120px" alt="ThyagoToledo" style="border-radius: 8px; border: 3px solid #00ffcc; box-shadow: 0 0 10px rgba(0, 255, 204, 0.5);" />
    <br />
    <sub><b>ThyagoToledo</b></sub>
  </a>
</p>
