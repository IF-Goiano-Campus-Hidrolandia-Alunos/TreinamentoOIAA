# Prompt detalhado — Trilha de Etapas (NLP, VC, AM)

> Complemento do `PROMPT_FRONTEND.md`. Aqui o foco e **a experiencia da trilha das 5 etapas**
> de cada pilar (NLP, VC, AM): como cada etapa aparece, o que faz, e **como a interface ja
> consome / deixa pronta a integracao com o backend existente**.
> O backend NAO deve ser reescrito — apenas consumido. Ao final ha contratos "propostos"
> (claramente marcados) para evolucao futura, sem inventar endpoints que ja existem.

---

## 0. Visao geral da trilha

Cada pilar tem **5 etapas em sequencia**, formando uma trilha (stepper vertical/horizontal):

| # | Etapa (`StageId`)   | Titulo               | Pontos | Auxilio | Foco |
|---|---------------------|----------------------|:------:|:-------:|------|
| 1 | `theory`            | Teoria               | 10     | sim     | Ler/entender |
| 2 | `guided`            | Treino com auxilio   | 15     | sim     | Praticar guiado |
| 3 | `unguided`          | Treino sem auxilio   | 20     | nao     | Praticar sozinho |
| 4 | `fill-blanks`       | Preencher lacunas    | 25     | nao     | Codigo (lacunas) |
| 5 | `from-scratch`      | IA do zero           | 30     | nao     | Codigo (2 modos) |

- Total: **100 pts/pilar**, **300 pts/integrante** (15 etapas no total).
- A trilha e **informativa e guia**: a pontuacao oficial e lancada pelo **tutor** em `/admin`
  e aparece no **placar**. A interface da trilha deve refletir isso (ver secao 6).

### Rotas sugeridas

- `/challenges` — visao geral dos 3 pilares (ja existe).
- `/challenges/[pillar]` — **pagina da trilha** do pilar (nlp|vc|am) com as 5 etapas.
- `/challenges/[pillar]/[stage]` — **detalhe da etapa** (theory|guided|unguided|fill-blanks|from-scratch).

> Pode optar por modal/painel lateral em vez de rota por etapa, mas mantenha rota por pilar.

---

## 1. De onde vem cada dado (backend pronto)

Tudo o que a trilha precisa **ja existe** na camada de dados. Nao reimplemente; importe.

```ts
// Metadados das 5 etapas (titulo, resumo, objetivo, pontos, auxilio, bullets, modos)
import { getStages, STAGE_MAX_POINTS, POINTS_PER_PILLAR, MAX_POINTS_TOTAL } from "@/lib/stages";
import { getChallenge, getAllChallenges, PILLAR_ORDER } from "@/lib/challenges";
import { getCode } from "@/lib/code-snippets"; // blocos de codigo (etapas 4 e 5)
import { ACCENT } from "@/lib/accents";          // cores por pilar
import type { PillarId, StageId, Stage, PillarStages, Challenge, PillarCode } from "@/lib/types";
```

Tipo `Stage` (o que cada card/detalhe de etapa renderiza):

```ts
interface Stage {
  id: StageId;            // "theory" | "guided" | "unguided" | "fill-blanks" | "from-scratch"
  order: number;          // 1..5
  title: string;          // ex.: "1. Teoria"
  short: string;          // resumo de 1 linha
  goal: string;           // objetivo da etapa
  hasAssistance: boolean; // tem dicas/auxilio?
  maxPoints: number;      // pontos da etapa
  details: string[];      // bullets de conteudo
  modes?: ("blocks" | "scratch")[]; // SO na etapa 5
}
```

Mapa etapa -> fontes de dados:

| Etapa | Campos do backend a usar |
|-------|--------------------------|
| `theory` | `Challenge.description`, `Challenge.keyConcepts` (`{term, definition}[]`), `Challenge.dataset`, `Stage.details` |
| `guided` | `Stage.goal`, `Stage.details`, `Challenge.steps`, `Stage.hasAssistance=true` (mostrar dicas) |
| `unguided` | `Stage.goal`, `Stage.details`, `Challenge.steps` (sem revelar dicas) |
| `fill-blanks` | `getCode(pillar)` / `GET /api/code/:pillar` — blocos com `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]` |
| `from-scratch` | `getCode(pillar)` (modo "com blocos") + `Stage.modes` (badges "com blocos" / "do zero") |

Rotas REST equivalentes (para componentes client):

- `GET /api/challenges` -> `{ challenges: Challenge[], stages: PillarStages[], scoring }`
- `GET /api/code/:pillar` -> `PillarCode` = `{ pillar, blocks: CodeBlock[] }`
  - `CodeBlock` = `{ id, title, language, code, highlight? }`. O 1o bloco e o **import block real**.

