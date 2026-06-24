import type { Challenge, PillarId, Pillar } from "./types";
import { PILLAR_ORDER } from "./stages";

export { PILLAR_ORDER };

export const PILLARS: Record<PillarId, Pillar> = {
  nlp: {
    id: "nlp",
    name: "Processamento de Linguagem Natural",
    shortName: "NLP",
    tagline: "Ensinar máquinas a ler, interpretar e gerar texto humano.",
  },
  vc: {
    id: "vc",
    name: "Visão Computacional",
    shortName: "VC",
    tagline: "Permitir que máquinas vejam e entendam o mundo visual.",
  },
  am: {
    id: "am",
    name: "Aprendizado de Máquina",
    shortName: "AM",
    tagline: "Modelos que aprendem padrões diretamente dos dados.",
  },
};

const CHALLENGES: Record<PillarId, Challenge> = {
  nlp: {
    pillar: "nlp",
    title: "Resgatar Palavras Perdidas em Livros Antigos",
    narrative:
      "Um manuscrito histórico em português foi recuperado de um acervo do interior de Goiás. Páginas borradas, traças e o tempo corroeram trechos inteiros. Sua missão: usar um modelo de linguagem para preencher as lacunas e devolver a memória ao texto.",
    description: [
      "Um manuscrito do século XIX, encontrado em um acervo do interior de Goiás, chegou às mãos da equipe parcialmente ilegível. Traças, umidade e o tempo apagaram dezenas de palavras espalhadas pelo texto.",
      "Sua missão é treinar um modelo de linguagem capaz de inferir as palavras faltantes a partir do contexto que sobrou. Cada lacuna devidamente preenchida é uma memória que volta a existir.",
      "O resultado final será comparado com transcrições conhecidas para medir a fidelidade da reconstrução.",
    ],
    keyConcepts: [
      {
        term: "Tokenização",
        definition:
          "Quebrar o texto em unidades menores (WordPiece, BPE, SentencePiece) compreensíveis pelo modelo.",
      },
      {
        term: "Modelos mascarados (MLM)",
        definition:
          "Modelos como BERT que aprendem a prever palavras escondidas a partir do contexto.",
      },
      {
        term: "Embeddings",
        definition:
          "Representações vetoriais de palavras que capturam significado e contexto.",
      },
      {
        term: "Atenção",
        definition:
          "Mecanismo que permite ao modelo pesar diferentes partes da entrada ao gerar uma predição.",
      },
    ],
    steps: [
      "Carregar e limpar o corpus histórico simulado.",
      "Aplicar o tokenizador escolhido sobre o texto.",
      "Mascarar as lacunas com o token <mask>.",
      "Executar o modelo e coletar as top-k predições.",
      "Avaliar a acurácia top-1 e top-5 contra o gabarito.",
    ],
    dataset:
      "Corpus de literatura portuguesa do séc. XIX (domínio público) + manuscrito histórico simulado com lacunas anotadas.",
  },
  vc: {
    pillar: "vc",
    title: "Ensinando o Carro a 'Ler' Placas de Trânsito",
    narrative:
      "Uma frota de carros autônomos precisa decidir, em milissegundos, se deve parar ou continuar. Sua missão: treinar um classificador robusto que distinga placas de Pare e Velocidade Máxima sob chuva, sol forte e iluminação ruim.",
    description: [
      "Carros autônomos precisam interpretar placas de trânsito em frações de segundo. Um erro pode significar uma frenagem brusca ou um acidente.",
      "Sua missão é treinar um classificador de imagens robusto a chuva, contraluz e oclusão parcial, capaz de distinguir placas de Pare das placas de Velocidade Máxima.",
      "O modelo final será avaliado em um conjunto de teste cego com 43 classes derivadas do GTSRB.",
    ],
    keyConcepts: [
      {
        term: "Convoluções",
        definition:
          "Filtros que percorrem a imagem extraindo padrões locais como bordas e texturas.",
      },
      {
        term: "Data augmentation",
        definition:
          "Gerar variações artificiais (rotação, ruído, brilho) para tornar o modelo mais robusto.",
      },
      {
        term: "Transfer learning",
        definition:
          "Reaproveitar pesos de um modelo pré-treinado (MobileNet, ResNet) e ajustar para o problema.",
      },
      {
        term: "Otimizadores",
        definition:
          "Algoritmos como Adam, SGD e RMSProp que ajustam os pesos minimizando a função de perda.",
      },
    ],
    steps: [
      "Carregar e dividir o dataset em treino, validação e teste.",
      "Definir as transformações (resize, normalização, augmentations).",
      "Escolher a arquitetura (MLP, CNN simples ou MobileNet).",
      "Treinar com early stopping e monitorar acurácia/perda.",
      "Avaliar matriz de confusão e métricas por classe.",
    ],
    dataset:
      "Subconjunto curado do GTSRB (German Traffic Sign Recognition Benchmark) com 43 classes + amostras locais.",
  },
  am: {
    pillar: "am",
    title: "Construindo um Sistema de Recomendação de Filmes",
    narrative:
      "Imagine a próxima geração do Netflix, do YouTube e do TikTok rodando em um modelo treinado por você. Sua missão: prever o que cada usuário vai amar assistir, equilibrando o que ele já gostou com a descoberta de novidades.",
    description: [
      "Plataformas como Netflix, YouTube e TikTok dependem de recomendadores que aprendem com bilhões de interações de usuários.",
      "Sua missão é construir um recomendador que, a partir do histórico de notas, prediga o que cada usuário tem mais chance de gostar.",
      "O sistema deve equilibrar relevância (acertar o que o usuário curte) e diversidade (sugerir novidades).",
    ],
    keyConcepts: [
      {
        term: "Filtragem colaborativa",
        definition:
          "Usar o padrão de interação de usuários parecidos para sugerir itens novos.",
      },
      {
        term: "Fatoração de matrizes (SVD)",
        definition:
          "Decompor a matriz usuário × item em fatores latentes que capturam preferências.",
      },
      {
        term: "Cold start",
        definition:
          "Problema de recomendar para usuários ou itens sem histórico suficiente.",
      },
      {
        term: "RMSE",
        definition:
          "Raiz do erro quadrático médio entre a nota prevista e a real — métrica clássica de regressão.",
      },
    ],
    steps: [
      "Carregar o MovieLens e inspecionar a distribuição de notas.",
      "Construir a matriz esparsa userId × movieId.",
      "Treinar a fatoração de matrizes (TruncatedSVD).",
      "Gerar recomendações top-N por usuário.",
      "Avaliar RMSE e diversidade do top-10.",
    ],
    dataset: "MovieLens 1M (userId, movieId, rating, timestamp) com metadados expandidos.",
  },
};

export function getAllChallenges(): Challenge[] {
  return PILLAR_ORDER.map((p) => CHALLENGES[p]);
}

export function getChallenge(id: PillarId): Challenge {
  return CHALLENGES[id];
}
