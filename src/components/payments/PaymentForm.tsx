import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { usePayments } from "../../hooks/usePayments";
import { toast } from "sonner";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

function InnerPaymentForm({ bookingId, onSuccess, onCancel, clientName }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const { createPaymentIntent } = usePayments();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await createPaymentIntent(String(bookingId));
        if (mounted) setClientSecret(res?.clientSecret || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to initiate payment");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [bookingId, createPaymentIntent]);

  const handleSubmit = async () => {
    if (!stripe || !elements || !clientSecret) return;
    setProcessing(true);
    try {
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element not found");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: clientName || "Customer",
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === "succeeded"
      ) {
        toast.success("Payment successful");
        if (onSuccess) await onSuccess();
      } else {
        toast.error("Payment was not completed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Payment error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Card details</Label>
      <div className="p-3 border rounded">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e: any) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!clientSecret || processing}>
          {processing ? "Processing…" : "Pay now"}
        </Button>
      </div>
    </div>
  );
}

export default function PaymentForm(props: any) {
  return (
    <Elements stripe={stripePromise}>
      <InnerPaymentForm {...props} />
    </Elements>
  );
}
