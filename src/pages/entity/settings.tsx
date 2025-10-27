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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import {
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Clock,
  Camera,
  Save,
  AlertTriangle,
} from "lucide-react";

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");
  const [isCustomizeProfileOpen, setIsCustomizeProfileOpen] = useState(false);

  // Profile customization states
  const [profileData, setProfileData] = useState({
    businessName: "Premium Beauty Salon",
    description:
      "Your trusted partner for all beauty and wellness needs. We offer professional services in a relaxing and modern environment.",
    address: "Rua Augusta, 123, Lisboa, Portugal",
    phone: "+351 21 123 4567",
    email: "contact@premiumbeauty.com",
    website: "www.premiumbeauty.com",
    workingHours: {
      monday: { open: "09:00", close: "19:00", closed: false },
      tuesday: { open: "09:00", close: "19:00", closed: false },
      wednesday: { open: "09:00", close: "19:00", closed: false },
      thursday: { open: "09:00", close: "19:00", closed: false },
      friday: { open: "09:00", close: "19:00", closed: false },
      saturday: { open: "10:00", close: "18:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: false },
    },
    specialties: ["Hair Styling", "Nail Care", "Skincare", "Massage"],
    images: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    ],
    socialMedia: {
      facebook: "https://facebook.com/premiumbeauty",
      instagram: "https://instagram.com/premiumbeauty",
      tiktok: "",
    },
  });

  // Mock settings state
  const [settings, setSettings] = useState({
    // Profile
    firstName: "João",
    lastName: "Silva",
    email: "joao@schedfy.com",
    phone: "+351 123 456 789",
    avatar: "",

    // Business
    businessName: "Studio João Silva",
    businessType: "salon",
    address: "Rua das Flores, 123, Lisboa",
    website: "https://studiojoaosilva.com",
    description: "Professional hair and beauty services",

    // Working Hours
    workingHours: {
      monday: { enabled: true, start: "09:00", end: "18:00" },
      tuesday: { enabled: true, start: "09:00", end: "18:00" },
      wednesday: { enabled: true, start: "09:00", end: "18:00" },
      thursday: { enabled: true, start: "09:00", end: "18:00" },
      friday: { enabled: true, start: "09:00", end: "19:00" },
      saturday: { enabled: true, start: "10:00", end: "17:00" },
      sunday: { enabled: false, start: "10:00", end: "16:00" },
    },

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false,

    // Appearance
    theme: "light",
    language: "en",
    currency: "EUR",
    timezone: "Europe/Lisbon",

    // Privacy
    profileVisible: true,
    shareAnalytics: false,
    twoFactorAuth: false,
  });

  const businessTypes = [
    { value: "salon", label: "Hair Salon" },
    { value: "spa", label: "Spa & Wellness" },
    { value: "barbershop", label: "Barbershop" },
    { value: "clinic", label: "Medical Clinic" },
    { value: "studio", label: "Beauty Studio" },
    { value: "other", label: "Other" },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "pt", label: "Português" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
  ];

  const timezones = [
    { value: "Europe/Lisbon", label: "Europe/Lisbon" },
    { value: "Europe/Madrid", label: "Europe/Madrid" },
    { value: "America/New_York", label: "America/New_York" },
    { value: "America/Sao_Paulo", label: "America/Sao_Paulo" },
  ];

  const currencies = [
    { value: "EUR", label: "Euro (€)" },
    { value: "USD", label: "US Dollar ($)" },
    { value: "BRL", label: "Brazilian Real (R$)" },
    { value: "GBP", label: "British Pound (£)" },
  ];

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateWorkingHours = (day: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day as keyof typeof prev.workingHours],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("settings.title", "Settings")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings.subtitle", "Manage your account and preferences")}
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={settings.avatar} />
                    <AvatarFallback className="text-lg">
                      {settings.firstName[0]}
                      {settings.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateSetting("firstName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateSetting("lastName", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateSetting("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateSetting("phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Configure your business details and operating hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={settings.businessName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateSetting("businessName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={settings.businessType}
                      onValueChange={(value: string) =>
                        updateSetting("businessType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateSetting("address", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.website}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateSetting("website", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updateSetting("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <Separator />

                {/* Public Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Public Profile
                  </h3>
                  <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label>Your Public Profile URL</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value="https://schedfy.com/business/beauty-salon-premium"
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              "https://schedfy.com/business/beauty-salon-premium"
                            );
                            // Show toast notification
                            console.log(
                              "Public profile URL copied to clipboard"
                            );
                          }}
                        >
                          Copy Link
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Share this link with your clients so they can view your
                        services and book appointments online.
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Public Profile Visibility</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow clients to find and book with your business
                          online
                        </p>
                      </div>
                      <Switch
                        defaultChecked={true}
                        onCheckedChange={(checked) => {
                          console.log("Public profile visibility:", checked);
                        }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          window.open(
                            "https://schedfy.com/business/beauty-salon-premium",
                            "_blank"
                          );
                        }}
                      >
                        View Public Profile
                      </Button>
                      <Dialog
                        open={isCustomizeProfileOpen}
                        onOpenChange={setIsCustomizeProfileOpen}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline">Customize Profile</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Customize Public Profile</DialogTitle>
                            <DialogDescription>
                              Customize how your business appears to potential
                              clients. This information will be displayed on
                              your public booking page.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-6 py-4">
                            <Tabs defaultValue="basic" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">
                                  Basic Info
                                </TabsTrigger>
                                <TabsTrigger value="hours">
                                  Working Hours
                                </TabsTrigger>
                                <TabsTrigger value="media">
                                  Photos & Media
                                </TabsTrigger>
                                <TabsTrigger value="social">
                                  Social Links
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent value="basic" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="business-name">
                                      Business Name
                                    </Label>
                                    <Input
                                      id="business-name"
                                      value={profileData.businessName}
                                      onChange={(e) =>
                                        setProfileData({
                                          ...profileData,
                                          businessName: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                      id="phone"
                                      value={profileData.phone}
                                      onChange={(e) =>
                                        setProfileData({
                                          ...profileData,
                                          phone: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="description">
                                    Business Description
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
                                    placeholder="Describe your business and services..."
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="address">Address</Label>
                                  <Input
                                    id="address"
                                    value={profileData.address}
                                    onChange={(e) =>
                                      setProfileData({
                                        ...profileData,
                                        address: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      value={profileData.email}
                                      onChange={(e) =>
                                        setProfileData({
                                          ...profileData,
                                          email: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                      id="website"
                                      value={profileData.website}
                                      onChange={(e) =>
                                        setProfileData({
                                          ...profileData,
                                          website: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>Specialties</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {profileData.specialties.map(
                                      (specialty) => (
                                        <Badge
                                          key={specialty}
                                          variant="secondary"
                                          className="cursor-pointer"
                                        >
                                          {specialty}
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 ml-2"
                                            onClick={() => {
                                              const newSpecialties =
                                                profileData.specialties.filter(
                                                  (s) => s !== specialty
                                                );
                                              setProfileData({
                                                ...profileData,
                                                specialties: newSpecialties,
                                              });
                                            }}
                                          >
                                            ×
                                          </Button>
                                        </Badge>
                                      )
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newSpecialty =
                                          prompt("Enter specialty:");
                                        if (
                                          newSpecialty &&
                                          !profileData.specialties.includes(
                                            newSpecialty
                                          )
                                        ) {
                                          setProfileData({
                                            ...profileData,
                                            specialties: [
                                              ...profileData.specialties,
                                              newSpecialty,
                                            ],
                                          });
                                        }
                                      }}
                                    >
                                      Add Specialty
                                    </Button>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="hours" className="space-y-4">
                                <div className="space-y-4">
                                  {Object.entries(profileData.workingHours).map(
                                    ([day, hours]) => (
                                      <div
                                        key={day}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className="w-20 text-sm font-medium capitalize">
                                            {day}
                                          </div>
                                          <Switch
                                            checked={!hours.closed}
                                            onCheckedChange={(checked) => {
                                              const newHours = {
                                                ...profileData.workingHours,
                                                [day]: {
                                                  ...hours,
                                                  closed: !checked,
                                                },
                                              };
                                              setProfileData({
                                                ...profileData,
                                                workingHours: newHours,
                                              });
                                            }}
                                          />
                                        </div>
                                        {!hours.closed && (
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              type="time"
                                              value={hours.open}
                                              onChange={(e) => {
                                                const newHours = {
                                                  ...profileData.workingHours,
                                                  [day]: {
                                                    ...hours,
                                                    open: e.target.value,
                                                  },
                                                };
                                                setProfileData({
                                                  ...profileData,
                                                  workingHours: newHours,
                                                });
                                              }}
                                              className="w-24"
                                            />
                                            <span className="text-muted-foreground">
                                              to
                                            </span>
                                            <Input
                                              type="time"
                                              value={hours.close}
                                              onChange={(e) => {
                                                const newHours = {
                                                  ...profileData.workingHours,
                                                  [day]: {
                                                    ...hours,
                                                    close: e.target.value,
                                                  },
                                                };
                                                setProfileData({
                                                  ...profileData,
                                                  workingHours: newHours,
                                                });
                                              }}
                                              className="w-24"
                                            />
                                          </div>
                                        )}
                                        {hours.closed && (
                                          <div className="text-sm text-muted-foreground">
                                            Closed
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </TabsContent>

                              <TabsContent value="media" className="space-y-4">
                                <div className="space-y-4">
                                  <div>
                                    <Label>Business Photos</Label>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      Upload photos that showcase your business,
                                      services, and atmosphere.
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                      {profileData.images.map((image) => (
                                        <div
                                          key={image}
                                          className="relative group"
                                        >
                                          <img
                                            src={image}
                                            alt="Business showcase"
                                            className="w-full h-32 object-cover rounded-lg"
                                          />
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => {
                                              const newImages =
                                                profileData.images.filter(
                                                  (img) => img !== image
                                                );
                                              setProfileData({
                                                ...profileData,
                                                images: newImages,
                                              });
                                            }}
                                          >
                                            ×
                                          </Button>
                                        </div>
                                      ))}
                                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                                        <div className="text-center">
                                          <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                          <p className="text-sm text-muted-foreground">
                                            Add Photo
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="social" className="space-y-4">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                      id="facebook"
                                      value={profileData.socialMedia.facebook}
                                      onChange={(e) =>
                                        setProfileData({
                                          ...profileData,
                                          socialMedia: {
                                            ...profileData.socialMedia,
                                            facebook: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="https://facebook.com/yourbusiness"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                      id="instagram"
                                      value={profileData.socialMedia.instagram}
                                      onChange={(e) =>
                                        setProfileData({
                                          ...profileData,
                                          socialMedia: {
                                            ...profileData.socialMedia,
                                            instagram: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="https://instagram.com/yourbusiness"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="tiktok">TikTok</Label>
                                    <Input
                                      id="tiktok"
                                      value={profileData.socialMedia.tiktok}
                                      onChange={(e) =>
                                        setProfileData({
                                          ...profileData,
                                          socialMedia: {
                                            ...profileData.socialMedia,
                                            tiktok: e.target.value,
                                          },
                                        })
                                      }
                                      placeholder="https://tiktok.com/@yourbusiness"
                                    />
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>

                          <div className="flex justify-between gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={() => setIsCustomizeProfileOpen(false)}
                            >
                              Cancel
                            </Button>
                            <div className="flex gap-2">
                              <Button variant="outline">Preview</Button>
                              <Button
                                onClick={() => {
                                  console.log(
                                    "Saving profile data:",
                                    profileData
                                  );
                                  setIsCustomizeProfileOpen(false);
                                }}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Working Hours
                  </h3>
                  <div className="space-y-4">
                    {daysOfWeek.map((day) => {
                      const daySettings =
                        settings.workingHours[
                          day.key as keyof typeof settings.workingHours
                        ];
                      return (
                        <div
                          key={day.key}
                          className="flex items-center space-x-4"
                        >
                          <div className="w-24">
                            <Label>{day.label}</Label>
                          </div>
                          <Switch
                            checked={daySettings.enabled}
                            onCheckedChange={(checked: boolean) =>
                              updateWorkingHours(day.key, "enabled", checked)
                            }
                          />
                          {daySettings.enabled && (
                            <>
                              <Input
                                type="time"
                                value={daySettings.start}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  updateWorkingHours(
                                    day.key,
                                    "start",
                                    e.target.value
                                  )
                                }
                                className="w-32"
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={daySettings.end}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  updateWorkingHours(
                                    day.key,
                                    "end",
                                    e.target.value
                                  )
                                }
                                className="w-32"
                              />
                            </>
                          )}
                          {!daySettings.enabled && (
                            <Badge variant="secondary">Closed</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about appointments and
                  updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked: boolean) =>
                        updateSetting("emailNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via text message
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked: boolean) =>
                        updateSetting("smsNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Send reminders to clients before appointments
                      </p>
                    </div>
                    <Switch
                      checked={settings.appointmentReminders}
                      onCheckedChange={(checked: boolean) =>
                        updateSetting("appointmentReminders", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and updates
                      </p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked: boolean) =>
                        updateSetting("marketingEmails", checked)
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Appearance & Localization
                </CardTitle>
                <CardDescription>
                  Customize your interface and regional settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: string) =>
                        updateSetting("theme", value)
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
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value: string) =>
                        updateSetting("language", value)
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value: string) =>
                        updateSetting("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value: string) =>
                        updateSetting("timezone", value)
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
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security & Privacy
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked: boolean) =>
                        updateSetting("twoFactorAuth", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <Switch
                      checked={settings.profileVisible}
                      onCheckedChange={(checked: boolean) =>
                        updateSetting("profileVisible", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve by sharing anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={settings.shareAnalytics}
                      onCheckedChange={(checked: boolean) =>
                        updateSetting("shareAnalytics", checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center text-destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Danger Zone
                  </h4>
                  <div className="p-4 border border-destructive/20 rounded-lg">
                    <div className="space-y-2">
                      <h5 className="font-medium">Delete Account</h5>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
