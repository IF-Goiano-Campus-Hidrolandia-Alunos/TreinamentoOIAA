import type { PillarId, StageId } from "./types";

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  pillar: PillarId;
  stage: StageId;
  questions: Question[];
}

export const QUIZZES: Record<PillarId, Record<string, Question[]>> = {
  nlp: {
    theory: [
      {
        id: "nlp_t1",
        text: "Qual e o papel principal de um tokenizador em Processamento de Linguagem Natural (NLP)?",
        options: [
          "Aumentar o tamanho do texto original para treinar melhor o modelo.",
          "Converter palavras e textos em numeros (tokens/IDs) que o modelo de IA consegue entender.",
          "Traduzir o texto de portugues para outros idiomas automaticamente.",
          "Corrigir erros gramaticais e ortograficos do manuscrito."
        ],
        correctIndex: 1
      },
      {
        id: "nlp_t2",
        text: "Por que a escolha de um tokenizador adequado e importante para o idioma Portugues?",
        options: [
          "Porque o portugues tem acentuacoes e caracteres especiais que podem ser fragmentados incorretamente por tokenizadores treinados apenas em ingles.",
          "Porque o portugues nao tem palavras longas, dispensando tokenizacao complexa.",
          "Porque os modelos de NLP de ultima geracao nao suportam acentuacao grafica.",
          "Porque o portugues exige obrigatoriamente o uso de SentencePiece para qualquer frase."
        ],
        correctIndex: 0
      },
      {
        id: "nlp_t3",
        text: "No desafio de NLP do manuscrito antigo, qual e a tarefa exata a ser resolvida pelo modelo?",
        options: [
          "Classificar se o texto e de ficcao ou de fatos reais.",
          "Identificar a autoria secreta e a data exata em que o livro foi escrito.",
          "Prever quais palavras preenchem corretamente as lacunas corrompidas no texto."
        ],
        correctIndex: 2
      }
    ],
    guided: [
      {
        id: "nlp_g1",
        text: "No notebook guiado de NLP, qual biblioteca e importada para carregar os tokenizadores pre-treinados?",
        options: [
          "tensorflow",
          "transformers",
          "scikit-learn"
        ],
        correctIndex: 1
      },
      {
        id: "nlp_g2",
        text: "Qual funcao classica do scikit-learn e usada para dividir os dados em conjuntos de treino e teste?",
        options: [
          "split_data",
          "random_split",
          "train_test_split"
        ],
        correctIndex: 2
      }
    ],
    unguided: [
      {
        id: "nlp_u1",
        text: "Qual tecnica e recomendada para otimizar os pontos e a acuracia do modelo de NLP na etapa sem auxilio?",
        options: [
          "Diminuir o tamanho do dataset de treino para acelerar a execucao.",
          "Testar diferentes tipos de tokenizadores (WordPiece, BPE, SentencePiece) e calibrar o tamanho do vocabulario.",
          "Remover todas as pontuacoes, acentos e espacos das frases."
        ],
        correctIndex: 1
      }
    ]
  },
  vc: {
    theory: [
      {
        id: "vc_t1",
        text: "O que representam as 43 classes do dataset GTSRB no desafio de Visao Computacional?",
        options: [
          "43 modelos de carros autonomos diferentes.",
          "43 tipos de placas de transito regulamentadas.",
          "43 cores de sinalizacao de rodovias brasileiras."
        ],
        correctIndex: 1
      },
      {
        id: "vc_t2",
        text: "Qual das seguintes arquiteturas e uma Rede Neural Convolucional (CNN) leve desenvolvida para rodar em dispositivos moveis?",
        options: [
          "MobileNetV2",
          "MLP (Multi-Layer Perceptron)",
          "ResNet152"
        ],
        correctIndex: 0
      },
      {
        id: "vc_t3",
        text: "Qual e o papel do otimizador (ex.: Adam, SGD) no treinamento de uma rede neural de Visao Computacional?",
        options: [
          "Redimensionar as fotos das placas no preprocessamento.",
          "Ajustar os pesos do modelo para minimizar a funcao de perda com base nos erros.",
          "Visualizar as imagens em graficos no matplotlib."
        ],
        correctIndex: 1
      }
    ],
    guided: [
      {
        id: "vc_g1",
        text: "Para qual resolucao (em pixels) as fotos das placas sao redimensionadas no pipeline guiado?",
        options: [
          "1280x720",
          "224x224",
          "48x48"
        ],
        correctIndex: 2
      },
      {
        id: "vc_g2",
        text: "Se o classificador apresentar overfitting (decorar treino e errar validacao), o que e ideal fazer?",
        options: [
          "Aplicar tecnicas como Dropout e Data Augmentation.",
          "Aumentar drasticamente a taxa de aprendizado (learning rate).",
          "Desativar a checagem do conjunto de validacao."
        ],
        correctIndex: 0
      }
    ],
    unguided: [
      {
        id: "vc_u1",
        text: "Na etapa sem auxilio, qual otimizador costuma oferecer convergencia mais estavel e rapida com a configuracao padrao?",
        options: [
          "Adam",
          "SGD simples (sem momentum)",
          "RMSprop com learning rate gigante"
        ],
        correctIndex: 0
      }
    ]
  },
  am: {
    theory: [
      {
        id: "am_t1",
        text: "O que significa a metrica RMSE em modelos preditivos de recomendacao?",
        options: [
          "Recommender Movie System Evaluation.",
          "Rate of Maximum Score Efficiency.",
          "Root Mean Squared Error (Raiz do Erro Quadratico Medio), que avalia o desvio das notas previstas."
        ],
        correctIndex: 2
      },
      {
        id: "am_t2",
        text: "Qual e o beneficio de normalizar as notas (ex. trazer escala de 1-5 para 0-1) em Aprendizado de Maquina?",
        options: [
          "Reduzir o tempo de execucao do preprocessamento no pandas.",
          "Facilitar a convergencia do otimizador do modelo de fatoracao de matrizes.",
          "Garantir que todos os usuarios tenham notas iguais."
        ],
        correctIndex: 1
      },
      {
        id: "am_t3",
        text: "Qual algoritmo e a base classica para recomendacao por filtragem colaborativa via fatoracao de matrizes?",
        options: [
          "Regressao Linear Simples.",
          "SVD (Singular Value Decomposition) ou camadas de Embeddings.",
          "K-Means Clustering."
        ],
        correctIndex: 1
      }
    ],
    guided: [
      {
        id: "am_g1",
        text: "No dataset de recomendacao de filmes, quais sao as colunas chaves usadas no treino?",
        options: [
          "userId, movieId e rating",
          "title, genre e year",
          "userName, movieTitle e timestamp"
        ],
        correctIndex: 0
      },
      {
        id: "am_g2",
        text: "Como e feita a divisao recomendada de dados para validacao em series temporais ou logs?",
        options: [
          "Nao dividir, treinar com tudo e validar nos mesmos dados.",
          "Separar uma porcentagem dos dados (ex: 20%) de forma aleatoria ou temporal antes do treinamento.",
          "Remover usuarios com poucas avaliacoes do dataset."
        ],
        correctIndex: 1
      }
    ],
    unguided: [
      {
        id: "am_u1",
        text: "Para obter um RMSE mais baixo na etapa sem auxilio, qual estrategia de normalizacao e recomendada?",
        options: [
          "Subtrair a media das notas de cada usuario (centralizacao por usuario).",
          "Substituir todos os valores nulos por nota maxima 5.",
          "Apenas embaralhar as linhas do dataset original."
        ],
        correctIndex: 0
      }
    ]
  }
};
