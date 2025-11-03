import { useState, useEffect, useMemo } from "react";
import { usePlanRestrictions } from "../../hooks/use-plan-restrictions";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import { bookingsService } from "../services/bookings.service";
import { useClients } from "../../hooks/useClients";
import { useServices } from "../../hooks/useServices";
import { usersApi } from "../../lib/api";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { EditBookingDialog } from "../../components/dialogs/edit-dialogs";
import {
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  User,
  X,
} from "lucide-react";
import PaymentForm from "../../components/payments/PaymentForm";

export function BookingManagementPage() {
  const { t } = useTranslation();
  const { canViewPricing, canViewPaymentDetails } = usePlanRestrictions();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";
  console.log("[BookingManagementPage] entityId from user context:", entityId);

  // Use the bookings hook with real API
  const { bookings, loading, fetchBookings, completeBooking } = useBookings({
    entityId,
    autoFetch: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  // Enhanced batch booking states
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [bookingSlots, setBookingSlots] = useState([
    {
      id: 1,
      service: "",
      professional: "",
      date: "",
      time: "",
      notes: "",
    },
  ]);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientResults, setShowClientResults] = useState(false);

  // Additional filter states
  const [serviceFilter, setServiceFilter] = useState("all");
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Enhanced batch booking functions
  const addBookingSlot = () => {
    const newSlot = {
      id: Date.now(),
      service: "",
      professional: "",
      date: "",
      time: "",
      notes: "",
    };
    setBookingSlots([...bookingSlots, newSlot]);
  };

  const removeBookingSlot = (id: number) => {
    setBookingSlots(bookingSlots.filter((slot) => slot.id !== id));
  };

  const updateBookingSlot = (id: number, field: string, value: string) => {
    setBookingSlots(
      bookingSlots.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };

  const selectClient = (client: any) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientResults(false);
  };

  const resetBookingForm = () => {
    setSelectedClient(null);
    setClientSearch("");
    setBookingSlots([
      {
        id: 1,
        service: "",
        professional: "",
        date: "",
        time: "",
        notes: "",
      },
    ]);
    setShowClientResults(false);
  };

  const handlePaymentClick = (booking: any) => {
    setSelectedBookingForPayment(booking);
    setPaymentDialogOpen(true);
  };

  // payments hook is used inside PaymentForm for in-app card flow

  // Mock data for services, clients, professionals (will be replaced with API later)
  const services = [
    { id: 1, name: "Haircut & Styling", duration: 60, price: 45 },
    { id: 2, name: "Beard Trim", duration: 30, price: 25 },
    { id: 3, name: "Full Manicure", duration: 90, price: 35 },
    { id: 4, name: "Deep Tissue Massage", duration: 60, price: 60 },
    { id: 5, name: "Facial Treatment", duration: 75, price: 55 },
  ];

  // Mock clients data for search
  const mockClients = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "+351 123 456 789",
      avatar: "https://i.pravatar.cc/150?img=1",
      address: "Rua das Flores, 123, Lisboa",
    },
    {
      id: 2,
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "+351 987 654 321",
      avatar: "https://i.pravatar.cc/150?img=2",
      address: "Avenida da República, 456, Porto",
    },
    {
      id: 3,
      name: "Pedro Lima",
      email: "pedro@email.com",
      phone: "+351 555 123 456",
      avatar: "https://i.pravatar.cc/150?img=3",
      address: "Praça do Comércio, 789, Lisboa",
    },
    {
      id: 4,
      name: "Sofia Martins",
      email: "sofia@email.com",
      phone: "+351 777 888 999",
      avatar: "https://i.pravatar.cc/150?img=4",
      address: "Rua Augusta, 321, Lisboa",
    },
    {
      id: 5,
      name: "João Fernandes",
      email: "joao@email.com",
      phone: "+351 666 777 888",
      avatar: "https://i.pravatar.cc/150?img=5",
      address: "Rua de Santa Catarina, 654, Porto",
    },
    {
      id: 6,
      name: "Carla Santos",
      email: "carla@email.com",
      phone: "+351 444 555 666",
      avatar: "https://i.pravatar.cc/150?img=6",
      address: "Avenida dos Aliados, 987, Porto",
    },
  ];

  const professionals = [
    { id: 1, name: "João Santos", speciality: "Hair Styling" },
    { id: 2, name: "Sofia Oliveira", speciality: "Nail Care" },
    { id: 3, name: "Carlos Ferreira", speciality: "Massage Therapy" },
    { id: 4, name: "Maria Rodrigues", speciality: "Skincare" },
  ];

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no-show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
      case "no-show":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Fetch related entities so we can display names instead of raw IDs
  const { clients } = useClients({ entityId, autoFetch: true });
  const { services: servicesFromApi } = useServices({
    entityId,
    autoFetch: true,
  });

  const [professionalsList, setProfessionalsList] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await usersApi.getUsers();
        const data = res?.data || [];
        if (mounted) setProfessionalsList(data);
      } catch (e) {
        // ignore - optional
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Derive bookings with populated client/service/professional objects when available
  const displayBookings = useMemo(() => {
    return bookings.map((b) => {
      // Resolve client
      const clientObj =
        b.client && typeof b.client === "object"
          ? b.client
          : clients.find((c: any) => String(c.id) === String(b.clientId)) ||
            (b.client
              ? { id: b.client, name: String(b.client), isFirstTime: false }
              : undefined);

      // Resolve service
      const serviceObj =
        b.service && typeof b.service === "object"
          ? b.service
          : servicesFromApi.find(
              (s: any) => String(s.id) === String(b.serviceId)
            ) ||
            (b.serviceId
              ? { id: b.serviceId, name: String(b.serviceId), price: 0 }
              : undefined);

      // Resolve professional
      const professionalObj =
        b.professional && typeof b.professional === "object"
          ? b.professional
          : professionalsList.find(
              (p: any) => String(p.id) === String(b.professionalId)
            ) ||
            (b.professionalId
              ? { id: b.professionalId, name: String(b.professionalId) }
              : undefined);

      return {
        ...b,
        client: clientObj,
        service: serviceObj,
        professional: professionalObj,
      };
    });
  }, [bookings, clients, servicesFromApi, professionalsList]);

  const filteredBookings = displayBookings.filter((booking) => {
    const matchesSearch =
      (booking.client?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.service?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking.professional?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesClientSearch =
      clientSearchTerm === "" ||
      (booking.client?.name || "")
        .toLowerCase()
        .includes(clientSearchTerm.toLowerCase()) ||
      (booking.client?.email || "")
        .toLowerCase()
        .includes(clientSearchTerm.toLowerCase()) ||
      (
        (booking.client && "phone" in booking.client && booking.client.phone) ||
        ""
      ).includes(clientSearchTerm);

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    const today = new Date().toISOString().split("T")[0];
    const bookingDate = booking.startTime.split("T")[0];
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && bookingDate === today) ||
      (dateFilter === "upcoming" && new Date(bookingDate) > new Date(today)) ||
      (dateFilter === "past" && new Date(bookingDate) < new Date(today));

    const matchesService =
      serviceFilter === "all" || booking.service?.name === serviceFilter;

    const matchesProfessional =
      professionalFilter === "all" ||
      booking.professional?.name === professionalFilter;

    // Payment status removed as it's not in the Booking model
    const matchesPayment = paymentFilter === "all"; // Placeholder

    return (
      matchesSearch &&
      matchesClientSearch &&
      matchesStatus &&
      matchesDate &&
      matchesService &&
      matchesProfessional &&
      matchesPayment
    );
  });

  const stats = {
    total: displayBookings.length,
    confirmed: displayBookings.filter((b) => b.status === "confirmed").length,
    pending: displayBookings.filter((b) => b.status === "pending").length,
    completed: displayBookings.filter((b) => b.status === "completed").length,
    cancelled: displayBookings.filter((b) => b.status === "cancelled").length,
    revenue: displayBookings
      .filter((b) => b.service)
      .reduce(
        (sum, b) =>
          sum +
          ((b.service as any)?.pricing?.basePrice ||
            (b.service as any)?.price ||
            0),
        0
      ),
  };

  // Show loading skeleton
  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("bookings.management.title", "Booking Management")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "bookings.management.subtitle",
              "View, edit, and manage all bookings for your entity"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Select a client and schedule one or multiple services with
                  different dates and times.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Client Selection Section */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Client Selection
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or phone..."
                        className="pl-9"
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setShowClientResults(e.target.value.length > 0);
                        }}
                        onFocus={() =>
                          setShowClientResults(clientSearch.length > 0)
                        }
                      />
                    </div>
                    <Button variant="outline" type="button">
                      <Plus className="h-4 w-4 mr-2" />
                      New Client
                    </Button>
                  </div>

                  {/* Client Search Results */}
                  {showClientResults && (
                    <div className="border rounded-lg bg-white shadow-sm max-h-48 overflow-y-auto">
                      {mockClients
                        .filter(
                          (client) =>
                            client.name
                              .toLowerCase()
                              .includes(clientSearch.toLowerCase()) ||
                            client.email
                              .toLowerCase()
                              .includes(clientSearch.toLowerCase()) ||
                            client.phone.includes(clientSearch)
                        )
                        .slice(0, 5)
                        .map((client) => (
                          <button
                            key={client.id}
                            className="w-full p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 text-left"
                            onClick={() => selectClient(client)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={client.avatar} />
                                <AvatarFallback>
                                  {client.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {client.email}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {client.phone}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Selected Client Display */}
                  {selectedClient && (
                    <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedClient.avatar} />
                            <AvatarFallback>
                              {selectedClient.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {selectedClient.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedClient.email} • {selectedClient.phone}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(null);
                            setClientSearch("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Slots Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Service Bookings
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBookingSlot}
                      disabled={!selectedClient}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Service
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {bookingSlots.map((slot, index) => (
                      <div
                        key={slot.id}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Service {index + 1}</h4>
                          {bookingSlots.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeBookingSlot(slot.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Service</Label>
                            <Select
                              value={slot.service}
                              onValueChange={(value) =>
                                updateBookingSlot(slot.id, "service", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem
                                    key={service.id}
                                    value={service.id.toString()}
                                  >
                                    <div className="flex flex-col">
                                      <span>{service.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {service.duration}min
                                        {canViewPricing &&
                                          ` • €${service.price}`}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Professional</Label>
                            <Select
                              value={slot.professional}
                              onValueChange={(value) =>
                                updateBookingSlot(
                                  slot.id,
                                  "professional",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select professional" />
                              </SelectTrigger>
                              <SelectContent>
                                {professionals.map((professional) => (
                                  <SelectItem
                                    key={professional.id}
                                    value={professional.id.toString()}
                                  >
                                    {professional.name} -{" "}
                                    {professional.speciality}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={slot.date}
                              onChange={(e) =>
                                updateBookingSlot(
                                  slot.id,
                                  "date",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Time</Label>
                            <Select
                              value={slot.time}
                              onValueChange={(value) =>
                                updateBookingSlot(slot.id, "time", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
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
                        </div>

                        <div className="space-y-2">
                          <Label>Notes (Optional)</Label>
                          <Textarea
                            placeholder="Any special requests or notes for this service..."
                            rows={2}
                            value={slot.notes}
                            onChange={(e) =>
                              updateBookingSlot(
                                slot.id,
                                "notes",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="border-t pt-4">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Booking Summary</span>
                      <span className="text-sm text-muted-foreground">
                        {bookingSlots.length} service
                        {bookingSlots.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {selectedClient && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Client:</span>{" "}
                        {selectedClient.name}
                      </div>
                    )}

                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Total Services:
                      </span>{" "}
                      {bookingSlots.length}
                    </div>

                    {bookingSlots.some((slot) => slot.service) &&
                      canViewPricing && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Estimated Total:
                          </span>{" "}
                          €
                          {bookingSlots
                            .filter((slot) => slot.service)
                            .reduce((total, slot) => {
                              const service = services.find(
                                (s) => s.id.toString() === slot.service
                              );
                              return total + (service?.price || 0);
                            }, 0)
                            .toFixed(2)}
                        </div>
                      )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetBookingForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      // Check slot availability for each booking slot before creating
                      let allAvailable = true;
                      for (const slot of bookingSlots) {
                        if (slot.service && slot.date && slot.time) {
                          const service = services.find(
                            (s) => s.id.toString() === slot.service
                          );
                          const startDateTime = `${slot.date}T${slot.time}`;
                          const endDateTime = service
                            ? new Date(
                                new Date(startDateTime).getTime() +
                                  service.duration * 60000
                              ).toISOString()
                            : startDateTime;
                          try {
                            const res = await bookingsService.checkSlotAvailability(
                              {
                                entityId,
                                serviceId: slot.service,
                                professionalId: slot.professional,
                                startDateTime,
                                endDateTime,
                                plan: user?.plan || "simple",
                                allowConcurrentBookings:
                                  user?.plan === "business", // Default based on plan
                              }
                            );
                            if (!res.data.available) {
                              allAvailable = false;
                              toast.error(
                                "Selected slot is not available. Please choose another time."
                              );
                              break;
                            }
                          } catch (err) {
                            allAvailable = false;
                            toast.error("Error checking slot availability.");
                            break;
                          }
                        }
                      }
                      if (allAvailable) {
                        // Process the booking creation
                        console.log("Creating bookings:", {
                          client: selectedClient,
                          slots: bookingSlots,
                        });
                        setIsCreateDialogOpen(false);
                        resetBookingForm();
                        // Call createBooking or batch create logic here
                      }
                    }}
                    disabled={
                      !selectedClient ||
                      bookingSlots.filter(
                        (slot) => slot.service && slot.date && slot.time
                      ).length === 0
                    }
                  >
                    Create {bookingSlots.filter((slot) => slot.service).length}{" "}
                    Booking
                    {bookingSlots.filter((slot) => slot.service).length === 1
                      ? ""
                      : "s"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmed}
            </div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.completed}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        {canViewPricing && (
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">€{stats.revenue}</div>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <div className="relative flex-1 md:flex-initial md:w-64">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={clientSearchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setClientSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
                <DialogDescription>
                  Apply additional filters to refine your booking search
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="service-filter">Service</Label>
                  <Select
                    value={serviceFilter}
                    onValueChange={setServiceFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="Haircut & Styling">
                        Haircut & Styling
                      </SelectItem>
                      <SelectItem value="Full Manicure">
                        Full Manicure
                      </SelectItem>
                      <SelectItem value="Deep Tissue Massage">
                        Deep Tissue Massage
                      </SelectItem>
                      <SelectItem value="Color Treatment">
                        Color Treatment
                      </SelectItem>
                      <SelectItem value="Facial Treatment">
                        Facial Treatment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="professional-filter">Professional</Label>
                  <Select
                    value={professionalFilter}
                    onValueChange={setProfessionalFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Professionals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Professionals</SelectItem>
                      <SelectItem value="João Santos">João Santos</SelectItem>
                      <SelectItem value="Sofia Oliveira">
                        Sofia Oliveira
                      </SelectItem>
                      <SelectItem value="Carlos Ferreira">
                        Carlos Ferreira
                      </SelectItem>
                      <SelectItem value="Maria Silva">Maria Silva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {canViewPaymentDetails && (
                  <div>
                    <Label htmlFor="payment-filter">Payment Status</Label>
                    <Select
                      value={paymentFilter}
                      onValueChange={setPaymentFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Payments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setServiceFilter("all");
                      setProfessionalFilter("all");
                      setPaymentFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button onClick={() => setIsFilterDialogOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>
            Complete list of all bookings with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Professional</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                {canViewPaymentDetails && <TableHead>Payment</TableHead>}
                {canViewPricing && <TableHead>Revenue</TableHead>}
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            booking.client && "avatar" in booking.client
                              ? (booking.client as { avatar?: string }).avatar
                              : undefined
                          }
                        />
                        <AvatarFallback className="text-xs">
                          {booking.client?.name
                            ? booking.client.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                            : ""}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {booking.client?.name}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {booking.client &&
                          "phone" in booking.client &&
                          booking.client.phone
                            ? booking.client.phone
                            : ""}
                        </div>
                        {booking.client?.isFirstTime && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            First Time
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.service?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(booking.service as any)?.duration?.duration ||
                          (booking.service as any)?.duration ||
                          0}
                        min • {(booking.service as any)?.category}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1 text-muted-foreground" />
                      {booking.professional?.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.date}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(booking.status)}
                    >
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </Badge>
                  </TableCell>
                  {canViewPaymentDetails && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getPaymentStatusColor(
                            booking.paymentStatus || "pending"
                          )}
                        >
                          {booking.paymentStatus || "pending"}
                        </Badge>
                        {booking.paymentStatus === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentClick(booking)}
                          >
                            Process
                          </Button>
                        )}
                        {booking.paymentStatus === "paid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentClick(booking)}
                          >
                            Details
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {canViewPricing && (
                    <TableCell>
                      <div className="font-medium">
                        €
                        {(booking.service as any)?.pricing?.basePrice ||
                          (booking.service as any)?.price ||
                          0}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBooking({
                            id: booking.id.toString(),
                            clientName: booking.client?.name,
                            clientEmail: booking.client?.email,
                            serviceName: booking.service?.name,
                            professionalName: booking.professional?.name,
                            date: booking.date,
                            time: booking.time,
                            duration:
                              (booking.service as any)?.duration?.duration ||
                              (booking.service as any)?.duration,
                            price:
                              (booking.service as any)?.pricing?.basePrice ||
                              (booking.service as any)?.price,
                            status: booking.status,
                            notes: booking.notes || "",
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditBookingDialog
        booking={editingBooking}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingBooking(null);
        }}
        onSave={(updatedBooking) => {
          // Handle booking update here
          console.log("Updated booking:", updatedBooking);
          setIsEditDialogOpen(false);
          setEditingBooking(null);
        }}
      />

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Management</DialogTitle>
            <DialogDescription>
              Manage payment for {selectedBookingForPayment?.client.name}'s
              booking
            </DialogDescription>
          </DialogHeader>
          {selectedBookingForPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Booking Details</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Service:</strong>{" "}
                      {selectedBookingForPayment.service.name}
                    </p>
                    <p className="text-sm">
                      <strong>Professional:</strong>{" "}
                      {selectedBookingForPayment.professional}
                    </p>
                    <p className="text-sm">
                      <strong>Date:</strong> {selectedBookingForPayment.date} at{" "}
                      {selectedBookingForPayment.time}
                    </p>
                    <p className="text-sm">
                      <strong>Duration:</strong>{" "}
                      {selectedBookingForPayment.service.duration}min
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Payment Information
                  </Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Amount:</strong> €
                      {selectedBookingForPayment.service.price}
                    </p>
                    <p className="text-sm">
                      <strong>Status:</strong>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${getPaymentStatusColor(
                          selectedBookingForPayment.paymentStatus
                        )}`}
                      >
                        {selectedBookingForPayment.paymentStatus}
                      </Badge>
                    </p>
                    {selectedBookingForPayment.paymentStatus === "paid" && (
                      <p className="text-sm">
                        <strong>Paid at:</strong>{" "}
                        {new Date().toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedBookingForPayment.paymentStatus === "pending" && (
                <div className="space-y-4">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mbway">MB Way</SelectItem>
                    </SelectContent>
                  </Select>

                  {paymentMethod === "card" ? (
                    // In-app card flow using Stripe Elements
                    <PaymentForm
                      bookingId={selectedBookingForPayment.id}
                      clientName={selectedBookingForPayment.client?.name}
                      onSuccess={async () => {
                        try {
                          await completeBooking(
                            String(selectedBookingForPayment.id)
                          );
                        } catch (err) {
                          console.error(err);
                        } finally {
                          await fetchBookings();
                          setPaymentDialogOpen(false);
                        }
                      }}
                      onCancel={() => setPaymentDialogOpen(false)}
                    />
                  ) : (
                    <div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-notes">Payment Notes</Label>
                        <Textarea
                          id="payment-notes"
                          placeholder="Add any payment-related notes..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={async () => {
                            try {
                              // For non-card methods we mark booking as completed.
                              await completeBooking(
                                String(selectedBookingForPayment.id)
                              );
                              await fetchBookings();
                              toast.success(
                                "Booking completed and payment recorded"
                              );
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to complete booking");
                            } finally {
                              setPaymentDialogOpen(false);
                            }
                          }}
                        >
                          Mark as Paid
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPaymentDialogOpen(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
