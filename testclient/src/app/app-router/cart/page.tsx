import { getCheckoutFromCookiesOrRedirect } from "@/lib/app-router";
import { TransactionInitializeDocument } from "@/generated/graphql";
import { StripeComponent } from "@/ui/components/stripeComponent";
import { executeGraphQL, stripeAppId } from "@/lib/common";

export default async function CartPage() {
	const checkout = await getCheckoutFromCookiesOrRedirect();

	const isStripeAppInstalled = checkout.availablePaymentGateways.some(
		(gateway) => gateway.id === stripeAppId,
	);

	if (!isStripeAppInstalled) {
		return (
			<div className="text-red-500">
				Stripe App was not installed in this Saleor Cloud instance. Go to{" "}
				<a href="https://stripe.saleor.app/">stripe.saleor.app</a> and follow the instructions.
			</div>
		);
	}

	const transaction = await executeGraphQL({
		query: TransactionInitializeDocument,
		variables: {
			checkoutId: checkout.id,
			data: {
				automatic_payment_methods: {
					enabled: true,
				},
			},
		},
		cache: "no-store",
	});

	const stripeData = transaction.transactionInitialize?.data as
		| undefined
		| {
				paymentIntent: {
					client_secret: string;
				};
				publishableKey: string;
		  };

	if (transaction.transactionInitialize?.errors.length || !stripeData) {
		return (
			<div className="text-red-500">
				<p>Failed to initialize Stripe transaction</p>
				<pre>{JSON.stringify(transaction, null, 2)}</pre>
			</div>
		);
	}

	return (
		<div>
			<p>Use the following card details to test payments:</p>
			<dl className="mb-4 grid w-fit grid-cols-[1fr,2fr] gap-x-2">
				<dt className="font-bold">Card number</dt>
				<dd>4242 4242 4242 4242</dd>
				<dt className="font-bold">Expiry date</dt>
				<dd>Any future date (eg. 03/30)</dd>
				<dt className="font-bold">CVC</dt>
				<dd>Any 3 digits (eg. 737)</dd>
			</dl>
			<StripeComponent
				clientSecret={stripeData.paymentIntent.client_secret}
				publishableKey={stripeData.publishableKey}
				returnUrl="http://localhost:3000/app-router/cart/payment"
			/>
		</div>
	);
}
