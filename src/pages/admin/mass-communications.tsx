import { useState } from "react";
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
import { Textarea } from "../../components/ui/textarea";
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
import { Checkbox } from "../../components/ui/checkbox";
import {
  Send,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  Copy,
  Edit,
  Filter,
  Building2,
  Users,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

type CommunicationChannel = "email" | "sms" | "whatsapp";
type CommunicationStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed";
type RecipientFilter =
  | "all"
  | "simple"
  | "individual"
  | "business"
  | "active"
  | "overdue"
  | "suspended";

interface CommunicationTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  channel: CommunicationChannel[];
  category: string;
  usageCount: number;
}

interface CommunicationCampaign {
  id: string;
  name: string;
  subject: string;
  message: string;
  channels: CommunicationChannel[];
  recipientFilter: RecipientFilter;
  recipientCount: number;
  status: CommunicationStatus;
  scheduledFor?: string;
  sentAt?: string;
  deliveredCount?: number;
  failedCount?: number;
  createdBy: string;
  createdAt: string;
}

export function MassCommunicationsPage() {
  const [activeTab, setActiveTab] = useState("compose");
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<
    CommunicationChannel[]
  >(["email"]);
  const [recipientFilter, setRecipientFilter] =
    useState<RecipientFilter>("all");
  const [scheduledDate, setScheduledDate] = useState("");
  const [, setSelectedTemplate] = useState<string>("");
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  // Mock Templates
  const [templates] = useState<CommunicationTemplate[]>([
    {
      id: "TPL001",
      name: "Payment Reminder",
      subject: "Important: Your Schedfy Payment is Due",
      message:
        "Hello {{entityName}},\n\nThis is a friendly reminder that your Schedfy subscription payment of €{{amount}} is due on {{dueDate}}.\n\nPlease ensure timely payment to avoid service interruption.\n\nBest regards,\nSchedfy Team",
      channel: ["email", "sms"],
      category: "Billing",
      usageCount: 45,
    },
    {
      id: "TPL002",
      name: "New Feature Announcement",
      subject: "Exciting New Features Available!",
      message:
        "Hello {{entityName}},\n\nWe're excited to announce new features in Schedfy:\n\n• AI-powered scheduling\n• Advanced analytics\n• Loyalty management\n\nUpgrade your plan to access these features today!\n\nBest regards,\nSchedfy Team",
      channel: ["email", "whatsapp"],
      category: "Marketing",
      usageCount: 28,
    },
    {
      id: "TPL003",
      name: "Subscription Suspended",
      subject: "Action Required: Subscription Suspended",
      message:
        "Hello {{entityName}},\n\nYour Schedfy subscription has been suspended due to payment issues.\n\nAmount overdue: €{{amount}}\nDays overdue: {{days}}\n\nPlease contact us to restore your service.\n\nBest regards,\nSchedfy Team",
      channel: ["email", "sms", "whatsapp"],
      category: "Billing",
      usageCount: 12,
    },
    {
      id: "TPL004",
      name: "Renewal Success",
      subject: "Thank You for Renewing Your Subscription",
      message:
        "Hello {{entityName}},\n\nThank you for renewing your Schedfy subscription!\n\nPlan: {{plan}}\nNext billing date: {{nextBilling}}\n\nWe're here to help you succeed.\n\nBest regards,\nSchedfy Team",
      channel: ["email"],
      category: "Confirmation",
      usageCount: 67,
    },
  ]);

  // Mock Campaigns
  const [campaigns] = useState<CommunicationCampaign[]>([
    {
      id: "CMP001",
      name: "January Payment Reminders",
      subject: "Your Schedfy Payment is Due",
      message: "Payment reminder message...",
      channels: ["email", "sms"],
      recipientFilter: "active",
      recipientCount: 132,
      status: "sent",
      sentAt: "2024-10-01 10:00",
      deliveredCount: 130,
      failedCount: 2,
      createdBy: "Admin",
      createdAt: "2024-09-28 14:30",
    },
    {
      id: "CMP002",
      name: "Feature Announcement - AI Premium",
      subject: "New AI Features Now Available",
      message: "Exciting AI features message...",
      channels: ["email", "whatsapp"],
      recipientFilter: "business",
      recipientCount: 70,
      status: "sent",
      sentAt: "2024-10-15 09:00",
      deliveredCount: 69,
      failedCount: 1,
      createdBy: "Admin",
      createdAt: "2024-10-14 16:00",
    },
    {
      id: "CMP003",
      name: "Overdue Payment Notice",
      subject: "Action Required: Payment Overdue",
      message: "Overdue payment notice...",
      channels: ["email", "sms", "whatsapp"],
      recipientFilter: "overdue",
      recipientCount: 12,
      status: "scheduled",
      scheduledFor: "2024-10-25 08:00",
      createdBy: "Admin",
      createdAt: "2024-10-23 11:15",
    },
  ]);

  const stats = {
    totalCampaigns: 45,
    sentThisMonth: 8,
    totalRecipients: 1456,
    averageDeliveryRate: 98.2,
  };

  const recipientCounts = {
    all: 156,
    simple: 36,
    individual: 50,
    business: 70,
    active: 132,
    overdue: 12,
    suspended: 8,
  };

  const handleChannelToggle = (channel: CommunicationChannel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleLoadTemplate = (template: CommunicationTemplate) => {
    setSubject(template.subject);
    setMessage(template.message);
    setSelectedChannels(template.channel);
    setSelectedTemplate(template.id);
    setIsTemplateDialogOpen(false);
    toast.success(`Template "${template.name}" loaded successfully`);
  };

  const handleSendCampaign = () => {
    if (!campaignName || !message || selectedChannels.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(
      `Campaign "${campaignName}" sent to ${recipientCounts[recipientFilter]} recipients!`
    );

    // Reset form
    setCampaignName("");
    setSubject("");
    setMessage("");
    setSelectedChannels(["email"]);
    setRecipientFilter("all");
    setScheduledDate("");
    setSelectedTemplate("");
  };

  const handleScheduleCampaign = () => {
    if (
      !campaignName ||
      !message ||
      !scheduledDate ||
      selectedChannels.length === 0
    ) {
      toast.error("Please fill in all required fields including schedule date");
      return;
    }

    toast.success(
      `Campaign "${campaignName}" scheduled for ${new Date(scheduledDate).toLocaleString()}`
    );

    // Reset form
    setCampaignName("");
    setSubject("");
    setMessage("");
    setSelectedChannels(["email"]);
    setRecipientFilter("all");
    setScheduledDate("");
    setSelectedTemplate("");
  };

  const getStatusBadge = (status: CommunicationStatus) => {
    const variants = {
      draft: { color: "bg-gray-500", label: "Draft", icon: Edit },
      scheduled: { color: "bg-blue-500", label: "Scheduled", icon: Clock },
      sending: { color: "bg-yellow-500", label: "Sending", icon: Send },
      sent: { color: "bg-green-500", label: "Sent", icon: CheckCircle },
      failed: { color: "bg-red-500", label: "Failed", icon: XCircle },
    };
    return variants[status];
  };

  const getChannelIcon = (channel: CommunicationChannel) => {
    const icons = {
      email: Mail,
      sms: Phone,
      whatsapp: MessageSquare,
    };
    return icons[channel];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Mass Communications
            </h1>
          </div>
          <p className="text-muted-foreground">
            Send emails, SMS, and WhatsApp messages to entities
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaigns
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sentThisMonth} sent this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Recipients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipients}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageDeliveryRate}%
            </div>
            <p className="text-xs text-green-600">Excellent delivery rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Entities
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipientCounts.active}</div>
            <p className="text-xs text-muted-foreground">
              Available recipients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="compose">
            <Edit className="mr-2 h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Send className="mr-2 h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Copy className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>
                Compose and send mass communications to entities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Name *</label>
                <Input
                  placeholder="e.g., January Payment Reminders"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              {/* Channel Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Communication Channels *
                </label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={selectedChannels.includes("email")}
                      onCheckedChange={() => handleChannelToggle("email")}
                    />
                    <label
                      htmlFor="email"
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={selectedChannels.includes("sms")}
                      onCheckedChange={() => handleChannelToggle("sms")}
                    />
                    <label
                      htmlFor="sms"
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Phone className="h-4 w-4" />
                      SMS
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="whatsapp"
                      checked={selectedChannels.includes("whatsapp")}
                      onCheckedChange={() => handleChannelToggle("whatsapp")}
                    />
                    <label
                      htmlFor="whatsapp"
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </label>
                  </div>
                </div>
              </div>

              {/* Recipient Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipients *</label>
                <div className="flex gap-2">
                  <Select
                    value={recipientFilter}
                    onValueChange={(value) =>
                      setRecipientFilter(value as RecipientFilter)
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All Entities ({recipientCounts.all})
                      </SelectItem>
                      <SelectItem value="active">
                        Active Subscriptions ({recipientCounts.active})
                      </SelectItem>
                      <SelectItem value="overdue">
                        Overdue Payments ({recipientCounts.overdue})
                      </SelectItem>
                      <SelectItem value="suspended">
                        Suspended ({recipientCounts.suspended})
                      </SelectItem>
                      <SelectItem value="simple">
                        Simple Plan ({recipientCounts.simple})
                      </SelectItem>
                      <SelectItem value="individual">
                        Individual Plan ({recipientCounts.individual})
                      </SelectItem>
                      <SelectItem value="business">
                        Business Plan ({recipientCounts.business})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="px-3 py-2">
                    <Users className="mr-1 h-3 w-3" />
                    {recipientCounts[recipientFilter]} recipients
                  </Badge>
                </div>
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Use Template (Optional)
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTemplateDialogOpen(true)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Browse Templates
                  </Button>
                </div>
              </div>

              {/* Subject */}
              {selectedChannels.includes("email") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Subject (Email) *
                  </label>
                  <Input
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Message *</label>
                <Textarea
                  placeholder="Enter your message here... You can use variables like {{entityName}}, {{amount}}, {{plan}}"
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {"{{entityName}}"}, {"{{amount}}"},{" "}
                  {"{{plan}}"}, {"{{dueDate}}"}, {"{{nextBilling}}"}
                </p>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Schedule (Optional)
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to send immediately
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewDialogOpen(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                {scheduledDate ? (
                  <Button onClick={handleScheduleCampaign}>
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule Campaign
                  </Button>
                ) : (
                  <Button onClick={handleSendCampaign}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campaign History</CardTitle>
                  <CardDescription>
                    View and manage past communications
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const statusBadge = getStatusBadge(campaign.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {campaign.subject}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {campaign.channels.map((channel) => {
                              const Icon = getChannelIcon(channel);
                              return (
                                <Badge
                                  key={channel}
                                  variant="outline"
                                  className="px-2"
                                >
                                  <Icon className="h-3 w-3" />
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Users className="mr-1 h-3 w-3" />
                            {campaign.recipientCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge.color}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.deliveredCount !== undefined ? (
                            <div className="text-sm">
                              <div className="text-green-600 font-medium">
                                {campaign.deliveredCount} delivered
                              </div>
                              {campaign.failedCount! > 0 && (
                                <div className="text-red-600 text-xs">
                                  {campaign.failedCount} failed
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>
                              {new Date(
                                campaign.createdAt
                              ).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {campaign.createdBy}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Communication Templates</CardTitle>
                  <CardDescription>
                    Reusable message templates for common communications
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {template.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Used {template.usageCount} times
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Subject:
                        </div>
                        <div className="text-sm">{template.subject}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Message Preview:
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {template.message}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Channels:
                        </div>
                        <div className="flex gap-1">
                          {template.channel.map((channel) => {
                            const Icon = getChannelIcon(channel);
                            return (
                              <Badge
                                key={channel}
                                variant="outline"
                                className="px-2"
                              >
                                <Icon className="mr-1 h-3 w-3" />
                                {channel}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          <Copy className="mr-2 h-3 w-3" />
                          Use Template
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Selection Dialog */}
      <Dialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Template</DialogTitle>
            <DialogDescription>
              Choose a template to load into the composer
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {template.subject}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground line-clamp-3">
                    {template.message}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleLoadTemplate(template)}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Campaign Preview</DialogTitle>
            <DialogDescription>
              Review your message before sending
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Campaign Name:</span>
                <span className="text-sm">
                  {campaignName || "Untitled Campaign"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recipients:</span>
                <Badge variant="outline">
                  <Users className="mr-1 h-3 w-3" />
                  {recipientCounts[recipientFilter]} entities
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Channels:</span>
                <div className="flex gap-1">
                  {selectedChannels.map((channel) => {
                    const Icon = getChannelIcon(channel);
                    return (
                      <Badge key={channel} variant="outline" className="px-2">
                        <Icon className="mr-1 h-3 w-3" />
                        {channel}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            {subject && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject:</label>
                <div className="p-3 border rounded-lg bg-muted">{subject}</div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Message:</label>
              <div className="p-4 border rounded-lg bg-muted whitespace-pre-wrap">
                {message || "No message entered"}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsPreviewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsPreviewDialogOpen(false);
                  if (scheduledDate) {
                    handleScheduleCampaign();
                  } else {
                    handleSendCampaign();
                  }
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Confirm & Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
