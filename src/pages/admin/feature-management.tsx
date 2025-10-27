import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useFeatureFlags } from "../../contexts/feature-flags-context";
import {
  Sparkles,
  Gift,
  BarChart3,
  Building2,
  AlertCircle,
  CheckCircle2,
  Info,
  Save,
  RefreshCw,
} from "lucide-react";

export function FeatureManagementPage() {
  const { features, updateFeatureFlag } = useFeatureFlags();
  const [isSaving, setIsSaving] = useState(false);
  const [localFeatures, setLocalFeatures] = useState(features);

  const handleToggle = (feature: keyof typeof features) => {
    setLocalFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update all changed features
      const changedFeatures = Object.keys(localFeatures).filter(
        (key) =>
          localFeatures[key as keyof typeof localFeatures] !==
          features[key as keyof typeof features]
      );

      for (const feature of changedFeatures) {
        await updateFeatureFlag(
          feature as keyof typeof features,
          localFeatures[feature as keyof typeof localFeatures]
        );
      }

      // Show success message
      console.log("Feature flags updated successfully");
    } catch (error) {
      console.error("Failed to update feature flags:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalFeatures(features);
  };

  const hasChanges = Object.keys(localFeatures).some(
    (key) =>
      localFeatures[key as keyof typeof localFeatures] !==
      features[key as keyof typeof features]
  );

  const featureDetails = [
    {
      key: "aiPremiumEnabled" as const,
      icon: Sparkles,
      title: "AI Premium Features",
      description:
        "Enable AI-powered booking assistant, smart scheduling, and predictive analytics for purchase",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      status: localFeatures.aiPremiumEnabled
        ? "Available for Purchase"
        : "Not Available",
      impact:
        "When enabled, businesses can purchase and access AI-powered features including smart scheduling, automated recommendations, and predictive analytics.",
      considerations: [
        "Requires additional infrastructure costs",
        "May need AI model training period",
        "Should be thoroughly tested before production release",
      ],
    },
    {
      key: "loyaltyManagementEnabled" as const,
      icon: Gift,
      title: "Loyalty Management",
      description:
        "Enable loyalty program features, points system, and customer rewards for purchase",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      status: localFeatures.loyaltyManagementEnabled
        ? "Available for Purchase"
        : "Not Available",
      impact:
        "When enabled, businesses can purchase and configure loyalty programs, reward systems, and customer engagement features.",
      considerations: [
        "Requires points calculation system",
        "May impact database performance",
        "Should integrate with existing booking system",
      ],
    },
    {
      key: "advancedAnalyticsEnabled" as const,
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Enable advanced reporting, data visualization, and business intelligence features",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      status: localFeatures.advancedAnalyticsEnabled
        ? "Available"
        : "Not Available",
      impact:
        "Provides detailed analytics, custom reports, and data-driven insights for business decisions.",
      considerations: [
        "Included in Business plan",
        "Requires data aggregation processing",
        "May impact system performance during report generation",
      ],
    },
    {
      key: "multiLocationEnabled" as const,
      icon: Building2,
      title: "Multi-Location Management",
      description:
        "Enable management of multiple business locations from a single account",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      status: localFeatures.multiLocationEnabled
        ? "Available"
        : "Not Available",
      impact:
        "Allows businesses to manage multiple locations, staff allocation, and cross-location analytics.",
      considerations: [
        "Included in Business plan",
        "Requires location-based data isolation",
        "May increase complexity in user interface",
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Management</h1>
          <p className="text-muted-foreground">
            Control which features are available for purchase across the
            platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900">
                Important Notice
              </h4>
              <p className="text-sm text-yellow-800 mt-1">
                Enabling or disabling features will immediately affect their
                availability for purchase across the entire platform. Make sure
                features are fully tested before enabling them for production
                use.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid gap-6">
        {featureDetails.map((feature) => (
          <Card
            key={feature.key}
            className={`border-2 ${localFeatures[feature.key] ? feature.borderColor : "border-gray-200"}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {feature.title}
                      {localFeatures[feature.key] ? (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 border-green-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-gray-300 text-gray-600"
                        >
                          Disabled
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={localFeatures[feature.key]}
                  onCheckedChange={() => handleToggle(feature.key)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-semibold">Current Status</Label>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {feature.status}
                  </p>
                </div>

                <div className="space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <feature.icon
                            className={`h-5 w-5 ${feature.color}`}
                          />
                          {feature.title}
                        </DialogTitle>
                        <DialogDescription>
                          Detailed information about this feature and its impact
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <h4 className="font-semibold mb-2">Impact</h4>
                          <p className="text-sm text-muted-foreground">
                            {feature.impact}
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-2">Considerations</h4>
                          <ul className="space-y-2">
                            {feature.considerations.map(
                              (consideration, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-primary mt-1">•</span>
                                  <span>{consideration}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {localFeatures[feature.key] !== features[feature.key] && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Pending change:</strong> This feature will be{" "}
                    <strong>
                      {localFeatures[feature.key] ? "enabled" : "disabled"}
                    </strong>{" "}
                    when you save changes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Summary</CardTitle>
          <CardDescription>Overview of all platform features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(localFeatures).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Enabled Features
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {Object.values(localFeatures).filter((v) => !v).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Disabled Features
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(localFeatures).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Features
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {hasChanges
                  ? Object.keys(localFeatures).filter(
                      (key) =>
                        localFeatures[key as keyof typeof localFeatures] !==
                        features[key as keyof typeof features]
                    ).length
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Pending Changes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