> Server Components devem importar direto de `@/lib/*` (mais rapido, sem fetch). Use as rotas
> `/api/*` apenas em Client Components que precisem buscar sob demanda.

---

## 2. Componentes propostos (tipados)

```
components/trilha/
  StageTrack.tsx        # a trilha (stepper) com as 5 etapas de um pilar
  StageNode.tsx         # um "no" da trilha: numero, titulo, pontos, estado, badge auxilio
  StageHeader.tsx       # cabecalho do detalhe (pilar + etapa + pontos + progresso)
  StageBadges.tsx       # badges: pontos, "com/sem auxilio", modos (etapa 5)
  stages/
    TheoryStage.tsx       # etapa 1
    GuidedStage.tsx       # etapa 2
    UnguidedStage.tsx     # etapa 3
    FillBlanksStage.tsx   # etapa 4 (usa CodeViewer)
    FromScratchStage.tsx  # etapa 5 (usa CodeViewer + alternancia de modo)
  CodeViewer.tsx        # syntax highlight + botao copiar + realce de [PASSO EM BRANCO]
hooks/
  useStageProgress.ts   # estado de progresso por etapa (ver secao 6)
```

Cada componente de etapa recebe sempre o mesmo contrato base, facilitando o roteamento:

```ts
interface StageViewProps {
  pillar: PillarId;
  challenge: Challenge;
  stage: Stage;
  code?: PillarCode;           // presente nas etapas 4 e 5
  progress: StageProgress;     // ver secao 6
  onProgressChange: (next: Partial<StageProgress>) => void;
}
```

Um "router" simples escolhe o componente por `stage.id`:

```ts
const STAGE_VIEWS: Record<StageId, React.FC<StageViewProps>> = {
  theory: TheoryStage,
  guided: GuidedStage,
  unguided: UnguidedStage,
  "fill-blanks": FillBlanksStage,
  "from-scratch": FromScratchStage,
};
```

Use sempre `ACCENT[pillar]` (classes literais: `.text`, `.border`, `.bg`, `.bgSoft`, `.ring`, `.glow`)
para colorir a trilha conforme o pilar (NLP roxo, VC ciano, AM verde).

---

## 3. A trilha (StageTrack) — navegacao e estados

- **Stepper** com os 5 nos (`StageNode`). Vertical no desktop (lado esquerdo) + conteudo a direita;
  no mobile, stepper horizontal scrollavel no topo.
- Estados visuais de cada no (derivados do progresso — secao 6):
  - **disponivel** (borda neon do pilar),
  - **em andamento** (glow pulsante),
  - **concluida** (check + preenchida),
  - **bloqueada** (opcional: cinza/cadeado — recomendado liberar todas, sem travar o aluno).
- Cada `StageNode` mostra: numero/ordem, titulo curto, **pontos** (`maxPoints`), e badge de
  **auxilio** (`Sparkles` se `hasAssistance`, `Lock` se nao).
- Barra de progresso do pilar no topo: `etapas concluidas / 5` e `pontos possiveis (100)`.
- Botoes "Anterior / Proxima etapa" no rodape do detalhe.

Exemplo (Server Component) montando a trilha do pilar:

```tsx
// app/challenges/[pillar]/page.tsx
import { getChallenge } from "@/lib/challenges";
import { getStages } from "@/lib/stages";

export default function PillarTrackPage({ params }: { params: { pillar: PillarId } }) {
  const challenge = getChallenge(params.pillar);
  const { stages } = getStages(params.pillar);
  return <StageTrack pillar={params.pillar} challenge={challenge} stages={stages} />;
}
```

---

## 4. Detalhe de cada etapa (interface + funcionalidades)

> Regra de ouro: **todo texto vem do backend** (`Stage` / `Challenge`). Nao invente conteudo
> tecnico novo; estilize o que ja existe. Pode adicionar microcopy de UI (botoes, dicas de uso).

### Etapa 1 — Teoria (`theory`, 10 pts, com auxilio)
- **Objetivo de UX:** o aluno entende o problema e os conceitos antes de praticar.
- **Mostrar:**
  - `challenge.description[]` como introducao narrativa (paragrafos).
  - `challenge.keyConcepts[]` como cards "termo -> definicao".
  - `stage.details[]` como bullets de teoria.
  - `challenge.dataset` num box destacado ("Sobre os dados").
- **Especifico por pilar:**
  - **NLP:** caixa "manuscrito" com lacunas `[____]` (efeito papel antigo/CRT) ilustrando o problema.
  - **VC:** grade de exemplos de placas (Pare vs Velocidade) — pode usar placeholders/ilustracao.
  - **AM:** mini-tabela `userId | movieId | rating` ilustrando os dados de recomendacao.
- **Funcionalidades:** botao "Marcar teoria como lida" (atualiza progresso local), CTA "Ir para o treino".
- **Integracao:** somente leitura (`getChallenge` + `getStages`). Progresso via `useStageProgress`.

