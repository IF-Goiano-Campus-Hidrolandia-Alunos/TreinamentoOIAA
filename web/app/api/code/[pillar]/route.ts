import { NextResponse } from "next/server";
import { CODE, getCode } from "@/lib/code-snippets";
import type { PillarId } from "@/lib/types";

// GET /api/code/:pillar  (pillar = nlp | vc | am) -> blocos de codigo da Fase 2.
export function GET(_req: Request, { params }: { params: { pillar: string } }) {
  const pillar = params.pillar as PillarId;
  if (!(pillar in CODE)) {
    return NextResponse.json(
      { error: "Pilar invalido. Use nlp, vc ou am." },
      { status: 404 },
    );
  }
  return NextResponse.json(getCode(pillar));
}
