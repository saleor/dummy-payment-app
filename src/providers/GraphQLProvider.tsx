import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { PropsWithChildren } from "react";
import { Provider } from "urql";
import { Box, Text, CopyIcon } from "@saleor/macaw-ui";
import { createClient } from "../lib/create-graphql-client";

function NotConnectedError() {
  const manifestUrl = typeof window !== "undefined" ? `${window.location.origin}/api/manifest` : "";

  const copyManifestUrl = () => {
    navigator.clipboard.writeText(manifestUrl);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={8}
      gap={6}
      __minHeight="50vh"
    >
      <Text size={6} fontWeight="bold" color="critical1">
        App Not Connected
      </Text>
      <Text color="default2" __textAlign="center" __maxWidth="500px">
        This app must be installed in a Saleor instance and accessed through the Saleor Dashboard.
      </Text>

      <Box
        display="flex"
        flexDirection="column"
        gap={4}
        padding={6}
        borderRadius={4}
        borderColor="default1"
        borderWidth={1}
        borderStyle="solid"
        __maxWidth="600px"
        __width="100%"
      >
        <Text size={5} fontWeight="bold">
          How to install
        </Text>
        <Box display="flex" flexDirection="column" gap={2}>
          <Text color="default2">
            1. Open your Saleor Dashboard and go to <Text fontWeight="bold">Apps</Text>
          </Text>
          <Text color="default2">
            2. Click <Text fontWeight="bold">Install external app</Text>
          </Text>
          <Text color="default2">3. Paste the manifest URL below and confirm installation</Text>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Text size={4} fontWeight="medium">
            Manifest URL
          </Text>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            padding={3}
            borderRadius={2}
            backgroundColor="default1"
          >
            <Text __wordBreak="break-all" size={3} fontFamily="mono">
              {manifestUrl}
            </Text>
            <Box
              as="button"
              onClick={copyManifestUrl}
              cursor="pointer"
              padding={2}
              borderRadius={2}
              backgroundColor="transparent"
              borderWidth={0}
              __flexShrink="0"
              display="flex"
              alignItems="center"
            >
              <CopyIcon color="default2" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function GraphQLProvider(props: PropsWithChildren<{}>) {
  const { appBridgeState } = useAppBridge();
  const url = appBridgeState?.saleorApiUrl;

  if (!url) {
    console.warn("Install the app in the Dashboard to be able to query Saleor API.");
    return <NotConnectedError />;
  }

  const client = createClient(url, async () => Promise.resolve({ token: appBridgeState?.token! }));

  return <Provider value={client} {...props} />;
}
