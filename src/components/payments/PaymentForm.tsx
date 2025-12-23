import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { usePayments } from "../../hooks/usePayments";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

function InnerPaymentForm({
  onSuccess,
  onCancel,
  returnUrl,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
  returnUrl?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      } else {
        toast.success("Payment successful");
        if (onSuccess) await onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Payment error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e: any) => setNotes(e.target.value)}
          placeholder="Add any special instructions..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || processing}>
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay now"
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentForm({
  bookingId,
  onSuccess,
  onCancel,
  amount,
  description,
  returnUrl,
}: any) {
  const { createPaymentIntent } = usePayments();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await createPaymentIntent({
          bookingId: String(bookingId),
          description: description || "Booking payment",
        });
        if (mounted && res?.clientSecret) {
          setClientSecret(res.clientSecret);
        }
      } catch (err: any) {
        console.error("Error creating payment intent:", err);
        toast.error(`Failed to initiate payment: ${err?.message || 'Unknown error'}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [bookingId, description, createPaymentIntent]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-4 text-destructive">
        Unable to initialize payment system. Please try again.
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0f172a',
          },
        },
      }}
    >
      <InnerPaymentForm
        onSuccess={onSuccess}
        onCancel={onCancel}
        returnUrl={returnUrl}
      />
    </Elements>
  );
}
