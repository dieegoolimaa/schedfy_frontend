import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { entitiesService, type Entity } from "../services/entities.service";
import { servicesService, type Service } from "../services/services.service";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

export function PublicBookingPage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntity = async () => {
      if (!username) {
        setError("Username not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Remove @ if present
        const cleanUsername = username.startsWith("@")
          ? username.slice(1)
          : username;
        const entity = await entitiesService.findByUsername(cleanUsername);

        if (entity) {
          setEntity(entity);
          // Load services for this entity
          loadServices(entity.id);
        } else {
          setError("Business not found");
        }
      } catch (err: any) {
        console.error("Failed to load entity:", err);
        setError(err?.message || "Business not found");
      } finally {
        setLoading(false);
      }
    };

    loadEntity();
  }, [username]);

  const loadServices = async (entityId: string) => {
    try {
      setLoadingServices(true);
      const response = await servicesService.getPublicByEntity(entityId);
      setServices(response.data || []);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Loading business profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Business Not Found</CardTitle>
            <CardDescription>
              The business you're looking for doesn't exist or is not available.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Banner */}
      <div className="relative h-48 bg-gradient-to-r from-primary to-primary/80 overflow-hidden">
        {entity.banner ? (
          <img
            src={entity.banner}
            alt={entity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-primary/80" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-background rounded-lg shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Logo */}
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={entity.logo} alt={entity.name} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {entity.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Business Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{entity.name}</h1>
                  <p className="text-muted-foreground mb-2">
                    @{entity.username}
                  </p>
                  <Badge variant="secondary" className="capitalize">
                    {entity.plan} Plan
                  </Badge>
                </div>
                <Button size="lg" className="gap-2">
                  <Calendar className="h-5 w-5" />
                  Book Now
                </Button>
              </div>

              {entity.description && (
                <p className="mt-4 text-muted-foreground">
                  {entity.description}
                </p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <Separator className="my-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {entity.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {entity.address}
                  </p>
                </div>
              </div>
            )}
            {entity.phone && (
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {entity.phone}
                  </p>
                </div>
              </div>
            )}
            {entity.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {entity.email}
                  </p>
                </div>
              </div>
            )}
            {entity.website && (
              <div className="flex items-start gap-2">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <a
                    href={entity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          {/* Services List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
                <CardDescription>
                  Choose a service to book an appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingServices ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Loading services...
                    </p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No services available</p>
                    <p className="text-sm mt-2">
                      This business hasn't added any services yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <Card
                        key={service.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {service.name}
                              </h3>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-3 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {formatDuration(service.duration)}
                                </div>
                                {service.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {service.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xl font-bold text-primary mb-2">
                                {formatPrice(service.price, service.currency)}
                              </div>
                              <Button size="sm" className="gap-1">
                                <Calendar className="h-4 w-4" />
                                Book
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Info Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      1
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Choose a Service</p>
                    <p className="text-sm text-muted-foreground">
                      Select the service you want to book
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      2
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Pick Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred date and time slot
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      3
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Confirm Booking</p>
                    <p className="text-sm text-muted-foreground">
                      Fill in your details and confirm
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Instant confirmation via email</p>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Easy rescheduling and cancellation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
