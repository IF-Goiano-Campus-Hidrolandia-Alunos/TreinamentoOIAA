import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  applyCors,
  createTeam,
  deleteTeam,
  getSql,
  isAdmin,
  listTeams,
  validateCreate,
} from "./_db";

// GET    /api/teams           -> { teams: Team[] }  (lista crua; ranking no client)
// POST   /api/teams           -> cria time (aberto)  body { name, tutor, members[] }
// DELETE /api/teams?id=...     -> remove time (header x-admin-token)
export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const sql = getSql();
  // Sem DATABASE_URL nao ha persistencia: 503 faz o FrontEnd cair no modo local.
  if (!sql) return res.status(503).json({ error: "no-db" });

  try {
    if (req.method === "GET") {
      const teams = await listTeams(sql);
      return res.status(200).json({ teams });
    }

    if (req.method === "POST") {
      const input = validateCreate(req.body);
      if (!input) return res.status(400).json({ error: "dados invalidos" });
      const team = await createTeam(sql, input);
      return res.status(201).json({ team });
    }

    if (req.method === "DELETE") {
      if (!isAdmin(req)) return res.status(401).json({ error: "nao autorizado" });
      const id = typeof req.query.id === "string" ? req.query.id : "";
      if (!id) return res.status(400).json({ error: "id obrigatorio" });
      const ok = await deleteTeam(sql, id);
      return res.status(ok ? 200 : 404).json({ ok });
    }

    return res.status(405).json({ error: "metodo nao suportado" });
  } catch (err) {
    console.error("[/api/teams]", err);
    return res.status(500).json({ error: "erro interno" });
  }
}
