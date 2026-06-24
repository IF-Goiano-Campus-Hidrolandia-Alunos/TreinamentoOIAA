import { z } from "zod";
import { STAGE_MAX_POINTS } from "@/lib/stages";

export const pillarSchema = z.enum(["nlp", "vc", "am"]);
export const stageSchema = z.enum([
  "theory",
  "guided",
  "unguided",
  "fill-blanks",
  "from-scratch",
]);

const name = z.string().trim().min(1, "Obrigatorio").max(60, "Maximo 60 caracteres");

/**
 * Criacao de time: nome do time, tutor e integrantes.
 * Backend aceita 1..5 integrantes (o desafio recomenda 3). O tutor nunca entra
 * na media do grupo.
 */
export const createTeamSchema = z.object({
  name,
  tutor: name,
  members: z.array(name).min(1, "Informe ao menos 1 integrante").max(5, "Maximo 5 integrantes"),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

/** Lancamento de nota de um integrante numa etapa. */
export const submitScoreSchema = z
  .object({
    memberId: z.string().min(1),
    pillar: pillarSchema,
    stage: stageSchema,
    points: z.number().min(0),
  })
  .superRefine((val, ctx) => {
    const max = STAGE_MAX_POINTS[val.stage];
    if (val.points > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["points"],
        message: `A etapa '${val.stage}' vale no maximo ${max} pontos.`,
      });
    }
  });
export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;
