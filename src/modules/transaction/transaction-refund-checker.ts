import { Money } from "../../../generated/graphql";

export class TransactionRefundChecker {
  checkIfAnotherRefundIsPossible(requestedAmount: number, chargedAmount: Money | undefined) {
    if (!chargedAmount) return true;
    return requestedAmount <= chargedAmount.amount;
  }
}
