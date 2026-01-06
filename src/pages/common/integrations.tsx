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
import { Switch } from "../../components/ui/switch";
import { 
  Calendar, 
  Mail, 
  MessageSquare, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export default function IntegrationsSettingsPage() {
  const { t } = useTranslation("settings");
  
  const [integrations, setIntegrations] = useState([
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your bookings with your Google Calendar",
      icon: <Calendar className="h-6 w-6 text-blue-500" />,
      connected: false,
      status: "disconnected",
    },
    {
      id: "outlook-calendar",
      name: "Outlook Calendar",
      description: "Sync your bookings with your Outlook Calendar",
      icon: <Calendar className="h-6 w-6 text-blue-700" />,
      connected: false,
      status: "disconnected",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Accept online payments for your bookings",
      icon: <Globe className="h-6 w-6 text-indigo-600" />,
      connected: true,
      status: "connected",
    },
    {
      id: "twilio",
      name: "Twilio SMS",
      description: "Send SMS reminders to your clients",
      icon: <MessageSquare className="h-6 w-6 text-red-600" />,
      connected: false,
      status: "disconnected",
    }
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(item => 
      item.id === id ? { ...item, connected: !item.connected, status: !item.connected ? "connected" : "disconnected" } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect Schedfy with your favorite tools and services.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((item) => (
          <Card key={item.id} className={item.connected ? "border-primary/20 bg-primary/5" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-background rounded-lg border shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </div>
              <Badge variant={item.connected ? "default" : "secondary"}>
                {item.connected ? (
                  <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</span>
                ) : (
                  <span className="flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Disconnected</span>
                )}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={item.connected} 
                    onCheckedChange={() => toggleIntegration(item.id)} 
                  />
                  <span className="text-sm font-medium">
                    {item.connected ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  {item.connected ? "Configure" : "Connect"} <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
