import { useState, useEffect } from "react";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { paymentsService } from "../../services/payments.service";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/auth-context";

interface ConnectWrapperProps {
  children: React.ReactNode;
}

export const ConnectWrapper = ({ children }: ConnectWrapperProps) => {
  const { user } = useAuth();
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initConnect = async () => {
      if (!user?.entityId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch the Account Session client secret from your backend
        const response = await paymentsService.createAccountSession(user.entityId);
        const clientSecret = response.data.clientSecret;

        if (!clientSecret) {
          throw new Error("Failed to retrieve client secret");
        }

        // 2. Initialize Stripe Connect
        const instance = loadConnectAndInitialize({
          publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
          fetchClientSecret: async () => {
            // This function is called when the session expires and needs to be refreshed
            const res = await paymentsService.createAccountSession(user.entityId);
            return res.data.clientSecret;
          },
          appearance: {
            overlays: 'dialog',
            variables: {
              colorPrimary: '#0f172a', // slate-900
            },
          },
        });

        setStripeConnectInstance(instance);
      } catch (err: any) {
        console.error("Failed to initialize Stripe Connect:", err);
        setError("Failed to load payment system. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initConnect();
  }, [user?.entityId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!stripeConnectInstance) {
    return <>{children}</>;
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      {children}
    </ConnectComponentsProvider>
  );
};
