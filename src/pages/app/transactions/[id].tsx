import { Box, Button, Chip, Combobox, Input, OrdersIcon, Spinner, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { StatusChip } from "@/components/StatusChip";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import React from "react";
import { trpcClient } from "@/trpc-client";
import { TransactionEventTypeEnum, useTransactionDetailsQuery } from "@/generated/graphql";

interface EventReporterOptions {
  label: TransactionEventTypeEnum;
  value: TransactionEventTypeEnum;
}

function formatCurrency(amount: number, currencyCode: string, locale: string = "en-US") {
  // Create a formatter
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  });

  // Format the number
  return formatter.format(amount);
}

function formatDateTime(dateString: string, locale = "en-US") {
  // Parse the date string to a Date object
  const date = new Date(dateString);

  // Create a formatter
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false, // Use 24-hour format
  });

  // Format the date
  return formatter.format(date);
}

const EventReporterPage = () => {
  const router = useRouter();
  const { appBridgeState, appBridge } = useAppBridge();

  const pspReference = router.query.id as string;

  const [eventType, setEventType] = React.useState<EventReporterOptions>({
    label: TransactionEventTypeEnum.ChargeSuccess,
    value: TransactionEventTypeEnum.ChargeSuccess,
  });

  const [amount, setAmount] = React.useState("");

  const navigateToOrder = (id: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: `/orders/${id}`,
        newContext: true,
      })
    );
  };

  const [{ data, fetching }, refetch] = useTransactionDetailsQuery({
    variables: {
      pspReference,
    },
  });

  const transaction = data?.orders?.edges[0]?.node?.transactions.find((transaction) => {
    return transaction?.pspReference === pspReference;
  });

  const orderId = data?.orders?.edges[0]?.node?.id;

  const mutation = trpcClient.transactionReporter.reportEvent.useMutation();

  const isLoading = fetching || mutation.isLoading;
  const handleReportEvent = async () => {
    try {
      const result = await mutation.mutateAsync({
        id: transaction?.id ?? "",
        // TODO: error handling
        amount: parseFloat(amount),
        type: eventType.value,
      });
      refetch({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Error reporting event:", error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      alignItems="center"
      gap={4}
    >
      <Text size={7}>Transaction event reporter</Text>
      <Box
        display="grid"
        gap={2}
        padding={4}
        borderRadius={4}
        borderStyle="solid"
        borderColor="default1"
        boxShadow="defaultFocused"
      >
        {data ? (
          <>
            <Box display="flex" justifyContent="space-between">
              <Text size={6}>{transaction?.name.length ? transaction.name : "Transaction"}</Text>
              <Button variant="secondary" onClick={() => navigateToOrder(orderId ?? "")}>
                <OrdersIcon />
                Open order
              </Button>
            </Box>
            <Text color="default2" marginBottom={4}>
              {transaction?.pspReference}
            </Text>
            {transaction?.events.map((event) => (
              <Box
                gap={2}
                key={event.id}
                display="grid"
                __gridTemplateColumns="auto 150px 150px 200px"
              >
                <Box justifySelf="start">
                  <StatusChip eventType={event.type} />
                </Box>
                <Text justifySelf="end">
                  {formatCurrency(
                    event.amount.amount,
                    event.amount.currency,
                    appBridgeState?.locale
                  )}
                </Text>
                <Text>{event.message}</Text>
                <Text justifySelf="end">{formatDateTime(event.createdAt)}</Text>
              </Box>
            ))}
          </>
        ) : (
          <Spinner />
        )}
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Text>Selet event type:</Text>
        <Combobox
          options={Object.values(TransactionEventTypeEnum).map((eventType) => ({
            label: eventType,
            value: eventType,
          }))}
          value={eventType}
          onChange={(val) => setEventType(val as EventReporterOptions)}
          size="small"
          __width="220px"
        />
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Text>Enter event amount:</Text>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          endAdornment={<Text size={1}>{transaction?.chargedAmount.currency}</Text>}
        />
      </Box>
      <Button disabled={isLoading} onClick={handleReportEvent}>
        {isLoading && <Spinner />}Fire event!
      </Button>
    </Box>
  );
};

export default EventReporterPage;
