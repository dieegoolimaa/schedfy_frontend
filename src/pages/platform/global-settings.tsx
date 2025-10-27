import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Textarea } from "../../components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Settings,
  Globe,
  CreditCard,
  Brain,
  Shield,
  Mail,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

interface SystemConfiguration {
  general: {
    platformName: string;
    platformDescription: string;
    supportEmail: string;
    defaultLanguage: string;
    defaultTimezone: string;
    enableRegistration: boolean;
    enableTrialPeriod: boolean;
    trialDurationDays: number;
  };
  stripe: {
    publishableKey: string;
    webhookSecret: string;
    enabled: boolean;
    supportedCurrencies: string[];
    taxRates: { [region: string]: number };
  };
  vertexAI: {
    projectId: string;
    region: string;
    modelName: string;
    enabled: boolean;
    apiKey: string;
    dailyRequestLimit: number;
  };
  email: {
    provider: "smtp" | "sendgrid" | "mailgun";
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    sendgridApiKey?: string;
    mailgunDomain?: string;
    mailgunApiKey?: string;
    fromAddress: string;
    fromName: string;
  };
  security: {
    enforceHttps: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    enableTwoFactor: boolean;
    allowedDomains: string[];
  };
  database: {
    connectionString: string;
    maxConnections: number;
    enableBackups: boolean;
    backupRetentionDays: number;
    enableReadReplicas: boolean;
  };
}

interface ApiIntegration {
  id: string;
  name: string;
  type: "payment" | "ai" | "email" | "calendar" | "other";
  status: "active" | "inactive" | "error";
  version: string;
  lastSync: string;
  endpoint: string;
  description: string;
}

