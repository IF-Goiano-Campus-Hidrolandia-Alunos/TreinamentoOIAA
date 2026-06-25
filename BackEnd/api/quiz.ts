import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors } from "./_db";
import { QUIZZES } from "../lib/quizzes";
import type { PillarId } from "../lib/types";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "metodo nao suportado" });

  const pillar = req.query.pillar as string;
  const stage = req.query.stage as string;

  if (!pillar || !stage) {
    return res.status(400).json({ error: "parametros pillar e stage sao obrigatorios" });
  }

  const pillarClean = pillar.toLowerCase() as PillarId;
  const stageClean = stage.toLowerCase();

  const pillarQuizzes = QUIZZES[pillarClean];
  if (!pillarQuizzes) {
    return res.status(404).json({ error: "pilar nao encontrado" });
  }

  const questions = pillarQuizzes[stageClean] || [];
  
  // Remover a resposta correta antes de enviar para o cliente
  const sanitizedQuestions = questions.map((q) => {
    return {
      id: q.id,
      text: q.text,
      options: q.options,
    };
  });

  return res.status(200).json({ questions: sanitizedQuestions });
}
