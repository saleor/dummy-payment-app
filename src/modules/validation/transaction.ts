import { z } from "zod";

export const transactionEventTypeSchema = z.enum([
  "CHARGE_REQUEST",
  "CHARGE_ACTION_REQUIRED",
  "CHARGE_FAILURE",
  "CHARGE_SUCCESS",
  "AUTHORIZATION_REQUEST",
  "AUTHORIZATION_ACTION_REQUIRED",
  "AUTHORIZATION_FAILURE",
  "AUTHORIZATION_SUCCESS",
]);

export const dataSchema = z.object({
  event: z.object({
    type: transactionEventTypeSchema,
  }),
});

export const responseSchema = z.object({
  pspReference: z.string(),
  result: transactionEventTypeSchema,
  amount: z.number(),
  data: z.record(z.union([z.string(), z.number()])).optional(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: z.array(z.union([z.literal("CHARGE"), z.literal("REFUND"), z.literal("CANCEL")])),
});

export type ResponseType = z.infer<typeof responseSchema>;
