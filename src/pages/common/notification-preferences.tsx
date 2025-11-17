import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { toast } from "sonner";
import { entitiesService } from "../../services/entities.service";
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
import {
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  Save,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  CreditCard,
  Users,
  Star,
  FileText,
  Shield,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Separator } from "../../components/ui/separator";

interface NotificationChannels {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  notifications: {
    // Booking lifecycle
    bookingCreated?: NotificationChannels;
    bookingConfirmed?: NotificationChannels;
    bookingRescheduled?: NotificationChannels;
    bookingCancelled?: NotificationChannels;
    bookingCompleted?: NotificationChannels;
    bookingNoShow?: NotificationChannels;
    // Reminders
    bookingReminder24h?: NotificationChannels;
    bookingReminder2h?: NotificationChannels;
    bookingReminder30min?: NotificationChannels;
    // Client management
    clientWelcome?: NotificationChannels;
    clientFirstBooking?: NotificationChannels;
    // Payments
    paymentReceived?: NotificationChannels;
    paymentFailed?: NotificationChannels;
    paymentRefunded?: NotificationChannels;
    invoiceGenerated?: NotificationChannels;
    // Subscriptions
    subscriptionExpiring?: NotificationChannels;
    subscriptionExpired?: NotificationChannels;
    subscriptionRenewed?: NotificationChannels;
    // Professional management
    professionalInvitation?: NotificationChannels;
    professionalAccountActivated?: NotificationChannels;
    professionalRemoved?: NotificationChannels;
    // Reviews
    newReviewReceived?: NotificationChannels;
    // Reports
    weeklyReport?: NotificationChannels;
    monthlyReport?: NotificationChannels;
    professionalCommissionReport?: NotificationChannels;
    // Entity management
    entityProfileApproved?: NotificationChannels;
    entityProfileRejected?: NotificationChannels;
    entityMaintenanceScheduled?: NotificationChannels;
    serviceAvailabilityUpdated?: NotificationChannels;
    // Security
    userLoginNewDevice?: NotificationChannels;
  };
}

interface NotificationTypeConfig {
  key: keyof NotificationPreferences["notifications"];
  label: string;
  description: string;
}

