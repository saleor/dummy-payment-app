import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { v7 as uuidv7 } from "uuid";
import { saleorApp } from "../../../saleor-app";
import {
  TransactionChargeRequestedDocument,
  TransactionChargeRequestedEventFragment,
} from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import {
  ChargeRequestedResponse,
  chargeRequestedInputSchema,
} from "../../../modules/validation/charge-webhook";
import { getZodErrorMessage } from "../../../lib/zod-error";

export const transactionChargeRequestedWebhook =
  new SaleorSyncWebhook<TransactionChargeRequestedEventFragment>({
    name: "Transaction Charge Requested",
    webhookPath: "api/webhooks/transaction-charge-requested",
    event: "TRANSACTION_CHARGE_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionChargeRequestedDocument,
  });

export default transactionChargeRequestedWebhook.createHandler((req, res, ctx) => {
  const logger = createLogger("transaction-charge-requested");
  const { payload } = ctx;
  const { amount } = payload.action;

  logger.debug("Received webhook", { payload });

  const payloadResult = chargeRequestedInputSchema.safeParse(payload);

  if (payloadResult.error) {
    logger.warn("Data received from Saleor didn't pass validation", { error: payloadResult.error });

    const failureResponse: ChargeRequestedResponse = {
      pspReference: uuidv7(),
      result: "CHARGE_FAILURE",
      message: getZodErrorMessage(payloadResult.error),
      actions: [],
      amount,
    };

    logger.info("Returning error response from Saleor", { response: failureResponse });

    return res.status(200).json(failureResponse);
  }

  const successResponse: ChargeRequestedResponse = {
    pspReference: uuidv7(),
    // TODO: Add result customization
    result: "CHARGE_SUCCESS",
    message: "Great success!",
    actions: [],
    amount,
    // TODO: Link to the app's details page
    // externalUrl
  };

  logger.info("Returning response to Saleor", { response: successResponse });

  return res.status(200).json(successResponse);
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
