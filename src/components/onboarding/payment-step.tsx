import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CreditCard, Loader2, Lock } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentMethodStepProps {
    onNext: (data: { paymentMethodId: string }) => void;
    onBack: () => void;
    planType: string;
}

function PaymentForm({ onNext, onBack, planType }: PaymentMethodStepProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const cardElement = elements.getElement(CardElement);

            if (!cardElement) {
                throw new Error("Card element not found");
            }

            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
            });

            if (error) {
                setError(error.message || "An error occurred");
                toast.error(error.message || "Payment method creation failed");
            } else if (paymentMethod) {
                toast.success("Payment method added successfully");
                onNext({ paymentMethodId: paymentMethod.id });
            }
        } catch (err: any) {
            console.error("Payment error:", err);
            setError(err.message || "An unexpected error occurred");
            toast.error("Failed to process payment method");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Add Payment Method</h2>
                <p className="text-muted-foreground">
                    Securely add your card for your {planType} plan subscription.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Card Details
                    </CardTitle>
                    <CardDescription>
                        Your payment information is encrypted and secure.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="p-4 border rounded-md bg-background">
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: "16px",
                                            color: "#424770",
                                            "::placeholder": {
                                                color: "#aab7c4",
                                            },
                                        },
                                        invalid: {
                                            color: "#9e2146",
                                        },
                                    },
                                    hidePostalCode: true,
                                }}
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            <span>Payments are processed securely by Stripe</span>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={onBack}
                                disabled={loading}
                            >
                                Back
                            </Button>
                            <Button type="submit" className="w-full" disabled={!stripe || loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Save & Continue"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export function PaymentMethodStep(props: PaymentMethodStepProps) {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm {...props} />
        </Elements>
    );
}
