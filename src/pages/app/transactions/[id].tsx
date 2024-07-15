import { Box, Button, Chip, Combobox, Input, Spinner, Text } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { StatusChip } from "@/components/StatusChip";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import React, { useState } from "react";
import { trpcClient } from "@/trpc-client";
import { TransactionEventTypeEnum, useTransactionDetailsViaIdQuery } from "@/generated/graphql";

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
  const { appBridgeState } = useAppBridge();
  const [otherError, setOtherError] = useState<string | null>(null);

  const transactionId = router.query.id as string;

  const [eventType, setEventType] = React.useState<EventReporterOptions>({
    label: TransactionEventTypeEnum.ChargeSuccess,
    value: TransactionEventTypeEnum.ChargeSuccess,
  });

  const [amount, setAmount] = React.useState("");

  const [{ data, fetching }, refetchDetails] = useTransactionDetailsViaIdQuery({
    variables: {
      id: transactionId,
    },
  });

  const transaction = data?.transaction;

  const mutation = trpcClient.transactionReporter.reportEvent.useMutation();

  const handleReportEvent = async () => {
    setOtherError(null);
    try {
      const parsedAmount = parseFloat(amount);

      if (Number.isNaN(parsedAmount)) {
        setOtherError("Invalid amount");
        throw new Error("Invalid amount");
      }

      const result = await mutation.mutateAsync({
        id: transactionId,
        amount: parsedAmount,
        type: eventType.value,
      });
      console.log("Mutation result:", result);
      refetchDetails({ requestPolicy: "network-only" });
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
        borderColor="default2"
        boxShadow="defaultFocused"
      >
        {data ? (
          <>
            <Text size={6}>{transaction?.name.length ? transaction.name : "Transaction"}</Text>
            <Text color="default2" marginBottom={4}>
              {transaction?.pspReference}
            </Text>
            {transaction?.events.map((event) => (
              <Box
                gap={2}
                key={event.id}
                display="grid"
                __gridTemplateColumns="80px 150px 150px 200px"
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
      <Button onClick={handleReportEvent} disabled={mutation.isLoading}>
        Fire event!
      </Button>
      {mutation.data && (
        <Text color="success1">
          Transaction reported: <pre>{JSON.stringify(mutation.data, null, 2)}</pre>
        </Text>
      )}
      {mutation.error && <Text color="critical1">Error reporting event (check console)</Text>}
      {otherError && <Text color="critical1">{otherError}</Text>}
    </Box>
  );
};

export default EventReporterPage;
