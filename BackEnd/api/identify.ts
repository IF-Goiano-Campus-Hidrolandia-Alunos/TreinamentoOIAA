import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, getSql } from "./_db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "metodo nao suportado" });

  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "no-db" });

  const { accessCode } = req.body || {};
  if (typeof accessCode !== "string" || !accessCode.trim()) {
    return res.status(400).json({ error: "codigo de acesso obrigatorio" });
  }

  const codeClean = accessCode.trim().toUpperCase();

  try {
    const rows = (await sql`
      SELECT 
        m.id AS member_id, 
        m.name AS member_name, 
        m.access_code, 
        t.id AS team_id, 
        t.name AS team_name
      FROM members m
      JOIN teams t ON m.team_id = t.id
      WHERE UPPER(m.access_code) = ${codeClean}
      LIMIT 1
    `) as Record<string, any>[];

    if (rows.length === 0) {
      return res.status(401).json({ error: "codigo de acesso invalido" });
    }

    const row = rows[0];
    return res.status(200).json({
      member: {
        id: row.member_id,
        name: row.member_name,
        teamId: row.team_id,
        teamName: row.team_name,
        accessCode: row.access_code,
      },
    });
  } catch (err) {
    console.error("[/api/identify]", err);
    return res.status(500).json({ error: "erro interno" });
  }
}
