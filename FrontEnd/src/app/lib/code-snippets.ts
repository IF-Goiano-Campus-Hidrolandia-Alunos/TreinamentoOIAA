import type { PillarCode, PillarId } from "./types";

const PLACEHOLDER = "# [PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA]";

const IMPORTS: Record<PillarId, string> = {
  nlp: `# Bloco de importacao de bibliotecas
import re
import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM
from datasets import load_dataset
import numpy as np`,
  vc: `# Bloco de importacao de bibliotecas
import torch
import torch.nn as nn
import torchvision
from torchvision import transforms, models
from torch.utils.data import DataLoader
import numpy as np`,
  am: `# Bloco de importacao de bibliotecas
import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity`,
};

const PILLAR_BLOCKS: Record<PillarId, { title: string; code: string }[]> = {
  nlp: [
    {
      title: "Carregar e limpar o corpus histórico",
      code: `def carregar_manuscrito(caminho: str) -> str:
    ${PLACEHOLDER}
    # Sugestão: ler arquivo, normalizar encoding, remover ruído OCR.
    pass`,
    },
    {
      title: "Mascarar lacunas para o modelo",
      code: `def mascarar_lacunas(texto: str, marcador: str = "[____]") -> str:
    ${PLACEHOLDER}
    # Substituir [____] pelo token <mask> do tokenizer.
    pass`,
    },
    {
      title: "Predição com modelo de linguagem",
      code: `def prever_palavras(texto_mascarado: str, modelo, tokenizer):
    ${PLACEHOLDER}
    pass`,
    },
  ],
  vc: [
    {
      title: "Pipeline de pré-processamento das placas",
      code: `def make_transforms():
    ${PLACEHOLDER}
    # Resize, normalização, augmentations.
    pass`,
    },
    {
      title: "Definir arquitetura CNN",
      code: `class PlacaClassifier(nn.Module):
    def __init__(self, num_classes: int = 2):
        super().__init__()
        ${PLACEHOLDER}

    def forward(self, x):
        ${PLACEHOLDER}`,
    },
    {
      title: "Loop de treinamento",
      code: `def treinar(modelo, loader, epochs: int = 10):
    ${PLACEHOLDER}
    pass`,
    },
  ],
  am: [
    {
      title: "Construir matriz usuário × filme",
      code: `def construir_matriz(df: pd.DataFrame) -> csr_matrix:
    ${PLACEHOLDER}
    pass`,
    },
    {
      title: "Fatoração de matrizes (SVD)",
      code: `def treinar_svd(matriz: csr_matrix, k: int = 50):
    ${PLACEHOLDER}
    pass`,
    },
    {
      title: "Gerar recomendações top-N",
      code: `def recomendar(user_id: int, modelo, n: int = 10):
    ${PLACEHOLDER}
    pass`,
    },
  ],
};

export function getCode(pillar: PillarId): PillarCode {
  return {
    pillar,
    blocks: [
      {
        id: `${pillar}-imports`,
        title: "Bloco de importação de bibliotecas",
        language: "python",
        code: IMPORTS[pillar],
        hasPlaceholder: false,
      },
      ...PILLAR_BLOCKS[pillar].map((b, i) => ({
        id: `${pillar}-${i + 1}`,
        title: b.title,
        language: "python",
        code: b.code,
        hasPlaceholder: b.code.includes(PLACEHOLDER),
      })),
    ],
  };
}

export function countPlaceholders(code: string): number {
  return (code.match(/# \[PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA\]/g) || []).length;
}
