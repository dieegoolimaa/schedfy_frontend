import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";
import {
  notificationTemplatesService,
  NotificationTemplate,
  NotificationChannel,
  NotificationEvent,
  CreateNotificationTemplateDto,
} from "../../services/notification-templates.service";
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
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  Heart,
  Target,
  Sparkles,
  Bot,
  Globe,
  BarChart3,
  Send,
  Calendar,
} from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationCenterPage() {
  const { t } = useTranslation();
  const { entity } = useAuth();
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationTemplates, setNotificationTemplates] = useState<
    NotificationTemplate[]
  >([]);

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateNotificationTemplateDto>({
    name: "",
    event: "booking_confirmed",
    channels: ["email"],
    subject: "",
    message: "",
    timing: "Immediate",
    enabled: true,
    variables: [],
    smartFeatures: {
      aiOptimizedTiming: false,
      sentimentAnalysis: false,
      personalization: true,
      autoTranslation: false,
    },
  });

  // Fetch templates on component mount
  useEffect(() => {
    if (entity?.id) {
      fetchTemplates();
    }
  }, [entity?.id]);

  const fetchTemplates = async () => {
    if (!entity?.id) return;

    try {
      setLoading(true);
      const templates = await notificationTemplatesService.getTemplatesByEntity(
        entity.id
      );
      setNotificationTemplates(templates);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error(
        error.response?.data?.message || "Failed to load notification templates"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      event: "booking_confirmed",
      channels: ["email"],
      subject: "",
      message: "",
      timing: "Immediate",
      enabled: true,
      variables: [],
      smartFeatures: {
        aiOptimizedTiming: false,
        sentimentAnalysis: false,
        personalization: true,
        autoTranslation: false,
      },
    });
  };

  const handleCreateTemplate = async () => {
    if (!formData.name || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const newTemplate = await notificationTemplatesService.createTemplate(
        formData
      );
      setNotificationTemplates([...notificationTemplates, newTemplate]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Template created successfully");
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast.error(error.response?.data?.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      const updatedTemplate = await notificationTemplatesService.updateTemplate(
        selectedTemplate._id,
        formData
      );
      setNotificationTemplates(
        notificationTemplates.map((t) =>
          t._id === selectedTemplate._id ? updatedTemplate : t
        )
      );
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
      resetForm();
      toast.success("Template updated successfully");
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error(error.response?.data?.message || "Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplate = async (id: string) => {
    try {
      const updatedTemplate = await notificationTemplatesService.toggleTemplate(
        id
      );
      setNotificationTemplates(
        notificationTemplates.map((t) => (t._id === id ? updatedTemplate : t))
      );
      toast.success(
        `Template ${updatedTemplate.enabled ? "enabled" : "disabled"}`
      );
    } catch (error: any) {
      console.error("Error toggling template:", error);
      toast.error(error.response?.data?.message || "Failed to toggle template");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      setLoading(true);
      await notificationTemplatesService.deleteTemplate(id);
      setNotificationTemplates(
        notificationTemplates.filter((t) => t._id !== id)
      );
      toast.success("Template deleted successfully");
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error(error.response?.data?.message || "Failed to delete template");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateTemplate = async (id: string) => {
    try {
      setLoading(true);
      const duplicated = await notificationTemplatesService.duplicateTemplate(
        id
      );
      setNotificationTemplates([...notificationTemplates, duplicated]);
      toast.success("Template duplicated successfully");
    } catch (error: any) {
      console.error("Error duplicating template:", error);
      toast.error(
        error.response?.data?.message || "Failed to duplicate template"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaultTemplates = async () => {
    if (!confirm("This will create default templates. Continue?")) return;

    try {
      setLoading(true);
      const templates =
        await notificationTemplatesService.seedDefaultTemplates();
      setNotificationTemplates([...notificationTemplates, ...templates]);
      toast.success(`${templates.length} default templates created`);
    } catch (error: any) {
      console.error("Error seeding templates:", error);
      toast.error(error.response?.data?.message || "Failed to seed templates");
    } finally {
      setLoading(false);
    }
  };

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
      clicked: 0,
      rate: 88,
    },
    whatsapp: {
      sent: 5670,
      delivered: 5640,
      opened: 5245,
      clicked: 2890,
      rate: 93.3,
    },
    push: {
      sent: 3420,
      delivered: 3180,
      opened: 1890,
      clicked: 890,
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
      default:
        return "bg-gray-500";
    }
  };

  const eventOptions: { value: NotificationEvent; label: string }[] = [
    { value: "booking_confirmed", label: "Booking Confirmed" },
    { value: "booking_reminder", label: "Booking Reminder" },
    { value: "booking_cancelled", label: "Booking Cancelled" },
    { value: "booking_rescheduled", label: "Booking Rescheduled" },
    { value: "payment_received", label: "Payment Received" },
    { value: "review_request", label: "Review Request" },
    { value: "birthday", label: "Birthday" },
    { value: "loyalty_reward", label: "Loyalty Reward" },
    { value: "promotion", label: "Promotion" },
    { value: "no_show_followup", label: "No-Show Follow-up" },
  ];

  const timingOptions = [
    "Immediate",
    "5 minutes before",
    "30 minutes before",
    "1 hour before",
    "2 hours before",
    "24 hours before",
    "48 hours before",
    "1 week before",
    "1 hour after",
    "24 hours after",
    "3 days after",
    "1 week after",
  ];

  const channelOptions: {
    value: NotificationChannel;
    label: string;
    icon: any;
  }[] = [
    { value: "email", label: "Email", icon: Mail },
    { value: "sms", label: "SMS", icon: MessageSquare },
    { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { value: "push", label: "Push", icon: Smartphone },
    { value: "in-app", label: "In-App", icon: Bell },
  ];

  const handleEditTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      event: template.event,
      channels: template.channels,
      subject: template.subject,
      message: template.message,
      timing: template.timing,
      enabled: template.enabled,
      variables: template.variables,
      smartFeatures: template.smartFeatures,
    });
    setIsEditDialogOpen(true);
  };

  const handlePreviewTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const availableVariables = [
    "{{client_name}}",
    "{{business_name}}",
    "{{service_name}}",
    "{{professional_name}}",
    "{{booking_date}}",
    "{{booking_time}}",
    "{{location}}",
    "{{price}}",
    "{{duration}}",
    "{{booking_link}}",
    "{{cancel_link}}",
  ];

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
          {notificationTemplates.length === 0 && (
            <Button
              variant="outline"
              onClick={handleSeedDefaultTemplates}
              disabled={loading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t("notifications.seedDefaults", "Seed Defaults")}
            </Button>
          )}
          <Button onClick={handleOpenCreateDialog} disabled={loading}>
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
              value="analytics"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
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
            {loading && <p>Loading templates...</p>}
            {!loading && notificationTemplates.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold mb-2">
                    No templates found
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Create your first notification template to get started
                  </p>
                  <Button onClick={handleOpenCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            )}
            {notificationTemplates.map((template) => (
              <Card
                key={template._id}
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
                        {!template.enabled && (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>

                      {/* Subject/Message Preview */}
                      <div className="space-y-1">
                        {template.subject && (
                          <p className="text-sm font-medium text-muted-foreground">
                            Subject: {template.subject}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.message}
                        </p>
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
                          handleToggleTemplate(template._id)
                        }
                        disabled={loading}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template._id)}
                          disabled={loading}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template._id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>
                  Overall notification delivery success rate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Email</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">97.8%</p>
                      <p className="text-xs text-muted-foreground">
                        12,180 / 12,450
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span className="font-medium">SMS</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">99.3%</p>
                      <p className="text-xs text-muted-foreground">
                        8,890 / 8,950
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium">WhatsApp</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">99.5%</p>
                      <p className="text-xs text-muted-foreground">
                        5,640 / 5,670
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Push</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">93.0%</p>
                      <p className="text-xs text-muted-foreground">
                        3,180 / 3,420
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Click-through and open rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Email Open Rate
                      </span>
                      <span className="text-sm font-semibold">73.2%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: "73.2%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">SMS Open Rate</span>
                      <span className="text-sm font-semibold">88%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: "88%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        WhatsApp Open Rate
                      </span>
                      <span className="text-sm font-semibold">93.3%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: "93.3%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Push Open Rate
                      </span>
                      <span className="text-sm font-semibold">59.4%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full"
                        style={{ width: "59.4%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Used Templates</CardTitle>
                <CardDescription>Top performing templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notificationTemplates.slice(0, 5).map((template, index) => (
                    <div key={template._id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.event.replace(/_/g, " ")}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {Math.floor(Math.random() * 1000) + 100} sent
                      </Badge>
                    </div>
                  ))}
                  {notificationTemplates.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No templates yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest notification events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <Send className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Booking confirmation sent
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Reminder scheduled</p>
                      <p className="text-xs text-muted-foreground">
                        15 minutes ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                      <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        AI optimization applied
                      </p>
                      <p className="text-xs text-muted-foreground">
                        1 hour ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Features Tab */}
        <TabsContent value="ai-features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>AI-Optimized Send Time</CardTitle>
                </div>
                <CardDescription>
                  Automatically determine the best time to send notifications
                  based on user engagement patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">How it works:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Analyzes historical engagement data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Learns individual user preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Optimizes delivery timing automatically</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Enable for all templates</p>
                      <p className="text-xs text-muted-foreground">
                        Increase engagement by up to 40%
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <CardTitle>Sentiment Analysis</CardTitle>
                </div>
                <CardDescription>
                  Analyze customer sentiment and adjust message tone accordingly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Benefits:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Detect customer mood from interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Adapt message tone dynamically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Improve customer satisfaction</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Enable sentiment analysis</p>
                      <p className="text-xs text-muted-foreground">
                        More personalized communications
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Smart Personalization</CardTitle>
                </div>
                <CardDescription>
                  Dynamically personalize content based on customer data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Auto-insert relevant customer data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Suggest personalized offers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                        <span>Tailor content to preferences</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Enable personalization</p>
                      <p className="text-xs text-muted-foreground">
                        Boost conversion rates
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>Auto-Translation</CardTitle>
                </div>
                <CardDescription>
                  Automatically translate messages to customer's preferred
                  language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">Supported languages:</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">English</Badge>
                      <Badge variant="secondary">Portuguese</Badge>
                      <Badge variant="secondary">Spanish</Badge>
                      <Badge variant="secondary">French</Badge>
                      <Badge variant="secondary">German</Badge>
                      <Badge variant="secondary">Italian</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Enable auto-translation</p>
                      <p className="text-xs text-muted-foreground">
                        Reach global customers
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedTemplate(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              Configure your notification template with multi-channel support
              and AI features
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Template Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Booking Confirmation"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event">
                      Event Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.event}
                      onValueChange={(value: NotificationEvent) =>
                        setFormData({ ...formData, event: value })
                      }
                    >
                      <SelectTrigger id="event">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timing">Timing</Label>
                  <Select
                    value={formData.timing}
                    onValueChange={(value) =>
                      setFormData({ ...formData, timing: value })
                    }
                  >
                    <SelectTrigger id="timing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timingOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Channels */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Channels</h3>
                <p className="text-sm text-muted-foreground">
                  Select the channels where this notification will be sent
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  {channelOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div
                        key={option.value}
                        className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                          formData.channels.includes(option.value)
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => toggleChannel(option.value)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{option.label}</span>
                        </div>
                        {formData.channels.includes(option.value) && (
                          <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Message Content</h3>

                {formData.channels.includes("email") && (
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Email Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Enter email subject line..."
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here... Use variables like {{client_name}}"
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Use variables to personalize your message
                  </p>
                </div>

                {/* Available Variables */}
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm font-medium mb-2">
                    Available Variables:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableVariables.map((variable) => (
                      <Badge
                        key={variable}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            message: formData.message + " " + variable,
                          });
                        }}
                      >
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* AI Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI Features</h3>
                <p className="text-sm text-muted-foreground">
                  Enable smart features to optimize your notifications
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <Label className="font-medium cursor-pointer">
                          AI-Optimized Send Time
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Automatically determine the best time to send
                      </p>
                    </div>
                    <Switch
                      checked={formData.smartFeatures?.aiOptimizedTiming}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          smartFeatures: {
                            ...formData.smartFeatures,
                            aiOptimizedTiming: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary" />
                        <Label className="font-medium cursor-pointer">
                          Sentiment Analysis
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Adapt tone based on customer sentiment
                      </p>
                    </div>
                    <Switch
                      checked={formData.smartFeatures?.sentimentAnalysis}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          smartFeatures: {
                            ...formData.smartFeatures,
                            sentimentAnalysis: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <Label className="font-medium cursor-pointer">
                          Smart Personalization
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Dynamic content based on customer data
                      </p>
                    </div>
                    <Switch
                      checked={formData.smartFeatures?.personalization}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          smartFeatures: {
                            ...formData.smartFeatures,
                            personalization: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <Label className="font-medium cursor-pointer">
                          Auto-Translation
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Translate to customer's language
                      </p>
                    </div>
                    <Switch
                      checked={formData.smartFeatures?.autoTranslation}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          smartFeatures: {
                            ...formData.smartFeatures,
                            autoTranslation: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">Enable Template</Label>
                  <p className="text-xs text-muted-foreground">
                    Active templates will be used automatically
                  </p>
                </div>
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enabled: checked })
                  }
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                setSelectedTemplate(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                isEditDialogOpen ? handleUpdateTemplate : handleCreateTemplate
              }
              disabled={loading || !formData.name || !formData.message}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isEditDialogOpen ? "Update Template" : "Create Template"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                {selectedTemplate.channels.includes("whatsapp") && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-medium">WhatsApp Preview</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-green-500 text-white p-3 rounded-lg text-sm max-w-xs">
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
    </div>
  );
}
