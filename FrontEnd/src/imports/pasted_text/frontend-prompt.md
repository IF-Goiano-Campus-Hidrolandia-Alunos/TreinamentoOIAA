# Prompt para construir o Front-End definitivo (cole numa IA de UI)

> Use este prompt para gerar a interface bonita. O **backend ja existe, compila e funciona** —
> NAO o reescreva. Consuma a camada de dados (`web/lib/*`) e as API Routes (`web/app/api/*`).
> O objetivo desta etapa e **somente o visual e as interacoes**, mantendo os contratos de dados.

---

## Contexto do projeto

App **Next.js 14 (App Router) + TypeScript + Tailwind** ja existente na pasta `web/`, pronto para a
Vercel. E a plataforma oficial do **Desafio Tecnico de Inteligencia Artificial** (IF Goiano — Campus
Hidrolandia), com tres pilares academicos (NLP, VC, AM). O front atual e funcional, porem cru.
Sua tarefa: deixa-lo **moderno, responsivo e impactante**, mantendo toda a logica e os contratos.

### Modelo de dominio (importante entender)

- Cada pilar (NLP, VC, AM) tem **5 etapas**, cada uma valendo pontos por integrante:
  1. **Teoria** (10 pts) — explicacoes/resumos.
  2. **Treino com auxilio** (15 pts) — pipeline guiado com dicas.
  3. **Treino sem auxilio** (20 pts) — repete o pipeline sozinho.
  4. **Preencher lacunas** (25 pts) — completa o codigo marcado com `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`.
  5. **IA do zero** (30 pts) — dois modos: "com blocos" e "do zero".
  - Total: 100 pts por pilar -> **300 pts** por integrante (todos os pilares).
- **Times**: nome do time + integrantes (recomendado 3) + **1 tutor**.
  - **Nota individual** = pontos do integrante normalizados em **0–100**.
  - **Nota do grupo** = **media das notas individuais** dos integrantes. O **tutor nunca conta**.
- Quem lanca nota e o **tutor**, na **Area do Tutor (`/admin`)**, protegida por token.

## NAO MEXER (camada pronta — apenas consumir)

- `web/lib/types.ts` — tipos: `PillarId`, `StageId`, `Pillar`, `Challenge`, `Stage`, `PillarStages`,
  `CodeBlock`, `PillarCode`, `Member`, `Team`, `MemberScored`, `TeamRanked`, `ScoreEntry`,
  `TeamSortKey`, `SortOrder`.
- `web/lib/challenges.ts` — `getAllChallenges()`, `getChallenge(id)`, `PILLAR_ORDER`.
- `web/lib/stages.ts` — `getStages(pillar)`, `STAGES`, `STAGE_MAX_POINTS`, `POINTS_PER_PILLAR` (100),
  `MAX_POINTS_TOTAL` (300), `TOTAL_STAGES` (15).
- `web/lib/scoring.ts` — `scoreMember`, `groupScore`, `rankTeams(teams, {sortBy, order})`
  (fonte unica da formula de notas; **nao** reimplemente o calculo no front).
- `web/lib/teams-store.ts` — `listTeams`, `getTeam`, `createTeam`, `deleteTeam`, `submitScore`
  (async; Neon em producao via `DATABASE_URL`, fallback local em `data/teams.runtime.json`).
- `web/lib/code-snippets.ts` — `getCode(pillar)`; 1o bloco = "Bloco de importacao de bibliotecas" (real),
  seguido do esqueleto com `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`.
- `web/lib/validation.ts` — schemas Zod (`createTeamSchema`, `submitScoreSchema`).
- `web/lib/accents.ts` — classes Tailwind por pilar (`ACCENT[pillar].text/border/bg/bgSoft/ring/glow`).
  Use SEMPRE estas classes literais (o Tailwind nao detecta classes montadas dinamicamente).

### Contratos das API Routes (manter)

- `GET /api/challenges` -> `{ challenges: Challenge[], stages: PillarStages[], scoring: { pointsPerPillar, maxPointsTotal } }`
- `GET /api/code/:pillar` (nlp|vc|am; 404 se invalido) -> `PillarCode` = `{ pillar, blocks: CodeBlock[] }`
- `GET /api/teams?search=&sortBy=name|groupScore|createdAt&order=asc|desc` -> `{ teams: TeamRanked[] }`
- `POST /api/teams` body `{ name, tutor, members: string[] }` -> `{ team }` (201). **Aberto** (alunos criam).
- `GET /api/teams/:id` -> `{ team: TeamRanked }`
- `DELETE /api/teams/:id` (header `x-admin-token`) -> `{ ok: true }`
- `POST /api/teams/:id/scores` (header `x-admin-token`) body `{ memberId, pillar, stage, points }` -> `{ team }` (201)

Pode reescrever livremente: `web/app/**/page.tsx`, os client components em `web/app/**` e
`web/components/**`, `web/app/globals.css`, `web/tailwind.config.ts` (tokens), e adicionar componentes
shadcn/ui. **Nao** altere `web/lib/*` nem `web/app/api/*`.

## Identidade visual

- **Tema:** Dark Mode (fundo cinza escuro/preto), estetica **cyberpunk/tecnologica limpa** — muito
  espaco negativo, contraste alto, brilhos neon sutis (glow), bordas finas, grids/linhas tenues.
- **Cores de destaque por pilar** (tokens `--nlp`/`--vc`/`--am` ja em `globals.css`):
  - **NLP** (Linguagem Natural): Roxo / Violeta neon.
  - **VC** (Visao Computacional): Ciano / Azul eletrico neon.
  - **AM** (Aprendizado de Maquina): Verde limao / Esmeralda neon.