### Etapa 2 — Treino com auxilio (`guided`, 15 pts, com auxilio)
- **Objetivo de UX:** praticar o pipeline com dicas passo a passo.
- **Mostrar:**
  - `stage.goal` em destaque.
  - `challenge.steps[]` como checklist interativo (o aluno marca cada passo).
  - `stage.details[]` como **dicas** reveladas (porque `hasAssistance === true`).
- **Funcionalidades:**
  - Checklist com persistencia local (cada passo marcado).
  - Painel de "Dicas" expansivel (lampada). Link externo para o notebook/Colab do pilar
    (campo de URL configuravel — ver secao 7).
  - Botao "Concluir treino guiado".
- **Integracao:** leitura + progresso local. (A nota oficial vem do tutor.)

### Etapa 3 — Treino sem auxilio (`unguided`, 20 pts, sem auxilio)
- **Objetivo de UX:** repetir o pipeline sozinho, justificando escolhas.
- **Mostrar:**
  - `stage.goal` + `challenge.steps[]` (sem revelar as dicas da etapa 2).
  - `stage.details[]` apresentados como **objetivos**, nao como dica pronta.
- **Funcionalidades:**
  - Mesma checklist, porem **sem** o painel de dicas (reforcar autonomia).
  - Campo opcional "Justifique suas escolhas" (textarea) salvo localmente — serve de rascunho
    e ja deixa o gancho para envio futuro ao backend (secao 6).
- **Integracao:** leitura + progresso/rascunho local.

### Etapa 4 — Preencher lacunas (`fill-blanks`, 25 pts, sem auxilio)
- **Objetivo de UX:** completar o esqueleto de codigo nas lacunas marcadas.
- **Mostrar (via `getCode(pillar)` / `GET /api/code/:pillar`):**
  - 1o bloco = **import block real** (somente leitura, com "Copiar").
  - Blocos seguintes = esqueleto com `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`.
- **Funcionalidades do `CodeViewer`:**
  - Syntax highlight (Python), tema escuro, botao **Copiar** por bloco.
  - **Realce** visual de cada linha `# [PASSO EM BRANCO ...]` (fundo neon do pilar).
  - Contador "N lacunas para preencher" (conte as ocorrencias do marcador).
  - (Opcional) editor inline read-write apenas nas linhas de lacuna — se for muito custoso,
    manter read-only + "Copiar" e o aluno completa no Colab.
- **Integracao:** consome `PillarCode`. Botao "Marcar etapa concluida" (progresso local).

### Etapa 5 — IA do zero (`from-scratch`, 30 pts, sem auxilio, 2 modos)
- **Objetivo de UX:** construir a solucao final em dois modos.
- **Mostrar:**
  - Alternancia (tabs/switch) entre os modos de `stage.modes`: **"com blocos"** e **"do zero"**.
    - **Com blocos:** reaproveitar `getCode(pillar)` (montar a partir dos componentes prontos).
    - **Do zero:** area "em branco" — instrucoes (`stage.goal`, `stage.details`) + link para o
      ambiente de codigo (Colab/Kaggle) onde o aluno escreve tudo.
  - `stage.details[]` como requisitos de entrega.
- **Funcionalidades:** badges dos 2 modos (`StageBadges`), botao por modo "Marcar modo concluido",
  e "Concluir etapa" so habilita quando ambos os modos estiverem marcados.
- **Integracao:** consome `PillarCode` (modo blocos) + progresso local por modo.

---

## 5. CodeViewer (etapas 4 e 5) — detalhes

- Entrada: `PillarCode.blocks` (`{ id, title, language, code, highlight? }`).
- Para cada bloco: titulo, botao "Copiar" (usa `navigator.clipboard`), highlight de Python.
- Realce dos placeholders: regex por linha contendo `[PASSO EM BRANCO` -> aplicar classe
  `ACCENT[pillar].bgSoft` + borda esquerda na cor do pilar.
- Acessibilidade: `aria-label` no botao copiar; foco visivel; `pre/code` com `tabindex`.

---

## 6. Progresso e ganchos de integracao (IMPORTANTE)

> O backend atual **nao** tem endpoint para o aluno "submeter/concluir etapa": a pontuacao
> e lancada pelo **tutor** (`POST /api/teams/:id/scores`) e exibida no **placar**. Portanto, a
> trilha rastreia progresso **localmente** e ja deixa o codigo pronto para plugar um endpoint
> no futuro, trocando apenas o adapter.

### Tipo de progresso (definir no front)

```ts
// hooks/useStageProgress.ts
export interface StageProgress {
  pillar: PillarId;
  stage: StageId;
  completed: boolean;
  // campos opcionais que ja preparam o envio futuro:
  checklist?: Record<string, boolean>; // passos marcados (etapas 2/3)
  notes?: string;                       // justificativa/rascunho (etapa 3)
  modes?: Partial<Record<"blocks" | "scratch", boolean>>; // etapa 5
  updatedAt?: string;
}
```

