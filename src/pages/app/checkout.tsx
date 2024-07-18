// pages/checkout.tsx
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import {
  ArrowRightIcon,
  Box,
  Button,
  Combobox,
  ExternalLinkIcon,
  Text,
  Toggle,
} from "@saleor/macaw-ui";
import {
  useChannelsListQuery,
  useCompleteCheckoutMutation,
  useCreateCheckoutMutation,
  useInitializeTransactionMutation,
  useProductListQuery,
  useUpdateDeliveryMutation,
} from "@/generated/graphql";
import { TransactionEventType, transactionEventTypeSchema } from "@/modules/validation/common";
import React from "react";
import { SyncWebhookRequestData } from "@/modules/validation/sync-transaction";

interface TransactionResponseOptions {
  value: TransactionEventType;
  label: TransactionEventType;
}

const CheckoutPage = () => {
  const { appBridge, appBridgeState } = useAppBridge();
  const [response, setResponse] = React.useState<TransactionResponseOptions>({
    value: "CHARGE_SUCCESS",
    label: "CHARGE_SUCCESS",
  });
  const [channelSlug, setChannelSlug] = React.useState<string>("");
  const [includePspReference, setIncludePspReference] = React.useState<boolean>(true);

  const [{ data: channelsData, fetching: fetchingChannels }] = useChannelsListQuery();
  const [{ data: productsData, fetching: fetchingProducts }] = useProductListQuery({
    pause: channelSlug === "",
    variables: { channelSlug },
  });
  const [checkoutCreateResult, checkoutCreateExecute] = useCreateCheckoutMutation();

  const [deliveryUpdateResult, deliveryUpdateExecute] = useUpdateDeliveryMutation();
  const handleExecuteDeliveryUpdate = () => {
    deliveryUpdateExecute({
      id: checkoutCreateResult.data?.checkoutCreate?.checkout?.id ?? "",
      methodId: checkoutCreateResult.data?.checkoutCreate?.checkout?.shippingMethods[0]?.id ?? "",
    });
  };

  const [transactionInitializeResult, transactionInitializeExecute] =
    useInitializeTransactionMutation();

  const [completeCheckoutResult, completeCheckoutExecute] = useCompleteCheckoutMutation();

  const handleExecuteInitializeTransaction = () => {
    transactionInitializeExecute({
      id: checkoutCreateResult.data?.checkoutCreate?.checkout?.id ?? "",
      data: {
        event: {
          type: response.value,
          includePspReference,
        },
      } as SyncWebhookRequestData,
    });
  };

  const handleExecuteCheckoutCreate = () => {
    checkoutCreateExecute({
      channelSlug,
      variants: [
        {
          quantity: 1,
          variantId: productsData?.products?.edges[0]?.node.defaultVariant?.id ?? "",
        },
      ],
    });
  };

  const handleExecuteCompleteCheckout = () => {
    completeCheckoutExecute({
      id: checkoutCreateResult.data?.checkoutCreate?.checkout?.id ?? "",
    });
  };

  const navigateToOrder = (id: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/orders/${id}`,
        newContext: true,
      })
    );
  };

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
        <Text size={8} marginTop={4}>
          Quick checkout tool
        </Text>
        <Box display="flex" gap={4} marginTop={2} alignItems="center">
          <Button
            disabled={channelSlug === "" || fetchingChannels || fetchingProducts}
            onClick={() => handleExecuteCheckoutCreate()}
          >
            Create checkout
          </Button>
          <ArrowRightIcon />
          <Button
            onClick={() => handleExecuteDeliveryUpdate()}
            disabled={!checkoutCreateResult.data}
          >
            Set delivery
          </Button>
          <ArrowRightIcon />
          <Button
            disabled={!checkoutCreateResult.data}
            onClick={() => handleExecuteInitializeTransaction()}
          >
            Initialize transaction
          </Button>
          <ArrowRightIcon />
          <Button
            disabled={!checkoutCreateResult.data || !deliveryUpdateResult.data}
            onClick={() => handleExecuteCompleteCheckout()}
          >
            Complete checkout
          </Button>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Text>Select channel:</Text>
          <Combobox
            value={channelSlug}
            onChange={(value) => setChannelSlug(value as string)}
            options={(channelsData?.channels ?? []).map((value) => ({
              value: value.slug,
              label: value.name,
            }))}
          />
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Text>Select transaction response:</Text>
          <Combobox
            // label="Transaction response"
            options={transactionEventTypeSchema.options.map((value) => ({
              label: value,
              value,
            }))}
            value={response}
            onChange={(value) => setResponse(value as TransactionResponseOptions)}
            size="small"
            __width="250px"
          />
        </Box>
        <Box>
          <Toggle
            pressed={includePspReference}
            onPressedChange={(pressed) => setIncludePspReference(pressed)}
          >
            <Text>Return pspReference</Text>
          </Toggle>
        </Box>
        {checkoutCreateResult.data && (
          <Box display="flex" flexDirection="column" gap={4}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Text fontWeight="bold">Checkout created: </Text>
              <Text>
                Checkout ID: {checkoutCreateResult.data.checkoutCreate?.checkout?.id ?? "Error"}
              </Text>
              <Text>
                Available gateways:{" "}
                {checkoutCreateResult.data.checkoutCreate?.checkout?.availablePaymentGateways?.map(
                  (gateway) => <Text key={gateway?.id}>{gateway?.name} </Text>
                ) ?? "Error "}
              </Text>
            </Box>
            {deliveryUpdateResult.data &&
              (!!deliveryUpdateResult.error ? (
                <Text color="critical1" fontWeight="bold">
                  Error setting shipping method
                </Text>
              ) : (
                <Text fontWeight="bold">Shipping method set!</Text>
              ))}
            <Box display="flex" flexDirection="column" gap={2}>
              {transactionInitializeResult.data && (
                <>
                  <Text fontWeight="bold">Transaction initialized: </Text>
                  <Text>
                    {transactionInitializeResult.data.transactionInitialize?.transactionEvent
                      ?.pspReference ?? "Error PSP Reference"}
                  </Text>
                  <Text>
                    {transactionInitializeResult.data.transactionInitialize?.transactionEvent
                      ?.type ?? "Error type"}
                  </Text>
                </>
              )}
            </Box>

            {completeCheckoutResult.data && (
              <Box
                onClick={() =>
                  navigateToOrder(completeCheckoutResult.data?.checkoutComplete?.order?.id ?? "")
                }
                cursor="pointer"
                color="accent1"
                display="flex"
                gap={2}
                alignItems="center"
              >
                <ExternalLinkIcon />
                <Text fontWeight="bold" color="accent1">
                  Created order{" "}
                  {completeCheckoutResult.data.checkoutComplete?.order?.number ?? "Error"}
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export default CheckoutPage;
