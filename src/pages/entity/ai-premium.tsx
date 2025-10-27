import { useState } from "react";
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
import { Input } from "../../components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
  MessageSquare,
  CreditCard,
  Crown,
  CheckCircle,
} from "lucide-react";

export function AIPremiumPage() {
  const { t } = useTranslation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("starter");
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
        "Increase pricing for premium services by 15%",
        "Offer package deals during slow periods",
        "Implement dynamic pricing for peak hours",
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
      suggestedSchedule: "Add 2 hours on weekends",
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
      name: "Smart Scheduling",
      description:
        "AI-powered appointment optimization based on staff availability and customer preferences",
      icon: Calendar,
      enabled: true,
      tier: "starter",
    },
    {
      id: "predictive-analytics",
      name: "Predictive Analytics",
      description: "Forecast revenue, customer behavior, and business trends",
      icon: BarChart3,
      enabled: predictiveAnalyticsEnabled,
      tier: "starter",
    },
    {
      id: "auto-booking",
      name: "Automated Booking",
      description: "AI chatbot handles customer bookings and inquiries 24/7",
      icon: Bot,
      enabled: autoBookingEnabled,
      tier: "professional",
    },
    {
      id: "smart-pricing",
      name: "Dynamic Pricing",
      description:
        "Optimize pricing based on demand, time, and market conditions",
      icon: Target,
      enabled: smartPricingEnabled,
      tier: "professional",
    },
    {
      id: "customer-insights",
      name: "Customer AI Insights",
      description:
        "Deep learning analysis of customer behavior and preferences",
      icon: Users,
      enabled: true,
      tier: "enterprise",
    },
    {
      id: "marketing-ai",
      name: "AI Marketing Campaigns",
      description: "Automated marketing campaigns with personalized content",
      icon: Sparkles,
      enabled: false,
      tier: "enterprise",
    },
  ];

  const pricingPlans = [
    {
      id: "starter",
      name: "AI Starter",
      price: 29.99,
      features: [
        "Smart Scheduling",
        "Basic Analytics",
        "Customer Insights",
        "Email Support",
      ],
      maxFeatures: 3,
    },
    {
      id: "professional",
      name: "AI Professional",
      price: 59.99,
      features: [
        "All Starter Features",
        "Automated Booking",
        "Dynamic Pricing",
        "Priority Support",
        "Custom Reports",
      ],
      maxFeatures: 6,
      popular: true,
    },
    {
      id: "enterprise",
      name: "AI Enterprise",
      price: 119.99,
      features: [
        "All Professional Features",
        "Advanced ML Models",
        "Marketing AI",
        "Dedicated Support",
        "API Access",
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
                AI Premium Coming Soon
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Our AI Premium features are currently in development and will be
                available for purchase soon. Stay tuned for powerful AI-driven
                insights and automation!
              </p>
            </div>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              Feature Not Available Yet
            </Badge>
          </div>
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
              <CardDescription>
                AI Premium will revolutionize how you manage your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Smart Scheduling</p>
                    <p className="text-sm text-muted-foreground">
                      AI-powered appointment optimization
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Predictive Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Forecast revenue and customer behavior
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bot className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Automated Booking</p>
                    <p className="text-sm text-muted-foreground">
                      24/7 AI chatbot for customer bookings
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Dynamic Pricing</p>
                    <p className="text-sm text-muted-foreground">
                      Optimize pricing based on demand
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
              <h1 className="text-3xl font-bold tracking-tight">AI Premium</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Sparkles className="mr-1 h-3 w-3" />
                Beta
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Supercharge your business with artificial intelligence
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              AI Settings
            </Button>
            {!isSubscribed && (
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to AI Premium
              </Button>
            )}
          </div>
        </div>

        {!isSubscribed ? (
          /* Subscription Plans */
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Choose Your AI Plan</CardTitle>
                <CardDescription>
                  Unlock powerful AI features to grow your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-3">
                  {pricingPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative cursor-pointer transition-all hover:shadow-lg ${
                        plan.popular ? "ring-2 ring-purple-500" : ""
                      } ${selectedPlan === plan.id ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-purple-500">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle>{plan.name}</CardTitle>
                        <div className="text-3xl font-bold">
                          €{plan.price}
                          <span className="text-sm font-normal text-muted-foreground">
                            /month
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
                            ? "Subscribe Now"
                            : "Select Plan"}
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
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      AI Score
                    </CardTitle>
                    <Brain className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.2</div>
                    <p className="text-xs text-muted-foreground">
                      +2.1 from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Efficiency Gain
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+28.5%</div>
                    <p className="text-xs text-muted-foreground">
                      Since AI activation
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Automated Tasks
                    </CardTitle>
                    <Zap className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Time Saved
                    </CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">47.2h</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
              </div>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>
                    Personalized suggestions to optimize your business
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
                            <Button size="sm">Apply</Button>
                            <Button size="sm" variant="outline">
                              Learn More
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
                    <CardTitle>Revenue Optimization</CardTitle>
                    <CardDescription>
                      AI-powered revenue analysis and forecasting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">
                          Projected Revenue Increase
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          +{aiInsights.revenueOptimization.projectedIncrease}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Current Monthly Revenue
                      </p>
                      <p className="text-2xl font-bold">
                        €{aiInsights.revenueOptimization.currentRevenue}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Behavior Analysis</CardTitle>
                    <CardDescription>
                      Deep insights into customer patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Retention Rate
                        </p>
                        <p className="text-xl font-bold text-blue-600">
                          {aiInsights.customerBehavior.retention}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Avg. Spending
                        </p>
                        <p className="text-xl font-bold text-purple-600">
                          €{aiInsights.customerBehavior.averageSpending}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm font-medium mb-2">Peak Hours</p>
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
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>
                    Customize AI behavior and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automated Booking</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow AI to automatically confirm bookings
                      </p>
                    </div>
                    <Switch
                      checked={autoBookingEnabled}
                      onCheckedChange={setAutoBookingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Smart Pricing</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dynamic pricing based on demand
                      </p>
                    </div>
                    <Switch
                      checked={smartPricingEnabled}
                      onCheckedChange={setSmartPricingEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Predictive Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Generate forecasts and business insights
                      </p>
                    </div>
                    <Switch
                      checked={predictiveAnalyticsEnabled}
                      onCheckedChange={setPredictiveAnalyticsEnabled}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <Label>AI Learning Preferences</Label>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">
                            Conservative Learning
                          </SelectItem>
                          <SelectItem value="balanced">
                            Balanced Approach
                          </SelectItem>
                          <SelectItem value="aggressive">
                            Aggressive Optimization
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
