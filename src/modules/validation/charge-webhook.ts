import { z } from "zod";
import { transactionActionsSchema } from "./common";

export const chargeRequestedInputSchema = z
  .object({
    action: z.object({
      amount: z
        .number()
        .positive()
        .refine((n) => n > 0, {
          message: "Number must be greater than zero",
        }),
      currency: z.string(),
    }),
  })
  .passthrough();

export const chargeRequestedSyncResponseSchema = z.object({
  pspReference: z.string(),
});

export const chargeRequestedAsyncResponseSchema = z.object({
  pspReference: z.string(),
  result: z.enum(["CHARGE_SUCCESS", "CHARGE_FAILURE"]),
  amount: z.number(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: transactionActionsSchema,
});

export const chargeRequestedResponseSchema = z.union([
  chargeRequestedSyncResponseSchema,
  chargeRequestedAsyncResponseSchema,
]);

export type ChargeRequestedResponse = z.infer<typeof chargeRequestedResponseSchema>;
