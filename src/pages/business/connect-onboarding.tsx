import { ConnectWrapper } from "@/components/stripe/ConnectWrapper";
import { ConnectOnboarding } from "@/components/stripe/ConnectOnboarding";

export default function ConnectOnboardingPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Setup</h1>
        <p className="text-muted-foreground">
          Complete your account setup to start receiving payments.
        </p>
      </div>

      <ConnectWrapper>
        <ConnectOnboarding />
      </ConnectWrapper>
    </div>
  );
}
