import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  Globe,
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
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

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
        setEntity(entityResponse.data);

        const entityId = entityResponse.data.id;

        // Fetch services and professionals for this entity
        const [servicesResponse, professionalsResponse] = await Promise.all([
          publicService.getEntityServices(entityId),
          publicService.getEntityProfessionals(entityId),
        ]);

        setServices(
          servicesResponse.data.filter((service) => service.isActive)
        );
        setProfessionals(
          professionalsResponse.data.filter(
            (professional) => professional.isAvailable
          )
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
      await publicService.createBooking(entity!.id, {
        entityId: entity!.id,
        serviceId: selectedService,
        professionalId: selectedSlot.professionalId!,
        date: selectedDate,
        time: selectedSlot.time,
        clientName: clientData.name,
        clientEmail: clientData.email,
        clientPhone: clientData.phone,
        notes: clientData.notes,
      });

      toast.success(
        "Booking confirmed! You will receive a confirmation email shortly."
      );

      // Reset form
      setSelectedService("");
      setSelectedProfessional("");
      setSelectedDate("");
      setSelectedSlot(null);
      setClientData({ name: "", email: "", phone: "", notes: "" });
    } catch (error: any) {
      console.error("Booking failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create booking. Please try again."
      );
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
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
        {entity.coverImage ? (
          <img
            src={entity.coverImage}
            alt={entity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
          onClick={() => {
            navigator.clipboard.writeText(globalThis.location.href);
            toast.success("Link copied to clipboard!");
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Profile Avatar */}
            <Avatar className="h-40 w-40 border-4 border-background shadow-xl">
              <AvatarImage src={entity.logo} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {getInitials(entity.name)}
              </AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 md:mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{entity.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{entity.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-foreground">{entity.rating}</span>
                      <span className="text-sm">({entity.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="w-full md:w-auto shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => {
                    const bookingSection = document.getElementById("booking-form");
                    bookingSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card rounded-lg border shadow-sm">
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
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{entity.description}</p>
              
              {/* Contact Info */}
              <div className="mt-6 flex flex-wrap gap-6">
                <a
                  href={`tel:${entity.phone}`}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{entity.phone}</span>
                </a>
                <a
                  href={`mailto:${entity.email}`}
                  className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{entity.email}</span>
                </a>
                {entity.website && (
                  <a
                    href={entity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {/* Social Media */}
              <div className="mt-4 flex gap-3">
                {entity.instagram && (
                  <a
                    href={`https://instagram.com/${entity.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {entity.website && (
                  <a
                    href={entity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-accent transition-colors"
                    title="Website"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
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
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedService === service.id
                        ? "ring-2 ring-primary shadow-lg"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedService(service.id);
                      setTimeout(() => {
                        const bookingSection = document.getElementById("booking-form");
                        bookingSection?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <Badge className="text-base px-3 py-1">€{service.price}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration} min</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <Card id="booking-form" className="scroll-mt-24">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CalendarDays className="h-6 w-6" />
                  Book Your Appointment
                </CardTitle>
                <CardDescription className="text-base">
                  Choose your preferred service, date, and time
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {!selectedService && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Please select a service above to continue</p>
                  </div>
                )}

                {selectedService && (
                  <>
                    {/* Selected Service Display */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Selected Service</p>
                          <p className="font-semibold">
                            {services.find(s => s.id === selectedService)?.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedService("");
                            setSelectedProfessional("");
                            setSelectedDate("");
                            setSelectedSlot(null);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    </div>

                    {/* Professional Selection (Optional) */}
                    {professionals.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-base font-semibold">Choose Professional (Optional)</Label>
                          {selectedProfessional && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProfessional("")}
                            >
                              Any available
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {professionals
                            .filter((prof) => prof.isAvailable)
                            .map((professional) => (
                              <Card
                                key={professional.id}
                                className={`cursor-pointer transition-all ${
                                  selectedProfessional === professional.id
                                    ? "ring-2 ring-primary shadow-md"
                                    : "hover:shadow-md"
                                }`}
                                onClick={() =>
                                  setSelectedProfessional(
                                    selectedProfessional === professional.id
                                      ? ""
                                      : professional.id
                                  )
                                }
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={professional.avatar} />
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                        {getInitials(
                                          `${professional.firstName} ${professional.lastName}`
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <h3 className="font-medium">
                                        {professional.firstName} {professional.lastName}
                                      </h3>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        <span>{professional.rating}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {professional.specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                      {professional.specialties.slice(0, 2).map((specialty) => (
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

                    {/* Date Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Select Date</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="text-base"
                      />
                    </div>

                    {/* Time Slot Selection using TimeSlotPicker */}
                    {selectedDate && entity && (
                      <TimeSlotPicker
                        entityId={entity.id}
                        serviceId={selectedService}
                        date={selectedDate}
                        professionalId={selectedProfessional || undefined}
                        selectedSlot={selectedSlot}
                        onSelectSlot={setSelectedSlot}
                      />
                    )}

                    {/* Client Information */}
                    {selectedSlot && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="text-base font-semibold">Your Information</h3>
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
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
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
                            {!booking && <CheckCircle className="h-5 w-5 mr-2" />}
                            Confirm Booking
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Team Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Our Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professionals.slice(0, 5).map((professional) => (
                  <div key={professional.id} className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={professional.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                        {getInitials(
                          `${professional.firstName} ${professional.lastName}`
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {professional.firstName} {professional.lastName}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-muted-foreground">{professional.rating}</span>
                      </div>
                    </div>
                    <Badge variant={professional.isAvailable ? "default" : "secondary"}>
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
                  const isOpen = entity?.workingHours[day.toLowerCase()]?.enabled;
                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="font-medium">{day}</span>
                      <span className={isOpen ? "text-foreground" : "text-muted-foreground"}>
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
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href={`tel:${entity.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Call us</div>
                    <div className="text-sm font-medium">{entity.phone}</div>
                  </div>
                </a>
                <a
                  href={`mailto:${entity.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Email us</div>
                    <div className="text-sm font-medium">{entity.email}</div>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Visit us</div>
                    <div className="text-sm font-medium">{entity.address}</div>
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
