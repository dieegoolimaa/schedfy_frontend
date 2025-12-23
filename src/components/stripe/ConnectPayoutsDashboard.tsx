import { ConnectPayouts } from "@stripe/react-connect-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ConnectPayoutsDashboard = () => {
  return (
    <div className="container mx-auto py-6">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <ConnectPayouts />
        </CardContent>
      </Card>
    </div>
  );
};
