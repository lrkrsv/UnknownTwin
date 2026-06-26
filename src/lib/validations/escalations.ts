import { z } from "zod";

export const createEscalationSchema = z.object({
  messageId: z.string().uuid(),
});

export const answerEscalationSchema = z.object({
  answer: z.string().min(1, "Answer is required").max(20000),
});

export type CreateEscalationBody = z.infer<typeof createEscalationSchema>;
export type AnswerEscalationBody = z.infer<typeof answerEscalationSchema>;
