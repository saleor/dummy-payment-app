import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { v7 as uuidv7 } from "uuid";
import { saleorApp } from "../../../saleor-app";
import {
  TransactionEventTypeEnum,
  TransactionFlowStrategyEnum,
  TransactionProcessSessionDocument,
  TransactionProcessSessionEventFragment,
} from "../../../../generated/graphql";
import { createLogger } from "../../logger";
import { dataSchema, ResponseType } from "../../../modules/validation/transaction";
import { getZodErrorMessage } from "../../../lib/zod-error";
import { getTransactionActions } from "../../../lib/transaction-actions";

export const transactionProcessSessionWebhook =
  new SaleorSyncWebhook<TransactionProcessSessionEventFragment>({
    name: "Payment Gateway Initialize Session",
    webhookPath: "api/webhooks/transaction-process-session",
    event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionProcessSessionDocument,
  });

export default transactionProcessSessionWebhook.createHandler((req, res, ctx) => {
  const logger = createLogger("transaction-process-session");
  const { payload } = ctx;
  const { actionType, amount } = payload.action;

  logger.debug("Received webhook", { payload });

  const rawEventData = payload.data;
  const dataResult = dataSchema.safeParse(rawEventData);

  if (dataResult.error) {
    logger.warn("Invalid data field received in notification", { error: dataResult.error });

    const errorResponse: ResponseType = {
      pspReference: uuidv7(),
      result:
        actionType === TransactionFlowStrategyEnum.Charge
          ? "CHARGE_FAILURE"
          : "AUTHORIZATION_FAILURE",
      message: getZodErrorMessage(dataResult.error),
      amount,
      actions: [],
    };

    logger.info("Returning error response to Saleor", { response: errorResponse });

    return res.status(200).json(errorResponse);
  }

  const data = dataResult.data;

  logger.info("Parsed data field from notification", { data });

  const successResponse: ResponseType = {
    pspReference: uuidv7(),
    result: data.event.type,
    message: "Great success!",
    actions: getTransactionActions(data.event.type as TransactionEventTypeEnum),
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
