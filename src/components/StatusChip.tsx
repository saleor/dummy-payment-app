import { Chip } from "@saleor/macaw-ui";
import { TransactionEventTypeEnum } from "../../generated/graphql";

interface StatusChipProps {
  eventType: TransactionEventTypeEnum | null | undefined;
}

export const StatusChip = ({ eventType }: StatusChipProps) => {
  switch (eventType) {
    case TransactionEventTypeEnum.ChargeRequest:
    case TransactionEventTypeEnum.AuthorizationRequest:
      return (
        <Chip color="info1" backgroundColor="info1">
          REQUESTED
        </Chip>
      );
    case TransactionEventTypeEnum.ChargeActionRequired:
    case TransactionEventTypeEnum.AuthorizationActionRequired:
      return (
        <Chip color="warning1" backgroundColor="warning1">
          ACTION REQUIRED
        </Chip>
      );
    case TransactionEventTypeEnum.ChargeFailure:
    case TransactionEventTypeEnum.AuthorizationFailure:
      return (
        <Chip color="critical1" backgroundColor="critical1">
          FAILURE
        </Chip>
      );
    case TransactionEventTypeEnum.ChargeSuccess:
    case TransactionEventTypeEnum.AuthorizationSuccess:
      return (
        <Chip color="success1" backgroundColor="success1">
          SUCCESS
        </Chip>
      );

    default:
      return (
        <Chip color="default1" backgroundColor="default1">
          {eventType?.replace(/_/g, " ") ?? "UNKNOWN"}
        </Chip>
      );
  }
};
