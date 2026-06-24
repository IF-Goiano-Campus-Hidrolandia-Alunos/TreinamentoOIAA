# Plano: Front-end do Desafio de IA (IF Goiano — Campus Hidrolândia)

## Contexto

O usuário forneceu um prompt detalhado descrevendo o front-end de uma plataforma acadêmica do **Desafio Técnico de Inteligência Artificial**, com 3 pilares (NLP, VC, AM), 5 etapas por pilar, sistema de pontuação, times com tutores, leaderboard e painel admin.

O prompt original assume Next.js 14 + App Router consumindo `web/lib/*` e `web/app/api/*`. Este ambiente, porém, é **Vite + React 18 + Tailwind v4** (Figma Make). A decisão foi: recriar localmente em `src/` o equivalente da camada de dados (tipos, scoring, mock de teams) e construir todas as 6 páginas com o visual cyberpunk dark especificado, usando os shadcn/ui já instalados em `src/app/components/ui/`.

Objetivo: entregar uma demonstração visual completa, navegável, com dados mockados em memória, que respeite a identidade visual e os contratos descritos no prompt.

## Arquitetura

App single-page com **react-router** (v7, já instalado) montado dentro de `src/app/App.tsx`. Estado de times em React Context com persistência em `localStorage` para simular o backend.

### Estrutura de arquivos novos

```
src/app/
├── App.tsx                              # Router + layout shell (substitui conteúdo atual)
├── lib/
│   ├── types.ts                         # PillarId, StageId, Team, MemberScored, etc.
│   ├── challenges.ts                    # getAllChallenges(), PILLAR_ORDER + textos reais dos 3 desafios
│   ├── stages.ts                        # STAGES, STAGE_MAX_POINTS, POINTS_PER_PILLAR=100
│   ├── scoring.ts                       # scoreMember, groupScore, rankTeams
│   ├── code-snippets.ts                 # getCode(pillar) com import block + placeholders Python
│   ├── accents.ts                       # ACCENT[pillar].text/border/bg/bgSoft/ring/glow (classes literais)
│   └── teams-store.tsx                  # Context + hook useTeams (mock CRUD + localStorage)
├── components/
│   ├── layout/
│   │   ├── NavBar.tsx                   # Nav fixa topo, rota ativa, mascote capivara
│   │   └── Footer.tsx                   # "Sistema ... desenvolvido por Thyago"
│   ├── pillars/
│   │   ├── PillarCard.tsx               # Card neon por pilar
│   │   └── StageStepper.tsx             # Trilha das 5 etapas
│   ├── code/
│   │   └── CodeBlockView.tsx            # Syntax highlight (custom regex/spans) + botão Copiar
│   ├── manuscript/
│   │   └── AncientManuscript.tsx        # Bloco com efeito papel antigo/CRT para NLP
│   ├── teams/
│   │   ├── CreateTeamForm.tsx
│   │   └── TeamCard.tsx
│   ├── leaderboard/
│   │   ├── LeaderboardTable.tsx         # Sort por header + linha expansível
│   │   └── SearchBar.tsx
│   ├── admin/
│   │   ├── TokenGate.tsx                # Salva token em localStorage
│   │   └── ScoreForm.tsx                # Time → integrante → pilar → etapa → pontos
│   └── ui/                              # (já existe; reutilizar)
└── pages/
    ├── HomePage.tsx                     # Hero + timeline 3 fases + cards pilares
    ├── ChallengesPage.tsx               # Tabs por pilar + manuscrito + 5 etapas
    ├── CodePage.tsx                     # Visualizador com highlight, abas por pilar
    ├── TeamsPage.tsx                    # Form criação + lista
    ├── LeaderboardPage.tsx              # Tabela ordenável + busca + top 3
    └── AdminPage.tsx                    # Token + lançar nota + excluir
```

### Identidade visual

- Tokens neon em `src/styles/globals.css`:
  - `--nlp: oklch(0.7 0.27 295)` (violeta)
  - `--vc: oklch(0.78 0.18 220)` (ciano elétrico)
  - `--am: oklch(0.82 0.22 145)` (verde limão)
- Fundo dark (#0a0a0f) com grid sutil de linhas (background SVG inline ou Tailwind).
- Glow neon em hover via `box-shadow` + `drop-shadow`.
- Mascote `capivara.png` (em `src/imports/`) usado opcionalmente em Home e Nav.
- Fontes: Inter para texto, JetBrains Mono para código — importadas em `src/styles/fonts.css`.

### Reutilização (já instalado)

- **shadcn/ui**: Button, Card, Tabs, Table, Input, Badge, Tooltip, Dialog, Select, Sonner (toast), Collapsible (linha expansível).
- **lucide-react** para ícones.
- **motion/react** para animações de entrada/hover (opcional, leve).
- **react-router v7** já instalado.

## Páginas (resumo)

1. **`/`** — Hero "Desafio de Inteligência Artificial", timeline horizontal das 3 fases (1ª concluída, 2ª em curso, 3ª concluída), 3 cards de pilares clicáveis.
2. **`/challenges`** — Tabs NLP/VC/AM. NLP renderiza `AncientManuscript` com lacunas `[____]`. Para cada pilar: narrativa, conceitos, dataset, stepper das 5 etapas com pontos.
3. **`/code`** — Tabs por pilar; `CodeBlockView` exibe blocos do `getCode(pillar)` com highlight Python (tokenização simples por regex), destaque vermelho/glow para `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`, botão Copiar (clipboard).
4. **`/teams`** — Form (nome, tutor, 3+ integrantes dinâmicos) → `useTeams().create`. Cards listando times com nota individual e nota do grupo.
5. **`/leaderboard`** — Tabela com Posição, Time, Tutor, Nota do Grupo. Headers clicáveis ordenam (via `rankTeams`). Busca filtra por time/tutor/integrante. Top 3 com medalhas/glow. Linha expansível mostra notas individuais e etapas concluídas (de 15). Rodapé com assinatura.
6. **`/admin`** — `TokenGate` (token mock validado por string fixa demo, salvo em localStorage). `ScoreForm` com Selects shadcn em cascata, respeitando `STAGE_MAX_POINTS[stage]`. Lista de times com botão excluir (Dialog de confirmação). Toasts de feedback.

## Dados mockados

- `teams-store.tsx` inicializa com 4–5 times demo populados (vários integrantes, notas variadas) para que `/leaderboard` e `/teams` apareçam ricos no primeiro load.
- Textos dos 3 desafios escritos em `challenges.ts` seguindo as descrições do prompt (manuscrito histórico NLP, recomendador AM, classificador de placas VC).
- Snippets Python em `code-snippets.ts`: 1º bloco "importação de bibliotecas" real, depois esqueleto com placeholders.

## Verificação

1. Dev server já rodando — navegar pelo preview do Figma Make.
2. Conferir: navegação entre as 6 rotas funciona; rota ativa destacada na NavBar.
3. `/teams` — criar um time, ver aparecer no card e no leaderboard.
4. `/admin` — inserir token demo, lançar uma nota, ver leaderboard atualizar.
5. `/leaderboard` — clicar headers para ordenar, buscar por nome, expandir linha.
6. `/code` — botão Copiar dispara toast; placeholders destacados.
7. `/challenges` — manuscrito antigo aparece no NLP com lacunas visíveis.
8. Responsivo: testar mobile (NavBar vira menu hamburguer/Sheet).
