import { z } from "zod";

export const ingestDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  source_type: z.string().min(1, "source_type is required").max(100),
  module: z.string().max(200).optional(),
  topic: z.string().max(200).optional(),
  content: z.string().min(1, "Content is required"),
});

export type IngestDocumentBody = z.infer<typeof ingestDocumentSchema>;
