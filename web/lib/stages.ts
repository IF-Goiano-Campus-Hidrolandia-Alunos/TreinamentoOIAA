import type { PillarId, PillarStages, Stage } from "@/lib/types";

// As 5 partes de cada desafio. A pontuacao por etapa soma 100 por pilar
// (3 pilares => 300 pontos maximos por integrante).

export const STAGE_MAX_POINTS: Record<Stage["id"], number> = {
  theory: 10,
  guided: 15,
  unguided: 20,
  "fill-blanks": 25,
  "from-scratch": 30,
};

/** Total de pontos possiveis por pilar (soma das 5 etapas). */
export const POINTS_PER_PILLAR = Object.values(STAGE_MAX_POINTS).reduce((a, b) => a + b, 0); // 100

/** Numero de pilares com etapas. */
export const PILLAR_COUNT = 3;

/** Total de etapas (3 pilares x 5). */
export const TOTAL_STAGES = PILLAR_COUNT * 5;

/** Pontos maximos por integrante (todos os pilares e etapas). */
export const MAX_POINTS_TOTAL = POINTS_PER_PILLAR * PILLAR_COUNT; // 300

type StageContent = Pick<Stage, "goal" | "details"> & { short: string };

// Conteudo especifico de cada etapa por pilar.
const CONTENT: Record<PillarId, Record<Stage["id"], StageContent>> = {
  nlp: {
    theory: {
      short: "Entenda o problema das lacunas e os conceitos de NLP.",
      goal: "Compreender dados, tokenizador e modelo antes de treinar.",
      details: [
        "Objetivo: prever trechos faltantes de um manuscrito em portugues.",
        "Dados: texto bruto (frases do livro).",
        "Tokenizador: transforma texto em numeros (WordPiece, BPE, SentencePiece).",
        "Modelo: a mente que aprende e reconstroi o que falta.",
      ],
    },
    guided: {
      short: "Treino basico COM auxilio: pipeline passo a passo.",
      goal: "Rodar o fluxo completo com dicas em cada escolha.",
      details: [
        "Carregar os dados de treino/teste.",
        "Escolher um tokenizador (dica: portugues tem acentos).",
        "Treinar um modelo simples e observar a metrica.",
      ],
    },
    unguided: {
      short: "Treino SEM auxilio: repita o fluxo sozinho.",
      goal: "Reproduzir o pipeline sem dicas, justificando as escolhas.",
      details: [
        "Repetir carregamento, tokenizacao e treino sem orientacao.",
        "Comparar tokenizadores/modelos e registrar o melhor resultado.",
      ],
    },
    "fill-blanks": {
      short: "Complete as lacunas do esqueleto de NLP.",
      goal: "Implementar as partes marcadas com [PASSO EM BRANCO].",
      details: [
        "load_data_from_drive(): retornar os DataFrames.",
        "get_tokenizer(name): retornar o tokenizador escolhido.",
        "ModeloLinguagem: definir __init__ e forward.",
        "Loop de treino e previsao das palavras.",
      ],
    },
    "from-scratch": {
      short: "Construa o preditor de lacunas: com blocos e do zero.",
      goal: "Entregar a IA funcionando nos dois modos.",
      details: [
        "Modo com blocos: montar usando os componentes prontos.",
        "Modo do zero: escrever todo o pipeline com o que aprendeu.",
      ],
    },
  },

  vc: {
    theory: {
      short: "Entenda a classificacao de placas e os conceitos de VC.",
      goal: "Compreender dados, modelo e otimizador antes de treinar.",
      details: [
        "Objetivo: diferenciar 'Pare' de 'Velocidade Maxima' (43 classes).",
        "Dados: fotos das placas (48x48, 3 canais).",
        "Modelo: rede que reconhece as placas (MLP, CNN, MobileNetV2).",
        "Otimizador: ajusta os pesos para reduzir o erro (Adam, SGD, RMSProp).",
      ],
    },
    guided: {
      short: "Treino basico COM auxilio: classificador guiado.",
      goal: "Rodar treino/validacao com dicas em cada escolha.",
      details: [
        "Dividir treino/validacao (dica: comece com 70/30).",
        "Escolher o otimizador (dica: Adam costuma ser robusto).",
        "Treinar uma CNN simples e medir a acuracia.",
      ],
    },
    unguided: {
      short: "Treino SEM auxilio: repita o classificador sozinho.",
      goal: "Reproduzir treino/validacao sem dicas.",
      details: [
        "Definir divisao, otimizador e arquitetura por conta propria.",
        "Comparar modelos e registrar a melhor acuracia.",
      ],
    },
    "fill-blanks": {
      short: "Complete as lacunas do esqueleto de VC.",
      goal: "Implementar as partes marcadas com [PASSO EM BRANCO].",
      details: [
        "get_optimizer(model, nome, lr): retornar o otimizador.",
        "SimpleCNN: definir camadas (__init__) e forward.",
        "train_model(): completar o loop de treino/validacao.",
      ],
    },
    "from-scratch": {
      short: "Construa o classificador de placas: com blocos e do zero.",
      goal: "Entregar a IA funcionando nos dois modos.",
      details: [
        "Modo com blocos: montar usando os componentes prontos.",
        "Modo do zero: escrever a rede e o treino do zero.",
      ],
    },
  },

  am: {
    theory: {
      short: "Entenda recomendacao de filmes e os conceitos de AM.",
      goal: "Compreender os dados e o pre-processamento antes de treinar.",
      details: [
        "Objetivo: prever a nota/filme que o usuario vai gostar.",
        "Dados: userId, movieId, rating.",
        "Normalizacao: levar valores para a escala 0-1 quando ajuda.",
        "Metrica: erro (RMSE) entre nota prevista e real.",
      ],
    },
    guided: {
      short: "Treino basico COM auxilio: recomendador guiado.",
      goal: "Rodar o fluxo com dicas em cada decisao.",
      details: [
        "Dividir treino/validacao (dica: 80/20 e um bom inicio).",
        "Decidir o que normalizar (IDs? ratings?).",
        "Treinar um modelo simples e medir o RMSE.",
      ],
    },
    unguided: {
      short: "Treino SEM auxilio: repita o recomendador sozinho.",
      goal: "Reproduzir o fluxo sem dicas.",
      details: [
        "Definir divisao, normalizacao e modelo por conta propria.",
        "Comparar abordagens e registrar o melhor RMSE.",
      ],
    },
    "fill-blanks": {
      short: "Complete as lacunas do esqueleto de AM.",
      goal: "Implementar as partes marcadas com [PASSO EM BRANCO].",
      details: [
        "prepare_data_consistently(): normalizar conforme escolhido.",
        "build_recommender(): construir o modelo.",
        "evaluate(): calcular o RMSE e gerar a submissao.",
      ],
    },
    "from-scratch": {
      short: "Construa o recomendador: com blocos e do zero.",
      goal: "Entregar a IA funcionando nos dois modos.",
      details: [
        "Modo com blocos: montar usando os componentes prontos.",
        "Modo do zero: escrever todo o pipeline do zero.",
      ],
    },
  },
};

