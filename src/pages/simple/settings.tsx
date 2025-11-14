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
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
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
import {
  Settings,
  Store,
  Clock,
  Bell,
  Eye,
  Save,
  Loader2,
  Calendar,
} from "lucide-react";
import { BusinessProfileManager } from "../../components/business-profile-manager";

export function SimpleSettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loadingEntity, setLoadingEntity] = useState(true);

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
      } catch (error) {
        console.error("Failed to load entity:", error);
        toast.error("Failed to load business profile");
      } finally {
        setLoadingEntity(false);
      }
    };

    loadEntity();
  }, [user?.entityId]);

  // Entity Profile Settings
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

  // Working Hours Settings
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

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    defaultSlotDuration: 30,
    slotBuffer: 0,
    advanceBookingDays: 30,
    cancellationPolicy: 24,
    allowOnlineBooking: true,
    requireApproval: false,
    sendConfirmationEmail: true,
    sendReminderSMS: false,
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailBookingCreated: true,
    emailBookingCancelled: true,
    emailBookingReminder: true,
    smsBookingReminder: false,
    smsBookingConfirmation: false,
    pushNotifications: true,
  });

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  });

  // Load entity data when component mounts
  useEffect(() => {
    const loadEntityData = async () => {
      if (!user?.entityId && !user?.id) return;

      setLoading(true);
      try {
        // TODO: Replace with actual API call to fetch entity data
        // Mock data - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Set default profile data based on user's entity
        setProfileData({
          name: user.name || "",
          description: "",
          address: "",
          phone: "",
          email: user.email || "",
          website: "",
          publicSlug: "",
          logo: "",
          coverImage: "",
        });
      } catch (error) {
        toast.error("Failed to load entity settings");
      } finally {
        setLoading(false);
      }
    };

    loadEntityData();
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // TODO: API call to save entity profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile settings saved successfully");
    } catch (error) {
      toast.error("Failed to save profile settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkingHours = async () => {
    setLoading(true);
    try {
      // TODO: API call to save working hours
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Working hours saved successfully");
    } catch (error) {
      toast.error("Failed to save working hours");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBookingSettings = async () => {
    setLoading(true);
    try {
      // TODO: API call to save booking settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Booking settings saved successfully");
    } catch (error) {
      toast.error("Failed to save booking settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // TODO: API call to save notification settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    } finally {
      setLoading(false);
    }
  };

  const generatePublicUrl = () => {
    if (profileData.publicSlug) {
      return `${window.location.origin}/book/${profileData.publicSlug}`;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">
            {t("settings.title", "Settings")}
          </h1>
          <p className="text-muted-foreground">
            Manage your business settings and preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Booking</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          {loadingEntity ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">
                  Loading business profile...
                </p>
              </CardContent>
            </Card>
          ) : (
            <BusinessProfileManager
              entityType={
                (user?.plan as "simple" | "individual" | "business") || "simple"
              }
              entityId={user?.entityId || user?.id || ""}
              initialData={{
                businessName: entity?.name || "",
                username: entity?.username || "",
                description: entity?.description || "",
                address: entity?.address || "",
                phone: entity?.phone || "",
                email: entity?.email || "",
                website: entity?.website || "",
                logo: entity?.logo,
                banner: entity?.banner,
                publicPageEnabled: true,
              }}
              onSave={(data) => {
                console.log("Saving business profile:", data);
                toast.success("Business profile updated successfully!");
                // Reload entity data
                const entityIdToLoad = user?.entityId || user?.id;
                if (entityIdToLoad) {
                  entitiesService.getById(entityIdToLoad).then((response) => {
                    setEntity(response.data || null);
                  });
                }
              }}
            />
          )}
        </TabsContent>

        {/* Working Hours */}
        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Working Hours
              </CardTitle>
              <CardDescription>
                Set your business operating hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={
                          workingHours[day.key as keyof typeof workingHours]
                            .enabled
                        }
                        onCheckedChange={(checked) =>
                          setWorkingHours({
                            ...workingHours,
                            [day.key]: {
                              ...workingHours[
                                day.key as keyof typeof workingHours
                              ],
                              enabled: checked,
                            },
                          })
                        }
                      />
                      <Label className="text-sm font-medium capitalize">
                        {day.label}
                      </Label>
                    </div>
                  </div>
                  {workingHours[day.key as keyof typeof workingHours]
                    .enabled && (
                    <div className="grid gap-3 sm:grid-cols-4 ml-8">
                      <div className="space-y-1">
                        <Label className="text-xs">Start</Label>
                        <Select
                          value={
                            workingHours[day.key as keyof typeof workingHours]
                              .start
                          }
                          onValueChange={(value) =>
                            setWorkingHours({
                              ...workingHours,
                              [day.key]: {
                                ...workingHours[
                                  day.key as keyof typeof workingHours
                                ],
                                start: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End</Label>
                        <Select
                          value={
                            workingHours[day.key as keyof typeof workingHours]
                              .end
                          }
                          onValueChange={(value) =>
                            setWorkingHours({
                              ...workingHours,
                              [day.key]: {
                                ...workingHours[
                                  day.key as keyof typeof workingHours
                                ],
                                end: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Break Start</Label>
                        <Select
                          value={
                            workingHours[day.key as keyof typeof workingHours]
                              .breakStart || "no-break"
                          }
                          onValueChange={(value) =>
                            setWorkingHours({
                              ...workingHours,
                              [day.key]: {
                                ...workingHours[
                                  day.key as keyof typeof workingHours
                                ],
                                breakStart: value === "no-break" ? "" : value,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Optional" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-break">No break</SelectItem>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Break End</Label>
                        <Select
                          value={
                            workingHours[day.key as keyof typeof workingHours]
                              .breakEnd || "no-break"
                          }
                          onValueChange={(value) =>
                            setWorkingHours({
                              ...workingHours,
                              [day.key]: {
                                ...workingHours[
                                  day.key as keyof typeof workingHours
                                ],
                                breakEnd: value === "no-break" ? "" : value,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Optional" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-break">No break</SelectItem>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end">
                <Button onClick={handleSaveWorkingHours} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Hours
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Settings
              </CardTitle>
              <CardDescription>
                Configure how clients can book appointments with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Appointment Duration</Label>
                  <Select
                    value={bookingSettings.defaultSlotDuration.toString()}
                    onValueChange={(value) =>
                      setBookingSettings({
                        ...bookingSettings,
                        defaultSlotDuration: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Buffer Time Between Bookings</Label>
                  <Select
                    value={bookingSettings.slotBuffer.toString()}
                    onValueChange={(value) =>
                      setBookingSettings({
                        ...bookingSettings,
                        slotBuffer: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Advance Booking Limit</Label>
                  <Select
                    value={bookingSettings.advanceBookingDays.toString()}
                    onValueChange={(value) =>
                      setBookingSettings({
                        ...bookingSettings,
                        advanceBookingDays: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                      <SelectItem value="60">2 months</SelectItem>
                      <SelectItem value="90">3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cancellation Policy</Label>
                  <Select
                    value={bookingSettings.cancellationPolicy.toString()}
                    onValueChange={(value) =>
                      setBookingSettings({
                        ...bookingSettings,
                        cancellationPolicy: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour before</SelectItem>
                      <SelectItem value="2">2 hours before</SelectItem>
                      <SelectItem value="4">4 hours before</SelectItem>
                      <SelectItem value="24">24 hours before</SelectItem>
                      <SelectItem value="48">48 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Online Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable clients to book online through your public page
                    </p>
                  </div>
                  <Switch
                    checked={bookingSettings.allowOnlineBooking}
                    onCheckedChange={(checked) =>
                      setBookingSettings({
                        ...bookingSettings,
                        allowOnlineBooking: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Bookings need your approval before being confirmed
                    </p>
                  </div>
                  <Switch
                    checked={bookingSettings.requireApproval}
                    onCheckedChange={(checked) =>
                      setBookingSettings({
                        ...bookingSettings,
                        requireApproval: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBookingSettings} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about bookings and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Booking Created</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a client books an appointment
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailBookingCreated}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          emailBookingCreated: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Booking Cancelled</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a booking is cancelled
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailBookingCancelled}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          emailBookingCancelled: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Daily summary of upcoming appointments
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailBookingReminder}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          emailBookingReminder: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">SMS Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Booking Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        SMS reminders 24h before appointments
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsBookingReminder}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          smsBookingReminder: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Booking Confirmations</Label>
                      <p className="text-sm text-muted-foreground">
                        SMS confirmation when bookings are created
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsBookingConfirmation}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          smsBookingConfirmation: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Browser notifications for real-time updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
