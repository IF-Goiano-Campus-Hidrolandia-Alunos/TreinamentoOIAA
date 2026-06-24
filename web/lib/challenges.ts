import type { Challenge, PillarId } from "@/lib/types";

// Conteudo extraido diretamente dos notebooks Kaggle da 1a Fase
// (Linguagem Natural, Visao Computacional e Aprendizado de Maquina).
// As strings de narrativa sao as reais usadas nos desafios.

export const CHALLENGES: Record<PillarId, Challenge> = {
  nlp: {
    id: "nlp",
    abbr: "NLP",
    name: "Processamento de Linguagem Natural",
    challengeTitle: "Resgatar Palavras Perdidas em Livros Antigos",
    tagline: "Preveja os trechos faltantes de um manuscrito historico corroido pelo tempo.",
    accent: "nlp",
    accentLabel: "Roxo / Violeta neon",
    description: [
      "Imagine uma descoberta historica: pesquisadores da lingua portuguesa encontram um manuscrito raríssimo, uma janela para o passado. O problema? O tempo foi cruel, e muitas de suas paginas estao corroidas, deixando lacunas na historia.",
      "E aqui que sua jornada comeca. Como especialista em IA, voce tem a chance de dar vida nova a essa obra, treinando um modelo para prever os trechos faltantes.",
      "Felizmente, as ferramentas para essa expedicao ja estao prontas. Seu papel nao e o de construtor, mas o de guia: voce ira escolher os melhores caminhos para levar o modelo ate o tesouro do conhecimento perdido.",
    ],
    keyConcepts: [
      { term: "Dados", definition: "Qualquer informacao bruta (tabelas, frases, texto do livro)." },
      { term: "Tokenizador", definition: "\"Picador\" de palavras que transforma texto em numeros que o computador entende." },
      { term: "Modelo", definition: "A mente que aprende com esses numeros e reconstroi o que falta." },
    ],
    steps: [
      "Carregar os dados (train.csv / test.csv) do acervo.",
      "Escolher o tokenizador (WordPiece, BPE ou SentencePiece) adequado ao portugues.",
      "Selecionar o modelo que tentara reconstruir as lacunas.",
      "Treinar e avaliar a previsao das palavras perdidas.",
    ],
    dataset: "Texto em portugues com lacunas a serem previstas. Tokenizadores disponiveis: WordPiece, Byte Pair Encoding (BPE) e SentencePiece.",
  },

  vc: {
    id: "vc",
    abbr: "VC",
    name: "Visao Computacional",
    challengeTitle: "Ensinando o Carro a \"Ler\" Placas de Transito",
    tagline: "Classifique placas de transito para um carro autonomo diferenciar \"Pare\" de limites de velocidade.",
    accent: "vc",
    accentLabel: "Ciano / Azul eletrico neon",
    description: [
      "Sua nova missao: como engenheiro(a) de IA, voce se junta a uma inovadora empresa de carros autonomos. O objetivo e claro: criar um modelo de visao computacional que seja um especialista em placas de transito.",
      "Seu trabalho se assemelha ao de um instrutor de transito, e o modelo e o seu aluno mais dedicado.",
      "Voce precisa ensina-lo a diferenciar um \"Pare\" de uma placa de \"Velocidade Maxima\", garantindo que, ao final do treinamento, ele possa guiar um veiculo de forma autonoma e segura.",
    ],
    keyConcepts: [
      { term: "Dados", definition: "Fotos das placas (material didatico) usadas para treino e validacao." },
      { term: "Modelo", definition: "A rede que vai aprender a reconhecer as placas (MLP, CNN, MobileNetV2...)." },
      { term: "Otimizador", definition: "Algoritmo que ajusta os pesos do modelo apos cada passo para reduzir o erro (Adam, SGD, RMSProp)." },
    ],
    steps: [
      "Carregar os dados (imagens das placas) e dividir em treino/validacao.",
      "Escolher o otimizador (Adam, SGD+Momentum ou RMSProp).",
      "Escolher o \"cerebro\" do modelo (MLP, CNN, MobileNetV2).",
      "Treinar o modelo e medir a acuracia na validacao.",
    ],
    dataset: "Dataset estilo GTSRB com 43 classes de placas (48x48, 3 canais). Divisao treino/validacao definida pelo participante.",
  },

  am: {
    id: "am",
    abbr: "AM",
    name: "Aprendizado de Maquina",
    challengeTitle: "Construindo um Sistema de Recomendacao de Filmes",
    tagline: "Crie um modelo preditivo que adivinha o proximo filme perfeito, como Netflix, YouTube e TikTok.",
    accent: "am",
    accentLabel: "Verde limao / Esmeralda neon",
    description: [
      "Voce e um engenheiro em IA, e uma grande empresa lhe chamou para fazer um Sistema de Recomendacao para eles. A recomendacao de conteudo esta muito conectada a nos: quando assistimos Netflix, YouTube e TikTok, todo video que e recomendado a nos e feito por um processo chamado \"Sistema de Recomendacao\".",
      "Com isso, precisamos, assim como Netflix, YouTube e TikTok, criar um sistema que adivinhe o que vamos gostar. Sua missao e treinar um modelo que sugira o proximo filme perfeito.",
    ],
    keyConcepts: [
      { term: "userId", definition: "Quem assistiu (identificador do usuario)." },
      { term: "movieId", definition: "Qual filme foi assistido (identificador do item)." },
      { term: "rating", definition: "A nota dada pelo usuario ao filme." },
      { term: "Normalizacao", definition: "Transforma valores de uma escala para 0-1 (ex.: notas 1-5 viram 0-1)." },
    ],
    steps: [
      "Carregar os dados (userId, movieId, rating) e dividir em treino/validacao.",
      "Decidir o pre-processamento: normalizar IDs e/ou ratings.",
      "Construir o modelo preditivo de recomendacao.",
      "Avaliar com RMSE / acuracia e gerar a submissao.",
    ],
    dataset: "Tabela de avaliacoes (userId, movieId, rating). Metricas previstas: mean_squared_error e accuracy_score.",
  },
};

/** Lista ordenada de pilares para navegacao/cards. */
export const PILLAR_ORDER: PillarId[] = ["nlp", "vc", "am"];

export function getChallenge(id: PillarId): Challenge {
  return CHALLENGES[id];
}

export function getAllChallenges(): Challenge[] {
  return PILLAR_ORDER.map((id) => CHALLENGES[id]);
}
