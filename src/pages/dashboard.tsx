// pages/dashboard.tsx
import { Box, Switch, Text } from "@saleor/macaw-ui";
import { Navigation } from "../components/Navigation";
import Link from "next/link";

const DashboardPage = () => {
  return (
    <>
      <Navigation />
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        width="100%"
        justifyContent="center"
        alignItems="center"
        gap={4}
      >
        <Switch defaultValue="1">
          <Switch.Item id="1" value="1">
            <Link href="/checkout">Create checkout</Link>
          </Switch.Item>
          <Switch.Item id="2" value="2">
            Create transaction
          </Switch.Item>
        </Switch>
        <Box display="flex" flexDirection="row" gap={4} backgroundColor="default2">
          <Text size={4}>Create checkout</Text>
          <Text size={4}>Create transaction</Text>
          <Text size={4}>Transasction list</Text>
          <Text size={4}>Flow settings</Text>
        </Box>
        <Box __width="75%" textAlign="center">
          <Text size={5}>Welcome to the Dummy Payment App Dashboard</Text>
        </Box>
      </Box>
    </>
  );
};

export default DashboardPage;
