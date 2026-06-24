# Prompt para construir o Front-End definitivo (cole numa IA de UI)

> Use este prompt amanha para gerar a interface bonita. O **backend ja existe e funciona** —
> NAO o reescreva: consuma a camada de dados (`web/lib/*`) e as API Routes (`web/app/api/*`).
> O objetivo desta etapa e **somente o visual e as interacoes**.

---

## Contexto do projeto

App **Next.js 14 (App Router) + TypeScript + Tailwind** ja existente na pasta `web/`, pronto para a
Vercel. E a plataforma oficial do **Desafio Tecnico de Inteligencia Artificial** (IF Goiano — Campus
Hidrolandia), com tres pilares academicos. O front atual e funcional, porem cru. Sua tarefa: deixa-lo
**moderno, responsivo e impactante**, mantendo toda a logica e os contratos de dados.

## NAO MEXER (camada pronta — apenas consumir)

- `web/lib/types.ts` — tipos (`PillarId`, `Challenge`, `CodeBlock`, `PillarCode`, `RankedEntry`...).
- `web/lib/challenges.ts` — `getAllChallenges()`, `getChallenge(id)`, `PILLAR_ORDER`.
- `web/lib/code-snippets.ts` — `getCode(pillar)`; 1o bloco = "Bloco de importacao de bibliotecas" (real),
  seguido do esqueleto com `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`.
- `web/lib/leaderboard-store.ts` — `listRanked({search,sortBy,order})`, `upsertEntry`, `removeEntry`.
- `web/lib/accents.ts` — classes Tailwind por pilar (manter as cores).
- API Routes (manter os contratos):
  - `GET /api/challenges` -> `{ challenges }`
  - `GET /api/code/:pillar` -> `PillarCode`
  - `GET /api/leaderboard?search=&sortBy=total&order=desc` -> `{ entries: RankedEntry[] }`
  - `POST /api/leaderboard` (header `x-admin-token`) -> cria/atualiza grupo
  - `DELETE /api/leaderboard?id=...` (header `x-admin-token`)

Pode reescrever livremente: `web/app/**/page.tsx`, `web/components/**`, `web/app/globals.css`,
`web/tailwind.config.ts` (tokens), e adicionar componentes shadcn/ui.

## Identidade visual

- **Tema:** Dark Mode (fundo cinza escuro/preto), estetica **cyberpunk/tecnologica limpa** — muito
  espaco negativo, contraste alto, brilhos neon sutis (glow), bordas finas, grids/linhas tenues.
- **Cores de destaque por pilar** (ja existem como tokens `--nlp`/`--vc`/`--am` em `globals.css`):
  - **NLP** (Linguagem Natural): Roxo / Violeta neon.
  - **VC** (Visao Computacional): Ciano / Azul eletrico neon.
  - **AM** (Aprendizado de Maquina): Verde limao / Esmeralda neon.
- **Tipografia:** sans moderna para texto (ex.: Inter/Geist) e **monoespacada** para codigo
  (JetBrains Mono / Fira Code). Titulos grandes e marcantes.
- **Micro-interacoes:** transicoes suaves (framer-motion opcional), hover com glow na cor do pilar,
  foco acessivel, animacao de entrada nas secoes.

## Stack de UI sugerida

- **shadcn/ui** (ja configurado em `web/components.json`): rode `npx shadcn@latest add button card tabs
  table input badge tooltip dialog sonner` e substitua os primitivos crus atuais em `components/ui/`.
- **lucide-react** para icones (ja instalado).
- Syntax highlighting de codigo: adicionar **shiki** ou **react-syntax-highlighter** (tema escuro,
  linguagem Python) e manter o botao "Copiar" ja existente.
- Opcional: **framer-motion** para animacoes.

## Paginas e secoes (manter a estrutura)

1. **Home `/`** — Landing.
   - Hero com titulo impactante "Desafio de Inteligencia Artificial", subtitulo e CTAs.
   - **Linha do tempo das 3 Fases**: 1a (Documentacao — concluida), 2a (Estrutura de Codigo-Bruto),
     3a (Avaliacao e Placar — responsaveis Caua e Thyago). Deixar visualmente como timeline.
   - 3 cards dos pilares, cada um com sua cor neon, levando para `/challenges`.

2. **Desafios `/challenges`** — abas/secoes por pilar (dados de `getAllChallenges()`):
   - **NLP** "Resgatar Palavras Perdidas em Livros Antigos": incluir um bloco que **simula o manuscrito
     historico** em portugues, com lacunas `[____]` que a IA deve prever (efeito de papel antigo/CRT).
   - **AM** "Construindo um Sistema de Recomendacao de Filmes": explicar o modelo preditivo estilo
     Netflix/YouTube/TikTok.
   - **VC** "Ensinando o Carro a 'Ler' Placas de Transito": explicar o classificador para carros
     autonomos (Pare vs Velocidade Maxima).
   - Mostrar narrativa, conceitos-chave e etapas (campos `description`, `keyConcepts`, `steps`,
     `dataset`).

3. **Codigo `/code`** — Estrutura da 2a Fase:
   - Visualizador elegante com **syntax highlighting** e botao **Copiar**.
   - Abas por pilar (NLP/VC/AM). Primeiro bloco visivel = "Bloco de importacao de bibliotecas".
   - Destacar os placeholders `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`.

4. **Placar `/leaderboard`** — Leaderboard interativo (3a Fase):
   - Colunas: **Posicao, Grupo, Integrantes, Nota Fase 1, Nota Fase 2, Pontuacao Total**.
   - **Ordenacao** ao clicar nos cabecalhos + **barra de busca** para filtrar por grupo/integrante
     (a logica ja existe em `LeaderboardTable`; melhore o visual: medalhas para top 3, barras de
     progresso, realce da Pontuacao Total).
   - Rodape obrigatorio: **"Sistema de pontuacao e gerenciamento desenvolvido por Caua e Thyago"**.

## Requisitos tecnicos

- Componentizado, limpo, tipado (sem `any` solto), acessivel (roles/aria nas abas e tabela).
- 100% responsivo (mobile-first). Navegacao fixa no topo com indicacao da rota ativa.
- Manter `web/app/api/*` e `web/lib/*` intactos; o front so consome.
- `npm run build` deve continuar passando. Deploy: Vercel com **Root Directory = `web`**.

## Criterios de aceite

- [ ] Visual cyberpunk dark coerente, com as 3 cores neon por pilar.
- [ ] Home com hero + timeline das 3 fases + cards dos pilares.
- [ ] `/challenges` com manuscrito simulado (NLP) e textos reais dos 3 desafios.
- [ ] `/code` com highlight + copiar + import block como primeiro bloco.
- [ ] `/leaderboard` ordenavel, com busca, top-3 destacado e assinatura "Caua e Thyago".
- [ ] Responsivo, acessivel e `npm run build` verde.
