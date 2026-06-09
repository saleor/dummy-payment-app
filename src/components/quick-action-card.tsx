import { Box, Text } from "@saleor/macaw-ui";

interface QuickActionCardProps {
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function QuickActionCard({
  title,
  description,
  onClick,
  disabled,
  loading,
}: QuickActionCardProps) {
  return (
    <Box
      as="button"
      borderStyle="solid"
      borderWidth={1}
      borderColor="default1"
      borderRadius={4}
      padding={4}
      display="grid"
      gap={1}
      cursor={disabled ? "auto" : "pointer"}
      __backgroundColor="transparent"
      __transition="background-color 150ms ease, border-color 150ms ease"
      __textAlign="left"
      onClick={disabled ? undefined : onClick}
      __opacity={disabled ? "0.5" : "1"}
      className="quick-action-card"
    >
      <Text size={3} fontWeight="bold">
        {loading ? `${title}...` : title}
      </Text>
      <Text size={2} color="default2">
        {description}
      </Text>
    </Box>
  );
}