### Adapter trocavel (localStorage agora, API depois)

```ts
// Hoje: persistencia local por aluno/navegador.
// Amanha: trocar SOMENTE a implementacao por chamadas fetch (contrato proposto abaixo),
// sem mexer nos componentes de etapa.
export interface ProgressStore {
  get(pillar: PillarId, stage: StageId): StageProgress | null;
  set(p: StageProgress): void;
  pillarSummary(pillar: PillarId): { completed: number; total: number }; // ex.: 3/5
}
```

- Implementacao inicial: `localStorage` com chave `oiaa-progress`.
- A trilha (`StageTrack`) deriva os estados dos nos a partir de `ProgressStore`.

### Contrato PROPOSTO para o futuro (NAO existe ainda — nao implementar no backend)

Marcar claramente como evolucao. Se um dia for criado, o adapter passa a chamar:

- `GET  /api/teams/:teamId/progress?memberId=...` -> `StageProgress[]`
- `PUT  /api/teams/:teamId/progress` body `StageProgress` (provavel `x-admin-token` ou auth de aluno)

> Enquanto isso nao existir, **nao** crie esses arquivos em `app/api`. Deixe apenas o adapter
> local + um comentario `// TODO: trocar por API quando o endpoint de progresso existir`.

### O que JA da para integrar de verdade hoje

- **Placar/pontuacao real:** linkar cada etapa concluida a explicacao "a nota oficial e lancada
  pelo tutor e aparece no /placar". Botao "Ver meu time no placar" -> `/leaderboard`.
- **Tutor:** na trilha, um aviso discreto "Tutores lancam as notas em /admin".

---

## 7. Configuracoes e especificidades por pilar

- **URLs dos notebooks (Colab/Kaggle):** criar um mapa em `lib/links.ts` (front) por pilar e etapa,
  ex.: `{ nlp: { colab: "..." }, vc: {...}, am: {...} }`. Hoje pode apontar para `#` ou para os
  arquivos `.py` da raiz; deixar centralizado para facil edicao.
- **NLP — "Resgatar Palavras Perdidas":** tema manuscrito; lacunas `[____]`; tokenizadores
  (WordPiece/BPE/SentencePiece) aparecem na teoria e no treino.
- **VC — "Ensinando o Carro a 'Ler' Placas":** tema carro autonomo; otimizadores (Adam/SGD/RMSProp)
  e modelos (MLP/CNN/MobileNet) na teoria/treino; 43 classes (Pare vs Velocidade).
- **AM — "Sistema de Recomendacao de Filmes":** tema streaming (Netflix/YouTube/TikTok); dados
  `userId/movieId/rating`; normalizacao e RMSE na teoria/treino.

---

## 8. Identidade visual e responsividade

- Dark mode cyberpunk; cor do pilar em toda a trilha (`ACCENT[pillar]`).
- Stepper com glow sutil na etapa ativa; cards de etapa com borda fina + hover glow.
- Mobile-first: stepper horizontal no topo; conteudo em coluna unica.
- Tipografia: sans para texto; mono para codigo. Titulos grandes por etapa.

---

## 9. Requisitos tecnicos

- Tipado de ponta a ponta (sem `any` solto); usar os tipos de `@/lib/types`.
- **Nao** alterar `web/lib/*` nem `web/app/api/*` (somente consumir).
- Server Components importam de `@/lib/*`; Client Components podem usar `/api/*` + `ProgressStore`.
- Acessibilidade: stepper navegavel por teclado, `aria-current` na etapa ativa, foco visivel.
- `npm run build` deve continuar verde. Deploy Vercel com Root Directory = `web`.
- Autoria: apenas **ThyagoToledo**.

## 10. Criterios de aceite

- [ ] Rota `/challenges/[pillar]` com a trilha das 5 etapas e cor do pilar.
- [ ] As 5 etapas implementadas com os campos reais do backend (sem conteudo inventado).
- [ ] Etapa Teoria com narrativa + conceitos + dataset (e visual tematico por pilar).
- [ ] Treino com auxilio mostra dicas (`hasAssistance`); Treino sem auxilio nao mostra.
- [ ] Preencher lacunas e IA do zero consomem `getCode(pillar)` com highlight + copiar + realce de `[PASSO EM BRANCO]`.
- [ ] Etapa 5 com alternancia dos 2 modos (com blocos / do zero).
- [ ] Progresso via `ProgressStore` (localStorage) com adapter pronto para virar API (comentado, nao implementado no back).
- [ ] Pontos por etapa e progresso do pilar (x/5, /100) visiveis; link para o placar.
- [ ] Responsivo, acessivel e build verde.