interface NotificationCategory {
  title: string;
  icon: React.ElementType;
  notifications: NotificationTypeConfig[];
  defaultExpanded?: boolean;
}

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    title: "Bookings & Appointments",
    icon: Calendar,
    defaultExpanded: true,
    notifications: [
      {
        key: "bookingCreated",
        label: "Booking Created",
        description: "When a new booking is created",
      },
      {
        key: "bookingConfirmed",
        label: "Booking Confirmed",
        description: "When a booking is confirmed",
      },
      {
        key: "bookingRescheduled",
        label: "Booking Rescheduled",
        description: "When a booking time is changed",
      },
      {
        key: "bookingCancelled",
        label: "Booking Cancelled",
        description: "When a booking is cancelled",
      },
      {
        key: "bookingCompleted",
        label: "Booking Completed",
        description: "When a booking is completed",
      },
      {
        key: "bookingNoShow",
        label: "Booking No-Show",
        description: "When a client doesn't show up",
      },
    ],
  },
  {
    title: "Appointment Reminders",
    icon: Bell,
    notifications: [
      {
        key: "bookingReminder24h",
        label: "24 Hours Before",
        description: "Reminder sent 24 hours before appointment",
      },
      {
        key: "bookingReminder2h",
        label: "2 Hours Before",
        description: "Reminder sent 2 hours before appointment",
      },
      {
        key: "bookingReminder30min",
        label: "30 Minutes Before",
        description: "Reminder sent 30 minutes before appointment",
      },
    ],
  },
  {
    title: "Client Management",
    icon: Users,
    notifications: [
      {
        key: "clientWelcome",
        label: "Welcome Message",
        description: "When a new client registers",
      },
      {
        key: "clientFirstBooking",
        label: "First Booking",
        description: "After client's first booking",
      },
    ],
  },
  {
    title: "Payments & Invoices",
    icon: DollarSign,
    notifications: [
      {
        key: "paymentReceived",
        label: "Payment Received",
        description: "When a payment is successfully received",
      },
      {
        key: "paymentFailed",
        label: "Payment Failed",
        description: "When a payment fails",
      },
      {
        key: "paymentRefunded",
        label: "Payment Refunded",
        description: "When a refund is processed",
      },
      {
        key: "invoiceGenerated",
        label: "Invoice Generated",
        description: "When a new invoice is created",
      },
    ],
  },
  {
    title: "Subscriptions",
    icon: CreditCard,
    notifications: [
      {
        key: "subscriptionExpiring",
        label: "Subscription Expiring",
        description: "Warning before subscription expires",
      },
      {
        key: "subscriptionExpired",
        label: "Subscription Expired",
        description: "When subscription has expired",
      },
      {
        key: "subscriptionRenewed",
        label: "Subscription Renewed",
        description: "When subscription is renewed",
      },
    ],
  },
  {
    title: "Team & Professionals",
    icon: Users,
    notifications: [
      {
        key: "professionalInvitation",
        label: "Professional Invitation",
        description: "When inviting a new team member",
      },
      {
        key: "professionalAccountActivated",
        label: "Account Activated",
        description: "When professional account is activated",
      },
      {
        key: "professionalRemoved",
        label: "Professional Removed",
        description: "When a professional is removed",
      },
    ],
  },
  {
    title: "Reviews & Feedback",
    icon: Star,
    notifications: [
      {
        key: "newReviewReceived",
        label: "New Review",
        description: "When a client leaves a review",
      },
    ],
  },
  {
    title: "Reports & Analytics",
    icon: FileText,
    notifications: [
      {
        key: "weeklyReport",
        label: "Weekly Report",
        description: "Weekly business performance report",
      },
      {
        key: "monthlyReport",
        label: "Monthly Report",
        description: "Monthly business performance report",
      },
      {
        key: "professionalCommissionReport",
        label: "Commission Report",
        description: "Professional commission calculations",
      },
    ],
  },
  {
    title: "Entity Management",
    icon: Settings,
    notifications: [
      {
        key: "entityProfileApproved",
        label: "Profile Approved",
        description: "When entity profile is approved",
      },
      {
        key: "entityProfileRejected",
        label: "Profile Rejected",
        description: "When entity profile is rejected",
      },
      {
        key: "entityMaintenanceScheduled",
        label: "Maintenance Scheduled",
        description: "System maintenance notifications",
      },
      {
        key: "serviceAvailabilityUpdated",
        label: "Service Availability",
        description: "When service availability changes",
      },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    notifications: [
      {
        key: "userLoginNewDevice",
        label: "New Device Login",
        description: "When logging in from a new device",
      },
    ],
  },
];

