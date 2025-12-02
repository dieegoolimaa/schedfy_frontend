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
import { Textarea } from "../../components/ui/textarea";
import { BusinessProfileManager } from "../../components/business-profile-manager";
import { User, Shield, Save, Building2, Clock } from "lucide-react";

/**
 * Unified Settings Page - Adapts to user's plan (Simple, Individual, Business)
 * Consolidates all settings variations into a single adaptive component
 */
export default function UnifiedSettingsPage() {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const plan = user?.plan || "simple";
  const isOwnerOrManager = user?.role === "owner" || user?.role === "manager" || user?.role === "admin";

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
            phone: response.data.phone || "",
            email: response.data.email || "",
            website: response.data.website || "",
            publicSlug: response.data.username || "",
            logo: response.data.logo || "",
            coverImage: response.data.banner || "",
          });

          // Initialize working hours if available
          if ((response.data as any).workingHours) {
            setWorkingHours((response.data as any).workingHours);
          }
        }
      } catch (error) {
        console.error("Failed to load entity:", error);
        toast.error(t("errors.loadFailed"));
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

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    shareAnalytics: false,
    twoFactorAuth: false,
  });

  const handleSaveProfile = async () => {
    if (!user?.entityId) return;
    if (!isOwnerOrManager) {
      toast.error(t("errors.unauthorized", "Only owners can modify settings"));
      return;
    }

    try {
      setSaving(true);
      // Use updateProfile method instead
      await entitiesService.updateProfile({
        name: profileData.name,
        description: profileData.description,
        address: profileData.address,
        phone: profileData.phone,
        website: profileData.website,
      } as any);
      toast.success(t("success.profileSaved"));
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!isOwnerOrManager) {
      toast.error(t("errors.unauthorized", "Only owners can modify settings"));
      return;
    }

    try {
      setSaving(true);

      // Save Working Hours if applicable
      if (plan === "business" || plan === "individual") {
        await entitiesService.updateWorkingHours(workingHours);
      }

      // Note: Appearance settings are typically local or user-specific,
      // and Privacy settings might need a specific endpoint if not part of profile.
      // For now, we focus on saving Working Hours as requested.

      toast.success(t("success.settingsSaved"));
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
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
              {t("tabs.business")}
            </TabsTrigger>
          )}
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            {t("tabs.profile")}
          </TabsTrigger>
          {(plan === "business" || plan === "individual" || plan === "simple") && (
            <TabsTrigger value="hours" className="gap-2">
              <Clock className="w-4 h-4" />
              {t("tabs.workingHours")}
            </TabsTrigger>
          )}
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="w-4 h-4" />
            {t("tabs.privacy")}
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab (Business Plan Only) */}
        {plan === "business" && (
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                {entity && (
                  <BusinessProfileManager
                    entityId={entity.id || user?.entityId || ""}
                    entityType={entity.plan || "business"}
                    initialData={{
                      businessName: entity.name,
                      username: entity.username,
                      description: entity.description,
                      address: entity.address,
                      phone: entity.phone,
                      email: entity.email,
                      website: entity.website,
                      logo: entity.logo,
                      banner: entity.banner,
                      publicPageEnabled:
                        (entity as any).publicProfile?.enabled ?? true,
                    }}
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
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>{t("profile.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("profile.name")}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("profile.phone")}</Label>
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
                <Label htmlFor="email">{t("profile.email")}</Label>
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
                <Label htmlFor="description">{t("profile.description")}</Label>
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
                <Label htmlFor="address">{t("profile.address")}</Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t("profile.website")}</Label>
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
                <Button onClick={handleSaveProfile} disabled={saving || !isOwnerOrManager}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? t("actions.saving") : t("actions.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Hours Tab (Business/Individual/Simple) */}
        {(plan === "business" || plan === "individual" || plan === "simple") && (
          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("workingHours.title")}</CardTitle>
                <CardDescription>
                  {t("workingHours.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(workingHours)
                  .filter(([day]) =>
                    [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ].includes(day)
                  )
                  .map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 w-32">
                        <Switch
                          checked={hours.enabled}
                          disabled={!isOwnerOrManager}
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
                          <div className="relative flex-1">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="time"
                              disabled={!isOwnerOrManager}
                              value={hours.start}
                              onChange={(e) =>
                                setWorkingHours({
                                  ...workingHours,
                                  [day]: { ...hours, start: e.target.value },
                                })
                              }
                              className="pl-10"
                            />
                          </div>
                          <span className="self-center">-</span>
                          <div className="relative flex-1">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="time"
                              disabled={!isOwnerOrManager}
                              value={hours.end}
                              onChange={(e) =>
                                setWorkingHours({
                                  ...workingHours,
                                  [day]: { ...hours, end: e.target.value },
                                })
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={saving || !isOwnerOrManager}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? t("actions.saving") : t("actions.save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.title")}</CardTitle>
              <CardDescription>{t("privacy.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("privacy.profileVisible")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("privacy.profileVisibleDesc")}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.profileVisible}
                  disabled={!isOwnerOrManager}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({
                      ...privacySettings,
                      profileVisible: checked,
                    })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={!isOwnerOrManager}>
                  <Save className="w-4 h-4 mr-2" />
                  {t("actions.save")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
