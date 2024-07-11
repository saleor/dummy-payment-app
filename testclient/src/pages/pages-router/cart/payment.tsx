import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CartPaymentPage() {
	const router = useRouter();
	// these params are provided by Stripe https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements#web-submit-payment
	const searchParams = router.query as { payment_intent?: string; payment_intent_client_secret?: string };
	const checkoutId = typeof sessionStorage === "undefined" ? undefined : sessionStorage.getItem("checkoutId");

	const [state, setState] = useState<"processing" | "requires_payment_method" | "error" | "succeeded">(
		"processing",
	);

	useEffect(() => {
		if (
			!checkoutId ||
			!searchParams ||
			!searchParams.payment_intent ||
			!searchParams.payment_intent_client_secret
		) {
			return;
		}

		const params = new URLSearchParams();
		params.set("payment_intent", searchParams.payment_intent);
		params.set("payment_intent_client_secret", searchParams.payment_intent_client_secret);

		void fetch("/api/createOrder?" + params.toString(), {
			method: "POST",
			body: JSON.stringify({ checkoutId }),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => res.json())
			.then((json: unknown) => {
				if (typeof json === "object" && json && "status" in json) {
					if (json.status === "processing") {
						setState("processing");
						return;
					}
					if (json.status === "requires_payment_method") {
						setState("requires_payment_method");
						void router.push("/pages-router/cart");
						return;
					}
					if (json.status === "succeeded" && "orderId" in json && typeof json.orderId === "string") {
						setState("succeeded");
						const orderId = json.orderId;
						void router.push(`/pages-router/cart/success/${orderId}`);
						return;
					}
				}
				setState("error");
				return;
			});
	}, [checkoutId, router, searchParams]);

	if (state === "error") {
		return (
			<div className="text-red-500">
				<p>Failed to finalize order</p>
			</div>
		);
	}
}
