import { ConnectAccountOnboarding } from "@stripe/react-connect-js";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const ConnectOnboarding = () => {
  const [onboardingExited, setOnboardingExited] = useState(false);

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Setup Payments</CardTitle>
          <CardDescription>
            To receive payments from your clients, you need to set up your payout account.
            This information is securely handled by Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!onboardingExited && (
            <ConnectAccountOnboarding
              onExit={() => setOnboardingExited(true)}
            />
          )}
          {onboardingExited && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">Setup Completed</h3>
              <p className="text-muted-foreground">
                You can now receive payments. Check the Payouts tab for details.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
