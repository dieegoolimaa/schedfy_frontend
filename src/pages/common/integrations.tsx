import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  RefreshCw,
  Unlink,
  ArrowLeft,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface IntegrationStatus {
  googleCalendar: { connected: boolean; email?: string };
}

const integrations = [
  {
    id: "google",
    name: "Google Calendar",
    description: "Sync your bookings with Google Calendar and create Google Meet links automatically",
    icon: "/icons/google-calendar.svg",
    color: "bg-white",
    features: ["Google Meet links", "Calendar sync", "Event reminders"],
    provider: "googleCalendar" as keyof IntegrationStatus,
  },
];

export default function IntegrationsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [integrationToDisconnect, setIntegrationToDisconnect] = useState<string | null>(null);
  const [status, setStatus] = useState<IntegrationStatus>({
    googleCalendar: { connected: false },
  });

  // Check for callback status
  useEffect(() => {
    const integration = searchParams.get("integration");
    const callbackStatus = searchParams.get("status");

    if (integration && callbackStatus) {
      if (callbackStatus === "success") {
        toast.success(`${integration} connected successfully!`);
      } else {
        toast.error(`Failed to connect ${integration}. Please try again.`);
      }
      // Clean URL
      window.history.replaceState({}, "", "/settings/integrations");
    }
  }, [searchParams]);

  // Fetch integration status
  const fetchStatus = async () => {
    try {
      const response = await apiClient.get<IntegrationStatus>("/api/integrations/status");
      setStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch integration status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    try {
      const response = await apiClient.get<{ url: string }>(`/api/integrations/connect/${integrationId}`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error(`Failed to connect ${integrationId}:`, error);
      toast.error(`Failed to connect ${integrationId}`);
      setConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    if (!integrationToDisconnect) return;

    setDisconnectingId(integrationToDisconnect);
    try {
      await apiClient.delete(`/api/integrations/${integrationToDisconnect}`);
      toast.success("Integration disconnected successfully");
      await fetchStatus();
    } catch (error) {
      console.error(`Failed to disconnect:`, error);
      toast.error("Failed to disconnect integration");
    } finally {
      setDisconnectingId(null);
      setShowDisconnectDialog(false);
      setIntegrationToDisconnect(null);
    }
  };

  const confirmDisconnect = (integrationId: string) => {
    setIntegrationToDisconnect(integrationId);
    setShowDisconnectDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back", "Back")}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("integrations.title", "Integrations")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t(
            "integrations.subtitle",
            "Connect your calendar and video conferencing tools to automate meeting creation"
          )}
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">
              {t("integrations.howItWorks", "How it works")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "integrations.howItWorksDesc",
                "When you connect an integration, you can configure your services to automatically create meeting links. When a client books a service marked as 'Online', the meeting link is automatically generated and sent to both parties."
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integrations List */}
      <div className="grid gap-6">
        {integrations.map((integration) => {
          const integrationStatus = status[integration.provider];
          const isConnected = integrationStatus?.connected;

          return (
            <Card key={integration.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Icon & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`h-14 w-14 rounded-xl ${integration.color} flex items-center justify-center shrink-0 border`}
                    >
                      {integration.id === "google" && (
                        <Calendar className="h-7 w-7 text-[#4285F4]" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{integration.name}</h3>
                        {isConnected ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Not connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {integration.description}
                      </p>
                      {isConnected && integrationStatus?.email && (
                        <p className="text-sm text-primary mt-2">
                          Connected as: {integrationStatus.email}
                        </p>
                      )}

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {integration.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                          disabled={connecting === integration.id}
                        >
                          {connecting === integration.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Reconnect
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDisconnect(integration.id)}
                          disabled={disconnectingId === integration.id}
                        >
                          {disconnectingId === integration.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Unlink className="h-4 w-4 mr-2" />
                          )}
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleConnect(integration.id)}
                        disabled={connecting === integration.id}
                      >
                        {connecting === integration.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ExternalLink className="h-4 w-4 mr-2" />
                        )}
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("integrations.setupInstructions", "Setup Instructions")}
          </CardTitle>
          <CardDescription>
            {t("integrations.setupInstructionsDesc", "Follow these steps to configure online meetings for your services")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="font-bold text-primary">1</span>
              </div>
              <h4 className="font-medium mb-1">Connect Integration</h4>
              <p className="text-sm text-muted-foreground">
                Click "Connect" on your preferred video platform above
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="font-bold text-primary">2</span>
              </div>
              <h4 className="font-medium mb-1">Configure Services</h4>
              <p className="text-sm text-muted-foreground">
                Go to Services and set meeting type to "Online"
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="font-bold text-primary">3</span>
              </div>
              <h4 className="font-medium mb-1">Automatic Links</h4>
              <p className="text-sm text-muted-foreground">
                Meeting links are automatically created and sent when bookings are confirmed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Integration?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the connection. You'll need to reconnect if you want to use this integration again.
              Existing meeting links will still work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
