import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { entitySubscriptionsService } from "@/services/entity-subscriptions.service";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    CreditCard,
    Crown,
    CheckCircle,
    Calendar,
    Download,
    Brain,
    TrendingUp,
    Users,
    Building,
    Loader2,
    AlertTriangle,
    Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function SubscriptionDetails() {
    const { t } = useTranslation(["subscription", "common"]);
    const { formatCurrency } = useCurrency();
    const queryClient = useQueryClient();
    const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    // Trial Calculation (Frontend-side fallback if status is not explicitly 'trialing')
    const trialDays = 14;
    // We need user creation date or subscription creation date. subscription.createdAt is best.
    // If subscription is loading, these will be recalculated later.
    const getTrialInfo = (sub: any) => {
        if (!sub) return { isOnTrial: false, daysRemaining: 0, trialEndDate: new Date() };
        const createdAt = new Date(sub.createdAt || Date.now());
        const end = new Date(createdAt.getTime() + trialDays * 24 * 60 * 60 * 1000);
        const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const isTrial = sub.plan !== 'simple' && days > 0 && days <= trialDays;
        return { isOnTrial: isTrial, daysRemaining: days, trialEndDate: end };
    };
    const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
        queryKey: ['subscription'],
        queryFn: async () => {
            const response = await entitySubscriptionsService.getCurrentSubscription();
            return response.data;
        },
    });

    const { data: plans, isLoading: isLoadingPlans } = useQuery({
        queryKey: ['plans'],
        queryFn: async () => {
            const response = await entitySubscriptionsService.getAvailablePlans();
            return response.data;
        },
    });

    const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const response = await entitySubscriptionsService.getInvoices();
            return response.data;
        },
    });

    // Mutations
    const upgradeMutation = useMutation({
        mutationFn: async ({ planId, interval }: { planId: string, interval: 'month' | 'year' }) => {
            const response = await entitySubscriptionsService.upgradePlan(planId, interval);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("messages.error.upgrade"));
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async () => {
            await entitySubscriptionsService.cancelSubscription();
        },
        onSuccess: () => {
            const date = subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : t("plan.accessUntil");
            toast.success(t("messages.success.cancel", { date }));
            setIsCancelDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("messages.error.cancel"));
        },
    });

    const portalMutation = useMutation({
        mutationFn: async () => {
            const response = await entitySubscriptionsService.getCustomerPortalUrl();
            return response.data;
        },
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("messages.error.portal"));
        },
    });

    const aiInsightsMutation = useMutation({
        mutationFn: async () => {
            const response = await entitySubscriptionsService.subscribeToAiInsights();
            return response.data;
        },
        onSuccess: (data) => {
            if (data && (data as any).url) {
                window.location.href = (data as any).url;
            } else {
                toast.success(t("messages.success.subscribeAi"));
                queryClient.invalidateQueries({ queryKey: ['subscription'] });
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("messages.error.aiSubscribe"));
        },
    });

    const unsubscribeAiInsightsMutation = useMutation({
        mutationFn: async () => {
            const response = await entitySubscriptionsService.unsubscribeFromAiInsights();
            return response.data;
        },
        onSuccess: () => {
            const date = subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : t("plan.accessUntil");
            toast.success(t("messages.success.unsubscribeAi", { date }));
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t("messages.error.aiUnsubscribe"));
        },
    });

    if (isLoadingSubscription || isLoadingPlans) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const currentPlan = Array.isArray(plans) ? plans.find(p => p.plan === subscription?.plan && p.interval === subscription?.interval) : null;
    const { isOnTrial, daysRemaining, trialEndDate } = getTrialInfo(subscription);

    // Logic: If on trial, next billing is trial end date.
    const nextBillingDate = isOnTrial ? trialEndDate : (subscription?.nextBillingDate ? new Date(subscription.nextBillingDate) : null);

    const currentAddOnPrice = subscription?.interval === 'year' ? 290 : 29;
    const totalCurrentPrice = (currentPlan?.price || 0) + (subscription?.aiInsightsSubscribed ? currentAddOnPrice : 0);

    // Filter plans: 
    // If current plan is Business, show no other plans (or maybe just Business to confirm).
    // If current plan is Individual, show Business.
    // If current plan is Simple, show Individual and Business.
    // Actually, user said "Available Plans should only show the plans that can be upgraded".
    // So if I am on Business, I see nothing? Or maybe just a message "You are on the highest plan".
    const availablePlans = Array.isArray(plans) ? plans.filter(p => {
        if (p.interval !== billingPeriod) return false;
        if (subscription?.plan === 'business') return false; // Hide all if on business
        if (subscription?.plan === 'individual' && p.plan === 'simple') return false; // Hide simple if on individual
        if (subscription?.plan === p.plan) return false; // Hide current plan
        return true;
    }) : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t("title", "Subscription Management")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("subtitle", "Manage your subscription, billing details, and invoices")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {subscription?.plan !== 'simple' && (
                        <Button variant="outline" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            {portalMutation.isPending ? t("common:loading") : t("actions.manageBilling")}
                        </Button>
                    )}
                </div>
            </div>

            {/* Current Subscription Overview */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-primary/20 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center text-xl">
                                    <Crown className="h-6 w-6 mr-2 text-yellow-500" />
                                    {subscription?.plan ? (subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)) : t("plan.unknown")} {t("plan.plan")}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {t("plan.activeSince", "Active since")}{" "}
                                    {subscription?.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : "-"}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isOnTrial && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Trial: {daysRemaining} days left
                                </Badge>
                            )}
                            <Badge
                                variant="outline"
                                className={`px-3 py-1 text-sm font-medium capitalize
                      ${isOnTrial ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                      ${!isOnTrial && subscription?.status === 'active' && !subscription.cancelAtPeriodEnd ? 'bg-green-100 text-green-800 border-green-200' : ''}
                      ${subscription?.status === 'canceled' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                      ${subscription?.cancelAtPeriodEnd ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                    `}
                            >
                                {isOnTrial ? "Trialing" : (subscription?.cancelAtPeriodEnd ? t("plan.cancellingSoon") : t(`plan.status.${subscription?.status}`, { defaultValue: subscription?.status || "" }))}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-muted/40 rounded-xl border">
                            <div>
                                <div className="text-3xl font-bold">
                                    {formatCurrency(totalCurrentPrice)}
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    {subscription?.interval === "month"
                                        ? t("billing.perMonth", "per month")
                                        : t("billing.perYear", "per year")}
                                    {subscription?.aiInsightsSubscribed && (
                                        <span className="ml-2 text-xs">
                                            ({formatCurrency(currentPlan?.price || 0)} Plan + {formatCurrency(currentAddOnPrice)} Add-ons)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-muted-foreground">
                                    {isOnTrial ? "Trial Ends On" : (subscription?.cancelAtPeriodEnd ? t("plan.accessUntil") : t("billing.nextBilling", "Next billing date"))}
                                </div>
                                <div className="text-lg font-semibold">
                                    {nextBillingDate ? nextBillingDate.toLocaleDateString() : "-"}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                {t("plan.includedFeatures", "Included Features")}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {currentPlan?.features
                                    .filter(feature => !feature.toLowerCase().includes('(add-on)'))
                                    .map((feature) => (
                                        <div key={feature} className="flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {subscription?.aiInsightsSubscribed && (
                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                    {t("plan.activeAddOns", "Active Add-ons")}
                                </h4>
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-50/50 border-purple-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 p-2 rounded-md">
                                            <Brain className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">AI Business Insights</div>
                                            <div className="text-xs text-muted-foreground">Advanced analytics & recommendations</div>
                                        </div>
                                    </div>
                                    <div className="font-medium text-sm">
                                        {formatCurrency(currentAddOnPrice)}/{subscription?.interval === 'year' ? 'yr' : 'mo'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="bg-muted/20 border-t p-6 flex justify-between items-center">
                        {subscription?.status === 'active' && !subscription.cancelAtPeriodEnd ? (
                            <>
                                <p className="text-xs text-muted-foreground max-w-[60%]">
                                    {t("billing.visitPortal")}
                                </p>
                                <Button
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setIsCancelDialogOpen(true)}
                                >
                                    {t("billing.cancelSubscription")}
                                </Button>
                            </>
                        ) : subscription?.cancelAtPeriodEnd ? (
                            <div className="w-full flex items-center justify-between">
                                <div className="flex items-center text-yellow-700">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    <span className="text-sm font-medium">{t("billing.endingOn", { date: nextBillingDate?.toLocaleDateString() })}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => portalMutation.mutate()}
                                >
                                    {t("billing.resumeSubscription")}
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full text-center">
                                <p className="text-sm text-muted-foreground">{t("billing.inactive")}</p>
                            </div>
                        )}
                    </CardFooter>
                </Card>

                {/* Usage Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("usage.title", "Usage Overview")}</CardTitle>
                        <CardDescription>
                            {t("usage.description", "Current month usage statistics")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <TrendingUp className="h-16 w-16 mb-4 opacity-10" />
                            <p className="text-sm font-medium">{t("usage.comingSoon")}</p>
                            <p className="text-xs text-center mt-2 max-w-[200px]">
                                {t("usage.comingSoonDesc")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="plans" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                    <TabsTrigger value="plans">
                        {t("tabs.changePlan", "Available Plans")}
                    </TabsTrigger>
                    <TabsTrigger value="addons">
                        {t("tabs.addOns", "Add-ons")}
                    </TabsTrigger>
                    <TabsTrigger value="invoices">
                        {t("tabs.invoices", "Invoices")}
                    </TabsTrigger>
                </TabsList>

                {/* Plans Tab */}
                <TabsContent value="plans" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                            {availablePlans.length > 0 ? t("plans.title", "Upgrade Your Plan") : t("plans.highestPlan")}
                        </h3>
                        {availablePlans.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="billing-toggle" className="text-sm">
                                    {t("billing.monthly", "Monthly")}
                                </Label>
                                <Switch
                                    id="billing-toggle"
                                    checked={billingPeriod === "year"}
                                    onCheckedChange={(checked: boolean) =>
                                        setBillingPeriod(checked ? "year" : "month")
                                    }
                                />
                                <Label htmlFor="billing-toggle" className="text-sm">
                                    {t("billing.yearly", "Yearly")}{" "}
                                    <Badge variant="secondary" className="ml-1 text-xs bg-green-100 text-green-800 hover:bg-green-200">
                                        {t("billing.save20", "Save 20%")}
                                    </Badge>
                                </Label>
                            </div>
                        )}
                    </div>

                    {availablePlans.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-3">
                            {availablePlans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className="relative flex flex-col"
                                >
                                    <CardHeader>
                                        <div className="text-center">
                                            <CardTitle className="text-xl">
                                                {plan.name}
                                            </CardTitle>
                                            <div className="mt-4">
                                                <div className="text-3xl font-bold">
                                                    {formatCurrency(plan.price)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {billingPeriod === "month"
                                                        ? t("billing.perMonth", "per month")
                                                        : t("billing.perYear", "per year")}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-1">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            disabled={upgradeMutation.isPending}
                                            onClick={() => {
                                                upgradeMutation.mutate({ planId: plan.plan, interval: billingPeriod });
                                            }}
                                        >
                                            {upgradeMutation.isPending ? t("actions.processing") : t("plans.upgradeTo", { plan: plan.name })}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                            <Crown className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                            <h3 className="text-lg font-medium">{t("plans.bestPlanTitle")}</h3>
                            <p className="text-muted-foreground mt-2">
                                {t("plans.bestPlanDesc", { plan: subscription?.plan })}
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* Add-ons Tab */}
                <TabsContent value="addons">
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium">
                            {t("addOns.title", "Available Add-ons")}
                        </h3>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-purple-100 p-2 rounded-lg">
                                            <Brain className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <CardTitle>
                                                {t("addOns.aiInsights.name", "AI Business Insights")}
                                            </CardTitle>
                                            <CardDescription>
                                                {t(
                                                    "addOns.aiInsights.description",
                                                    "Advanced AI-powered analytics and recommendations"
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(
                                            billingPeriod === "month" ? 29 : 290
                                        )}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">
                                            {billingPeriod === "month"
                                                ? t("billing.perMonth", "/month")
                                                : t("billing.perYear", "/year")}
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        <li className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">
                                                {t(
                                                    "addOns.aiInsights.features.predictive",
                                                    "Predictive analytics"
                                                )}
                                            </span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">
                                                {t(
                                                    "addOns.aiInsights.features.clientBehavior",
                                                    "Client behavior insights"
                                                )}
                                            </span>
                                        </li>
                                        <li className="flex items-center space-x-2">
                                            <Building className="h-4 w-4 text-green-500" />
                                            <span className="text-sm">
                                                {t(
                                                    "addOns.aiInsights.features.optimization",
                                                    "Business optimization tips"
                                                )}
                                            </span>
                                        </li>
                                    </ul>
                                    <Button
                                        className="w-full"
                                        variant={subscription?.aiInsightsSubscribed ? "destructive" : "default"}
                                        disabled={aiInsightsMutation.isPending || unsubscribeAiInsightsMutation.isPending}
                                        onClick={() => {
                                            if (subscription?.aiInsightsSubscribed) {
                                                // Using browser native confirm since translated confirm isn't straightforward without a dialog
                                                if (confirm(t("dialog.cancel.desc"))) { // Reusing cancel desc as "Are you sure..."
                                                    unsubscribeAiInsightsMutation.mutate();
                                                }
                                            } else {
                                                if (isOnTrial) {
                                                    if (confirm("Subscribing to AI Business Insights will end your free trial immediately and you will be charged for the plan + add-on. Do you want to continue?")) {
                                                        aiInsightsMutation.mutate();
                                                    }
                                                } else {
                                                    aiInsightsMutation.mutate();
                                                }
                                            }
                                        }}
                                    >
                                        {subscription?.aiInsightsSubscribed ? (
                                            unsubscribeAiInsightsMutation.isPending ? t("actions.unsubscribing") : t("actions.unsubscribe")
                                        ) : (
                                            aiInsightsMutation.isPending ? t("actions.processing") : t("actions.subscribe")
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Invoices Tab */}
                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("invoices.title", "Invoice History")}</CardTitle>
                            <CardDescription>
                                {t("invoices.description", "Download and manage your invoices")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {isLoadingInvoices ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </div>
                                ) : Array.isArray(invoices) && invoices.length > 0 ? (
                                    (invoices || []).map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-muted p-2 rounded-full">
                                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {t("invoices.invoice", "Invoice")} {invoice.number}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(invoice.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="font-medium">
                                                        {formatCurrency(invoice.amount)}
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={`
                            ${invoice.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                            ${invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                            ${invoice.status === 'void' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
                            ${invoice.status === 'uncollectible' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                          `}
                                                    >
                                                        {invoice.status}
                                                    </Badge>
                                                </div>
                                                {invoice.pdfUrl && (
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>{t("invoices.notFound")}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Cancel Subscription Dialog */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            {t("dialog.cancel.title")}
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            {t("dialog.cancel.desc")}
                            <br /><br />
                            <span dangerouslySetInnerHTML={{ __html: t("dialog.cancel.warning", { date: nextBillingDate?.toLocaleDateString() }) }} />
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                            {t("dialog.cancel.keep")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => cancelMutation.mutate()}
                            disabled={cancelMutation.isPending}
                        >
                            {cancelMutation.isPending ? t("dialog.cancel.processing") : t("dialog.cancel.confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
