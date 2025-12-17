import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  MessageSquare,
  Smartphone,
  Bell,
  Save,
  Info,
  Calendar,
  Users,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Mail,
  CheckCircle,
  DollarSign,
  CreditCard,
  Star,
  FileText,
  Settings,
  Shield,
  Building2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Separator } from "../../components/ui/separator";
import { BOOKING_NOTIFICATION_EVENTS, NotificationEvent } from "../../types/enums/notification-event.enum";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";

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
    [key: string]: NotificationChannels | undefined;
  };
}

interface NotificationTypeConfig {
  key: string;
  label: string;
  description: string;
}

interface NotificationCategory {
  title: string;
  icon: React.ElementType;
  notifications: NotificationTypeConfig[];
  defaultExpanded?: boolean;
}

// Client notifications - what the business sends to clients
const CLIENT_NOTIFICATION_CATEGORIES: NotificationCategory[] = [
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
    defaultExpanded: true,
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
    defaultExpanded: true,
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
];

// Business notifications - what the business receives
const BUSINESS_NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    title: "Payments & Invoices",
    icon: DollarSign,
    defaultExpanded: true,
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
  const { t } = useTranslation("notifications");
  const { user, entity } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [activeTab, setActiveTab] = useState("client");

  // Helper to check if a notification key corresponds to a booking event
  const isBookingEvent = (key: string): boolean => {
    const snakeCaseKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    return BOOKING_NOTIFICATION_EVENTS.includes(snakeCaseKey as NotificationEvent);
  };

  // Filter client categories to only include booking events
  const filteredClientCategories = CLIENT_NOTIFICATION_CATEGORIES.map(category => ({
    ...category,
    notifications: category.notifications.filter(n => isBookingEvent(n.key))
  })).filter(category => category.notifications.length > 0);

  const [expandedClientCategories, setExpandedClientCategories] = useState<Set<string>>(
    new Set(filteredClientCategories.map((c) => c.title))
  );

  const [expandedBusinessCategories, setExpandedBusinessCategories] = useState<Set<string>>(
    new Set(BUSINESS_NOTIFICATION_CATEGORIES.filter(c => c.defaultExpanded).map((c) => c.title))
  );

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    notifications: {},
  });

  useEffect(() => {
    if (entity?.id || user?.entityId) {
      loadPreferences();
    }
  }, [entity?.id, user?.entityId]);

  const loadPreferences = async () => {
    const entityId = entity?.id || user?.entityId;
    if (!entityId) return;

    try {
      setLoading(true);
      const response = await entitiesService.getById(entityId);
      const entityData = response.data;

      if (entityData) {
        setCurrentPlan(entityData.plan || "");

        if (entityData.notificationSettings) {
          const mappedNotifications: { [key: string]: NotificationChannels } = {};

          if (entityData.notificationSettings.notifications) {
            Object.entries(entityData.notificationSettings.notifications).forEach(([key, value]: [string, any]) => {
              // Skip internal keys
              if (key === '_id' || key === 'id') return;

              if (value) {
                mappedNotifications[key] = {
                  email: value.email ?? true,
                  sms: value.sms ?? false,
                  whatsapp: value.whatsapp ?? false,
                };
              }
            });
          }

          setPreferences({
            emailEnabled: entityData.notificationSettings.emailEnabled ?? true,
            smsEnabled: entityData.notificationSettings.smsEnabled || false,
            whatsappEnabled:
              entityData.notificationSettings.whatsappEnabled || false,
            notifications: mappedNotifications,
          });
        }
      }
    } catch (error: any) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    const entityId = entity?.id || user?.entityId;

    if (!entityId) {
      toast.error("Entity ID not found. Cannot save preferences.");
      return;
    }

    try {
      setSaving(true);

      // Clean notifications object to remove undefined values
      const cleanNotifications: { [key: string]: { email?: boolean; sms?: boolean; whatsapp?: boolean } } = {};
      Object.entries(preferences.notifications).forEach(([key, value]) => {
        if (value) {
          cleanNotifications[key] = value;
        }
      });

      const payload = {
        ...preferences,
        notifications: cleanNotifications
      };

      console.log("Saving preferences:", payload);
      await entitiesService.updateNotificationSettings(payload);
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

  const toggleClientCategory = (title: string) => {
    setExpandedClientCategories((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const toggleBusinessCategory = (title: string) => {
    setExpandedBusinessCategories((prev) => {
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
    notificationKey: string,
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
    notificationKey: string
  ): NotificationChannels => {
    return (
      preferences.notifications[notificationKey] || {
        email: true,
        sms: false,
        whatsapp: false,
      }
    );
  };

  const isSimplePlan = (currentPlan || "").toLowerCase() === 'simple';

  if (isSimplePlan) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
        <div className="px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              {t("simplePlan.title")}
            </CardTitle>
            <CardDescription>
              {t("simplePlan.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Label className="text-base font-semibold">{t("channels.email.title")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("channels.email.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {t("channels.email.enabled")}
                </span>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t("upgrade.title")}</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">
                  {t("upgrade.description")}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
                  <li>{t("upgrade.features.sms")}</li>
                  <li>{t("upgrade.features.whatsapp")}</li>
                  <li>{t("upgrade.features.firstBooking")}</li>
                </ul>
                <Button variant="outline" onClick={() => window.location.href = '/subscription'}>
                  {t("upgrade.button")}
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render a category card
  const renderCategoryCard = (
    category: NotificationCategory,
    isClientSection: boolean,
    expandedCategories: Set<string>,
    toggleCategory: (title: string) => void
  ) => {
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
            <div className={`hidden md:grid ${isClientSection ? 'grid-cols-[1fr,100px,100px]' : 'grid-cols-[1fr,100px,100px,100px]'} gap-4 pb-3 border-b font-semibold text-sm`}>
              <div>Notification</div>
              {!isClientSection && <div className="text-center">Email</div>}
              <div className="text-center">SMS</div>
              <div className="text-center">WhatsApp</div>
            </div>

            {/* Notification Rows */}
            {category.notifications.map((notification, index) => {
              const channels = getNotificationChannels(notification.key);
              const canUseSms = preferences.smsEnabled;
              const canUseWhatsapp = preferences.whatsappEnabled;

              return (
                <div key={notification.key}>
                  {/* Desktop Layout */}
                  <div className={`hidden md:grid ${isClientSection ? 'grid-cols-[1fr,100px,100px]' : 'grid-cols-[1fr,100px,100px,100px]'} gap-4 py-4 items-center`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="text-base font-medium">
                          {notification.label}
                        </Label>
                        {isClientSection && (
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground font-normal gap-1">
                              <Mail className="h-3 w-3" /> Email
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground font-normal gap-1">
                              <Bell className="h-3 w-3" /> In-App
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>

                    {/* Email Toggle - Only for business notifications */}
                    {!isClientSection && (
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
                    )}

                    {/* SMS Toggle */}
                    <div className="flex justify-center">
                      <Switch
                        checked={channels.sms}
                        disabled={!canUseSms}
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
                        disabled={!canUseWhatsapp}
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
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="text-sm font-medium">
                          {notification.label}
                        </Label>
                        {isClientSection && (
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground font-normal gap-1">
                              <Mail className="h-3 w-3" /> Email
                            </Badge>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted text-muted-foreground font-normal gap-1">
                              <Bell className="h-3 w-3" /> In-App
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>

                    {/* Email Toggle - Only for business notifications */}
                    {!isClientSection && (
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
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">SMS</span>
                      </div>
                      <Switch
                        checked={channels.sms}
                        disabled={!canUseSms}
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
                        disabled={!canUseWhatsapp}
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

                  {/* Line Separator */}
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
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Notification Preferences
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Configure notifications for your clients and your business.
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
            Enable or disable notification channels globally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* SMS - Optional */}
            <div className={`flex items-center justify-between p-4 border rounded-lg`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <Label
                    htmlFor="sms-enabled"
                    className="text-base font-semibold cursor-pointer"
                  >
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send text messages for booking events
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
            <div className={`flex items-center justify-between p-4 border rounded-lg`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <Label
                    htmlFor="whatsapp-enabled"
                    className="text-base font-semibold cursor-pointer"
                  >
                    WhatsApp Notifications
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

      {/* Tabs for Client vs Business Notifications */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client" className="gap-2">
            <Users className="h-4 w-4" />
            Client Notifications
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Business Notifications
          </TabsTrigger>
        </TabsList>

        {/* Client Notifications Tab */}
        <TabsContent value="client" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure which notifications your clients receive. Email and In-App notifications are always sent to ensure clients stay informed about their bookings.
            </AlertDescription>
          </Alert>

          {filteredClientCategories.map((category) =>
            renderCategoryCard(category, true, expandedClientCategories, toggleClientCategory)
          )}
        </TabsContent>

        {/* Business Notifications Tab */}
        <TabsContent value="business" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure which notifications you receive about your business. You can enable or disable email notifications for each type.
            </AlertDescription>
          </Alert>

          {BUSINESS_NOTIFICATION_CATEGORIES.map((category) =>
            renderCategoryCard(category, false, expandedBusinessCategories, toggleBusinessCategory)
          )}
        </TabsContent>
      </Tabs>

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
