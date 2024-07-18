import { AuthData } from "@saleor/app-sdk/APL";

export class AppUrlGenerator {
  constructor(private authData: Pick<AuthData, "appId" | "saleorApiUrl">) {}

  private getAppBaseUrlRelative(appId: string) {
    return `/dashboard/apps/${appId}/app/app`;
  }

  private getAppBaseUrlAbsolute(appId: string, saleorApiUrl: string) {
    const saleorDashboardUrl = saleorApiUrl.replace("/graphql/", "");
    return `${saleorDashboardUrl}${this.getAppBaseUrlRelative(appId)}`;
  }

  getTransactionDetailsUrl(transactionId: string, options?: { includeSaleorBaseUrl: boolean }) {
    const { includeSaleorBaseUrl = false } = options ?? {};
    const baseUrl = includeSaleorBaseUrl
      ? this.getAppBaseUrlAbsolute(this.authData.appId, this.authData.saleorApiUrl)
      : this.getAppBaseUrlRelative(this.authData.appId);
    return `${baseUrl}/transactions/${transactionId}`;
  }
}
