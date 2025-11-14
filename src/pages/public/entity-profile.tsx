import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { publicService } from "@/services/public.service";
import { toast } from "sonner";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Instagram,
  Share2,
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import type { TimeSlot } from "@/components/time-slot-picker";

interface PublicEntity {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  rating: number;
  totalReviews: number;
  workingHours: any;
}

interface PublicService {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  isActive: boolean;
  professionalIds?: string[];
}

interface PublicProfessional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialties?: string[];
}

interface ServicePackage {
  _id: string;
  name: string;
  description?: string;
  services: PublicService[];
  pricing: {
    packagePrice: number;
    originalPrice: number;
    discount: number;
  };
  validity: number;
  sessionsIncluded: number;
  status: string;
}

export function PublicEntityProfilePage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [entity, setEntity] = useState<PublicEntity | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [professionals, setProfessionals] = useState<PublicProfessional[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);

  // Booking state
  const [activeTab, setActiveTab] = useState<"services" | "packages">(
    "services"
  );
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Fetch entity data
  useEffect(() => {
    const fetchEntityData = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const entityResponse = await publicService.getEntityBySlug(slug);
        const entityData = entityResponse.data;
        setEntity(entityData);

        const entityId = entityData.id || (entityData as any)._id;

        const [servicesResponse, professionalsResponse, packagesResponse] =
          await Promise.all([
            publicService.getEntityServices(entityId),
            publicService.getEntityProfessionals(entityId),
            publicService
              .getEntityPackages(entityId)
              .catch(() => ({ data: [] })),
          ]);

        // Map services
        const mappedServices = servicesResponse.data
          .map((service: any) => ({
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
          .filter(
            (service: any) =>
              service.isActive !== false && service.status !== "inactive"
          );

        // Map professionals
        const mappedProfessionals = professionalsResponse.data.map(
          (prof: any) => ({
            ...prof,
            id: prof.id || prof._id,
          })
        );

        setServices(mappedServices);
        setProfessionals(mappedProfessionals);
        setPackages(
          Array.isArray(packagesResponse.data) ? packagesResponse.data : []
        );
      } catch (error: any) {
        console.error("Failed to load entity data:", error);
        if (error.response?.status === 404) {
          toast.error("Business not found");
        } else {
          toast.error("Failed to load business information");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEntityData();
  }, [slug]);

  // Filter professionals by selected service
  const availableProfessionals = useMemo(() => {
    if (!selectedService) return professionals;

    const service = services.find((s) => s.id === selectedService);
    if (!service) return professionals;

    const assignedIds = (service as any).professionalIds || [];
    if (assignedIds.length === 0) return professionals;

    const assignedIdsAsStrings = assignedIds.map((id: any) => String(id));
    return professionals.filter((prof) => {
      const profId = String(prof.id || (prof as any)._id);
      return assignedIdsAsStrings.includes(profId);
    });
  }, [selectedService, services, professionals]);

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      toast.error("Please select all booking details");
      return;
    }

    if (!clientData.name || !clientData.email || !clientData.phone) {
      toast.error("Please fill in all required information");
      return;
    }

    setBooking(true);
    try {
      const service = services.find((s) => s.id === selectedService);
      if (!service) {
        toast.error("Service not found");
        return;
      }

      const duration = service?.duration || 60;
      const basePrice = service?.price || 0;

      const [hours, minutes] = selectedSlot.time.split(":").map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      const bookingData = {
        entityId: entity!.id,
        serviceId: selectedService,
        professionalId:
          selectedSlot.professionalId || selectedProfessional || undefined,
        clientInfo: {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          notes: clientData.notes || undefined,
        },
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        pricing: {
          basePrice: basePrice,
          totalPrice: basePrice,
          currency: "EUR",
        },
        status: "pending",
        notes: clientData.notes || undefined,
        createdBy: entity!.id,
      };

      await publicService.createBooking(entity!.id, bookingData as any);

      toast.success(
        "Booking confirmed! You will receive a confirmation email shortly."
      );

      // Reset form
      setSelectedService("");
      setSelectedProfessional("");
      setSelectedDate(undefined);
      setSelectedSlot(null);
      setClientData({ name: "", email: "", phone: "", notes: "" });
    } catch (error: any) {
      console.error("Booking failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create booking. Please try again.";
      toast.error(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Business Not Found</CardTitle>
            <CardDescription>
              The business you're looking for doesn't exist or is not available.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Cover */}
      <div className="relative">
        <div className="h-64 md:h-80 lg:h-96 overflow-hidden relative">
          {entity.coverImage ? (
            <img
              src={entity.coverImage}
              alt={entity.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
        </div>

        {/* Floating Actions */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 backdrop-blur-md hover:bg-white shadow-lg"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 backdrop-blur-md hover:bg-white shadow-lg"
            onClick={() => {
              navigator.clipboard.writeText(globalThis.location.href);
              toast.success("Link copied!");
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Business Info Card - Overlapping Hero */}
        <div className="container mx-auto px-4 -mt-32 relative z-20">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl shrink-0">
                  <AvatarImage src={entity.logo} />
                  <AvatarFallback className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                    {getInitials(entity.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {entity.name}
                    </h1>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {entity.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {entity.address.city}, {entity.address.country}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{entity.rating}</span>
                        <span>({entity.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {entity.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {entity.description}
                    </p>
                  )}

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    {entity.phone && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${entity.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    )}
                    {entity.email && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${entity.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    )}
                    {entity.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://instagram.com/${entity.instagram.replace(
                            "@",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Services & Booking */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services & Packages Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Book an Appointment</CardTitle>
                <CardDescription>
                  Choose a service or package and select your preferred time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={(v: any) => setActiveTab(v)}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="services" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Services ({services.length})
                    </TabsTrigger>
                    <TabsTrigger value="packages" className="gap-2">
                      <Package className="h-4 w-4" />
                      Packages ({packages.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Services Tab */}
                  <TabsContent value="services" className="space-y-6">
                    {services.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No services available at the moment</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {services.map((service) => (
                          <Card
                            key={service.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedService === service.id
                                ? "ring-2 ring-primary"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedService(service.id);
                              setSelectedPackage("");
                            }}
                          >
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {service.name}
                              </CardTitle>
                              {service.description && (
                                <CardDescription className="line-clamp-2">
                                  {service.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{service.duration} min</span>
                                  </div>
                                </div>
                                <div className="text-lg font-bold">
                                  {formatCurrency(service.price)}
                                </div>
                              </div>
                              {selectedService === service.id && (
                                <Badge className="mt-3 w-full justify-center">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Packages Tab */}
                  <TabsContent value="packages" className="space-y-6">
                    {packages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No packages available at the moment</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {packages.map((pkg) => (
                          <Card
                            key={pkg._id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedPackage === pkg._id
                                ? "ring-2 ring-primary"
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedPackage(pkg._id);
                              setSelectedService("");
                            }}
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-xl">
                                    {pkg.name}
                                  </CardTitle>
                                  {pkg.description && (
                                    <CardDescription className="mt-1">
                                      {pkg.description}
                                    </CardDescription>
                                  )}
                                </div>
                                {pkg.pricing.discount > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="text-sm"
                                  >
                                    -{pkg.pricing.discount.toFixed(0)}% OFF
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {pkg.services.map((service) => (
                                  <Badge key={service.id} variant="outline">
                                    {service.name}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div>
                                  <div className="text-sm text-muted-foreground line-through">
                                    {formatCurrency(pkg.pricing.originalPrice)}
                                  </div>
                                  <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(pkg.pricing.packagePrice)}
                                  </div>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                  <div>{pkg.sessionsIncluded} sessions</div>
                                  <div>{pkg.validity} days validity</div>
                                </div>
                              </div>
                              {selectedPackage === pkg._id && (
                                <Badge className="w-full justify-center">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Booking Form */}
                {selectedService && (
                  <div className="mt-8 space-y-6 pt-8 border-t">
                    <h3 className="text-xl font-semibold">Booking Details</h3>

                    {/* Professional Selection (optional) */}
                    {availableProfessionals.length > 0 && (
                      <div className="space-y-2">
                        <Label>Choose Professional (Optional)</Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {availableProfessionals.map((prof) => (
                            <Card
                              key={prof.id}
                              className={`cursor-pointer transition-all hover:shadow-sm ${
                                selectedProfessional === prof.id
                                  ? "ring-2 ring-primary"
                                  : ""
                              }`}
                              onClick={() => setSelectedProfessional(prof.id)}
                            >
                              <CardContent className="p-4 flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={prof.avatar} />
                                  <AvatarFallback>
                                    {getInitials(
                                      `${prof.firstName} ${prof.lastName}`
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {prof.firstName} {prof.lastName}
                                  </p>
                                  {prof.specialties &&
                                    prof.specialties.length > 0 && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {prof.specialties.join(", ")}
                                      </p>
                                    )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date & Time Selection */}
                    <div className="space-y-2">
                      <Label>Select Date & Time</Label>
                      <TimeSlotPicker
                        entityId={entity.id}
                        serviceId={selectedService}
                        professionalId={selectedProfessional}
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        selectedSlot={selectedSlot}
                        onSlotSelect={setSelectedSlot}
                      />
                    </div>

                    {/* Client Information */}
                    <div className="space-y-4 pt-6 border-t">
                      <h4 className="font-semibold">Your Information</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={clientData.name}
                            onChange={(e) =>
                              setClientData({
                                ...clientData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={clientData.email}
                            onChange={(e) =>
                              setClientData({
                                ...clientData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={clientData.phone}
                          onChange={(e) =>
                            setClientData({
                              ...clientData,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any special requests or information..."
                          rows={3}
                          value={clientData.notes}
                          onChange={(e) =>
                            setClientData({
                              ...clientData,
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Book Button */}
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleBooking}
                      disabled={
                        booking ||
                        !selectedService ||
                        !selectedDate ||
                        !selectedSlot ||
                        !clientData.name ||
                        !clientData.email ||
                        !clientData.phone
                      }
                    >
                      {booking ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-5 w-5 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Team & Info */}
          <div className="space-y-6">
            {/* Team */}
            {professionals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Our Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {professionals.map((prof) => (
                    <div key={prof.id} className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={prof.avatar} />
                        <AvatarFallback>
                          {getInitials(`${prof.firstName} ${prof.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {prof.firstName} {prof.lastName}
                        </p>
                        {prof.specialties && prof.specialties.length > 0 && (
                          <p className="text-sm text-muted-foreground truncate">
                            {prof.specialties.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {entity.phone && (
                  <a
                    href={`tel:${entity.phone}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <span>{entity.phone}</span>
                  </a>
                )}
                {entity.email && (
                  <a
                    href={`mailto:${entity.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span>{entity.email}</span>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
