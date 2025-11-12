import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import {
  publicService,
  PublicEntity,
  PublicService,
  PublicProfessional,
} from "../../services/public.service";
import { TimeSlotPicker } from "../../components/time-slot-picker";
import { TimeSlot } from "../../services/bookings.service";
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
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { Calendar } from "../../components/ui/calendar";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  CheckCircle,
  ArrowLeft,
  Loader2,
  CalendarDays,
  Instagram,
  Share2,
} from "lucide-react";

export function PublicEntityProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [entity, setEntity] = useState<PublicEntity | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [professionals, setProfessionals] = useState<PublicProfessional[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Booking preference: 'time' (any professional) or 'professional' (specific professional)
  const [bookingMode, setBookingMode] = useState<"time" | "professional">(
    "time"
  );

  // Client information for booking
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch entity data by slug
  useEffect(() => {
    const fetchEntityData = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        // Fetch entity by slug
        const entityResponse = await publicService.getEntityBySlug(slug);
        console.log("Entity response:", entityResponse.data);
        setEntity(entityResponse.data);

        const entityId =
          entityResponse.data.id || (entityResponse.data as any)._id;
        console.log("Entity ID:", entityId);

        // Fetch services and professionals for this entity
        const [servicesResponse, professionalsResponse, packagesResponse] =
          await Promise.all([
            publicService.getEntityServices(entityId),
            publicService.getEntityProfessionals(entityId),
            publicService
              .getEntityPackages(entityId)
              .catch(() => ({ data: [] })), // Gracefully handle if packages don't exist
          ]);

        console.log("Services response:", servicesResponse.data);
        console.log("Professionals response:", professionalsResponse.data);
        console.log("Packages response:", packagesResponse.data);

        // Map services to ensure consistent id field (handle both id and _id)
        // Also normalize duration and price from nested objects
        const mappedServices = servicesResponse.data
          .map((service: any) => ({
            ...service,
            id: service.id || service._id,
            // Extract duration from nested duration object
            duration:
              typeof service.duration === "object"
                ? service.duration.duration
                : service.duration,
            // Extract price from nested pricing object
            price:
              typeof service.pricing === "object"
                ? service.pricing.basePrice
                : service.price,
            // Map assignedProfessionals to professionalIds for consistency
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

        // Map professionals to ensure consistent id field
        const mappedProfessionals = professionalsResponse.data.map(
          (prof: any) => ({
            ...prof,
            id: prof.id || prof._id,
          })
        );

        console.log("Mapped services:", mappedServices);
        console.log("Mapped professionals (raw):", professionalsResponse.data);
        console.log("Mapped professionals (final):", mappedProfessionals);

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
  const availableProfessionalsForService = useMemo(() => {
    if (!selectedService) {
      return professionals; // No service selected, show all
    }

    // Find selected service
    const service = services.find((s) => s.id === selectedService);
    if (!service) {
      console.log("[PublicEntityProfile] Service not found:", selectedService);
      return professionals;
    }

    // Check if service has assigned professionals (professionalIds or assignedProfessionals)
    const assignedProfessionalIds =
      (service as any).professionalIds ||
      (service as any).assignedProfessionals ||
      [];

    console.log("[PublicEntityProfile] Filtering professionals:", {
      service: service.name,
      assignedProfessionalIds,
      assignedProfessionalIdsType: assignedProfessionalIds.map(
        (id: any) => typeof id
      ),
      allProfessionals: professionals.length,
      professionalsIds: professionals.map((p) => ({
        id: p.id || (p as any)._id,
        type: typeof (p.id || (p as any)._id),
      })),
    });

    // If no professionals assigned to service, show all (fallback)
    if (assignedProfessionalIds.length === 0) {
      console.log(
        "[PublicEntityProfile] No professionals assigned to service, showing all"
      );
      return professionals;
    }

    // Convert assigned IDs to strings for comparison (handles both ObjectId and string formats)
    const assignedIdsAsStrings = assignedProfessionalIds.map((id: any) =>
      String(id)
    );

    // Filter professionals by service assignment
    const filtered = professionals.filter((prof) => {
      const profId = String(prof.id || (prof as any)._id);
      return assignedIdsAsStrings.includes(profId);
    });

    console.log("[PublicEntityProfile] Filtered professionals:", {
      filtered: filtered.length,
      professionalNames: filtered.map((p) => `${p.firstName} ${p.lastName}`),
    });

    return filtered;
  }, [selectedService, services, professionals]);

  // Generate available time slots when service, professional, and date are selected
  // Now handled by TimeSlotPicker component

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
      // Get service details for duration and pricing
      const service = services.find((s) => s.id === selectedService);
      if (!service) {
        toast.error("Service not found");
        return;
      }

      const duration = service?.duration || 60;
      const basePrice = service?.price || 0;

      // Parse time slot
      const [hours, minutes] = selectedSlot.time.split(":").map(Number);

      // Create start datetime
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);

      // Create end datetime based on duration
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      // Prepare booking data matching backend DTO
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
        createdBy: entity!.id, // Use entity ID as creator for public bookings
      };

      console.log("Creating booking with data:", bookingData);

      const response = await publicService.createBooking(
        entity!.id,
        bookingData as any
      );

      console.log("Booking created successfully:", response.data);

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
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

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

  const formatWorkingHours = (day: string) => {
    if (!entity?.workingHours[day.toLowerCase()]?.enabled) {
      return "Closed";
    }

    const hours = entity.workingHours[day.toLowerCase()];
    let schedule = `${hours.start} - ${hours.end}`;

    if (hours.breakStart && hours.breakEnd) {
      schedule += ` (Break: ${hours.breakStart} - ${hours.breakEnd})`;
    }

    return schedule;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading business profile...</p>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The business you're looking for doesn't exist or is not available.
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Header with Glassmorphism */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
        {entity.coverImage ? (
          <img
            src={entity.coverImage}
            alt={entity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />

        {/* Floating Action Buttons */}
        <div className="absolute top-4 left-0 right-0 px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-900 border-0 shadow-lg"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 backdrop-blur-md hover:bg-white text-gray-900 border-0 shadow-lg"
            onClick={() => {
              navigator.clipboard.writeText(globalThis.location.href);
              toast.success("Link copied!");
            }}
          >
            <Share2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 -mt-20 sm:-mt-24 pb-12 relative z-10">
        {/* Profile Card with Modern Design */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar with Badge */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white dark:border-gray-700 shadow-xl">
                <AvatarImage src={entity.logo} />
                <AvatarFallback className="text-2xl sm:text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  {getInitials(entity.name)}
                </AvatarFallback>
              </Avatar>
              {/* Online Badge */}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
            </div>

            {/* Business Info */}
            <div className="flex-1 min-w-0 w-full">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {entity.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>{entity.address}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {entity.rating}
                  </span>
                  <span>({entity.totalReviews} reviews)</span>
                </div>
              </div>

              {entity.description && (
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6 line-clamp-2">
                  {entity.description}
                </p>
              )}

              {/* Quick Contact Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {entity.phone && (
                  <a
                    href={`tel:${entity.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                )}
                {entity.email && (
                  <a
                    href={`mailto:${entity.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </a>
                )}
                {entity.instagram && (
                  <a
                    href={`https://instagram.com/${entity.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                  >
                    <Instagram className="h-4 w-4" />
                    <span className="hidden sm:inline">Instagram</span>
                  </a>
                )}
              </div>

              {/* Main CTA Button */}
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                disabled={services.length === 0}
                onClick={(e) => {
                  e.preventDefault();
                  if (services.length === 0) {
                    toast.error("No services available to book");
                    return;
                  }
                  const bookingSection =
                    document.getElementById("booking-form");
                  if (bookingSection) {
                    setTimeout(() => {
                      bookingSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 100);
                  }
                }}
              >
                <CalendarDays className="h-5 w-5 mr-2" />
                {services.length === 0
                  ? "No Services Available"
                  : "Book Appointment"}
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{services.length}</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{professionals.length}</div>
              <div className="text-sm text-muted-foreground">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{entity.totalReviews}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{entity.rating}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {entity.description}
              </p>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <a
                  href={`tel:${entity.phone}`}
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors group"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span className="truncate">{entity.phone}</span>
                </a>
                <a
                  href={`mailto:${entity.email}`}
                  className="flex items-center gap-3 text-sm hover:text-primary transition-colors group"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <span className="truncate">{entity.email}</span>
                </a>
              </div>

              {/* Social Media */}
              {entity.instagram && entity.instagram.trim() !== "" && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Follow us:
                    </span>
                    <a
                      href={`https://instagram.com/${entity.instagram.replace(
                        "@",
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg"
                      title="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>{entity.instagram}</span>
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {/* Left Column - Services & Booking */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Services</h2>
              {services.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="font-semibold text-lg mb-2">
                      No Services Available
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      This business hasn't added any services yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50",
                        selectedService === service.id &&
                          "border-primary shadow-lg ring-2 ring-primary/20"
                      )}
                      onClick={() => {
                        setSelectedService(service.id);
                        setSelectedProfessional("");
                        setSelectedDate(undefined);
                        setSelectedSlot(null);
                        setTimeout(() => {
                          document
                            .getElementById("booking-form")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }, 100);
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="font-semibold text-lg leading-tight break-words flex-1">
                            {service.name}
                          </h3>
                          {selectedService === service.id && (
                            <CheckCircle className="h-6 w-6 text-primary shrink-0" />
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-4 pt-3 border-t">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-medium">
                              {service.duration} min
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="font-semibold text-base px-3 py-1"
                          >
                            €{service.price}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Packages Section */}
            {packages.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Our Packages</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {packages.map((pkg) => (
                    <Card
                      key={pkg.id || pkg._id}
                      className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">
                              {pkg.name}
                            </CardTitle>
                            {pkg.description && (
                              <CardDescription className="text-sm line-clamp-2">
                                {pkg.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge
                            variant={
                              pkg.recurrence === "one-time"
                                ? "secondary"
                                : "default"
                            }
                            className="shrink-0"
                          >
                            {pkg.recurrence === "one-time"
                              ? "One-time"
                              : pkg.recurrence === "monthly"
                              ? "Monthly"
                              : pkg.recurrence === "quarterly"
                              ? "Quarterly"
                              : "Annual"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Package Details */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Sessions Included:
                            </span>
                            <span className="font-semibold">
                              {pkg.sessionsIncluded}
                            </span>
                          </div>
                          {pkg.validity && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Valid for:
                              </span>
                              <span className="font-semibold">
                                {pkg.validity.count}{" "}
                                {pkg.validity.unit === "days"
                                  ? "Days"
                                  : pkg.validity.unit === "months"
                                  ? "Months"
                                  : "Years"}
                              </span>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Pricing */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Original Price:
                            </span>
                            <span className="text-sm line-through text-muted-foreground">
                              €
                              {pkg.pricing?.originalPrice?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              Package Price:
                            </span>
                            <span className="text-2xl font-bold text-primary">
                              €{pkg.pricing?.packagePrice?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          {pkg.pricing?.discount > 0 && (
                            <div className="text-center">
                              <Badge variant="destructive" className="text-sm">
                                Save {pkg.pricing.discount}%
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Included Services */}
                        {pkg.services && pkg.services.length > 0 && (
                          <div className="pt-2">
                            <p className="text-sm font-medium mb-2">
                              Included Services:
                            </p>
                            <ul className="space-y-1">
                              {pkg.services.slice(0, 3).map((service: any) => (
                                <li
                                  key={service.id || service._id}
                                  className="text-sm text-muted-foreground flex items-center gap-2"
                                >
                                  <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                                  <span className="line-clamp-1">
                                    {service.name}
                                  </span>
                                </li>
                              ))}
                              {pkg.services.length > 3 && (
                                <li className="text-sm text-muted-foreground italic">
                                  +{pkg.services.length - 3} more services
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* CTA Button */}
                        <Button
                          className="w-full mt-4"
                          onClick={() => {
                            toast.info(
                              "Please contact us directly to purchase this package"
                            );
                          }}
                        >
                          Get Package
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Form - Modern Glassmorphism Style */}
            {services.length > 0 && (
              <div
                id="booking-form"
                className="scroll-mt-24 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-white">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Book Appointment</h2>
                      <p className="text-blue-100 text-sm">
                        Simple, fast & secure
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {!selectedService && (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 mb-4">
                        <CalendarDays className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-bold text-xl mb-2">
                        Select a Service
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm mx-auto">
                        Choose from our services above to check availability
                      </p>
                    </div>
                  )}

                  {selectedService && (
                    <div className="space-y-6">
                      {/* Selected Service Chip */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                              Selected
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {
                                services.find((s) => s.id === selectedService)
                                  ?.name
                              }
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                          onClick={() => {
                            setSelectedService("");
                            setSelectedProfessional("");
                            setSelectedDate(undefined);
                            setSelectedSlot(null);
                          }}
                        >
                          Change
                        </Button>
                      </div>

                      {/* Booking Mode - Simplified */}
                      {availableProfessionalsForService.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Booking Preference
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              className={`p-4 rounded-xl border-2 transition-all ${
                                bookingMode === "time"
                                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                              }`}
                              onClick={() => {
                                setBookingMode("time");
                                setSelectedProfessional("");
                                setSelectedSlot(null);
                              }}
                            >
                              <Clock
                                className={`h-6 w-6 mx-auto mb-2 ${
                                  bookingMode === "time"
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              />
                              <p
                                className={`text-sm font-medium ${
                                  bookingMode === "time"
                                    ? "text-blue-600"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                By Time
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Any professional
                              </p>
                            </button>

                            <button
                              type="button"
                              className={`p-4 rounded-xl border-2 transition-all ${
                                bookingMode === "professional"
                                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                              }`}
                              onClick={() => {
                                setBookingMode("professional");
                                setSelectedSlot(null);
                              }}
                            >
                              <Users
                                className={`h-6 w-6 mx-auto mb-2 ${
                                  bookingMode === "professional"
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              />
                              <p
                                className={`text-sm font-medium ${
                                  bookingMode === "professional"
                                    ? "text-blue-600"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                By Professional
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Choose specific
                              </p>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Professional Selection - Only show if mode is 'professional' */}
                      {bookingMode === "professional" &&
                        availableProfessionalsForService.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-base font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Select Professional
                            </Label>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {availableProfessionalsForService
                                .filter((prof) => prof.isAvailable !== false)
                                .map((professional) => (
                                  <Card
                                    key={professional.id}
                                    className={`cursor-pointer transition-all ${
                                      selectedProfessional === professional.id
                                        ? "ring-2 ring-primary shadow-md scale-[1.02]"
                                        : "hover:shadow-md hover:scale-[1.01]"
                                    }`}
                                    onClick={() => {
                                      setSelectedProfessional(professional.id);
                                      setSelectedSlot(null);
                                    }}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 shrink-0">
                                          <AvatarImage
                                            src={professional.avatar}
                                          />
                                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                            {getInitials(
                                              `${professional.firstName} ${professional.lastName}`
                                            )}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <h3 className="font-medium truncate">
                                            {professional.firstName}{" "}
                                            {professional.lastName}
                                          </h3>
                                          <div className="flex items-center gap-2 text-sm">
                                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                                            <span className="text-muted-foreground">
                                              {professional.rating}
                                            </span>
                                          </div>
                                        </div>
                                        {selectedProfessional ===
                                          professional.id && (
                                          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                        )}
                                      </div>
                                      {professional.specialties &&
                                        professional.specialties.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-3">
                                            {professional.specialties
                                              .slice(0, 2)
                                              .map((specialty) => (
                                                <Badge
                                                  key={specialty}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {specialty}
                                                </Badge>
                                              ))}
                                          </div>
                                        )}
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Warning when "By Professional" mode but no professionals available */}
                      {bookingMode === "professional" &&
                        availableProfessionalsForService.length === 0 && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>
                                No professionals available for this service.
                                Please use "By Time" mode.
                              </span>
                            </p>
                          </div>
                        )}

                      {/* Date Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          Select Date
                        </Label>
                        <Calendar
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedSlot(null); // Reset slot when date changes
                          }}
                          minDate={new Date()}
                          className="w-full"
                        />
                      </div>

                      {/* Time Slot Selection using TimeSlotPicker */}
                      {selectedDate && entity && (
                        <div className="space-y-3">
                          <TimeSlotPicker
                            entityId={entity.id}
                            serviceId={selectedService}
                            date={selectedDate.toISOString().split("T")[0]}
                            professionalId={
                              bookingMode === "professional" &&
                              selectedProfessional
                                ? selectedProfessional
                                : undefined
                            }
                            selectedSlot={selectedSlot}
                            onSelectSlot={setSelectedSlot}
                          />
                        </div>
                      )}

                      {/* Client Information */}
                      {selectedSlot && (
                        <div className="space-y-4">
                          <Separator />
                          <div className="space-y-4">
                            <h3 className="text-base font-semibold">
                              Your Information
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                  id="name"
                                  value={clientData.name}
                                  onChange={(e) =>
                                    setClientData({
                                      ...clientData,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="Your full name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input
                                  id="phone"
                                  value={clientData.phone}
                                  onChange={(e) =>
                                    setClientData({
                                      ...clientData,
                                      phone: e.target.value,
                                    })
                                  }
                                  placeholder="+351 123 456 789"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={clientData.email}
                                onChange={(e) =>
                                  setClientData({
                                    ...clientData,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="your.email@example.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="notes">
                                Additional Notes (Optional)
                              </Label>
                              <Textarea
                                id="notes"
                                value={clientData.notes}
                                onChange={(e) =>
                                  setClientData({
                                    ...clientData,
                                    notes: e.target.value,
                                  })
                                }
                                placeholder="Any special requests or notes..."
                                rows={3}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-4">
                            <Button
                              onClick={handleBooking}
                              disabled={booking}
                              size="lg"
                              className="w-full sm:w-auto shadow-lg"
                            >
                              {booking && (
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              )}
                              {!booking && (
                                <CheckCircle className="h-5 w-5 mr-2" />
                              )}
                              Confirm Booking
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Team Section */}
            {professionals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Our Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {professionals.slice(0, 5).map((professional) => (
                    <div
                      key={professional.id}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={professional.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                          {getInitials(
                            `${professional.firstName} ${professional.lastName}`
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {professional.firstName} {professional.lastName}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                          <span className="text-muted-foreground">
                            {professional.rating}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          professional.isAvailable ? "default" : "secondary"
                        }
                        className="shrink-0"
                      >
                        {professional.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  ))}
                  {professionals.length > 5 && (
                    <p className="text-sm text-center text-muted-foreground pt-2">
                      +{professionals.length - 5} more professionals
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daysOfWeek.map((day) => {
                  const isOpen =
                    entity?.workingHours[day.toLowerCase()]?.enabled;
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="font-medium">{day}</span>
                      <span
                        className={
                          isOpen ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {formatWorkingHours(day)}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={`tel:${entity.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Call us
                    </div>
                    <div className="text-sm font-medium truncate">
                      {entity.phone}
                    </div>
                  </div>
                </a>
                <a
                  href={`mailto:${entity.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Email us
                    </div>
                    <div className="text-sm font-medium truncate">
                      {entity.email}
                    </div>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Visit us
                    </div>
                    <div className="text-sm font-medium leading-tight">
                      {entity.address}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
