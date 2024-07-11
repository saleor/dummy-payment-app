import { StripeComponent } from "@/ui/components/stripeComponent";
import {
	GetCheckoutByIdDocument,
	GetCheckoutByIdQuery,
	GetCheckoutByIdQueryVariables,
	TransactionInitializeDocument,
	TransactionInitializeMutation,
	TransactionInitializeMutationVariables,
} from "@/generated/graphql";
import { stripeAppId } from "@/lib/common";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useEffect } from "react";

export default function CartPage() {
	const checkoutId = typeof sessionStorage === "undefined" ? undefined : sessionStorage.getItem("checkoutId");
	const { data: checkoutResponse, loading: checkoutLoading } = useQuery<
		GetCheckoutByIdQuery,
		GetCheckoutByIdQueryVariables
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- skip: !checkoutId
	>(gql(GetCheckoutByIdDocument.toString()), { variables: { id: checkoutId! }, skip: !checkoutId });

	const [createTransaction, { data: transactionInitializeResponse, loading: transactionInitializeLoading }] =
		useMutation<TransactionInitializeMutation, TransactionInitializeMutationVariables>(
			gql(TransactionInitializeDocument.toString()),
		);

	const isStripeAppInstalled = checkoutResponse?.checkout?.availablePaymentGateways.some(
		(gateway) => gateway.id === stripeAppId,
	);

	useEffect(() => {
		if (
			!checkoutResponse ||
			!isStripeAppInstalled ||
			transactionInitializeLoading ||
			transactionInitializeResponse ||
			!checkoutResponse.checkout
		) {
			return;
		}
		void createTransaction({
			variables: {
				checkoutId: checkoutResponse.checkout.id,
				data: {},
			},
		});
	}, [
		checkoutResponse,
		createTransaction,
		isStripeAppInstalled,
		transactionInitializeLoading,
		transactionInitializeResponse,
	]);

	if (!checkoutResponse || checkoutLoading) {
		return <div>Loading…</div>;
	}

	if (!isStripeAppInstalled) {
		return (
			<div className="text-red-500">
				Stripe App was not installed in this Saleor Cloud instance. Go to{" "}
				<a href="https://stripe.saleor.app/">stripe.saleor.app</a> and follow the instructions.
			</div>
		);
	}

	if (!transactionInitializeResponse || transactionInitializeLoading) {
		return <div>Loading…</div>;
	}

	const stripeData = transactionInitializeResponse.transactionInitialize?.data as
		| undefined
		| {
				paymentIntent: {
					client_secret: string;
				};
				publishableKey: string;
		  };

	if (transactionInitializeResponse.transactionInitialize?.errors.length || !stripeData) {
		return (
			<div className="text-red-500">
				<p>Failed to initialize Stripe transaction</p>
				<pre>{JSON.stringify(transactionInitializeResponse, null, 2)}</pre>
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
				returnUrl="http://localhost:3000/pages-router/cart/payment"
			/>
		</div>
	);
}
