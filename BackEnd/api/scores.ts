import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, getSql, isAdmin, submitScore, validateScore } from "./_db";

// POST /api/scores  (header x-admin-token) -> lanca/atualiza a nota de um integrante.
// body { teamId, memberId, pillar, stage, points }
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "metodo nao suportado" });

  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "no-db" });
  if (!isAdmin(req)) return res.status(401).json({ error: "nao autorizado" });

  const payload = validateScore(req.body);
  if (!payload) return res.status(400).json({ error: "dados invalidos" });

  try {
    const ok = await submitScore(sql, payload);
    return res.status(ok ? 200 : 404).json({ ok });
  } catch (err) {
    console.error("[/api/scores]", err);
    return res.status(500).json({ error: "erro interno" });
  }
}
