import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { entitiesService, type Entity } from "../../services/entities.service";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { BusinessProfileManager } from "../../components/business-profile-manager";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Building2,
  Clock,
} from "lucide-react";

/**
 * Unified Settings Page - Adapts to user's plan (Simple, Individual, Business)
 * Consolidates all settings variations into a single adaptive component
 */
export default function UnifiedSettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const plan = user?.plan || "simple";
  const [activeTab, setActiveTab] = useState(
    plan === "business" ? "business" : "profile"
  );
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loadingEntity, setLoadingEntity] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load entity data
  useEffect(() => {
    const loadEntity = async () => {
      if (!user?.entityId) {
        setLoadingEntity(false);
        return;
      }

      try {
        const response = await entitiesService.getById(user.entityId);
        setEntity(response.data || null);
        // Initialize form data from entity
        if (response.data) {
          setProfileData({
            name: response.data.name || "",
            description: response.data.description || "",
            address: response.data.address || "",
            phone: (response.data as any).contactInfo?.phone || "",
            email: (response.data as any).contactInfo?.email || "",
            website: (response.data as any).contactInfo?.website || "",
            publicSlug: (response.data as any).publicSlug || "",
            logo: (response.data as any).branding?.logo || "",
            coverImage: (response.data as any).branding?.coverImage || "",
          });
        }
      } catch (error) {
        console.error("Failed to load entity:", error);
        toast.error(t("settings.errors.loadFailed"));
      } finally {
        setLoadingEntity(false);
      }
    };

    loadEntity();
  }, [user?.entityId, t]);

  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    publicSlug: "",
    logo: "",
    coverImage: "",
  });

  // Working Hours Settings (for Business/Individual)
  const [workingHours, setWorkingHours] = useState({
    monday: {
      enabled: true,
      start: "09:00",
      end: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
    },
    tuesday: {
      enabled: true,
      start: "09:00",
      end: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
    },
    wednesday: {
      enabled: true,
      start: "09:00",
      end: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
    },
    thursday: {
      enabled: true,
      start: "09:00",
      end: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
    },
    friday: {
      enabled: true,
      start: "09:00",
      end: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
    },
    saturday: {
      enabled: false,
      start: "09:00",
      end: "14:00",
      breakStart: "",
      breakEnd: "",
    },
    sunday: {
      enabled: false,
      start: "09:00",
      end: "14:00",
      breakStart: "",
      breakEnd: "",
    },
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false,
    newBookingAlert: true,
    cancellationAlert: true,
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    language: "en",
    currency: "EUR",
    timezone: "Europe/Lisbon",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "24h",
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    shareAnalytics: false,
    twoFactorAuth: false,
  });

  const handleSaveProfile = async () => {
    if (!user?.entityId) return;

    try {
      setSaving(true);
      // Use updateProfile method instead
      await entitiesService.updateProfile({
        name: profileData.name,
        description: profileData.description,
        address: profileData.address,
      } as any);
      toast.success(t("settings.success.profileSaved"));
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(t("settings.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = () => {
    toast.success(t("settings.success.settingsSaved"));
  };

  const languages = [
    { value: "en", label: "English" },
    { value: "pt", label: "Português" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
  ];

  const timezones = [
    { value: "Europe/Lisbon", label: "Europe/Lisbon (GMT+0)" },
    { value: "Europe/London", label: "Europe/London (GMT+0)" },
    { value: "Europe/Paris", label: "Europe/Paris (GMT+1)" },
    { value: "America/New_York", label: "America/New_York (GMT-5)" },
  ];

  if (loadingEntity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("settings.description")}
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          {plan === "business" && (
            <TabsTrigger value="business" className="gap-2">
              <Building2 className="w-4 h-4" />
              {t("settings.tabs.business")}
            </TabsTrigger>
          )}
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            {t("settings.tabs.profile")}
          </TabsTrigger>
          {(plan === "business" || plan === "individual") && (
            <TabsTrigger value="hours" className="gap-2">
              <Clock className="w-4 h-4" />
              {t("settings.tabs.workingHours")}
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            {t("settings.tabs.notifications")}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            {t("settings.tabs.appearance")}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="w-4 h-4" />
            {t("settings.tabs.privacy")}
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab (Business Plan Only) */}
        {plan === "business" && (
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.business.title")}</CardTitle>
                <CardDescription>
                  {t("settings.business.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entity && (
                  <BusinessProfileManager
                    entityId={(entity as any).id || user?.entityId || ""}
                    entityType={(entity as any).type || "business"}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profile.title")}</CardTitle>
              <CardDescription>
                {t("settings.profile.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("settings.profile.name")}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("settings.profile.phone")}</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("settings.profile.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  {t("settings.profile.description")}
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={profileData.description}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t("settings.profile.address")}</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t("settings.profile.website")}</Label>
                <Input
                  id="website"
                  type="url"
                  value={profileData.website}
                  onChange={(e) =>
                    setProfileData({ ...profileData, website: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving
                    ? t("settings.actions.saving")
                    : t("settings.actions.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Hours Tab (Business/Individual Only) */}
        {(plan === "business" || plan === "individual") && (
          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.workingHours.title")}</CardTitle>
                <CardDescription>
                  {t("settings.workingHours.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-2 w-32">
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) =>
                          setWorkingHours({
                            ...workingHours,
                            [day]: { ...hours, enabled: checked },
                          })
                        }
                      />
                      <Label className="capitalize">{day}</Label>
                    </div>
                    {hours.enabled && (
                      <div className="flex gap-2 flex-1">
                        <Input
                          type="time"
                          value={hours.start}
                          onChange={(e) =>
                            setWorkingHours({
                              ...workingHours,
                              [day]: { ...hours, start: e.target.value },
                            })
                          }
                        />
                        <span className="self-center">-</span>
                        <Input
                          type="time"
                          value={hours.end}
                          onChange={(e) =>
                            setWorkingHours({
                              ...workingHours,
                              [day]: { ...hours, end: e.target.value },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>
                    <Save className="w-4 h-4 mr-2" />
                    {t("settings.actions.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications.title")}</CardTitle>
              <CardDescription>
                {t("settings.notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.notifications.email")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.emailDesc")}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.notifications.sms")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.smsDesc")}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      smsNotifications: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.notifications.reminders")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.notifications.remindersDesc")}
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.appointmentReminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      appointmentReminders: checked,
                    })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  {t("settings.actions.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.appearance.title")}</CardTitle>
              <CardDescription>
                {t("settings.appearance.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("settings.appearance.theme")}</Label>
                  <Select
                    value={appearanceSettings.theme}
                    onValueChange={(value) =>
                      setAppearanceSettings({
                        ...appearanceSettings,
                        theme: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.appearance.language")}</Label>
                  <Select
                    value={appearanceSettings.language}
                    onValueChange={(value) =>
                      setAppearanceSettings({
                        ...appearanceSettings,
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.appearance.timezone")}</Label>
                  <Select
                    value={appearanceSettings.timezone}
                    onValueChange={(value) =>
                      setAppearanceSettings({
                        ...appearanceSettings,
                        timezone: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.appearance.currency")}</Label>
                  <Select
                    value={appearanceSettings.currency}
                    onValueChange={(value) =>
                      setAppearanceSettings({
                        ...appearanceSettings,
                        currency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  {t("settings.actions.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.privacy.title")}</CardTitle>
              <CardDescription>
                {t("settings.privacy.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.privacy.profileVisible")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.privacy.profileVisibleDesc")}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.profileVisible}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      profileVisible: checked,
                    })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.privacy.twoFactor")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.privacy.twoFactorDesc")}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      twoFactorAuth: checked,
                    })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  {t("settings.actions.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
