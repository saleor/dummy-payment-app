// pages/checkout.tsx
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Switch, Text } from "@saleor/macaw-ui";
import { useProductListQuery } from "../../generated/graphql";

const CheckoutPage = () => {
  const { appBridge, appBridgeState } = useAppBridge();

  console.log(appBridgeState?.saleorApiUrl);

  const [{ data, fetching }] = useProductListQuery();
  console.log(data?.products?.edges[0].node.name);
  return (
    <Box>
      {appBridgeState?.saleorApiUrl ? data?.products?.edges[0].node.name : "No Saleor API URL"}
    </Box>
  );
};

export default CheckoutPage;