export default function NotificationPreferencesPage() {
  const { entity } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(
      NOTIFICATION_CATEGORIES.filter((c) => c.defaultExpanded).map(
        (c) => c.title
      )
    )
  );

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    notifications: {},
  });

  useEffect(() => {
    loadPreferences();
  }, [entity?.id]);

  const loadPreferences = async () => {
    if (!entity?.id) return;

    try {
      setLoading(true);
      const response = await entitiesService.getById(entity.id);
      const entityData = response.data;

      if (
        entityData &&
        "notificationSettings" in entityData &&
        entityData.notificationSettings
      ) {
        setPreferences({
          emailEnabled: true, // Always enabled
          smsEnabled: entityData.notificationSettings.smsEnabled || false,
          whatsappEnabled:
            entityData.notificationSettings.whatsappEnabled || false,
          notifications: entityData.notificationSettings.notifications || {},
        });
      }
    } catch (error: any) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!entity?.id) return;

    try {
      setSaving(true);
      console.log("Saving preferences:", preferences);
      await entitiesService.updateNotificationSettings(preferences);
      toast.success("Notification preferences saved successfully");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      console.error("Error details:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to save preferences"
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (title: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const updateNotificationChannel = (
    notificationKey: keyof NotificationPreferences["notifications"],
    channel: keyof NotificationChannels,
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notificationKey]: {
          email: prev.notifications[notificationKey]?.email ?? true,
          sms: prev.notifications[notificationKey]?.sms ?? false,
          whatsapp: prev.notifications[notificationKey]?.whatsapp ?? false,
          [channel]: value,
        },
      },
    }));
  };

  const getNotificationChannels = (
    notificationKey: keyof NotificationPreferences["notifications"]
  ): NotificationChannels => {
    return (
      preferences.notifications[notificationKey] || {
        email: true,
        sms: false,
        whatsapp: false,
      }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Notification Preferences
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Configure individual notification settings for each event type across
          all channels
        </p>
      </div>

      {/* Global Channel Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Global Channel Settings
          </CardTitle>
          <CardDescription>
            Enable or disable notification channels globally. Individual
            notifications can override these settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Email notifications are always enabled and cannot be disabled. SMS
              and WhatsApp are optional channels.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* Email - Always enabled */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-semibold">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Required - All notifications are sent via email
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Always Active
                </span>
              </div>
            </div>

            {/* SMS - Optional */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Label
                    htmlFor="sms-enabled"
                    className="text-base font-semibold cursor-pointer"
                  >
                    SMS
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send text messages to clients' mobile phones
                  </p>
                </div>
              </div>
              <Switch
                id="sms-enabled"
                checked={preferences.smsEnabled}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, smsEnabled: checked })
                }
              />
            </div>

            {/* WhatsApp - Optional */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <Label
                    htmlFor="whatsapp-enabled"
                    className="text-base font-semibold cursor-pointer"
                  >
                    WhatsApp
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send messages via WhatsApp Business
                  </p>
                </div>
              </div>
              <Switch
                id="whatsapp-enabled"
                checked={preferences.whatsappEnabled}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, whatsappEnabled: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Notification Settings */}
      {NOTIFICATION_CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isExpanded = expandedCategories.has(category.title);

        return (
          <Card key={category.title}>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleCategory(category.title)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {category.title}
                  <span className="text-sm text-muted-foreground font-normal">
                    ({category.notifications.length})
                  </span>
                </CardTitle>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-1 px-2 sm:px-6">
                {/* Table Header - Hidden on mobile, shown on desktop */}
                <div className="hidden md:grid grid-cols-[1fr,80px,80px,100px] gap-4 pb-3 border-b font-semibold text-sm">
                  <div>Notification</div>
                  <div className="text-center">Email</div>
                  <div className="text-center">SMS</div>
                  <div className="text-center">WhatsApp</div>
                </div>

                {/* Notification Rows */}
                {category.notifications.map((notification, index) => {
                  const channels = getNotificationChannels(notification.key);

                  return (
                    <div key={notification.key}>
                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-[1fr,80px,80px,100px] gap-4 py-4 items-center">
                        <div>
                          <Label className="text-base font-medium">
                            {notification.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>

                        {/* Email Toggle */}
                        <div className="flex justify-center">
                          <Switch
                            checked={channels.email}
                            onCheckedChange={(checked) =>
                              updateNotificationChannel(
                                notification.key,
                                "email",
                                checked
                              )
                            }
                          />
                        </div>

                        {/* SMS Toggle */}
                        <div className="flex justify-center">
                          <Switch
                            checked={channels.sms}
                            disabled={!preferences.smsEnabled}
                            onCheckedChange={(checked) =>
                              updateNotificationChannel(
                                notification.key,
                                "sms",
                                checked
                              )
                            }
                          />
                        </div>

                        {/* WhatsApp Toggle */}
                        <div className="flex justify-center">
                          <Switch
                            checked={channels.whatsapp}
                            disabled={!preferences.whatsappEnabled}
                            onCheckedChange={(checked) =>
                              updateNotificationChannel(
                                notification.key,
                                "whatsapp",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden py-3 space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            {notification.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {notification.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Email</span>
                          </div>
                          <Switch
                            checked={channels.email}
                            onCheckedChange={(checked) =>
                              updateNotificationChannel(
                                notification.key,
                                "email",
                                checked
                              )
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">SMS</span>
                          </div>
                          <Switch
                            checked={channels.sms}
                            disabled={!preferences.smsEnabled}
                            onCheckedChange={(checked) =>
                              updateNotificationChannel(
                                notification.key,
                                "sms",
                                checked
                              )
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">WhatsApp</span>
                          </div>
                          <Switch
                            checked={channels.whatsapp}
                            disabled={!preferences.whatsappEnabled}
                            onCheckedChange={(checked) =>
                              updateNotificationChannel(
                                notification.key,
                                "whatsapp",
                                checked
                              )
                            }
                          />
                        </div>
                      </div>

                      {index < category.notifications.length - 1 && (
                        <Separator />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 sm:bottom-4 bg-background pt-4 pb-2 sm:pb-0 border-t px-2 sm:px-0">
        <Button
          variant="outline"
          onClick={loadPreferences}
          disabled={loading || saving}
          className="w-full sm:w-auto"
        >
          Reset
        </Button>
        <Button
          onClick={savePreferences}
          disabled={saving}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
