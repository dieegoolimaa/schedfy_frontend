import { useState } from "react";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { FeatureGate } from "../../contexts/feature-flags-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Brain,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Target,
  Clock,
  Star,
  Settings,
  Sparkles,
  Bot,
  Crown,
  CheckCircle,
} from "lucide-react";

export function AIPremiumPage() {
  const { t } = useTranslation("aiPremium");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const { formatCurrency } = useCurrency();
  const [autoBookingEnabled, setAutoBookingEnabled] = useState(true);
  const [smartPricingEnabled, setSmartPricingEnabled] = useState(false);
  const [predictiveAnalyticsEnabled, setPredictiveAnalyticsEnabled] =
    useState(true);

  // Mock AI insights data
  const aiInsights = {
    revenueOptimization: {
      currentRevenue: 12450,
      projectedIncrease: 18.5,
      recommendations: [
        t("mock.rec1"),
        t("mock.rec2"),
        t("mock.rec3"),
      ],
    },
    customerBehavior: {
      retention: 85.2,
      averageSpending: 67.5,
      noShowRate: 12.3,
      peakHours: ["10:00-12:00", "14:00-16:00"],
    },
    staffOptimization: {
      efficiency: 92.1,
      utilizationRate: 78.5,
      suggestedSchedule: t("mock.suggestedSchedule"),
    },
    marketingInsights: {
      bestChannels: ["Instagram", "Google Ads", "Referrals"],
      campaignROI: 285.7,
      customerAcquisitionCost: 23.5,
    },
  };

  const aiFeatures = [
    {
      id: "smart-scheduling",
      name: t("plans.features.smartScheduling"),
      description: t("gate.expect.scheduling.description"),
      icon: Calendar,
      enabled: true,
      tier: "starter",
    },
    {
      id: "predictive-analytics",
      name: t("plans.features.basicAnalytics"),
      description: t("gate.expect.analytics.description"),
      icon: BarChart3,
      enabled: predictiveAnalyticsEnabled,
      tier: "starter",
    },
    {
      id: "auto-booking",
      name: t("plans.features.automatedBooking"),
      description: t("gate.expect.booking.description"),
      icon: Bot,
      enabled: autoBookingEnabled,
      tier: "professional",
    },
    {
      id: "smart-pricing",
      name: t("plans.features.dynamicPricing"),
      description: t("gate.expect.pricing.description"),
      icon: Target,
      enabled: smartPricingEnabled,
      tier: "professional",
    },
    {
      id: "customer-insights",
      name: t("plans.features.customerInsights"),
      description: t("insights.behavior.description"),
      icon: Users,
      enabled: true,
      tier: "enterprise",
    },
    {
      id: "marketing-ai",
      name: t("plans.features.marketingAI"),
      description: t("plans.features.marketingAIDesc"),
      icon: Sparkles,
      enabled: false,
      tier: "enterprise",
    },
  ];

  const pricingPlans = [
    {
      id: "starter",
      name: t("plans.starter"),
      price: 29.99,
      features: [
        t("plans.features.smartScheduling"),
        t("plans.features.basicAnalytics"),
        t("plans.features.customerInsights"),
        t("plans.features.emailSupport"),
      ],
      maxFeatures: 3,
    },
    {
      id: "professional",
      name: t("plans.professional"),
      price: 59.99,
      features: [
        t("plans.features.allStarter"),
        t("plans.features.automatedBooking"),
        t("plans.features.dynamicPricing"),
        t("plans.features.prioritySupport"),
        t("plans.features.customReports"),
      ],
      maxFeatures: 6,
      popular: true,
    },
    {
      id: "enterprise",
      name: t("plans.enterprise"),
      price: 119.99,
      features: [
        t("plans.features.allProfessional"),
        t("plans.features.advancedML"),
        t("plans.features.marketingAI"),
        t("plans.features.dedicatedSupport"),
        t("plans.features.apiAccess"),
      ],
      maxFeatures: 10,
    },
  ];

  return (
    <FeatureGate
      feature="aiPremiumEnabled"
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="text-center space-y-4">
            <Brain className="h-20 w-20 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t("gate.title")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {t("gate.description")}
              </p>
            </div>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              {t("gate.badge")}
            </Badge>
          </div>
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>{t("gate.expect.title")}</CardTitle>
              <CardDescription>
                {t("gate.expect.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("gate.expect.scheduling.title")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("gate.expect.scheduling.description")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("gate.expect.analytics.title")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("gate.expect.analytics.description")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bot className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("gate.expect.booking.title")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("gate.expect.booking.description")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t("gate.expect.pricing.title")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("gate.expect.pricing.description")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Sparkles className="mr-1 h-3 w-3" />
                {t("beta")}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              {t("actions.settings")}
            </Button>
            {!isSubscribed && (
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Crown className="mr-2 h-4 w-4" />
                {t("actions.upgrade")}
              </Button>
            )}
          </div>
        </div>

        {!isSubscribed ? (
          /* Subscription Plans */
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{t("plans.title")}</CardTitle>
                <CardDescription>
                  {t("plans.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-3">
                  {pricingPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative cursor-pointer transition-all hover:shadow-lg ${plan.popular ? "ring-2 ring-purple-500" : ""
                        } ${selectedPlan === plan.id ? "ring-2 ring-blue-500" : ""
                        }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-purple-500">{t("plans.mostPopular")}</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle>{plan.name}</CardTitle>
                        <div className="text-3xl font-bold">
                          {formatCurrency(plan.price)}
                          <span className="text-sm font-normal text-muted-foreground">
                            {t("plans.perMonth")}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                        <Button
                          className="w-full mt-4"
                          variant={
                            selectedPlan === plan.id ? "default" : "outline"
                          }
                          onClick={() => setIsSubscribed(true)}
                        >
                          {selectedPlan === plan.id
                            ? t("actions.subscribe")
                            : t("actions.selectPlan")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* AI Dashboard - For Subscribed Users */
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
              <TabsTrigger value="insights">{t("tabs.insights")}</TabsTrigger>
              <TabsTrigger value="features">{t("tabs.features")}</TabsTrigger>
              <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("overview.aiScore")}
                    </CardTitle>
                    <Brain className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.2</div>
                    <p className="text-xs text-muted-foreground">
                      +2.1 {t("overview.lastMonth")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("overview.efficiencyGain")}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+28.5%</div>
                    <p className="text-xs text-muted-foreground">
                      {t("overview.sinceActivation")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("overview.automatedTasks")}
                    </CardTitle>
                    <Zap className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-xs text-muted-foreground">{t("overview.thisMonth")}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("overview.timeSaved")}
                    </CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47.2h</div>
                    <p className="text-xs text-muted-foreground">{t("overview.thisMonth")}</p>
                  </CardContent>
                </Card>
              </div>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    {t("overview.recommendations.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("overview.recommendations.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsights.revenueOptimization.recommendations.map(
                    (recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-muted rounded-lg"
                      >
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Star className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {recommendation}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm">{t("actions.apply")}</Button>
                            <Button size="sm" variant="outline">
                              {t("actions.learnMore")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("insights.revenue.title")}</CardTitle>
                    <CardDescription>
                      {t("insights.revenue.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          {t("insights.revenue.projected")}
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          +{aiInsights.revenueOptimization.projectedIncrease}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {t("insights.revenue.current")}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          aiInsights.revenueOptimization.currentRevenue
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("insights.behavior.title")}</CardTitle>
                    <CardDescription>
                      {t("insights.behavior.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {t("insights.behavior.retention")}
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {aiInsights.customerBehavior.retention}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {t("insights.behavior.avgSpending")}
                        </p>
                        <p className="text-xl font-bold text-purple-600">
                          {formatCurrency(
                            aiInsights.customerBehavior.averageSpending
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium mb-2">{t("insights.behavior.peakHours")}</p>
                      <div className="flex gap-2">
                        {aiInsights.customerBehavior.peakHours.map(
                          (hour, index) => (
                            <Badge key={index} variant="outline">
                              {hour}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {aiFeatures.map((feature) => {
                  const IconComponent = feature.icon;
                  return (
                    <Card key={feature.id}>
                      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <div className="flex items-center space-x-2 flex-1">
                          <IconComponent className="h-5 w-5 text-purple-600" />
                          <CardTitle className="text-base">
                            {feature.name}
                          </CardTitle>
                        </div>
                        <Switch
                          checked={feature.enabled}
                          disabled={feature.tier === "enterprise"}
                        />
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{feature.description}</CardDescription>
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={
                              feature.tier === "enterprise"
                                ? "bg-purple-50"
                                : ""
                            }
                          >
                            {feature.tier}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.title")}</CardTitle>
                  <CardDescription>
                    {t("settings.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("settings.automatedBooking.label")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.automatedBooking.desc")}
                      </p>
                    </div>
                    <Switch
                      checked={autoBookingEnabled}
                      onCheckedChange={setAutoBookingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("settings.smartPricing.label")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.smartPricing.desc")}
                      </p>
                    </div>
                    <Switch
                      checked={smartPricingEnabled}
                      onCheckedChange={setSmartPricingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("settings.predictiveAnalytics.label")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.predictiveAnalytics.desc")}
                      </p>
                    </div>
                    <Switch
                      checked={predictiveAnalyticsEnabled}
                      onCheckedChange={setPredictiveAnalyticsEnabled}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <Label>{t("settings.learning.label")}</Label>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">
                            {t("settings.learning.conservative")}
                          </SelectItem>
                          <SelectItem value="balanced">
                            {t("settings.learning.balanced")}
                          </SelectItem>
                          <SelectItem value="aggressive">
                            {t("settings.learning.aggressive")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </FeatureGate>
  );
}
