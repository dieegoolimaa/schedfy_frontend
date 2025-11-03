import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  publicService,
  PublicEntity,
  PublicService,
  PublicProfessional,
} from "../../services/public.service";
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
  Globe,
  Star,
  Users,
  CheckCircle,
  ArrowLeft,
  Loader2,
  CalendarDays,
} from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
  professionalId?: string;
}

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
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

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
  useEffect(() => {
    if (selectedService && selectedProfessional && selectedDate && entity) {
      generateAvailableSlots();
    }
  }, [selectedService, selectedProfessional, selectedDate, entity]);

  const generateAvailableSlots = async () => {
    if (!entity || !selectedService || !selectedProfessional || !selectedDate)
      return;

    try {
      const response = await publicService.getAvailableSlots({
        entityId: entity.id,
        serviceId: selectedService,
        professionalId: selectedProfessional,
        date: selectedDate,
      });

      setAvailableSlots(response.data);
    } catch (error) {
      console.error("Failed to load available slots:", error);
      // Fallback to mock data for now
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 17;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeString = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          slots.push({
            time: timeString,
            available: Math.random() > 0.3,
            professionalId: selectedProfessional,
          });
        }
      }

      setAvailableSlots(slots);
    }
  };

  const handleBooking = async () => {
    if (
      !selectedService ||
      !selectedProfessional ||
      !selectedDate ||
      !selectedTime
    ) {
      toast.error("Please select all booking details");
      return;
    }

    if (!clientData.name || !clientData.email || !clientData.phone) {
      toast.error("Please fill in your contact information");
      return;
    }

    if (!entity) {
      toast.error("Entity information not loaded");
      return;
    }

    setBooking(true);
    try {
      await publicService.createBooking({
        entityId: entity.id,
        serviceId: selectedService,
        professionalId: selectedProfessional,
        date: selectedDate,
        time: selectedTime,
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
      setSelectedTime("");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={entity.logo} />
              <AvatarFallback className="text-lg">
                {getInitials(entity.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{entity.name}</h1>
              <p className="text-muted-foreground mb-4">{entity.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{entity.rating}</span>
                  <span className="text-muted-foreground">
                    ({entity.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{entity.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{entity.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Book an Appointment
                </CardTitle>
                <CardDescription>
                  Select a service, professional, date and time to book your
                  appointment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Service Selection */}
                <div className="space-y-3">
                  <Label>Choose a Service</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedService === service.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{service.name}</h3>
                          <Badge variant="secondary">€{service.price}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{service.duration} minutes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedService && (
                  <>
                    {/* Professional Selection */}
                    <div className="space-y-3">
                      <Label>Choose Professional</Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {professionals
                          .filter((prof) => prof.isAvailable)
                          .map((professional) => (
                            <div
                              key={professional.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedProfessional === professional.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                              onClick={() =>
                                setSelectedProfessional(professional.id)
                              }
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={professional.avatar} />
                                  <AvatarFallback>
                                    {getInitials(
                                      `${professional.firstName} ${professional.lastName}`
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium">
                                    {professional.firstName}{" "}
                                    {professional.lastName}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>{professional.rating}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {professional.specialties.map(
                                      (specialty) => (
                                        <Badge
                                          key={specialty}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {specialty}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-3">
                      <Label>Select Date</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    {/* Time Slot Selection */}
                    {selectedDate && availableSlots.length > 0 && (
                      <div className="space-y-3">
                        <Label>Select Time</Label>
                        <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              variant={
                                selectedTime === slot.time
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className="text-xs"
                            >
                              {slot.time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Client Information */}
                    {selectedTime && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h3 className="font-medium">Your Information</h3>
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
                          >
                            {booking && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            <CheckCircle className="h-4 w-4 mr-2" />
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="font-medium">{day}</span>
                    <span className="text-muted-foreground">
                      {formatWorkingHours(day)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{entity.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{entity.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{entity.address}</span>
                </div>
                {entity.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={entity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Our Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {professionals.map((professional) => (
                  <div
                    key={professional.id}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={professional.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          `${professional.firstName} ${professional.lastName}`
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {professional.firstName} {professional.lastName}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{professional.rating}</span>
                        <Badge
                          variant={
                            professional.isAvailable ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {professional.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
