import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, getSql, getAnswerKey, countAttempts, lastSubmissionAt } from "./_db";
import { QUIZZES } from "../lib/quizzes";
import { calculateMetricPoints, computeAccuracy, computeRmse, STAGE_MAX_POINTS } from "../lib/grading";
import { parseCsvMap } from "../lib/csv";
import type { PillarId, StageId, ScoreEntry } from "../lib/types";

// Anti-spam / anti-brute-force: intervalo minimo entre envios e teto de tentativas por etapa.
const COOLDOWN_MS = 4000;
const MAX_ATTEMPTS_PER_STAGE = 10;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "metodo nao suportado" });

  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "no-db" });

  const headerCode = req.headers["x-member-code"] || req.headers["x-access-code"];
  if (!headerCode || typeof headerCode !== "string") {
    return res.status(401).json({ error: "codigo de acesso nao informado" });
  }

  const codeClean = headerCode.trim().toUpperCase();
  const { pillar, stage, kind, payload } = req.body || {};

  if (!pillar || !stage || !kind || !payload) {
    return res.status(400).json({ error: "parametros insuficientes" });
  }

  const pillarClean = pillar.toLowerCase() as PillarId;
  const stageClean = stage.toLowerCase() as StageId;

  // 1. Validar integrante
  const members = (await sql`
    SELECT id, team_id, name, scores, access_code 
    FROM members 
    WHERE UPPER(access_code) = ${codeClean}
    LIMIT 1
  `) as Record<string, any>[];

  if (members.length === 0) {
    return res.status(401).json({ error: "codigo de acesso invalido" });
  }

  const member = members[0];

  // Rate limit (cooldown global) + teto de tentativas por etapa
  try {
    const lastTs = await lastSubmissionAt(sql, member.id);
    if (lastTs && Date.now() - lastTs < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (Date.now() - lastTs)) / 1000);
      return res.status(429).json({ error: `Aguarde ${wait}s antes de enviar novamente.` });
    }
    const attempts = await countAttempts(sql, member.id, pillarClean, stageClean);
    if (attempts >= MAX_ATTEMPTS_PER_STAGE) {
      return res
        .status(429)
        .json({ error: `Limite de ${MAX_ATTEMPTS_PER_STAGE} tentativas nesta etapa atingido.` });
    }
  } catch (e) {
    // Falha no controle de rate limit nao deve bloquear a submissao legitima.
    console.warn("[/api/submit] rate-limit check falhou:", e);
  }

  const maxPoints = STAGE_MAX_POINTS[stageClean] || 0;

  let calculatedPoints = 0;
  let detailObj: Record<string, any> = {};

  // 2. Corrigir submissao conforme tipo
  if (kind === "quiz") {
    const questions = QUIZZES[pillarClean]?.[stageClean] || [];
    if (questions.length === 0) {
      return res.status(400).json({ error: "este estagio nao possui quiz" });
    }

    const { answers } = payload;
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "respostas invalidas" });
    }

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    calculatedPoints = Math.round(maxPoints * (correctCount / questions.length));
    detailObj = {
      answers,
      correctCount,
      totalQuestions: questions.length,
    };
  } else if (kind === "metric") {
    const { value, mode } = payload;
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return res.status(400).json({ error: "valor de metrica invalido" });
    }

    calculatedPoints = calculateMetricPoints(pillarClean, stageClean, numValue);
    detailObj = {
      value: numValue,
      mode,
    };
  } else if (kind === "csv") {
    // Auto-correcao "estilo Kaggle": compara o CSV de previsoes do aluno com o
    // gabarito cadastrado pelo tutor e converte a metrica em pontos.
    const { csv, mode } = payload;
    if (typeof csv !== "string" || !csv.trim()) {
      return res.status(400).json({ error: "CSV vazio ou invalido" });
    }
    const key = await getAnswerKey(sql, pillarClean, stageClean);
    if (!key) {
      return res.status(400).json({ error: "gabarito ainda nao foi cadastrado para esta etapa" });
    }
    const predMap = parseCsvMap(csv);
    if (Object.keys(predMap).length === 0) {
      return res.status(400).json({ error: "nao foi possivel ler previsoes do CSV (use colunas id,valor)" });
    }
    const metricValue =
      key.metric === "rmse" ? computeRmse(predMap, key.keys) : computeAccuracy(predMap, key.keys);
    calculatedPoints = calculateMetricPoints(pillarClean, stageClean, metricValue);
    detailObj = {
      kind: "csv",
      metric: key.metric,
      metricValue: Math.round(metricValue * 10000) / 10000,
      predicted: Object.keys(predMap).length,
      total: Object.keys(key.keys).length,
      mode,
    };
  } else {
    return res.status(400).json({ error: "tipo de submissao desconhecido" });
  }

  try {
    // 3. Gravar submissao no historico
    const submissionId = `sub_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date().toISOString();

    await sql`
      INSERT INTO submissions (id, member_id, pillar, stage, points, detail, created_at)
      VALUES (${submissionId}, ${member.id}, ${pillarClean}, ${stageClean}, ${calculatedPoints}, ${JSON.stringify(detailObj)}::jsonb, ${createdAt})
    `;

    // 4. Buscar a melhor pontuacao (best-score) para esta etapa/pilar
    const submissionsResult = (await sql`
      SELECT MAX(points) as max_points 
      FROM submissions 
      WHERE member_id = ${member.id} AND pillar = ${pillarClean} AND stage = ${stageClean}
    `) as Record<string, any>[];

    const bestPoints = submissionsResult[0]?.max_points != null ? Number(submissionsResult[0].max_points) : calculatedPoints;

    // 5. Atualizar member.scores com a melhor pontuacao
    let currentScores: ScoreEntry[] = [];
    if (member.scores) {
      if (Array.isArray(member.scores)) {
        currentScores = member.scores as ScoreEntry[];
      } else if (typeof member.scores === "string") {
        try {
          currentScores = JSON.parse(member.scores) as ScoreEntry[];
        } catch {
          currentScores = [];
        }
      }
    }

    // Filtrar scores antigos da mesma etapa/pilar e inserir o melhor
    const newScores = currentScores.filter(
      (s) => !(s.pillar === pillarClean && s.stage === stageClean)
    );
    newScores.push({
      pillar: pillarClean,
      stage: stageClean,
      points: bestPoints,
    });

    await sql`
      UPDATE members 
      SET scores = ${JSON.stringify(newScores)}::jsonb 
      WHERE id = ${member.id}
    `;

    return res.status(200).json({
      points: calculatedPoints,
      best: bestPoints,
      scores: newScores,
    });
  } catch (err) {
    console.error("[/api/submit]", err);
    return res.status(500).json({ error: "erro interno ao processar a submissao" });
  }
}
