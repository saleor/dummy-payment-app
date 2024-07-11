import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { createClient } from "../../../lib/create-graphq-client";
import { saleorApp } from "../../../saleor-app";
import {
  TransactionInitializeSessionDocument,
  TransactionInitializeSessionEventFragment,
} from "../../../../generated/graphql";

/**
 * Create abstract Webhook. It decorates handler and performs security checks under the hood.
 *
 * transactionInitializeWebhook.getWebhookManifest() must be called in api/manifest too!
 */
export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionEventFragment>({
    name: "Transaction Initialize Session",
    webhookPath: "api/webhooks/transaction-initialize-session",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionDocument,
  });

/**
 * Export decorated Next.js handler, which adds extra context
 */
export default transactionInitializeSessionWebhook.createHandler((req, res, ctx) => {
  const {
    /**
     * Access payload from Saleor - defined above
     */
    payload,
    /**
     * Saleor event that triggers the webhook (here - ORDER_CREATED)
     */
    event,
    /**
     * App's URL
     */
    baseUrl,
    /**
     * Auth data (from APL) - contains token and saleorApiUrl that can be used to construct graphQL client
     */
    authData,
  } = ctx;

  /**
   * Create GraphQL client to interact with Saleor API.
   */
  const client = createClient(authData.saleorApiUrl, async () => ({ token: authData.token }));

  /**
   * Now you can fetch additional data using urql.
   * https://formidable.com/open-source/urql/docs/api/core/#clientquery
   */

  // const data = await client.query().toPromise()

  /**
   * Inform Saleor that webhook was delivered properly.
   */
  return res.status(200).end();
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
