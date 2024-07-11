import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { v7 as uuidv7 } from "uuid";
import { saleorApp } from "../../../saleor-app";
import {
  TransactionRefundRequestedDocument,
  TransactionRefundRequestedEventFragment,
} from "../../../../generated/graphql";
import { createLogger } from "../../logger";
import { RefundRequestedResponse } from "../../../modules/validation/refund-webhook";
import { TransactionRefundChecker } from "../../../modules/transaction/transaction-refund-checker";

export const transactionRefundRequestedWebhook =
  new SaleorSyncWebhook<TransactionRefundRequestedEventFragment>({
    name: "Payment Gateway Initialize Session",
    webhookPath: "api/webhooks/transaction-refund-requested",
    event: "TRANSACTION_REFUND_REQUESTED",
    apl: saleorApp.apl,
    query: TransactionRefundRequestedDocument,
  });

export default transactionRefundRequestedWebhook.createHandler((req, res, ctx) => {
  const logger = createLogger("transaction-refund-requested");
  const { payload } = ctx;
  const { amount } = payload.action;

  const transactionRefundChecker = new TransactionRefundChecker();

  logger.debug("Received webhook", { payload });

  const successResponse: RefundRequestedResponse = {
    pspReference: uuidv7(),
    // TODO: Add result customization
    result: "REFUND_SUCCESS",
    message: "Great success!",
    actions: transactionRefundChecker.checkIfAnotherRefundIsPossible(
      amount,
      payload.transaction?.chargedAmount
    )
      ? ["REFUND"]
      : [],
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