const ORDER: Stage["id"][] = ["theory", "guided", "unguided", "fill-blanks", "from-scratch"];

const META: Record<Stage["id"], { title: string; hasAssistance: boolean }> = {
  theory: { title: "1. Teoria", hasAssistance: true },
  guided: { title: "2. Treino com auxilio", hasAssistance: true },
  unguided: { title: "3. Treino sem auxilio", hasAssistance: false },
  "fill-blanks": { title: "4. Preencher lacunas", hasAssistance: false },
  "from-scratch": { title: "5. IA do zero", hasAssistance: false },
};

function buildStages(pillar: PillarId): Stage[] {
  return ORDER.map((id, i) => {
    const c = CONTENT[pillar][id];
    const stage: Stage = {
      id,
      order: i + 1,
      title: META[id].title,
      short: c.short,
      goal: c.goal,
      hasAssistance: META[id].hasAssistance,
      maxPoints: STAGE_MAX_POINTS[id],
      details: c.details,
    };
    if (id === "from-scratch") stage.modes = ["blocks", "scratch"];
    return stage;
  });
}

export const STAGES: Record<PillarId, PillarStages> = {
  nlp: { pillar: "nlp", stages: buildStages("nlp") },
  vc: { pillar: "vc", stages: buildStages("vc") },
  am: { pillar: "am", stages: buildStages("am") },
};

export function getStages(pillar: PillarId): PillarStages {
  return STAGES[pillar];
}

/** Retorna os pontos maximos de uma etapa especifica. */
export function stageMax(stage: Stage["id"]): number {
  return STAGE_MAX_POINTS[stage];
}