- **Tipografia:** sans moderna para texto (ex.: Inter/Geist) e **monoespacada** para codigo
  (JetBrains Mono / Fira Code). Titulos grandes e marcantes.
- **Micro-interacoes:** transicoes suaves (framer-motion opcional), hover com glow na cor do pilar,
  foco acessivel, animacao de entrada nas secoes. Mascote: `capivara-icon/capivara.png` (uso opcional).

## Stack de UI sugerida

- **shadcn/ui** (ja configurado em `web/components.json`): rode `npx shadcn@latest add button card tabs
  table input badge tooltip dialog select sonner` e substitua os primitivos crus atuais em `components/ui/`.
  Hoje os `<select>` do `/admin` sao nativos — troque pelo Select do shadcn.
- **lucide-react** para icones (ja instalado).
- Syntax highlighting de codigo: adicionar **shiki** ou **react-syntax-highlighter** (tema escuro,
  linguagem Python) e manter o botao "Copiar" ja existente.
- Opcional: **framer-motion** para animacoes.

## Paginas e secoes (manter a estrutura e as rotas)

1. **Home `/`** — Landing.
   - Hero com titulo impactante "Desafio de Inteligencia Artificial", subtitulo e CTAs.
   - **Linha do tempo das 3 Fases** (timeline): 1a (Documentacao — concluida), 2a (Estrutura de
     Codigo-Bruto), 3a (Avaliacao e Placar — concluida).
   - 3 cards dos pilares, cada um com sua cor neon, levando para `/challenges`.

2. **Desafios `/challenges`** — abas/secoes por pilar (`getAllChallenges()` + `getStages(pillar)`):
   - **NLP** "Resgatar Palavras Perdidas em Livros Antigos": incluir um bloco que **simula o manuscrito
     historico** em portugues, com lacunas `[____]` (efeito de papel antigo/CRT).
   - **AM** "Construindo um Sistema de Recomendacao de Filmes": modelo preditivo estilo Netflix/YouTube/TikTok.
   - **VC** "Ensinando o Carro a 'Ler' Placas de Transito": classificador para carros autonomos
     (Pare vs Velocidade Maxima).
   - Mostrar narrativa, conceitos-chave, dataset E **as 5 etapas** (de `getStages`): titulo, resumo,
     objetivo, pontos, se tem auxilio, e os 2 modos da etapa 5. Deixe as etapas como uma trilha/stepper.

3. **Codigo `/code`** — Estrutura da 2a Fase:
   - Visualizador elegante com **syntax highlighting** e botao **Copiar**.
   - Abas por pilar (NLP/VC/AM). Primeiro bloco visivel = "Bloco de importacao de bibliotecas".
   - Destacar os placeholders `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`.

4. **Times `/teams`** — Cadastro e listagem:
   - Formulario para criar time: nome, tutor e integrantes (campos para 3, permitindo adicionar/remover).
     POST em `/api/teams`; apos sucesso, `router.refresh()`.
   - Lista/cards dos times cadastrados com tutor, integrantes e nota individual de cada um + nota do grupo.

5. **Placar `/leaderboard`** — Leaderboard interativo (3a Fase):
   - Colunas: **Posicao, Time, Tutor, Nota do Grupo** + linha expansivel com as **notas individuais**
     de cada integrante (e quantas das 15 etapas concluiu).
   - **Ordenacao** ao clicar nos cabecalhos (Time, Nota do Grupo) + **barra de busca** (filtra por time,
     tutor ou integrante). Top 3 destacado (1o/2o/3o). Realce da Nota do Grupo. Barras de progresso opcionais.
   - Rodape: **"Sistema de pontuacao e gerenciamento desenvolvido por Thyago"**.

6. **Area do Tutor `/admin`** — Painel restrito (melhorar o visual, manter a logica):
   - Campo de **token** (`x-admin-token`, salvo no localStorage).
   - Formulario "Lancar Nota": selecionar time -> integrante -> pilar -> etapa -> pontos
     (com limite `STAGE_MAX_POINTS[stage]`). POST em `/api/teams/:id/scores`.
   - Lista de times com nota do grupo, notas individuais e botao de **excluir** (DELETE, com confirmacao).
   - Mostrar feedback de sucesso/erro claro. Trocar os `<select>` nativos por Select do shadcn.

## Requisitos tecnicos

- Componentizado, limpo, tipado (sem `any` solto), acessivel (roles/aria nas abas e tabela).
- 100% responsivo (mobile-first). Navegacao fixa no topo com indicacao da rota ativa
  (Home, Desafios, Codigo, Times, Placar, Tutor).
- Manter `web/app/api/*` e `web/lib/*` intactos; o front so consome.
- `npm run build` deve continuar passando. Deploy: Vercel com **Root Directory = `web`**.
- **Autoria:** apenas **ThyagoToledo**. Nao adicione outros autores/creditos.

## Criterios de aceite

- [ ] Visual cyberpunk dark coerente, com as 3 cores neon por pilar.
- [ ] Home com hero + timeline das 3 fases + cards dos pilares.
- [ ] `/challenges` com manuscrito simulado (NLP), textos reais dos 3 desafios e as **5 etapas** por pilar.
- [ ] `/code` com highlight + copiar + import block como primeiro bloco.
- [ ] `/teams` com formulario de criacao funcional e lista de times.
- [ ] `/leaderboard` ordenavel, com busca, top-3 destacado, notas individuais + nota do grupo e assinatura "Thyago".
- [ ] `/admin` estilizado, lancando notas e excluindo times com token.
- [ ] Responsivo, acessivel e `npm run build` verde.