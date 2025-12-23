import { ConnectWrapper } from "@/components/stripe/ConnectWrapper";
import { ConnectPayoutsDashboard } from "@/components/stripe/ConnectPayoutsDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConnectFinancialsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
        <p className="text-muted-foreground">
          Manage your payouts, view transactions, and configure your bank account.
        </p>
      </div>

      <ConnectWrapper>
        <ConnectPayoutsDashboard />
      </ConnectWrapper>
    </div>
  );
}
