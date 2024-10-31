import { Chip } from "@saleor/macaw-ui";
import { TransactionEventOutputTypeEnum } from "@/generated/graphql";

interface StatusChipProps {
  eventType: TransactionEventOutputTypeEnum | null | undefined;
}

export const StatusChip = ({ eventType }: StatusChipProps) => {
  switch (eventType) {
    case "CHARGE_REQUEST":
    case "AUTHORIZATION_REQUEST":
    case "CANCEL_REQUEST":
    case "REFUND_REQUEST":
      return (
        <Chip color="info1" backgroundColor="info1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
    case "CHARGE_ACTION_REQUIRED":
    case "AUTHORIZATION_ACTION_REQUIRED":
      return (
        <Chip color="warning1" backgroundColor="warning1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
    case "CHARGE_FAILURE":
    case "AUTHORIZATION_FAILURE":
    case "CANCEL_FAILURE":
    case "REFUND_FAILURE":
      return (
        <Chip color="critical1" backgroundColor="critical1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
    case "CHARGE_SUCCESS":
    case "AUTHORIZATION_SUCCESS":
    case "CANCEL_SUCCESS":
    case "REFUND_SUCCESS":
      return (
        <Chip color="success1" backgroundColor="success1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
    // Chargeback, refund reverse, info, authorization adjustment
    default:
      return (
        <Chip color="default1" backgroundColor="default1" whiteSpace="nowrap">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
  }
};
