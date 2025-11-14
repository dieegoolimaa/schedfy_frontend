import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

export default function ProfessionalBookingsPage() {
  const { t } = useTranslation("professional");
  const { user } = useAuth();
  const entityId = user?.entityId || "";
  const professionalId = user?.id || "";

  const { bookings, loading } = useBookings({
    entityId,
    autoFetch: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter bookings for this professional
  const myBookings = bookings.filter(
    (b) =>
      b.professionalId === professionalId ||
      (b.professionalId as any)?._id === professionalId
  );

  // Apply filters
  const filteredBookings = myBookings.filter((booking) => {
    const matchesSearch =
      !searchQuery ||
      (booking.clientId as any)?.firstName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (booking.clientId as any)?.lastName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (booking.service as any)?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> =
      {
        pending: {
          variant: "secondary",
          icon: AlertCircle,
          label: "Pending",
        },
        confirmed: {
          variant: "default",
          icon: CheckCircle,
          label: "Confirmed",
        },
        completed: {
          variant: "outline",
          icon: CheckCircle,
          label: "Completed",
        },
        cancelled: {
          variant: "destructive",
          icon: XCircle,
          label: "Cancelled",
        },
      };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const upcomingBookings = filteredBookings
    .filter(
      (b) =>
        (b.status === "confirmed" || b.status === "pending") &&
        b.startDateTime &&
        new Date(b.startDateTime) >= new Date()
    )
    .sort((a, b) => {
      const aTime = a.startDateTime ? new Date(a.startDateTime).getTime() : 0;
      const bTime = b.startDateTime ? new Date(b.startDateTime).getTime() : 0;
      return aTime - bTime;
    });

  const todayBookings = upcomingBookings.filter(
    (b) =>
      b.startDateTime &&
      format(new Date(b.startDateTime), "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd")
  );

  const pastBookings = filteredBookings
    .filter(
      (b) =>
        b.status === "completed" ||
        b.status === "cancelled" ||
        (b.startDateTime && new Date(b.startDateTime) < new Date())
    )
    .sort((a, b) => {
      const aTime = a.startDateTime ? new Date(a.startDateTime).getTime() : 0;
      const bTime = b.startDateTime ? new Date(b.startDateTime).getTime() : 0;
      return bTime - aTime;
    });

  const renderBookingCard = (booking: any) => {
    const client = booking.clientId;
    const service = booking.service || booking.serviceId;
    const startTime = new Date(booking.startDateTime);
    const endTime = new Date(booking.endDateTime);

    return (
      <Card key={booking._id}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={(client as any)?.profilePicture} />
                <AvatarFallback>
                  {(client as any)?.firstName?.[0]}
                  {(client as any)?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {(client as any)?.firstName} {(client as any)?.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {(service as any)?.name || "Service"}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {format(startTime, "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
                  </div>
                </div>

                {(client as any)?.phone && (
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="h-4 w-4" />
                    {(client as any).phone}
                  </div>
                )}
                {(client as any)?.email && (
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-4 w-4" />
                    {(client as any).email}
                  </div>
                )}

                {booking.notes && (
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium mb-1">Notes:</p>
                    <p className="text-muted-foreground">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your scheduled appointments
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings.length}</div>
            <p className="text-xs text-muted-foreground">appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myBookings.length}</div>
            <p className="text-xs text-muted-foreground">all bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("filters.searchPlaceholder", "Search by client or service...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("filters.allStatus", "All Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allStatus", "All Status")}</SelectItem>
                <SelectItem value="pending">{t("filters.pending", "Pending")}</SelectItem>
                <SelectItem value="confirmed">{t("filters.confirmed", "Confirmed")}</SelectItem>
                <SelectItem value="completed">{t("filters.completed", "Completed")}</SelectItem>
                <SelectItem value="cancelled">{t("filters.cancelled", "Cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Loading appointments...</p>
              </CardContent>
            </Card>
          ) : upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-muted-foreground">
                  You don't have any scheduled appointments yet
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Loading appointments...</p>
              </CardContent>
            </Card>
          ) : pastBookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No past appointments
                </h3>
                <p className="text-muted-foreground">
                  Your completed appointments will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            pastBookings.map(renderBookingCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
