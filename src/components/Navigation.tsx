import { Box } from "@saleor/macaw-ui";

export const Navigation = () => {
  return (
    <Box width="100%" backgroundColor="default2" __height="10%">
      <Box display="flex" flexDirection="row" gap={4} padding={4}>
        <Box>Home</Box>
        <Box>Checkout</Box>
        <Box>Dashboard</Box>
      </Box>
    </Box>
  );
};
