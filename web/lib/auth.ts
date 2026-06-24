import { NextResponse } from "next/server";

/**
 * Confere o token de admin/tutor: header `x-admin-token` == env `ADMIN_TOKEN`.
 * Usado nas operacoes de escrita sensiveis (lancar nota, remover time).
 */
export function authorize(req: Request): { ok: true } | { ok: false; res: NextResponse } {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "ADMIN_TOKEN nao configurado no servidor. Veja web/.env.example." },
        { status: 503 },
      ),
    };
  }
  if (req.headers.get("x-admin-token") !== expected) {
    return { ok: false, res: NextResponse.json({ error: "Nao autorizado." }, { status: 401 }) };
  }
  return { ok: true };
}
