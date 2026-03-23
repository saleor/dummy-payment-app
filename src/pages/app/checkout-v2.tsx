import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import {
  useChannelsListQuery,
  useCompleteCheckoutMutation,
  useCreateCheckoutMutation,
  useInitializeTransactionMutation,
  useProductListQuery,
  useUpdateDeliveryMutation,
} from "@/generated/graphql";
import { TransactionEventType, transactionEventTypeSchema } from "@/modules/validation/common";
import React, { useEffect } from "react";
import { SyncWebhookRequestData } from "@/modules/validation/sync-transaction";
import { useRouter } from "next/router";
import { v7 as uuidv7 } from "uuid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (amount: number, currency: string) => {
  return `${currency} ${amount.toFixed(2)}`;
};

const CheckoutV2Page = () => {
  const router = useRouter();
  const { appBridge } = useAppBridge();

  const [channelSlug, setChannelSlug] = React.useState<string>("");
  const [selectedShippingId, setSelectedShippingId] = React.useState<string>("");
  const [includePspReference, setIncludePspReference] = React.useState<boolean>(true);
  const [pspReference, setPspReference] = React.useState<string>(() => uuidv7());
  const [eventType, setEventType] = React.useState<TransactionEventType>("CHARGE_SUCCESS");

  const [{ data: channelsData }] = useChannelsListQuery();
  const [{ data: productsData }] = useProductListQuery({
    pause: channelSlug === "",
    variables: { channelSlug },
  });

  const [checkoutResult, checkoutExecute] = useCreateCheckoutMutation();
  const [deliveryResult, deliveryExecute] = useUpdateDeliveryMutation();
  const [txInitResult, txInitExecute] = useInitializeTransactionMutation();
  const [completeResult, completeExecute] = useCompleteCheckoutMutation();

  const checkout = checkoutResult.data?.checkoutCreate?.checkout;
  const product = productsData?.products?.edges[0]?.node;
  const variant = product?.defaultVariant;
  const shippingMethods = checkout?.shippingMethods ?? [];
  const selectedShipping = shippingMethods.find((m) => m.id === selectedShippingId);
  const txEvent = txInitResult.data?.transactionInitialize?.transactionEvent;
  const txTransaction = txInitResult.data?.transactionInitialize?.transaction;
  const order = completeResult.data?.checkoutComplete?.order;

  // Auto-create checkout when channel and product are available
  useEffect(() => {
    if (channelSlug && variant) {
      checkoutExecute({
        channelSlug,
        variants: [{ quantity: 1, variantId: variant.id }],
      });
      // Reset downstream state
      setSelectedShippingId("");
    }
  }, [channelSlug, variant?.id]);

  // Auto-select first shipping method
  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShippingId) {
      setSelectedShippingId(shippingMethods[0].id);
    }
  }, [shippingMethods.length]);

  // Auto-set delivery when shipping method changes
  useEffect(() => {
    if (checkout?.id && selectedShippingId) {
      deliveryExecute({ id: checkout.id, methodId: selectedShippingId });
    }
  }, [checkout?.id, selectedShippingId]);

  const handleInitializeTransaction = () => {
    if (!checkout?.id) return;
    txInitExecute({
      id: checkout.id,
      data: {
        event: {
          type: eventType,
          includePspReference,
        },
      } as SyncWebhookRequestData,
    });
  };

  const handleCompleteCheckout = () => {
    if (!checkout?.id) return;
    completeExecute({ id: checkout.id });
  };

  const navigateToOrder = (orderId: string) => {
    appBridge?.dispatch(
      actions.Redirect({ to: `/orders/${orderId}`, newContext: true })
    );
  };

  const productPrice = variant?.pricing?.price?.gross;
  const shippingPrice = selectedShipping?.price;
  const subtotal = productPrice?.amount ?? 0;
  const shipping = shippingPrice?.amount ?? 0;
  const total = subtotal + shipping;
  const currency = productPrice?.currency ?? "USD";

  return (
    <div className="tw-checkout min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
              D
            </div>
            <div>
              <h1 className="text-lg font-semibold">Dummy Payment App</h1>
              <p className="text-xs text-muted-foreground">Saleor Payments API Testing</p>
            </div>
          </div>
          <Badge variant="outline">Connected</Badge>
        </div>
      </div>

      {/* Page title */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Checkout with Payments</h2>
            <p className="text-sm text-muted-foreground">
              Create a checkout and initialize a payment transaction
            </p>
          </div>
          <Badge variant="secondary">Manual</Badge>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
        {/* Left column - Configuration */}
        <div className="space-y-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Configuration
          </div>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channelSlug} onValueChange={setChannelSlug}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(channelsData?.channels ?? []).map((ch) => (
                      <SelectItem key={ch.slug} value={ch.slug}>
                        {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Delivery method</Label>
                <Select
                  value={selectedShippingId}
                  onValueChange={setSelectedShippingId}
                  disabled={shippingMethods.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery..." />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} &mdash; {formatCurrency(method.price.amount, method.price.currency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Initialize Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="psp-ref"
                  checked={includePspReference}
                  onCheckedChange={(checked) => setIncludePspReference(checked === true)}
                />
                <Label htmlFor="psp-ref" className="cursor-pointer">
                  Send PSP reference
                </Label>
              </div>

              {includePspReference && (
                <Input value={pspReference} readOnly className="font-mono text-xs" />
              )}

              <div className="space-y-2">
                <Label>Transaction response</Label>
                <Select value={eventType} onValueChange={(v) => setEventType(v as TransactionEventType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionEventTypeSchema.options.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleInitializeTransaction}
                disabled={!checkout?.id || txInitResult.fetching}
              >
                Initialize Transaction
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Complete checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleCompleteCheckout}
                disabled={!checkout?.id || !deliveryResult.data || completeResult.fetching}
              >
                Complete Checkout
              </Button>

              {order && (
                <button
                  className="mt-3 text-sm text-primary underline underline-offset-4"
                  onClick={() => navigateToOrder(order.id)}
                >
                  View Order #{order.number}
                </button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Checkout Preview */}
        <div className="space-y-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Checkout Preview
          </div>

          <Card>
            <CardContent className="space-y-0 p-0">
              {/* Product */}
              <div className="p-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product
                </div>
                {product ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {product.thumbnail?.url && (
                        <img
                          src={product.thumbnail.url}
                          alt={product.thumbnail.alt ?? product.name}
                          className="h-12 w-12 rounded-md border object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        {product.category && (
                          <p className="text-xs text-muted-foreground">{product.category.name}</p>
                        )}
                      </div>
                    </div>
                    {productPrice && (
                      <p className="text-sm font-medium">
                        {formatCurrency(productPrice.amount, productPrice.currency)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a channel to load products</p>
                )}
              </div>

              <Separator />

              {/* Subtotal */}
              <div className="p-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subtotal
                </div>
                {selectedShipping ? (
                  <div className="flex items-center justify-between text-sm">
                    <span>{selectedShipping.name}</span>
                    <span>{formatCurrency(selectedShipping.price.amount, selectedShipping.price.currency)}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No delivery method selected</p>
                )}
              </div>

              <Separator />

              {/* Address */}
              <div className="p-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Address
                </div>
                <div className="space-y-0.5 text-sm">
                  <p className="font-medium">John Doe</p>
                  <p className="text-muted-foreground">813 Howard Street</p>
                  <p className="text-muted-foreground">Oswego, NY 13126</p>
                </div>
              </div>

              <Separator />

              {/* Delivery */}
              <div className="p-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery
                </div>
                {selectedShipping ? (
                  <p className="text-sm">{selectedShipping.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not selected</p>
                )}
              </div>

              <Separator />

              {/* Transaction status */}
              <div className="p-6">
                {txEvent ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Event type</span>
                      <Badge variant="secondary">{txEvent.type}</Badge>
                    </div>
                    {txEvent.pspReference && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">PSP Reference</span>
                        <span className="font-mono text-xs">{txEvent.pspReference}</span>
                      </div>
                    )}
                    {txEvent.amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span>{formatCurrency(txEvent.amount.amount, txEvent.amount.currency)}</span>
                      </div>
                    )}
                    {txTransaction?.id && (
                      <button
                        className="mt-1 text-xs text-primary underline underline-offset-4"
                        onClick={() => router.push(`/app/transactions/${txTransaction.id}`)}
                      >
                        View transaction details
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No transaction initialized yet</p>
                )}
              </div>

              <Separator />

              {/* Price summary */}
              <div className="space-y-2 p-6">
                {product && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shippingPrice ? formatCurrency(shipping, currency) : "—"}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total, currency)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutV2Page;
