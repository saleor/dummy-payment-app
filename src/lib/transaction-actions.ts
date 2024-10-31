import { TransactionActionEnum, TransactionEventTypeEnum } from "../../generated/graphql";

export function getTransactionActions(
  type: TransactionEventTypeEnum
): Array<TransactionActionEnum> {
  switch (type) {
    case "INFO":
    case "CHARGE_BACK":
    case "CHARGE_FAILURE":
      return ["REFUND", "CHARGE", "CANCEL"];
    case "REFUND_OR_CANCEL_SUCCESS":
    case "REFUND_OR_CANCEL_FAILURE":
    case "REFUND_OR_CANCEL_REQUEST":
      return ["REFUND", "CANCEL"];
    case "AUTHORIZATION_ADJUSTMENT":
    case "AUTHORIZATION_FAILURE":
    case "AUTHORIZATION_REQUEST":
    case "AUTHORIZATION_SUCCESS":
    case "CANCEL_FAILURE":
    case "CANCEL_REQUEST":
      return ["CHARGE", "CANCEL"];
    case "CHARGE_REQUEST":
    case "CHARGE_SUCCESS":
    case "REFUND_FAILURE":
    case "REFUND_REQUEST":
    case "REFUND_SUCCESS":
      return ["REFUND"];
    case "CANCEL_SUCCESS":
    case "CHARGE_ACTION_REQUIRED":
    case "AUTHORIZATION_ACTION_REQUIRED":
    case "REFUND_REVERSE":
      return [];
    default:
      return [];
  }
}
