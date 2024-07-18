import { z } from "zod";
import { transactionActionsSchema, transactionEventTypeSchema } from "./common";

export const dataSchema = z.object({
  event: z.object({
    type: transactionEventTypeSchema,
    includePspReference: z.boolean().optional().default(true),
  }),
});

export type SyncWebhookRequestData = z.infer<typeof dataSchema>;

export const responseSchema = z.object({
  pspReference: z.string().optional(),
  result: transactionEventTypeSchema,
  amount: z.number(),
  data: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: transactionActionsSchema,
});

export type ResponseType = z.infer<typeof responseSchema>;
