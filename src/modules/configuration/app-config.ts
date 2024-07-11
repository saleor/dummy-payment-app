import { z } from "zod";

export const appConfigSchema = z.object({
  refundConfig: z.enum(["SYNC", "ASYNC", "FAILURE"]),
  chargeConfig: z.enum(["SYNC", "ASYNC", "FAILURE"]),
  cancelConfig: z.enum(["SYNC", "ASYNC", "FAILURE"]),
  // TODO: Add implementation for ASYNC events via event queue
  asyncActionConfig: z.object({
    delay: z.number().int().positive().default(30),
  }),
  // TODO: Add implementation for sync events delay via wait()
  syncActionConfig: z.object({
    delay: z.number().int().positive().default(0),
  }),
});
