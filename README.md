<div align="center">
<img width="150" alt="saleor-app-template" src="https://github.com/saleor/dummy-payment-app/blob/main/public/logo.png?raw=true">
</div>

<div align="center">
  <h1>Dummy Payment App</h1>
</div>

<div align="center">
  <p>Bare-bones app for testing Saleor's <a href="https://docs.saleor.io/docs/developer/payments#payment-app">Transactions API</a></p>
</div>

<div align="center">
  <a href="https://saleor.io/">Website</a>
  <span> | </span>
  <a href="https://docs.saleor.io/docs/3.x/">Docs</a>
</div>

> [!TIP]
> Questions or issues? Check our [discord](https://discord.gg/H52JTZAtSH) channel for help.

### What is Dummy Payment App?

The Dummy Payment App allows you to test Saleor's payment and checkout features without needing to set up a real payment provider. You can create orders, process payments, issue refunds, and more, all within the Saleor Dashboard.

### App features

- Create new checkouts and orders from the Saleor Dashboard:

![Dummy Payment App has UI in Saleor dashboard for creating new orders from checkouts with Transactions](docs/1_checkout.jpeg)

- Process payments and update transaction statuses:

![Dummy Payment App has UI in Saleor dashboard for updating Transactions](docs/2_event_reporter.jpeg)

> [!TIP]
> Each Transaction has `externalUrl` that links to this page from Order details page in Saleor Dashboard:

- Issue refunds, process charges and cancellations for Transactions

### How does it work?

The Dummy Payment App supports the following webhooks to enable payment flows:

The app implements webhooks to process payments initiated from your storefront:

- `PAYMENT_GATEWAY_INITIALIZE_SESSION`
- `TRANSACTION_INITIALIZE_SESSION`
- `TRANSACTION_PROCESS_SESSION`

It also implements webhooks to allow updating the status of Transactions from the Saleor Dashboard, similar to how a real third-party payment provider would:

- `TRANSACTION_REFUND_REQUESTED`
- `TRANSACTION_CHARGE_REQUESTED`
- `TRANSACTION_CANCELATION_REQUESTED`

### How to use the app?

After installing the app in Saleor, visit the app's Dashboard.

There you can create a [Checkout](https://docs.saleor.io/developer/checkout/overview), a set shipping method on that checkout.
After that step is completed you can initialize a Transaction using [`transactionInitialize`](https://docs.saleor.io/api-reference/payments/mutations/transaction-initialize) mutation. App's response to that mutation can be modified using provided input.

The checkout process in app looks like this:

1. Select channel where you want to create the Checkout
2. Click "Create checkout" to create Checkout in Saleor in your selected channel
3. Click "Set delivery" to set delivery method on that checkout
4. Set response you want the app to return for [`TRANSACTION_INITIALIZE_SESSION`](https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#initialize-transaction-session)
5. Click "Initialize transaction"
6. Wait until response is returned and click "Complete checkout" to send [`checkoutComplete`](https://docs.saleor.io/api-reference/checkout/mutations/checkout-complete) mutation

### Learn more

#### Docs

- [**Apps guide**](https://docs.saleor.io/docs/developer/extending/apps/overview) - learn more how to build your own Saleor app
- [**Transactions API**](https://docs.saleor.io/docs/developer/payments) - learn how to use Transactions API in your store
- [**Payment App webhooks**](https://docs.saleor.io/docs/developer/extending/webhooks/synchronous-events/transaction) - learn how to build your own Payment App

#### Examples

- [**Stripe Payment App**](https://github.com/saleor/saleor-app-payment-stripe)
- [**Stripe Example Storefront**](https://github.com/saleor/example-nextjs-stripe)

## Development

You can find docs about App development in the [Saleor documentation](https://docs.saleor.io/developer/extending/apps/developing-apps/app-examples).

## Support

Please open GitHub issues if you find any problem with this app. PRs are welcome too 😄

You can find help with Saleor in these places:

- [GitHub Discussions](https://github.com/saleor/saleor/discussions)
- [Saleor Discord](https://discord.gg/H52JTZAtSH)

## Credits

- App logo: [Lucide](https://lucide.dev/license)
