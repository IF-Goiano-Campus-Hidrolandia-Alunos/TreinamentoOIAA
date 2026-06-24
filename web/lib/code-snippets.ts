import type { PillarCode, PillarId } from "@/lib/types";

// Esqueletos de codigo da Fase 2 ("Estrutura de Codigo-Bruto").
// - O 1o bloco de cada pilar e o "Bloco de importacao de bibliotecas" REAL,
//   extraido do notebook Kaggle correspondente.
// - Os blocos seguintes sao o esqueleto do algoritmo com lacunas marcadas por
//   `# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`, espelhando a ordem das
//   celulas dos notebooks (carregar dados -> escolhas -> modelo -> treino).

const NLP_IMPORTS = `# Esse bloco puxa codigos de outras pessoas que ja fizeram o que a gente precisa
import pandas as pd
import gdown
import os
from transformers import BertTokenizer, GPT2Tokenizer, T5Tokenizer
import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.feature_extraction.text import CountVectorizer
import torch
import torch.nn as nn
import math
from sklearn.model_selection import train_test_split`;

const NLP_SKELETON = `# 1) Carregamento dos dados (train.csv / test.csv)
def load_data_from_drive(train_url, test_url, sample_submission_url):
    # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
    # Baixar os CSVs e retornar os DataFrames de treino, teste e submissao.
    pass

# 2) Escolha do tokenizador adequado ao portugues
#    Opcoes: "wordpiece" | "bpe" | "sentencepiece"
def get_tokenizer(tokenizer_name):
    # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
    # Retornar o tokenizador escolhido a partir do nome.
    pass

# 3) Definicao do modelo que reconstroi as lacunas
class ModeloLinguagem(nn.Module):
    def __init__(self, vocab_size, embed_dim=128):
        super().__init__()
        # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]

    def forward(self, x):
        # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
        pass

# 4) Treino e previsao das palavras perdidas
# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]`;

const VC_IMPORTS = `# Esse bloco puxa codigos de outras pessoas que ja fizeram o que a gente precisa
from tensorflow.keras.losses import SparseCategoricalCrossentropy
from tensorflow.keras.losses import CategoricalCrossentropy
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.losses import MeanSquaredError
from sklearn.model_selection import train_test_split
from tensorflow.keras.optimizers import RMSprop
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.optimizers import SGD
from tensorflow.keras import models, layers
from torch.utils.data import Dataset, DataLoader
from torch.utils.data import random_split
import torchvision.transforms as transforms
from datasets import load_dataset
import matplotlib.pyplot as plt
import tensorflow as tf
import numpy as np
import pandas as pd
import torchvision
from torchvision import transforms
import torch
import torch.nn as nn
import random
import cv2
import os
from PIL import Image
import gdown
import pyarrow.parquet as pq
from torch.utils.data import random_split`;

const VC_SKELETON = `# 1) Divisao treino/validacao (escolha a porcentagem de validacao)
val_percent = 0.30  # [PASSO EM BRANCO - AJUSTE A DIVISAO DOS DADOS]
train_df, val_df = train_test_split(df, test_size=val_percent, random_state=42)

# 2) Escolha do otimizador: "adam" | "sgd" | "rmsprop"
def get_optimizer(model, nome, lr=1e-3):
    # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
    pass

# 3) Escolha do "cerebro" do modelo (MLP, CNN ou MobileNetV2)
class SimpleCNN(nn.Module):
    def __init__(self, num_classes=43):
        super().__init__()
        # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]

    def forward(self, x):
        # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
        pass

# 4) Loop de treino
def train_model(model, train_loader, val_loader, criterion, optimizer, epochs=5):
    # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
    pass`;

const AM_IMPORTS = `import pandas as pd
import numpy as np
import os
import warnings

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.metrics import accuracy_score

import gdown

from google.colab import files`;

const AM_SKELETON = `# 1) Carregar e dividir os dados (escolha a divisao treino/validacao)
train_df, val_df = train_test_split(df, test_size=0.20, random_state=42)
# [PASSO EM BRANCO - AJUSTE A DIVISAO DOS DADOS]

# 2) Pre-processamento: decida o que normalizar
def prepare_data_consistently(train_df, val_df, test_df,
                              normalize_ids=False, normalize_ratings=True):
    # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
    # Normalizar IDs e/ou ratings conforme a escolha.
    pass

# 3) Construir o modelo de recomendacao
def build_recommender(train_df):
    # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
    pass

# 4) Avaliar (RMSE) e gerar submissao
def evaluate(model, val_df):
    # [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]
    # Dica: mean_squared_error(y_true, y_pred, squared=False)
    pass`;

export const CODE: Record<PillarId, PillarCode> = {
  nlp: {
    pillar: "nlp",
    blocks: [
      { id: "nlp-imports", title: "Bloco de importacao de bibliotecas", language: "python", code: NLP_IMPORTS, highlight: true },
      { id: "nlp-skeleton", title: "Esqueleto do algoritmo", language: "python", code: NLP_SKELETON },
    ],
  },
  vc: {
    pillar: "vc",
    blocks: [
      { id: "vc-imports", title: "Bloco de importacao de bibliotecas", language: "python", code: VC_IMPORTS, highlight: true },
      { id: "vc-skeleton", title: "Esqueleto do algoritmo", language: "python", code: VC_SKELETON },
    ],
  },
  am: {
    pillar: "am",
    blocks: [
      { id: "am-imports", title: "Bloco de importacao de bibliotecas", language: "python", code: AM_IMPORTS, highlight: true },
      { id: "am-skeleton", title: "Esqueleto do algoritmo", language: "python", code: AM_SKELETON },
    ],
  },
};

export function getCode(pillar: PillarId): PillarCode {
  return CODE[pillar];
}
