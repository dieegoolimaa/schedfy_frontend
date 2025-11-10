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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Edit,
  Camera,
  Save,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  CreditCard,
} from "lucide-react";

export function EntityProfilePage() {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);

  // Mock entity data
  const entityData = {
    id: 1,
    name: "Bella Vita Salon & Spa",
    type: "Beauty Salon",
    description:
      "Premium beauty salon offering comprehensive hair, nail, and wellness services in the heart of Lisbon. Our experienced team provides personalized treatments in a relaxing, modern environment.",
    logo: "",
    coverImage: "",
    contact: {
      email: "info@bellavita.pt",
      phone: "+351 123 456 789",
      website: "https://bellavita.pt",
      instagram: "@bellavita_salon",
      address: {
        street: "Rua das Flores, 123",
        city: "Lisboa",
        postalCode: "1200-100",
        country: "Portugal",
      },
    },
    workingHours: {
      monday: {
        enabled: true,
        start: "09:00",
        end: "19:00",
        breakStart: "",
        breakEnd: "",
      },
      tuesday: {
        enabled: true,
        start: "09:00",
        end: "19:00",
        breakStart: "",
        breakEnd: "",
      },
      wednesday: {
        enabled: true,
        start: "09:00",
        end: "19:00",
        breakStart: "",
        breakEnd: "",
      },
      thursday: {
        enabled: true,
        start: "09:00",
        end: "20:00",
        breakStart: "",
        breakEnd: "",
      },
      friday: {
        enabled: true,
        start: "09:00",
        end: "20:00",
        breakStart: "",
        breakEnd: "",
      },
      saturday: {
        enabled: true,
        start: "10:00",
        end: "18:00",
        breakStart: "",
        breakEnd: "",
      },
      sunday: {
        enabled: false,
        start: "10:00",
        end: "17:00",
        breakStart: "",
        breakEnd: "",
      },
    },
    socialMedia: {
      instagram: "@bellavitasalon",
      facebook: "BellaVitaSalonSpa",
      twitter: "@bellavitaspa",
      linkedin: "bella-vita-salon-spa",
    },
    settings: {
      onlineBooking: true,
      emailNotifications: true,
      smsNotifications: true,
      publicProfile: true,
      showPrices: true,
      allowCancellation: true,
      requireDeposit: false,
      autoConfirm: false,
    },
    subscription: {
      plan: "Business",
      status: "active",
      validUntil: "2024-12-31",
      features: [
        "Unlimited bookings",
        "Multi-professional management",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
    },
    stats: {
      totalBookings: 2847,
      activeClients: 642,
      professionals: 8,
      averageRating: 4.7,
      totalRevenue: 187420,
      thisMonthBookings: 156,
      thisMonthRevenue: 12340,
    },
  };

  const weekDays = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const subscriptionColors = {
    Simple: "bg-blue-100 text-blue-800 border-blue-200",
    Individual: "bg-purple-100 text-purple-800 border-purple-200",
    Business: "bg-gold-100 text-gold-800 border-gold-200",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("entityProfile.title", "Entity Profile")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "entityProfile.subtitle",
              "Manage your business profile and settings"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
              {editMode && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button variant="secondary" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Cover
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={entityData.logo} />
                  <AvatarFallback>
                    <Building2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  {editMode ? (
                    <Input
                      defaultValue={entityData.name}
                      className="text-2xl font-bold h-auto p-2"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{entityData.name}</h2>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{entityData.type}</Badge>
                    <Badge
                      variant="outline"
                      className={
                        subscriptionColors[
                          entityData.subscription
                            .plan as keyof typeof subscriptionColors
                        ]
                      }
                    >
                      {entityData.subscription.plan} Plan
                    </Badge>
                  </div>
                </div>

                {editMode ? (
                  <Textarea
                    defaultValue={entityData.description}
                    placeholder="Business description..."
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {entityData.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {entityData.stats.totalBookings.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Bookings
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {entityData.stats.activeClients}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Active Clients
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {entityData.stats.professionals}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Professionals
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                      <Star className="h-5 w-5 mr-1" />
                      {entityData.stats.averageRating}
                    </div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Manage your business contact details and address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {editMode ? (
                      <Input
                        id="email"
                        defaultValue={entityData.contact.email}
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">{entityData.contact.email}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {editMode ? (
                      <Input
                        id="phone"
                        defaultValue={entityData.contact.phone}
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">{entityData.contact.phone}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {editMode ? (
                      <Input
                        id="website"
                        defaultValue={entityData.contact.website}
                        className="flex-1"
                      />
                    ) : (
                      <a
                        href={entityData.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-blue-600 hover:underline"
                      >
                        {entityData.contact.website}
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    {editMode ? (
                      <Input
                        id="instagram"
                        placeholder="@username"
                        defaultValue={entityData.contact.instagram}
                        className="flex-1"
                      />
                    ) : entityData.contact.instagram ? (
                      <a
                        href={`https://instagram.com/${entityData.contact.instagram.replace(
                          "@",
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-blue-600 hover:underline"
                      >
                        {entityData.contact.instagram}
                      </a>
                    ) : (
                      <span className="flex-1 text-muted-foreground">
                        Not set
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    {editMode ? (
                      <Input
                        id="street"
                        defaultValue={entityData.contact.address.street}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{entityData.contact.address.street}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {editMode ? (
                      <Input
                        id="city"
                        defaultValue={entityData.contact.address.city}
                      />
                    ) : (
                      <span>{entityData.contact.address.city}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal Code</Label>
                    {editMode ? (
                      <Input
                        id="postal"
                        defaultValue={entityData.contact.address.postalCode}
                      />
                    ) : (
                      <span>{entityData.contact.address.postalCode}</span>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    {editMode ? (
                      <Select
                        defaultValue={entityData.contact.address.country.toLowerCase()}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portugal">Portugal</SelectItem>
                          <SelectItem value="brazil">Brazil</SelectItem>
                          <SelectItem value="usa">United States</SelectItem>
                          <SelectItem value="spain">Spain</SelectItem>
                          <SelectItem value="france">France</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>{entityData.contact.address.country}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>
                Set your operating hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weekDays.map((day) => {
                const dayData =
                  entityData.workingHours[
                    day.key as keyof typeof entityData.workingHours
                  ];
                return (
                  <div
                    key={day.key}
                    className="flex items-center space-x-4 py-2"
                  >
                    <div className="w-24">
                      <Label className="font-medium">{day.label}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={dayData.enabled} disabled={!editMode} />
                      {dayData.enabled ? (
                        <div className="flex items-center space-x-2">
                          {editMode ? (
                            <>
                              <Input
                                type="time"
                                defaultValue={dayData.start}
                                className="w-32"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                defaultValue={dayData.end}
                                className="w-32"
                              />
                            </>
                          ) : (
                            <span className="text-sm">
                              {dayData.start} - {dayData.end}
                              {dayData.breakStart && dayData.breakEnd && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  (Break: {dayData.breakStart} -{" "}
                                  {dayData.breakEnd})
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Connect your social media accounts to increase visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="flex items-center space-x-2">
                    <Instagram className="h-4 w-4 text-pink-500" />
                    {editMode ? (
                      <Input
                        id="instagram"
                        defaultValue={entityData.socialMedia.instagram}
                        placeholder="@username"
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">
                        {entityData.socialMedia.instagram}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="flex items-center space-x-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    {editMode ? (
                      <Input
                        id="facebook"
                        defaultValue={entityData.socialMedia.facebook}
                        placeholder="Page name"
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">
                        {entityData.socialMedia.facebook}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <div className="flex items-center space-x-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    {editMode ? (
                      <Input
                        id="twitter"
                        defaultValue={entityData.socialMedia.twitter}
                        placeholder="@username"
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">
                        {entityData.socialMedia.twitter}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    {editMode ? (
                      <Input
                        id="linkedin"
                        defaultValue={entityData.socialMedia.linkedin}
                        placeholder="Company name"
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">
                        {entityData.socialMedia.linkedin}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Settings</CardTitle>
                <CardDescription>
                  Configure how customers can book your services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Online Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow customers to book appointments online
                    </p>
                  </div>
                  <Switch
                    checked={entityData.settings.onlineBooking}
                    disabled={!editMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show Prices</Label>
                    <p className="text-sm text-muted-foreground">
                      Display service prices to customers
                    </p>
                  </div>
                  <Switch
                    checked={entityData.settings.showPrices}
                    disabled={!editMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Cancellation</Label>
                    <p className="text-sm text-muted-foreground">
                      Let customers cancel their bookings
                    </p>
                  </div>
                  <Switch
                    checked={entityData.settings.allowCancellation}
                    disabled={!editMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto Confirm</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically confirm new bookings
                    </p>
                  </div>
                  <Switch
                    checked={entityData.settings.autoConfirm}
                    disabled={!editMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Deposit</Label>
                    <p className="text-sm text-muted-foreground">
                      Require deposit payment for bookings
                    </p>
                  </div>
                  <Switch
                    checked={entityData.settings.requireDeposit}
                    disabled={!editMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive booking updates via email
                    </p>
                  </div>
                  <Switch
                    checked={entityData.settings.emailNotifications}
                    disabled={!editMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive booking updates via SMS
                    </p>
                  </div>
                  <Switch
                    checked={entityData.settings.smsNotifications}
                    disabled={!editMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>
                  Control your business visibility and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your business discoverable in search results
                    </p>
                  </div>
                  <Switch
                    checked={entityData.settings.publicProfile}
                    disabled={!editMode}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">
                        {entityData.subscription.plan} Plan
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          subscriptionColors[
                            entityData.subscription
                              .plan as keyof typeof subscriptionColors
                          ]
                        }
                      >
                        {entityData.subscription.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Valid until{" "}
                      {new Date(
                        entityData.subscription.validUntil
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing
                    </Button>
                    <Button>Upgrade Plan</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Included Features</h4>
                  <ul className="space-y-2">
                    {entityData.subscription.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Usage This Month</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bookings</span>
                        <span>
                          {entityData.stats.thisMonthBookings} / Unlimited
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: "65%" }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Professionals</span>
                        <span>
                          {entityData.stats.professionals} / Unlimited
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: "40%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
