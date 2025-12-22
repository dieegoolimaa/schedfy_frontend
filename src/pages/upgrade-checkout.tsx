import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useRegion } from "@/contexts/region-context";
import { usePlanRestrictions } from "@/hooks/use-plan-restrictions";
import { subscriptionsService } from "@/services/subscriptions.service";
import { toast } from "sonner";
import { ArrowLeft, Check, CreditCard, Loader2, ShieldCheck, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function UpgradeCheckoutPage() {
    const { t } = useTranslation("upgrade");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { getPriceDisplay, region } = useRegion();

    const planId = searchParams.get("planId");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Define plan details mapping (similar to UpgradePage)
    const getPlanDetails = (id: string | null) => {
        if (!id) return null;

        // This should ideally come from a shared config or API
        const plans: Record<string, any> = {
            "simple_unlimited": {
                name: t("plans.unlimitedBookings.title", "Unlimited Bookings"),
                price: region === 'BR' ? "R$29.90" : "€9.90",
                description: t("plans.unlimitedBookings.description", "Remove booking limits from your Simple plan"),
                features: [
                    t("plans.unlimitedBookings.features.unlimited", "Unlimited bookings"),
                    t("plans.unlimitedBookings.features.keepCurrent", "Keep current features"),
                    t("plans.unlimitedBookings.features.cancelAnytime", "Cancel anytime"),
                ],
                recommended: true
            },
            "individual": {
                name: t("plans.individual.name", "Individual"),
                price: region === 'BR' ? "R$89.90" : "€34.90",
                description: t("plans.individual.description", "AI-powered insights for growing businesses"),
                features: [
                    t("plans.individual.features.everythingInSimple", "Everything in Simple"),
                    t("plans.individual.features.aiInsights", "AI-powered insights"),
                    t("plans.individual.features.advancedAnalytics", "Advanced analytics"),
                    t("plans.individual.features.serviceOptimization", "Service optimization"),
                    t("plans.individual.features.prioritySupport", "Priority support"),
                ]
            },
            "business": {
                name: t("plans.business.name", "Business"),
                price: region === 'BR' ? "R$199.90" : "€89.90",
                description: t("plans.business.description", "Complete solution for teams"),
                features: [
                    t("plans.business.features.everythingInIndividual", "Everything in Individual"),
                    t("plans.business.features.multiProfessional", "Multi-professional management"),
                    t("plans.business.features.teamCollaboration", "Team collaboration"),
                    t("plans.business.features.advancedRoles", "Advanced role management"),
                    t("plans.business.features.customIntegrations", "Custom integrations"),
                    t("plans.business.features.dedicatedSupport", "Dedicated support"),
                ]
            }
        };

        return plans[id];
    };

    const plan = getPlanDetails(planId);

    useEffect(() => {
        if (!planId || !plan) {
            toast.error(t("errors.invalidPlan", "Invalid plan selected"));
            navigate("/upgrade");
        }
    }, [planId, plan, navigate, t]);

    const handleConfirmUpgrade = async () => {
        if (!planId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Try automated stripe flow first
            const { url } = await subscriptionsService.upgradePlan(planId, 'month');
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (err: any) {
            console.error("Automated upgrade failed", err);
            // If 404 or backend error, show manual option
            setError(t("errors.upgradeFailedManual", "Automated checkout is unavailable right now. Please request a manual upgrade below."));
        } finally {
            setIsLoading(false);
        }
    };

    const { isSimplePlan, isIndividualPlan } = usePlanRestrictions();

    const handleManualRequest = () => {
        const subject = encodeURIComponent(`Upgrade Request: ${plan?.name}`);
        const body = encodeURIComponent(`I would like to upgrade my account to the ${plan?.name} plan.\n\nIssue encountered: ${error || "Manual request"}`);

        // Determine correct support path based on plan
        const supportPath = isSimplePlan ? "/simple/support" : isIndividualPlan ? "/individual/support" : "/entity/support";

        navigate(`${supportPath}?action=create-ticket&category=billing&subject=${subject}&description=${body}`);
        toast.info(t("messages.redirectingToSupport", "Redirecting to support ticket creation..."));
    };

    if (!plan) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate("/upgrade")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t("actions.back", "Back")}
                    </Button>
                    <h1 className="text-2xl font-bold">{t("checkout.title", "Review Your Upgrade")}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Checkout Area */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("checkout.summary", "Subscription Summary")}</CardTitle>
                                <CardDescription>{t("checkout.summaryDesc", "Review your new plan details")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-between items-start p-4 bg-muted rounded-lg">
                                    <div>
                                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {plan.features.slice(0, 3).map((f: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{plan.price}</div>
                                        <div className="text-sm text-muted-foreground">/{t("period.month", "month")}</div>
                                    </div>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Checkout Issue</AlertTitle>
                                        <AlertDescription className="space-y-3">
                                            <p>{error}</p>
                                            <Button variant="outline" size="sm" onClick={handleManualRequest} className="w-full gap-2 bg-white text-destructive hover:bg-red-50">
                                                <Mail className="h-4 w-4" />
                                                {t("actions.contactSupport", "Contact Support to Upgrade")}
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-medium text-sm">{t("checkout.secure", "Secure Payment")}</h4>
                                            <p className="text-xs text-muted-foreground">{t("checkout.secureDesc", "Payments are processed securely via Stripe. You can cancel at any time.")}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-3">
                                <Button
                                    size="lg"
                                    className="w-full text-base font-semibold h-12"
                                    onClick={handleConfirmUpgrade}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {t("actions.processing", "Processing...")}
                                        </>
                                    ) : (
                                        <>
                                            {t("actions.confirmToPay", "Continue to Payment")}
                                            <span className="ml-2 bg-primary-foreground/20 px-2 py-0.5 rounded text-sm">
                                                {plan.price}
                                            </span>
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-xs text-muted-foreground">
                                    By confirming, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Sidebar / FAQ */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">{t("checkout.faq.title", "Common Questions")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-medium">When will I be charged?</h4>
                                    <p className="text-muted-foreground mt-1">You will be charged immediately for the first month. Subscription renews automatically.</p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Can I cancel anytime?</h4>
                                    <p className="text-muted-foreground mt-1">Yes, you can cancel your subscription at any time from the account settings.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
