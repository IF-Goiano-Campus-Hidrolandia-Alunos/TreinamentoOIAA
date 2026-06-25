import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyCors, getSql, isAdmin } from "../_db";

function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "metodo nao suportado" });

  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "no-db" });

  if (!isAdmin(req)) {
    return res.status(401).json({ error: "nao autorizado" });
  }

  try {
    const membersWithoutCode = (await sql`
      SELECT id FROM members WHERE access_code IS NULL OR access_code = ''
    `) as Record<string, any>[];

    let updatedCount = 0;
    for (const m of membersWithoutCode) {
      let success = false;
      let attempts = 0;
      while (!success && attempts < 10) {
        const code = generateAccessCode();
        try {
          // Tenta atualizar garantindo a restricao de unicidade
          const result = (await sql`
            UPDATE members 
            SET access_code = ${code} 
            WHERE id = ${m.id} AND (access_code IS NULL OR access_code = '')
            RETURNING id
          `) as Record<string, any>[];
          if (result.length > 0) {
            success = true;
            updatedCount++;
          } else {
            // Se nao retornou linha, talvez outra requesicao atualizou, ou falhou.
            success = true; 
          }
        } catch (e) {
          // Se falhou (ex: violacao de indice unico), tenta outro codigo
          attempts++;
        }
      }
    }

    return res.status(200).json({ ok: true, backfilledCount: updatedCount });
  } catch (err) {
    console.error("[/api/admin/backfill-codes]", err);
    return res.status(500).json({ error: "erro interno ao realizar o backfill" });
  }
}
