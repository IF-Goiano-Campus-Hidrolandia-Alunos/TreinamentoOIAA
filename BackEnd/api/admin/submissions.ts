import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, ensureSchema, getSql, isAdmin } from "../_db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "metodo nao suportado" });

  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "no-db" });

  if (!isAdmin(req)) {
    return res.status(401).json({ error: "nao autorizado" });
  }

  const teamId = req.query.teamId as string;

  try {
    await ensureSchema(sql);
    let rows: Record<string, any>[];
    if (teamId) {
      rows = (await sql`
        SELECT 
          s.id, 
          s.member_id, 
          m.name AS member_name, 
          t.id AS team_id, 
          t.name AS team_name, 
          s.pillar, 
          s.stage, 
          s.points, 
          s.detail, 
          s.created_at
        FROM submissions s
        JOIN members m ON s.member_id = m.id
        JOIN teams t ON m.team_id = t.id
        WHERE t.id = ${teamId}
        ORDER BY s.created_at DESC
      `) as Record<string, any>[];
    } else {
      rows = (await sql`
        SELECT 
          s.id, 
          s.member_id, 
          m.name AS member_name, 
          t.id AS team_id, 
          t.name AS team_name, 
          s.pillar, 
          s.stage, 
          s.points, 
          s.detail, 
          s.created_at
        FROM submissions s
        JOIN members m ON s.member_id = m.id
        JOIN teams t ON m.team_id = t.id
        ORDER BY s.created_at DESC
      `) as Record<string, any>[];
    }

    const submissions = rows.map((r) => {
      let detailObj = r.detail;
      if (typeof detailObj === "string") {
        try {
          detailObj = JSON.parse(detailObj);
        } catch {}
      }
      return {
        id: r.id,
        memberId: r.member_id,
        memberName: r.member_name,
        teamId: r.team_id,
        teamName: r.team_name,
        pillar: r.pillar,
        stage: r.stage,
        points: Number(r.points),
        detail: detailObj,
        createdAt: r.created_at,
      };
    });

    return res.status(200).json({ submissions });
  } catch (err) {
    console.error("[/api/admin/submissions]", err);
    return res.status(500).json({ error: "erro interno ao buscar submissoes" });
  }
}
