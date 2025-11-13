import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatCard } from "../../components/ui/stat-card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Heart,
  Star,
  Gift,
  Target,
  Sparkles,
  Bot,
  Globe,
} from "lucide-react";

type NotificationChannel = "email" | "sms" | "whatsapp" | "push" | "in-app";
type NotificationEvent =
  | "booking_confirmed"
  | "booking_reminder"
  | "booking_cancelled"
  | "booking_rescheduled"
  | "payment_received"
  | "review_request"
  | "birthday"
  | "loyalty_reward"
  | "promotion"
  | "no_show_followup";

interface NotificationTemplate {
  id: string;
  name: string;
  event: NotificationEvent;
  channels: NotificationChannel[];
  subject: string;
  message: string;
  timing: string;
  enabled: boolean;
  variables: string[];
  smartFeatures: {
    aiOptimizedTiming: boolean;
    sentimentAnalysis: boolean;
    personalization: boolean;
    autoTranslation: boolean;
  };
}

export function NotificationCenterPage() {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  // Mock notification templates
  const [notificationTemplates, setNotificationTemplates] = useState<
    NotificationTemplate[]
  >([
    {
      id: "1",
      name: "Booking Confirmation",
      event: "booking_confirmed",
      channels: ["email", "sms", "whatsapp"],
      subject: "Your booking is confirmed! 🎉",
      message:
        "Hi {{client_name}}, your appointment for {{service_name}} with {{professional_name}} is confirmed for {{booking_date}} at {{booking_time}}. Looking forward to seeing you!",
      timing: "Immediate",
      enabled: true,
      variables: [
        "client_name",
        "service_name",
        "professional_name",
        "booking_date",
        "booking_time",
        "location",
      ],
      smartFeatures: {
        aiOptimizedTiming: false,
        sentimentAnalysis: false,
        personalization: true,
        autoTranslation: true,
      },
    },
    {
      id: "2",
      name: "Smart Reminder - 24h Before",
      event: "booking_reminder",
      channels: ["email", "sms", "push"],
      subject: "Tomorrow's appointment with {{business_name}}",
      message:
        "Hi {{client_name}}! Just a friendly reminder about your appointment tomorrow at {{booking_time}} for {{service_name}}. We can't wait to see you! Reply YES to confirm or CANCEL to reschedule.",
      timing: "24 hours before",
      enabled: true,
      variables: [
        "client_name",
        "business_name",
        "booking_time",
        "service_name",
      ],
      smartFeatures: {
        aiOptimizedTiming: true,
        sentimentAnalysis: true,
        personalization: true,
        autoTranslation: true,
      },
    },
    {
      id: "3",
      name: "Last Minute Reminder",
      event: "booking_reminder",
      channels: ["sms", "push"],
      subject: "",
      message:
        "{{client_name}}, your appointment starts in 2 hours! 📍 {{location}}. See you soon!",
      timing: "2 hours before",
      enabled: true,
      variables: ["client_name", "location"],
      smartFeatures: {
        aiOptimizedTiming: false,
        sentimentAnalysis: false,
        personalization: false,
        autoTranslation: true,
      },
    },
    {
      id: "4",
      name: "Review Request with Incentive",
      event: "review_request",
      channels: ["email", "whatsapp"],
      subject: "How was your experience? Get 10% off next visit! ⭐",
      message:
        "Hi {{client_name}}! Thank you for visiting us for {{service_name}}. We'd love to hear about your experience. Leave a review and get 10% off your next booking! {{review_link}}",
      timing: "24 hours after",
      enabled: true,
      variables: ["client_name", "service_name", "review_link"],
      smartFeatures: {
        aiOptimizedTiming: true,
        sentimentAnalysis: true,
        personalization: true,
        autoTranslation: true,
      },
    },
    {
      id: "5",
      name: "Win-Back No-Show",
      event: "no_show_followup",
      channels: ["email", "sms"],
      subject: "We missed you! Come back with 20% off 💙",
      message:
        "Hi {{client_name}}, we noticed you missed your appointment. Life gets busy! We'd love to see you again. Here's 20% off your next booking: {{voucher_code}}",
      timing: "3 days after no-show",
      enabled: true,
      variables: ["client_name", "voucher_code"],
      smartFeatures: {
        aiOptimizedTiming: true,
        sentimentAnalysis: true,
        personalization: true,
        autoTranslation: false,
      },
    },
    {
      id: "6",
      name: "Birthday Celebration",
      event: "birthday",
      channels: ["email", "sms", "whatsapp"],
      subject: "Happy Birthday {{client_name}}! 🎂 Special gift inside",
      message:
        "Happy Birthday {{client_name}}! 🎉 To celebrate your special day, enjoy a complimentary upgrade on your next visit. Valid for 30 days: {{birthday_code}}",
      timing: "On birthday at 9 AM",
      enabled: true,
      variables: ["client_name", "birthday_code"],
      smartFeatures: {
        aiOptimizedTiming: false,
        sentimentAnalysis: false,
        personalization: true,
        autoTranslation: true,
      },
    },
    {
      id: "7",
      name: "Loyalty Milestone Reached",
      event: "loyalty_reward",
      channels: ["email", "push", "in-app"],
      subject: "🏆 You've reached {{tier_name}} status!",
      message:
        "Congratulations {{client_name}}! You've unlocked {{tier_name}} tier with exclusive benefits: {{benefits_list}}. Thank you for your loyalty!",
      timing: "Immediate",
      enabled: true,
      variables: ["client_name", "tier_name", "benefits_list"],
      smartFeatures: {
        aiOptimizedTiming: false,
        sentimentAnalysis: false,
        personalization: true,
        autoTranslation: true,
      },
    },
  ]);

  // Channel statistics
  const channelStats = {
    email: {
      sent: 12450,
      delivered: 12180,
      opened: 8926,
      clicked: 4567,
      rate: 73.2,
    },
    sms: {
      sent: 8950,
      delivered: 8890,
      opened: 7823,
      clicked: 2156,
      rate: 88.0,
    },
    whatsapp: {
      sent: 5670,
      delivered: 5620,
      opened: 5245,
      clicked: 3124,
      rate: 93.3,
    },
    push: {
      sent: 3420,
      delivered: 3180,
      opened: 1890,
      clicked: 945,
      rate: 59.4,
    },
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      case "push":
        return <Smartphone className="h-4 w-4" />;
      case "in-app":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getEventBadgeColor = (event: NotificationEvent) => {
    switch (event) {
      case "booking_confirmed":
        return "bg-green-500";
      case "booking_reminder":
        return "bg-blue-500";
      case "booking_cancelled":
        return "bg-red-500";
      case "payment_received":
        return "bg-emerald-500";
      case "review_request":
        return "bg-yellow-500";
      case "birthday":
        return "bg-pink-500";
      case "loyalty_reward":
        return "bg-purple-500";
      case "promotion":
        return "bg-orange-500";
      case "no_show_followup":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handlePreviewTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const toggleTemplateStatus = (templateId: string) => {
    setNotificationTemplates(
      notificationTemplates.map((t) =>
        t.id === templateId ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              {t("notifications.title", "Notification Center")}
            </h1>
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {t(
              "notifications.subtitle",
              "Manage multi-channel notifications with smart automation and personalization"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            {t("notifications.settings", "Settings")}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("notifications.createTemplate", "New Template")}
          </Button>
        </div>
      </div>

      {/* Channel Performance Overview */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Email"
          value={`${channelStats.email.rate}%`}
          subtitle={`${channelStats.email.opened.toLocaleString()} opened of ${channelStats.email.sent.toLocaleString()}`}
          icon={Mail}
          trend={{ value: "+5.2%", isPositive: true }}
          variant="info"
        />

        <StatCard
          title="SMS"
          value={`${channelStats.sms.rate}%`}
          subtitle={`${channelStats.sms.opened.toLocaleString()} opened of ${channelStats.sms.sent.toLocaleString()}`}
          icon={MessageSquare}
          trend={{ value: "+3.8%", isPositive: true }}
          variant="success"
        />

        <StatCard
          title="WhatsApp"
          value={`${channelStats.whatsapp.rate}%`}
          subtitle={`${channelStats.whatsapp.opened.toLocaleString()} opened of ${channelStats.whatsapp.sent.toLocaleString()}`}
          icon={MessageSquare}
          trend={{ value: "+12.4%", isPositive: true }}
          variant="success"
        />

        <StatCard
          title="Push"
          value={`${channelStats.push.rate}%`}
          subtitle={`${channelStats.push.opened.toLocaleString()} opened of ${channelStats.push.sent.toLocaleString()}`}
          icon={Smartphone}
          trend={{ value: "-2.1%", isPositive: false }}
          variant="warning"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="templates" className="space-y-6">
        <div className="border-b">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
            <TabsTrigger
              value="templates"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger
              value="automation"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              <Zap className="mr-2 h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="ai-features"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              <Bot className="mr-2 h-4 w-4" />
              AI Features
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {notificationTemplates.map((template) => (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Template info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {template.name}
                        </h3>
                        <Badge
                          className={`${getEventBadgeColor(
                            template.event
                          )} text-white`}
                        >
                          {template.event.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      {/* Channels */}
                      <div className="flex flex-wrap gap-2">
                        {template.channels.map((channel) => (
                          <Badge
                            key={channel}
                            variant="outline"
                            className="flex items-center gap-1.5 px-3 py-1"
                          >
                            {getChannelIcon(channel)}
                            <span className="capitalize">{channel}</span>
                          </Badge>
                        ))}
                      </div>

                      {/* Timing */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{template.timing}</span>
                      </div>

                      {/* AI Features */}
                      {(template.smartFeatures.aiOptimizedTiming ||
                        template.smartFeatures.personalization ||
                        template.smartFeatures.sentimentAnalysis ||
                        template.smartFeatures.autoTranslation) && (
                        <div className="flex flex-wrap gap-2">
                          {template.smartFeatures.aiOptimizedTiming && (
                            <Badge
                              variant="secondary"
                              className="text-xs gap-1"
                            >
                              <Sparkles className="h-3 w-3" />
                              Smart Time
                            </Badge>
                          )}
                          {template.smartFeatures.personalization && (
                            <Badge
                              variant="secondary"
                              className="text-xs gap-1"
                            >
                              <Target className="h-3 w-3" />
                              Personal
                            </Badge>
                          )}
                          {template.smartFeatures.sentimentAnalysis && (
                            <Badge
                              variant="secondary"
                              className="text-xs gap-1"
                            >
                              <Heart className="h-3 w-3" />
                              Sentiment
                            </Badge>
                          )}
                          {template.smartFeatures.autoTranslation && (
                            <Badge
                              variant="secondary"
                              className="text-xs gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              Translation
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <Switch
                        checked={template.enabled}
                        onCheckedChange={() =>
                          toggleTemplateStatus(template.id)
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Smart Automation Rules</CardTitle>
                <CardDescription>
                  AI-powered automation to send the right message at the right
                  time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Optimal Send Time</h4>
                      <p className="text-sm text-muted-foreground">
                        AI analyzes client behavior to send at their most active
                        time
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Smart Segmentation</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically group clients by behavior and preferences
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-pink-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Sentiment Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        Adjust tone based on client satisfaction and history
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Auto-Translation</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically translate to client's preferred language
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Boosters</CardTitle>
                <CardDescription>
                  Advanced features to increase client engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Two-Way Messaging</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow clients to reply YES/NO to confirm or reschedule
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Gift className="h-5 w-5 text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Dynamic Incentives</h4>
                      <p className="text-sm text-muted-foreground">
                        Auto-generate vouchers for no-shows and win-backs
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Review Incentives</h4>
                      <p className="text-sm text-muted-foreground">
                        Reward clients who leave reviews with loyalty points
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-indigo-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Referral Tracking</h4>
                      <p className="text-sm text-muted-foreground">
                        Track and reward clients who refer new customers
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Performance Analytics</CardTitle>
              <CardDescription>
                Track delivery, engagement, and conversion metrics across all
                channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Email Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Email</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {channelStats.email.sent.toLocaleString()} sent
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Delivered
                      </div>
                      <div className="text-2xl font-bold">
                        {(
                          (channelStats.email.delivered /
                            channelStats.email.sent) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Opened
                      </div>
                      <div className="text-2xl font-bold">
                        {channelStats.email.rate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Clicked
                      </div>
                      <div className="text-2xl font-bold">
                        {(
                          (channelStats.email.clicked /
                            channelStats.email.opened) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Converted
                      </div>
                      <div className="text-2xl font-bold">18.5%</div>
                    </div>
                  </div>
                </div>

                {/* SMS Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <span className="font-medium">SMS</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {channelStats.sms.sent.toLocaleString()} sent
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Delivered
                      </div>
                      <div className="text-2xl font-bold">
                        {(
                          (channelStats.sms.delivered / channelStats.sms.sent) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Opened
                      </div>
                      <div className="text-2xl font-bold">
                        {channelStats.sms.rate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Replied
                      </div>
                      <div className="text-2xl font-bold">24.1%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Converted
                      </div>
                      <div className="text-2xl font-bold">32.8%</div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium">WhatsApp</span>
                      <Badge variant="secondary" className="text-xs">
                        Highest Engagement
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {channelStats.whatsapp.sent.toLocaleString()} sent
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Delivered
                      </div>
                      <div className="text-2xl font-bold">
                        {(
                          (channelStats.whatsapp.delivered /
                            channelStats.whatsapp.sent) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Opened
                      </div>
                      <div className="text-2xl font-bold">
                        {channelStats.whatsapp.rate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Replied
                      </div>
                      <div className="text-2xl font-bold">55.6%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Converted
                      </div>
                      <div className="text-2xl font-bold">41.2%</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Performing Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Templates</CardTitle>
              <CardDescription>
                Templates with highest engagement and conversion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Smart Reminder - 24h Before</h4>
                    <p className="text-sm text-muted-foreground">
                      88% open rate • 67% confirmation rate
                    </p>
                  </div>
                  <Badge className="bg-green-500">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Top Performer
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      Review Request with Incentive
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      76% open rate • 42% review completion
                    </p>
                  </div>
                  <Badge className="bg-blue-500">High Engagement</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Win-Back No-Show</h4>
                    <p className="text-sm text-muted-foreground">
                      81% open rate • 28% rebooking rate
                    </p>
                  </div>
                  <Badge className="bg-purple-500">Best ROI</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Features Tab */}
        <TabsContent value="ai-features" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-purple-500" />
                <div>
                  <CardTitle>AI-Powered Features</CardTitle>
                  <CardDescription>
                    Leverage artificial intelligence to optimize your
                    notification strategy
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <CardTitle className="text-base">
                        Optimal Send Time Prediction
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      AI analyzes each client's behavior to determine when
                      they're most likely to engage with notifications.
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">
                        +23% engagement improvement
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-base">
                        Smart Content Personalization
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Automatically customize message tone, length, and content
                      based on client preferences and history.
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">
                        +18% conversion rate
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-green-500" />
                      <CardTitle className="text-base">
                        Sentiment Analysis
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Analyze client satisfaction and adjust communication style
                      accordingly (empathetic, celebratory, professional).
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">
                        +31% satisfaction score
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 dark:border-orange-800">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-base">
                        Predictive No-Show Prevention
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Identify clients at risk of no-show and send proactive
                      engagement messages with incentives.
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium">
                        -42% no-show rate
                      </span>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <CardHeader>
                  <CardTitle>AI Insights Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        +34%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Overall Engagement
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        -28%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        No-Show Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        €12.4K
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Revenue Impact
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              See how your notification will appear across different channels
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {selectedTemplate.channels.includes("email") && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">Email Preview</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 bg-muted p-4 rounded">
                      <div className="font-semibold">
                        {selectedTemplate.subject}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {selectedTemplate.message}
                      </div>
                    </CardContent>
                  </Card>
                )}
                {selectedTemplate.channels.includes("sms") && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">SMS Preview</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-500 text-white p-3 rounded-lg text-sm max-w-xs">
                        {selectedTemplate.message}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Customize your notification template with smart variables and
              multi-channel support
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input defaultValue={selectedTemplate.name} />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select defaultValue={selectedTemplate.event}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking_confirmed">
                        Booking Confirmed
                      </SelectItem>
                      <SelectItem value="booking_reminder">
                        Booking Reminder
                      </SelectItem>
                      <SelectItem value="review_request">
                        Review Request
                      </SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="loyalty_reward">
                        Loyalty Reward
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="flex flex-wrap gap-2">
                  {(["email", "sms", "whatsapp", "push"] as const).map(
                    (channel) => (
                      <Badge
                        key={channel}
                        variant={
                          selectedTemplate.channels.includes(channel)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                      >
                        {getChannelIcon(channel)}
                        <span className="ml-1">{channel}</span>
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject Line (Email)</Label>
                <Input
                  defaultValue={selectedTemplate.subject}
                  placeholder="Enter subject line..."
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  defaultValue={selectedTemplate.message}
                  rows={6}
                  placeholder="Enter your message..."
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {selectedTemplate.variables.join(", ")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Timing</Label>
                <Select defaultValue={selectedTemplate.timing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediate">Immediate</SelectItem>
                    <SelectItem value="2 hours before">
                      2 hours before
                    </SelectItem>
                    <SelectItem value="24 hours before">
                      24 hours before
                    </SelectItem>
                    <SelectItem value="48 hours before">
                      48 hours before
                    </SelectItem>
                    <SelectItem value="24 hours after">
                      24 hours after
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>AI Features</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">
                      AI-Optimized Send Time
                    </Label>
                    <Switch
                      defaultChecked={
                        selectedTemplate.smartFeatures.aiOptimizedTiming
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Sentiment Analysis</Label>
                    <Switch
                      defaultChecked={
                        selectedTemplate.smartFeatures.sentimentAnalysis
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Smart Personalization</Label>
                    <Switch
                      defaultChecked={
                        selectedTemplate.smartFeatures.personalization
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Auto-Translation</Label>
                    <Switch
                      defaultChecked={
                        selectedTemplate.smartFeatures.autoTranslation
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
