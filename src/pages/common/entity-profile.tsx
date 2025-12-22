import { useState, useEffect } from "react";
import { EntityPlan } from "../../types/enums";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth-context";
import { apiClient } from "../../lib/api-client";
import { formatNumber } from "../../lib/region-config";
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
  Users,
  Loader2,
  Clock,
} from "lucide-react";

export function EntityProfilePage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for entity data
  const [entityData, setEntityData] = useState<any>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Fetch entity data
  useEffect(() => {
    const fetchEntityData = async () => {
      if (!user?.entityId) {
        console.log("No entityId found");
        return;
      }

      setLoading(true);
      try {
        // Fetch entity details
        const entityResponse = await apiClient.get(
          `/api/entities/${user.entityId}`
        );
        console.log("Entity data:", entityResponse.data);
        setEntityData(entityResponse.data);

        // Fetch professionals
        const professionalsResponse = await apiClient.get(
          `/api/users/professionals?entityId=${user.entityId}`
        );
        console.log("Professionals:", professionalsResponse.data);
        setProfessionals(
          Array.isArray(professionalsResponse.data)
            ? professionalsResponse.data
            : []
        );

        // Fetch services
        const servicesResponse = await apiClient.get(
          `/api/services?entityId=${user.entityId}`
        );
        console.log("Services:", servicesResponse.data);
        setServices(
          Array.isArray(servicesResponse.data)
            ? servicesResponse.data.map((service: any) => ({
              ...service,
              id: service.id || service._id,
              duration:
                typeof service.duration === "object"
                  ? service.duration.duration
                  : service.duration,
              price:
                typeof service.pricing === "object"
                  ? service.pricing.basePrice
                  : service.price,
              professionalIds:
                service.assignedProfessionalIds ||
                service.assignedProfessionals ||
                service.professionalIds ||
                [],
            }))
            : []
        );
      } catch (error: any) {
        console.error("Error fetching entity data:", error);
        toast.error(
          error.response?.data?.message || "Failed to load entity data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEntityData();
  }, [user?.entityId]);

  const handleSave = async () => {
    if (!entityData) return;

    setSaving(true);
    try {
      await apiClient.put(
        `/api/entities/${entityData.id || entityData._id}`,
        entityData
      );
      toast.success("Entity profile updated successfully");
      setEditMode(false);
    } catch (error: any) {
      console.error("Error saving entity:", error);
      toast.error(
        error.response?.data?.message || "Failed to save entity profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!entityData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">No entity data found</p>
      </div>
    );
  }

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
    [EntityPlan.SIMPLE]: "bg-blue-100 text-blue-800 border-blue-200",
    [EntityPlan.INDIVIDUAL]: "bg-purple-100 text-purple-800 border-purple-200",
    [EntityPlan.BUSINESS]: "bg-gold-100 text-gold-800 border-gold-200",
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
          {entityData?.slug && (
            <Button
              variant="secondary"
              onClick={() => window.open(`/book/${entityData.slug}`, "_blank")}
            >
              <Globe className="h-4 w-4 mr-2" />
              View Public Page
            </Button>
          )}
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : editMode ? (
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
                      value={entityData.name || ""}
                      onChange={(e) =>
                        setEntityData({ ...entityData, name: e.target.value })
                      }
                      className="text-2xl font-bold h-auto p-2"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{entityData.name}</h2>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {entityData.entityType || entityData.type || "Business"}
                    </Badge>
                    {entityData.subscription?.plan && (
                      <Badge
                        variant="outline"
                        className={
                          subscriptionColors[
                          entityData.subscription.plan as EntityPlan
                          ] || "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {entityData.subscription.plan.charAt(0).toUpperCase() + entityData.subscription.plan.slice(1)} Plan
                      </Badge>
                    )}
                  </div>
                </div>

                {editMode ? (
                  <Textarea
                    value={entityData.description || ""}
                    onChange={(e) =>
                      setEntityData({
                        ...entityData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Business description..."
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {entityData.description || "No description available"}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(entityData.stats?.totalBookings || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Bookings
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {entityData.stats?.activeClients || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Active Clients
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {professionals.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Professionals
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                      <Star className="h-5 w-5 mr-1" />
                      {entityData.stats?.averageRating || "N/A"}
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
        <div className="border-b overflow-x-auto">
          <TabsList className="w-full justify-start flex-nowrap h-auto p-0 bg-transparent inline-flex min-w-full">
            <TabsTrigger value="basic" className="whitespace-nowrap">
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="hours" className="whitespace-nowrap">
              Business Hours
            </TabsTrigger>
            {entityData?.subscription?.plan !== EntityPlan.SIMPLE && (
              <TabsTrigger value="team" className="whitespace-nowrap">
                Team
              </TabsTrigger>
            )}
            <TabsTrigger value="social" className="whitespace-nowrap">
              Social Media
            </TabsTrigger>
            <TabsTrigger value="settings" className="whitespace-nowrap">
              Settings
            </TabsTrigger>
            <TabsTrigger value="subscription" className="whitespace-nowrap">
              Subscription
            </TabsTrigger>
          </TabsList>
        </div>

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
                        value={entityData.contact?.email || ""}
                        onChange={(e) =>
                          setEntityData({
                            ...entityData,
                            contact: {
                              ...entityData.contact,
                              email: e.target.value,
                            },
                          })
                        }
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">
                        {entityData.contact?.email || "Not set"}
                      </span>
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
                        value={entityData.contact?.phone || ""}
                        onChange={(e) =>
                          setEntityData({
                            ...entityData,
                            contact: {
                              ...entityData.contact,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">
                        {entityData.contact?.phone || "Not set"}
                      </span>
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
                        defaultValue={entityData.contact?.website || ""}
                        className="flex-1"
                      />
                    ) : entityData.contact?.website ? (
                      <a
                        href={entityData.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-blue-600 hover:underline"
                      >
                        {entityData.contact.website}
                      </a>
                    ) : (
                      <span className="flex-1 text-muted-foreground">
                        Not set
                      </span>
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
                        defaultValue={entityData.contact?.instagram || ""}
                        className="flex-1"
                      />
                    ) : entityData.contact?.instagram ? (
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
                        defaultValue={entityData.contact?.address?.street || ""}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{entityData.contact?.address?.street || "Not set"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {editMode ? (
                      <Input
                        id="city"
                        defaultValue={entityData.contact?.address?.city || ""}
                      />
                    ) : (
                      <span>{entityData.contact?.address?.city || "Not set"}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal">Postal Code</Label>
                    {editMode ? (
                      <Input
                        id="postal"
                        defaultValue={entityData.contact?.address?.postalCode || ""}
                      />
                    ) : (
                      <span>{entityData.contact?.address?.postalCode || "Not set"}</span>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    {editMode ? (
                      <Select
                        defaultValue={(entityData.contact?.address?.country || "portugal").toLowerCase()}
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
                      <span>{entityData.contact?.address?.country || "Not set"}</span>
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
                  entityData.workingHours?.[
                  day.key as keyof typeof entityData.workingHours
                  ];

                if (!dayData) return null;

                return (
                  <div
                    key={day.key}
                    className="flex items-center space-x-4 py-2"
                  >
                    <div className="w-24">
                      <Label className="font-medium">{day.label}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={dayData.enabled || false}
                        disabled={!editMode}
                        onCheckedChange={(checked) => {
                          if (editMode) {
                            setEntityData({
                              ...entityData,
                              workingHours: {
                                ...entityData.workingHours,
                                [day.key]: {
                                  ...dayData,
                                  enabled: checked,
                                },
                              },
                            });
                          }
                        }}
                      />
                      {dayData.enabled ? (
                        <div className="flex items-center space-x-2">
                          {editMode ? (
                            <>
                              <Input
                                type="time"
                                value={dayData.start || "09:00"}
                                onChange={(e) => {
                                  setEntityData({
                                    ...entityData,
                                    workingHours: {
                                      ...entityData.workingHours,
                                      [day.key]: {
                                        ...dayData,
                                        start: e.target.value,
                                      },
                                    },
                                  });
                                }}
                                className="w-32"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={dayData.end || "18:00"}
                                onChange={(e) => {
                                  setEntityData({
                                    ...entityData,
                                    workingHours: {
                                      ...entityData.workingHours,
                                      [day.key]: {
                                        ...dayData,
                                        end: e.target.value,
                                      },
                                    },
                                  });
                                }}
                                className="w-32"
                              />
                            </>
                          ) : (
                            <span className="text-sm">
                              {dayData.start || "09:00"} -{" "}
                              {dayData.end || "18:00"}
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

        {/* Team Tab */}
        {entityData?.subscription?.plan !== EntityPlan.SIMPLE && (
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  Manage your team of professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {professionals.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No professionals found. Add team members to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {professionals.map((professional) => (
                      <Card
                        key={professional.id || professional._id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={professional.profilePicture} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                {professional.firstName?.[0]}
                                {professional.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {professional.firstName} {professional.lastName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm mt-1">
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  <span className="ml-1 text-muted-foreground">
                                    {professional.rating || "N/A"}
                                  </span>
                                </div>
                                {professional.isAvailable !== undefined && (
                                  <Badge
                                    variant={
                                      professional.isAvailable
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {professional.isAvailable
                                      ? "Available"
                                      : "Unavailable"}
                                  </Badge>
                                )}
                              </div>
                              {professional.specialties &&
                                professional.specialties.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {professional.specialties
                                      .slice(0, 2)
                                      .map((specialty: string) => (
                                        <Badge
                                          key={specialty}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {specialty}
                                        </Badge>
                                      ))}
                                    {professional.specialties.length > 2 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{professional.specialties.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Services Offered
                </CardTitle>
                <CardDescription>
                  Active services available for booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No services found. Add services to start accepting bookings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => {
                      const duration =
                        typeof service.duration === "object"
                          ? service.duration.duration
                          : service.duration;
                      const price =
                        typeof service.pricing === "object"
                          ? service.pricing.basePrice
                          : service.price;

                      return (
                        <div
                          key={service.id || service._id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{duration || 0} min</span>
                            </div>
                            <div className="font-semibold">
                              {formatCurrency(price || 0)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

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

            <Card>
              <CardHeader>
                <CardTitle>AI Features</CardTitle>
                <CardDescription>
                  Manage AI-powered insights and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show AI Insights</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle visibility of AI insights in your dashboard
                    </p>
                  </div>
                  <Switch
                    checked={entityData.aiInsightsEnabled !== false}
                    disabled={!editMode || !entityData.isPremium}
                    onCheckedChange={(checked) => {
                      if (editMode) {
                        setEntityData({
                          ...entityData,
                          aiInsightsEnabled: checked,
                        });
                      }
                    }}
                  />
                </div>
                {!entityData.isPremium && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    <strong>AI Insights Add-on required.</strong> Subscribe to AI Insights to unlock intelligent business analytics.
                    <br />
                    <span className="text-xs">
                      • Simple plan: Operational insights (efficiency, capacity, trends)
                      <br />
                      • Individual/Business: Full insights (financial, management, demand + operational)
                    </span>
                  </div>
                )}
                {entityData.isPremium && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                    ✅ AI Insights active. Available features based on your plan:
                    <br />
                    <span className="text-xs">
                      {entityData.plan === 'simple'
                        ? '• Operational insights (efficiency, capacity, booking trends)'
                        : '• Full insights (financial analytics, management tips, demand forecasting + operational)'}
                    </span>
                  </div>
                )}
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
                    {entityData.subscription?.features?.map(
                      (feature: string) => (
                        <li
                          key={feature}
                          className="flex items-center space-x-2"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      )
                    )}
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
