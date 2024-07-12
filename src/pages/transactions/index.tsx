import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import Link from "next/link";
import React from "react";

const TransactionsPage = () => {
  const [pspReference, setPspReference] = React.useState<string>("");
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  }, [error]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
      justifyContent="flex-start"
      alignItems="center"
      gap={4}
      marginTop={4}
    >
      <Text size={7}>Here you can create events for any transaction made using this app.</Text>
      <Box>
        <Text>Please paste PSP Reference of the transaction you want to create events for.</Text>
        <Input value={pspReference} onChange={(event) => setPspReference(event.target.value)} />
      </Box>
      <Box display="flex" gap={2}>
        <Button variant="secondary" onClick={() => setPspReference("")}>
          Clear
        </Button>
        <Link href={`/transactions/${pspReference}`}>
          <Button disabled={!pspReference} variant={error ? "error" : "primary"}>
            Go to transaction
          </Button>
        </Link>
      </Box>
      {error && <Text color="critical1">Invalid PSP Reference</Text>}
    </Box>
  );
};

export default TransactionsPage;
