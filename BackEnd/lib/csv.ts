// Parser de CSV minimalista (sem dependencias). Espera duas colunas: id, valor.
// Aceita separador "," ou ";". Ignora a 1a linha se parecer cabecalho
// (ex.: "id,label", "id,prediction", "id,rating").

export function parseCsvMap(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!text) return out;

  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return out;

  const splitLine = (l: string) => {
    const sep = l.includes(";") && !l.includes(",") ? ";" : ",";
    return l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
  };

  // Detecta cabecalho: 1a linha cujo 2o campo nao e numerico e parece rotulo.
  let start = 0;
  const first = splitLine(lines[0]);
  const secondIsNumber = first.length > 1 && first[1] !== "" && Number.isFinite(Number(first[1]));
  const looksHeader = /id|label|prediction|rating|class|target|previsao|previsão/i.test(lines[0]);
  if (looksHeader && !secondIsNumber) start = 1;

  for (let i = start; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    if (cols.length < 2) continue;
    const id = cols[0];
    const value = cols[1];
    if (id !== "") out[id] = value;
  }
  return out;
}
