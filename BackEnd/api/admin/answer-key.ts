import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, deleteAnswerKey, ensureSchema, getSql, isAdmin, setAnswerKey } from "../_db";
import { parseCsvMap } from "../../lib/csv";
import { GRADING_CONFIGS } from "../../lib/grading";
import type { PillarId } from "../../lib/types";

// GET  /api/admin/answer-key            -> status dos gabaritos cadastrados (admin)
// POST /api/admin/answer-key            -> cadastra/atualiza gabarito (admin)
//   body { pillar, stage, csv, metric? }  (metric default deriva do pilar)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "no-db" });
  if (!isAdmin(req)) return res.status(401).json({ error: "nao autorizado" });

  try {
    await ensureSchema(sql);
    if (req.method === "GET") {
      const rows = (await sql`
        SELECT pillar, stage, metric, updated_at,
               (SELECT count(*) FROM jsonb_object_keys(keys)) AS n
        FROM answer_keys
        ORDER BY pillar, stage
      `) as Record<string, any>[];
      return res.status(200).json({
        keys: rows.map((r) => ({
          pillar: r.pillar,
          stage: r.stage,
          metric: r.metric,
          count: Number(r.n),
          updatedAt: r.updated_at,
        })),
      });
    }

    if (req.method === "POST") {
      const { pillar, stage, csv, metric } = req.body || {};
      if (typeof pillar !== "string" || typeof stage !== "string" || typeof csv !== "string") {
        return res.status(400).json({ error: "pillar, stage e csv sao obrigatorios" });
      }
      const pillarClean = pillar.toLowerCase() as PillarId;
      const stageClean = stage.toLowerCase();
      const cfg = GRADING_CONFIGS[pillarClean];
      if (!cfg) return res.status(400).json({ error: "pilar invalido" });

      const metricResolved =
        typeof metric === "string" && (metric === "rmse" || metric === "accuracy")
          ? metric
          : cfg.lowerIsBetter
            ? "rmse"
            : "accuracy";

      const keys = parseCsvMap(csv);
      if (Object.keys(keys).length === 0) {
        return res
          .status(400)
          .json({ error: "nao foi possivel ler o gabarito (use colunas id,valor)" });
      }

      const count = await setAnswerKey(sql, pillarClean, stageClean, metricResolved, keys);
      return res.status(200).json({ ok: true, pillar: pillarClean, stage: stageClean, metric: metricResolved, count });
    }

    if (req.method === "DELETE") {
      const pillar = typeof req.query.pillar === "string" ? req.query.pillar.toLowerCase() : "";
      const stage = typeof req.query.stage === "string" ? req.query.stage.toLowerCase() : "";
      if (!pillar || !stage) return res.status(400).json({ error: "pillar e stage obrigatorios" });
      const ok = await deleteAnswerKey(sql, pillar, stage);
      return res.status(ok ? 200 : 404).json({ ok });
    }

    return res.status(405).json({ error: "metodo nao suportado" });
  } catch (err) {
    console.error("[/api/admin/answer-key]", err);
    return res.status(500).json({ error: "erro interno" });
  }
}
