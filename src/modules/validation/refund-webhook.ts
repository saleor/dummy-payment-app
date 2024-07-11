import { z } from "zod";
import { transactionActionsSchema } from "./common";

export const refundRequestedSyncResponseSchema = z.object({
  pspReference: z.string(),
});

export const refundRequestedAsyncResponseSchema = z.object({
  pspReference: z.string(),
  result: z.enum(["REFUND_SUCCESS", "REFUND_FAILURE"]),
  amount: z.number(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: transactionActionsSchema,
});

export const refundRequestedResponseSchema = z.union([
  refundRequestedSyncResponseSchema,
  refundRequestedAsyncResponseSchema,
]);

export type RefundRequestedResponse = z.infer<typeof refundRequestedResponseSchema>;
