import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Entity } from "@/types/models/entities.interface";

export function PaymentAlert() {
    const { entity } = useAuth();
    const navigate = useNavigate();

    // Cast entity to Entity interface to access new properties
    // In a real scenario, we should update the AuthEntity type definition
    const currentEntity = entity as unknown as Entity;

    if (!currentEntity?.hasPaymentIssue) {
        return null;
    }

    const handleManageSubscription = () => {
        if (currentEntity.plan === 'simple') {
            navigate('/simple/subscription');
        } else if (currentEntity.plan === 'individual') {
            navigate('/individual/subscription');
        } else {
            navigate('/entity/subscription');
        }
    };

    return (
        <div className="container mx-auto px-4 py-2">
            <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="ml-2">Payment Issue Detected</AlertTitle>
                <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ml-2">
                    <span>
                        {currentEntity.paymentIssueType === 'payment_failed'
                            ? "We couldn't process your last payment. Please update your payment method to avoid service interruption."
                            : currentEntity.paymentIssueType === 'past_due'
                                ? "Your subscription is past due. Please settle your outstanding balance."
                                : "There is an issue with your subscription payment."}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 hover:bg-red-100 hover:text-red-900 dark:border-red-800 dark:hover:bg-red-900/50 dark:hover:text-red-100 whitespace-nowrap"
                        onClick={handleManageSubscription}
                    >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Update Payment Method
                    </Button>
                </AlertDescription>
            </Alert>
        </div>
    );
}
