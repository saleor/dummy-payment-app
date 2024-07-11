import { z } from "zod";
import { transactionActionsSchema, transactionEventTypeSchema } from "./common";

export const dataSchema = z.object({
  event: z.object({
    type: transactionEventTypeSchema,
  }),
});

export const responseSchema = z.object({
  pspReference: z.string(),
  result: transactionEventTypeSchema,
  amount: z.number(),
  data: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: transactionActionsSchema,
});

export type ResponseType = z.infer<typeof responseSchema>;
