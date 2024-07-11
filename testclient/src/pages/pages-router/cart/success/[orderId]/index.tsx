import Image from "next/image";
import { GetOrderByIdDocument, GetOrderByIdQuery, GetOrderByIdQueryVariables } from "@/generated/graphql";
import Link from "next/link";
import { formatMoney } from "@/lib/common";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";

export default function CartSuccessPage() {
	const router = useRouter();
	const { data: orderResponse, loading: loadingOrder } = useQuery<
		GetOrderByIdQuery,
		GetOrderByIdQueryVariables
	>(gql(GetOrderByIdDocument.toString()), {
		variables: { orderId: router.query.orderId as string },
	});

	if (!orderResponse?.order || loadingOrder) {
		return;
	}

	return (
		<article>
			<h1 className="text-5xl">Order #{orderResponse.order.number} summary</h1>
			<p className="text-2xl">Thank you for your order!</p>
			<p className="my-4">
				Order status: <strong>{orderResponse.order.statusDisplay}</strong>
			</p>

			<table className="table-auto">
				<thead className="text-left">
					<tr>
						<th></th>
						<th className="border-r px-4 py-2">Product</th>
						<th className="border-r px-4 py-2">Quantity</th>
						<th className="px-4 py-2">Price</th>
					</tr>
				</thead>
				<tbody>
					{orderResponse.order.lines.map((line) => (
						<tr key={line.id} className="border-t">
							<td>
								{line.thumbnail?.url && <Image src={line.thumbnail?.url} alt="" width={64} height={64} />}
							</td>
							<td className="border-r px-4 py-2">{line.productName}</td>
							<td className="border-r px-4 py-2 text-center">{line.quantity}</td>
							<td className="px-4 py-2">
								{formatMoney(line.unitPrice.gross.amount, line.unitPrice.gross.currency)}
							</td>
						</tr>
					))}
				</tbody>
				<tfoot className="font-bold">
					<tr className="border-t">
						<td className="border-r px-4 py-2 text-right" colSpan={3}>
							Total
						</td>
						<td className="px-4 py-2">
							{formatMoney(orderResponse.order.total.gross.amount, orderResponse.order.total.gross.currency)}{" "}
							<span className="font-normal italic">
								(including{" "}
								{formatMoney(orderResponse.order.total.tax.amount, orderResponse.order.total.tax.currency)}{" "}
								tax)
							</span>
						</td>
					</tr>
					<tr className="border-t">
						<td className="border-r px-4 py-2 text-right" colSpan={3}>
							Paid
						</td>
						<td className="px-4 py-2">
							{formatMoney(
								orderResponse.order.totalCharged.amount,
								orderResponse.order.totalCharged.currency,
							)}
						</td>
					</tr>
				</tfoot>
			</table>
			<Link
				className="mt-8 inline-block rounded-md border px-4 py-2 text-xl font-bold text-blue-500 shadow-md hover:text-blue-400 hover:underline"
				href="/"
			>
				Back to the homepage
			</Link>
		</article>
	);
}
