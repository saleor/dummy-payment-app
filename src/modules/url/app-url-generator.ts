import { AuthData } from "@saleor/app-sdk/APL";

export class AppUrlGenerator {
  constructor(private authData: Pick<AuthData, "appId">) {}

  private getAppBaseUrl(appId: string) {
    return `/dashboard/apps/${appId}/app`;
  }

  getTransactionDetailsUrl(transactionId: string) {
    const baseUrl = this.getAppBaseUrl(this.authData.appId);
    return `${baseUrl}/transactions/${transactionId}`;
  }
}
