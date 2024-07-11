import { CheckoutCompleteDocument, PaymentGatewayInitializeDocument } from "@/generated/graphql";
import { executeGraphQL, stripeAppId } from "@/lib/common";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export default async function CreateOrderHandler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
	const { payment_intent, payment_intent_client_secret } = req.query;

	if (
		!payment_intent ||
		!payment_intent_client_secret ||
		typeof payment_intent !== "string" ||
		typeof payment_intent_client_secret !== "string"
	) {
		res.status(400).json({ error: "Missing payment intent or client secret" });
		return;
	}

	const checkoutId = (req.body as { checkoutId?: string }).checkoutId;
	if (!checkoutId) {
		res.status(400).json({ error: "Missing checkout ID" });
		return;
	}

	const paymentGateway = await executeGraphQL({
		query: PaymentGatewayInitializeDocument,
		variables: {
			checkoutId,
		},
	});

	const stripeData = paymentGateway.paymentGatewayInitialize?.gatewayConfigs?.find(
		(gateway) => gateway.id === stripeAppId,
	)?.data as undefined | { publishableKey: string };

	if (
		!stripeData?.publishableKey ||
		paymentGateway.paymentGatewayInitialize?.errors.length ||
		paymentGateway.paymentGatewayInitialize?.gatewayConfigs?.some((gateway) => gateway.errors?.length)
	) {
		res.status(404).send({ error: "Payment not found" });
		return;
	}

	const stripe = new Stripe(stripeData.publishableKey, { apiVersion: "2022-11-15" });

	const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent, {
		client_secret: payment_intent_client_secret,
	});

	if (paymentIntent.status === "processing") {
		res.status(200).json({ status: "processing" });
		return;
	}

	if (paymentIntent.status === "requires_payment_method") {
		res.status(200).json({ status: "requires_payment_method" });
	}

	if (paymentIntent.status === "succeeded") {
		const order = await executeGraphQL({
			query: CheckoutCompleteDocument,
			variables: {
				checkoutId,
			},
		});
		if (
			order.checkoutComplete?.errors.length ||
			order.checkoutComplete?.order?.errors.length ||
			!order.checkoutComplete?.order
		) {
			res.status(400).json({ error: "Failed to complete order" });
			return;
		}
		res.status(201).json({ status: "succeeded", orderId: order.checkoutComplete.order.id });
		return;
	}
}