export function GlobalSettingsPage() {
  const { t } = useTranslation();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);

  // Mock system configuration
  const [config, setConfig] = useState<SystemConfiguration>({
    general: {
      platformName: "Schedfy",
      platformDescription: "Modern scheduling platform for businesses",
      supportEmail: "support@schedfy.com",
      defaultLanguage: "en",
      defaultTimezone: "UTC",
      enableRegistration: true,
      enableTrialPeriod: true,
      trialDurationDays: 14,
    },
    stripe: {
      publishableKey: "pk_live_51K...",
      webhookSecret: "whsec_...",
      enabled: true,
      supportedCurrencies: ["EUR", "USD", "BRL"],
      taxRates: {
        PT: 23,
        BR: 20,
        US: 8.5,
      },
    },
    vertexAI: {
      projectId: "schedfy-ai-insights",
      region: "us-central1",
      modelName: "gemini-1.5-pro",
      enabled: true,
      apiKey: "AIza...",
      dailyRequestLimit: 10000,
    },
    email: {
      provider: "sendgrid",
      sendgridApiKey: "SG.abc...",
      fromAddress: "noreply@schedfy.com",
      fromName: "Schedfy Platform",
    },
    security: {
      enforceHttps: true,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      enableTwoFactor: false,
      allowedDomains: [],
    },
    database: {
      connectionString: "mongodb+srv://...",
      maxConnections: 100,
      enableBackups: true,
      backupRetentionDays: 30,
      enableReadReplicas: true,
    },
  });

  // Mock API integrations
  const apiIntegrations: ApiIntegration[] = [
    {
      id: "stripe",
      name: "Stripe",
      type: "payment",
      status: "active",
      version: "2023-10-16",
      lastSync: "2024-01-20T10:30:00Z",
      endpoint: "https://api.stripe.com",
      description: "Payment processing and subscription management",
    },
    {
      id: "vertex_ai",
      name: "Vertex AI",
      type: "ai",
      status: "active",
      version: "v1",
      lastSync: "2024-01-20T09:45:00Z",
      endpoint: "https://us-central1-aiplatform.googleapis.com",
      description: "AI insights and analytics",
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      type: "email",
      status: "active",
      version: "v3",
      lastSync: "2024-01-20T08:20:00Z",
      endpoint: "https://api.sendgrid.com",
      description: "Email delivery and notifications",
    },
    {
      id: "google_calendar",
      name: "Google Calendar",
      type: "calendar",
      status: "inactive",
      version: "v3",
      lastSync: "2024-01-19T16:00:00Z",
      endpoint: "https://www.googleapis.com/calendar",
      description: "Calendar integration and synchronization",
    },
  ];

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "ai":
        return <Brain className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "calendar":
        return <Globe className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const maskApiKey = (key: string) => {
    if (!showApiKeys) {
      return `${key.substring(0, 8)}${"*".repeat(key.length - 8)}`;
    }
    return key;
  };

  const handleSaveConfiguration = () => {
    // Implementation for saving configuration
    console.log("Saving configuration:", config);
  };

  const handleTestIntegration = (integrationId: string) => {
    // Implementation for testing integration
    console.log("Testing integration:", integrationId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("platform.settings.title", "Global Settings")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "platform.settings.subtitle",
              "Configure platform settings and integrations"
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowApiKeys(!showApiKeys)}
          >
            {showApiKeys ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showApiKeys
              ? t("platform.settings.hideKeys", "Hide Keys")
              : t("platform.settings.showKeys", "Show Keys")}
          </Button>
          <Button onClick={handleSaveConfiguration}>
            <Save className="h-4 w-4 mr-2" />
            {t("common.save", "Save Changes")}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            {t("platform.settings.tabs.general", "General")}
          </TabsTrigger>
          <TabsTrigger value="payments">
            {t("platform.settings.tabs.payments", "Payments")}
          </TabsTrigger>
          <TabsTrigger value="ai">
            {t("platform.settings.tabs.ai", "AI & Analytics")}
          </TabsTrigger>
          <TabsTrigger value="email">
            {t("platform.settings.tabs.email", "Email")}
          </TabsTrigger>
          <TabsTrigger value="security">
            {t("platform.settings.tabs.security", "Security")}
          </TabsTrigger>
          <TabsTrigger value="integrations">
            {t("platform.settings.tabs.integrations", "Integrations")}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                {t("platform.settings.general.title", "General Configuration")}
              </CardTitle>
              <CardDescription>
                {t(
                  "platform.settings.general.description",
                  "Basic platform settings and configuration"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">
                    {t(
                      "platform.settings.general.platformName",
                      "Platform Name"
                    )}
                  </Label>
                  <Input
                    id="platform-name"
                    value={config.general.platformName}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        general: {
                          ...config.general,
                          platformName: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">
                    {t(
                      "platform.settings.general.supportEmail",
                      "Support Email"
                    )}
                  </Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={config.general.supportEmail}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        general: {
                          ...config.general,
                          supportEmail: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-language">
                    {t(
                      "platform.settings.general.defaultLanguage",
                      "Default Language"
                    )}
                  </Label>
                  <Select
                    value={config.general.defaultLanguage}
                    onValueChange={(value) =>
                      setConfig({
                        ...config,
                        general: { ...config.general, defaultLanguage: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="pt">🇵🇹 Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-timezone">
                    {t(
                      "platform.settings.general.defaultTimezone",
                      "Default Timezone"
                    )}
                  </Label>
                  <Select
                    value={config.general.defaultTimezone}
                    onValueChange={(value) =>
                      setConfig({
                        ...config,
                        general: { ...config.general, defaultTimezone: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/Lisbon">
                        Europe/Lisbon
                      </SelectItem>
                      <SelectItem value="America/Sao_Paulo">
                        America/Sao_Paulo
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform-description">
                  {t(
                    "platform.settings.general.platformDescription",
                    "Platform Description"
                  )}
                </Label>
                <Textarea
                  id="platform-description"
                  value={config.general.platformDescription}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      general: {
                        ...config.general,
                        platformDescription: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">
                  {t("platform.settings.general.features", "Platform Features")}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>
                        {t(
                          "platform.settings.general.enableRegistration",
                          "Enable Registration"
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "platform.settings.general.enableRegistrationDesc",
                          "Allow new users to register for the platform"
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={config.general.enableRegistration}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          general: {
                            ...config.general,
                            enableRegistration: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>
                        {t(
                          "platform.settings.general.enableTrialPeriod",
                          "Enable Trial Period"
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t(
                          "platform.settings.general.enableTrialPeriodDesc",
                          "Offer free trial period for new users"
                        )}
                      </p>
                    </div>
                    <Switch
                      checked={config.general.enableTrialPeriod}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          general: {
                            ...config.general,
                            enableTrialPeriod: checked,
                          },
                        })
                      }
                    />
                  </div>
                  {config.general.enableTrialPeriod && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="trial-duration">
                        {t(
                          "platform.settings.general.trialDuration",
                          "Trial Duration (days)"
                        )}
                      </Label>
                      <Input
                        id="trial-duration"
                        type="number"
                        min="1"
                        max="30"
                        value={config.general.trialDurationDays}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            general: {
                              ...config.general,
                              trialDurationDays: Number.parseInt(
                                e.target.value
                              ),
                            },
                          })
                        }
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {t("platform.settings.payments.title", "Payment Configuration")}
              </CardTitle>
              <CardDescription>
                {t(
                  "platform.settings.payments.description",
                  "Configure Stripe payment processing"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>
                    {t("platform.settings.payments.enabled", "Enable Payments")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "platform.settings.payments.enabledDesc",
                      "Enable Stripe payment processing"
                    )}
                  </p>
                </div>
                <Switch
                  checked={config.stripe.enabled}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      stripe: { ...config.stripe, enabled: checked },
                    })
                  }
                />
              </div>

              {config.stripe.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-publishable-key">
                        {t(
                          "platform.settings.payments.publishableKey",
                          "Publishable Key"
                        )}
                      </Label>
                      <Input
                        id="stripe-publishable-key"
                        type="password"
                        value={maskApiKey(config.stripe.publishableKey)}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            stripe: {
                              ...config.stripe,
                              publishableKey: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-webhook-secret">
                        {t(
                          "platform.settings.payments.webhookSecret",
                          "Webhook Secret"
                        )}
                      </Label>
                      <Input
                        id="stripe-webhook-secret"
                        type="password"
                        value={maskApiKey(config.stripe.webhookSecret)}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            stripe: {
                              ...config.stripe,
                              webhookSecret: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      {t(
                        "platform.settings.payments.taxRates",
                        "Tax Rates by Region"
                      )}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(config.stripe.taxRates).map(
                        ([region, rate]) => (
                          <div key={region} className="space-y-2">
                            <Label htmlFor={`tax-${region}`}>
                              {region} (%)
                            </Label>
                            <Input
                              id={`tax-${region}`}
                              type="number"
                              min="0"
                              max="50"
                              step="0.1"
                              value={rate}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  stripe: {
                                    ...config.stripe,
                                    taxRates: {
                                      ...config.stripe.taxRates,
                                      [region]: Number.parseFloat(
                                        e.target.value
                                      ),
                                    },
                                  },
                                })
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                {t(
                  "platform.settings.ai.title",
                  "AI & Analytics Configuration"
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  "platform.settings.ai.description",
                  "Configure Vertex AI for insights and analytics"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>
                    {t("platform.settings.ai.enabled", "Enable AI Insights")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "platform.settings.ai.enabledDesc",
                      "Enable AI-powered insights and analytics"
                    )}
                  </p>
                </div>
                <Switch
                  checked={config.vertexAI.enabled}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      vertexAI: { ...config.vertexAI, enabled: checked },
                    })
                  }
                />
              </div>

              {config.vertexAI.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vertex-project-id">
                        {t("platform.settings.ai.projectId", "Project ID")}
                      </Label>
                      <Input
                        id="vertex-project-id"
                        value={config.vertexAI.projectId}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vertexAI: {
                              ...config.vertexAI,
                              projectId: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vertex-region">
                        {t("platform.settings.ai.region", "Region")}
                      </Label>
                      <Select
                        value={config.vertexAI.region}
                        onValueChange={(value) =>
                          setConfig({
                            ...config,
                            vertexAI: { ...config.vertexAI, region: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-central1">
                            us-central1
                          </SelectItem>
                          <SelectItem value="us-east1">us-east1</SelectItem>
                          <SelectItem value="europe-west1">
                            europe-west1
                          </SelectItem>
                          <SelectItem value="asia-southeast1">
                            asia-southeast1
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vertex-model">
                        {t("platform.settings.ai.model", "Model")}
                      </Label>
                      <Select
                        value={config.vertexAI.modelName}
                        onValueChange={(value) =>
                          setConfig({
                            ...config,
                            vertexAI: { ...config.vertexAI, modelName: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-1.5-pro">
                            Gemini 1.5 Pro
                          </SelectItem>
                          <SelectItem value="gemini-1.5-flash">
                            Gemini 1.5 Flash
                          </SelectItem>
                          <SelectItem value="gemini-1.0-pro">
                            Gemini 1.0 Pro
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vertex-limit">
                        {t(
                          "platform.settings.ai.dailyLimit",
                          "Daily Request Limit"
                        )}
                      </Label>
                      <Input
                        id="vertex-limit"
                        type="number"
                        min="100"
                        max="100000"
                        value={config.vertexAI.dailyRequestLimit}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            vertexAI: {
                              ...config.vertexAI,
                              dailyRequestLimit: Number.parseInt(
                                e.target.value
                              ),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vertex-api-key">
                      {t("platform.settings.ai.apiKey", "API Key")}
                    </Label>
                    <Input
                      id="vertex-api-key"
                      type="password"
                      value={maskApiKey(config.vertexAI.apiKey)}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          vertexAI: {
                            ...config.vertexAI,
                            apiKey: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                {t("platform.settings.email.title", "Email Configuration")}
              </CardTitle>
              <CardDescription>
                {t(
                  "platform.settings.email.description",
                  "Configure email delivery settings"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-provider">
                    {t("platform.settings.email.provider", "Provider")}
                  </Label>
                  <Select
                    value={config.email.provider}
                    onValueChange={(value: "smtp" | "sendgrid" | "mailgun") =>
                      setConfig({
                        ...config,
                        email: { ...config.email, provider: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from-address">
                    {t("platform.settings.email.fromAddress", "From Address")}
                  </Label>
                  <Input
                    id="from-address"
                    type="email"
                    value={config.email.fromAddress}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        email: { ...config.email, fromAddress: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {config.email.provider === "sendgrid" && (
                <div className="space-y-2">
                  <Label htmlFor="sendgrid-api-key">
                    {t(
                      "platform.settings.email.sendgridApiKey",
                      "SendGrid API Key"
                    )}
                  </Label>
                  <Input
                    id="sendgrid-api-key"
                    type="password"
                    value={maskApiKey(config.email.sendgridApiKey || "")}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        email: {
                          ...config.email,
                          sendgridApiKey: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}

              {config.email.provider === "smtp" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">
                      {t("platform.settings.email.smtpHost", "SMTP Host")}
                    </Label>
                    <Input
                      id="smtp-host"
                      value={config.email.smtpHost || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: { ...config.email, smtpHost: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">
                      {t("platform.settings.email.smtpPort", "SMTP Port")}
                    </Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={config.email.smtpPort || 587}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          email: {
                            ...config.email,
                            smtpPort: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t(
                  "platform.settings.security.title",
                  "Security Configuration"
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  "platform.settings.security.description",
                  "Configure security and access controls"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {t(
                        "platform.settings.security.enforceHttps",
                        "Enforce HTTPS"
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "platform.settings.security.enforceHttpsDesc",
                        "Redirect all HTTP traffic to HTTPS"
                      )}
                    </p>
                  </div>
                  <Switch
                    checked={config.security.enforceHttps}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        security: { ...config.security, enforceHttps: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>
                      {t(
                        "platform.settings.security.enableTwoFactor",
                        "Enable Two-Factor Authentication"
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "platform.settings.security.enableTwoFactorDesc",
                        "Require 2FA for platform administrators"
                      )}
                    </p>
                  </div>
                  <Switch
                    checked={config.security.enableTwoFactor}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        security: {
                          ...config.security,
                          enableTwoFactor: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">
                    {t(
                      "platform.settings.security.sessionTimeout",
                      "Session Timeout (hours)"
                    )}
                  </Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="1"
                    max="168"
                    value={config.security.sessionTimeout}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        security: {
                          ...config.security,
                          sessionTimeout: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-login-attempts">
                    {t(
                      "platform.settings.security.maxLoginAttempts",
                      "Max Login Attempts"
                    )}
                  </Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={config.security.maxLoginAttempts}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        security: {
                          ...config.security,
                          maxLoginAttempts: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    {t(
                      "platform.settings.integrations.title",
                      "API Integrations"
                    )}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "platform.settings.integrations.description",
                      "Manage external API integrations"
                    )}
                  </CardDescription>
                </div>
                <Dialog
                  open={isApiDialogOpen}
                  onOpenChange={setIsApiDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t(
                        "platform.settings.integrations.add",
                        "Add Integration"
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t(
                          "platform.settings.integrations.addDialog.title",
                          "Add New Integration"
                        )}
                      </DialogTitle>
                      <DialogDescription>
                        {t(
                          "platform.settings.integrations.addDialog.description",
                          "Configure a new API integration"
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="integration-name">
                          {t("platform.settings.integrations.name", "Name")}
                        </Label>
                        <Input id="integration-name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="integration-type">
                          {t("platform.settings.integrations.type", "Type")}
                        </Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="payment">Payment</SelectItem>
                            <SelectItem value="ai">AI</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="calendar">Calendar</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="integration-endpoint">
                          {t(
                            "platform.settings.integrations.endpoint",
                            "Endpoint"
                          )}
                        </Label>
                        <Input id="integration-endpoint" type="url" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button>{t("common.add", "Add")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t(
                        "platform.settings.integrations.integration",
                        "Integration"
                      )}
                    </TableHead>
                    <TableHead>
                      {t("platform.settings.integrations.type", "Type")}
                    </TableHead>
                    <TableHead>
                      {t("platform.settings.integrations.status", "Status")}
                    </TableHead>
                    <TableHead>
                      {t("platform.settings.integrations.version", "Version")}
                    </TableHead>
                    <TableHead>
                      {t(
                        "platform.settings.integrations.lastSync",
                        "Last Sync"
                      )}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("common.actions", "Actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiIntegrations.map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getIntegrationIcon(integration.type)}
                            <span className="font-medium">
                              {integration.name}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {integration.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {integration.type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getIntegrationStatusColor(
                            integration.status
                          )}
                        >
                          {integration.status === "active" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {integration.status === "error" && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {integration.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{integration.version}</TableCell>
                      <TableCell>
                        {new Date(integration.lastSync).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTestIntegration(integration.id)
                            }
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            {t("common.test", "Test")}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            {t("common.edit", "Edit")}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t("common.delete", "Delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
