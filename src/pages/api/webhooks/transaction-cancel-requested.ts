import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { v7 as uuidv7 } from "uuid";
import { saleorApp } from "../../../saleor-app";
import {
  TransactionCancelRequestedDocument,
  TransactionCancelRequestedEventFragment,
} from "../../../../generated/graphql";
import { createLogger } from "../../../logger";
import {
  CancelationRequestedResponse,
  cancelationRequestedInputSchema,
} from "../../../modules/validation/cancel-webhook";
import { getZodErrorMessage } from "../../../lib/zod-error";
import { getTransactionActions } from "../../../lib/transaction-actions";

export const transactionCancelationRequestedWebhook =
  new SaleorSyncWebhook<TransactionCancelRequestedEventFragment>({
    name: "Transaction cancelation Requested",
    webhookPath: "api/webhooks/transaction-cancelation-requested",
    event: "TRANSACTION_CHARGE_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionCancelRequestedDocument,
  });

export default transactionCancelationRequestedWebhook.createHandler((req, res, ctx) => {
  const logger = createLogger("transaction-cancelation-requested");
  const { payload } = ctx;

  logger.debug("Received webhook", { payload });

  const payloadResult = cancelationRequestedInputSchema.safeParse(payload);

  if (payloadResult.error) {
    logger.warn("Data received from Saleor didn't pass validation", { error: payloadResult.error });

    const failureResponse: CancelationRequestedResponse = {
      pspReference: uuidv7(),
      result: "CANCEL_FAILURE",
      message: getZodErrorMessage(payloadResult.error),
      actions: getTransactionActions("CANCEL_FAILURE"),
    };

    logger.info("Returning error response from Saleor", { response: failureResponse });

    return res.status(200).json(failureResponse);
  }

  const successResponse: CancelationRequestedResponse = {
    pspReference: uuidv7(),
    // TODO: Add result customization
    result: "CANCEL_SUCCESS",
    message: "Great success!",
    actions: getTransactionActions("CANCEL_SUCCESS"),
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
