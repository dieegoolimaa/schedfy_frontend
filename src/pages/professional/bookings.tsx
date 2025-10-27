import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: "confirmed" | "pending" | "completed" | "cancelled" | "no_show";
  notes?: string;
  location?: string;
}

export function ProfessionalBookingsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Mock data for professional's assigned bookings
  const bookings: Booking[] = [
    {
      id: "1",
      clientName: "Ana Silva",
      clientPhone: "+351 912 345 678",
      serviceName: "Haircut & Style",
      date: "2024-01-25",
      time: "09:00",
      duration: 60,
      price: 35,
      status: "confirmed",
      notes: "Client prefers shorter layers",
      location: "Salon Main Floor",
    },
    {
      id: "2",
      clientName: "Carlos Santos",
      clientPhone: "+351 913 456 789",
      serviceName: "Beard Trim",
      date: "2024-01-25",
      time: "10:30",
      duration: 30,
      price: 15,
      status: "confirmed",
      location: "Salon Main Floor",
    },
    {
      id: "3",
      clientName: "Maria Oliveira",
      clientPhone: "+351 914 567 890",
      serviceName: "Hair Color",
      date: "2024-01-25",
      time: "14:00",
      duration: 120,
      price: 85,
      status: "pending",
      notes: "First time client, consultation needed",
      location: "Salon Private Room",
    },
    {
      id: "4",
      clientName: "João Pereira",
      clientPhone: "+351 915 678 901",
      serviceName: "Haircut",
      date: "2024-01-24",
      time: "16:00",
      duration: 45,
      price: 25,
      status: "completed",
      location: "Salon Main Floor",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "no_show":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            No Show
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === "today") {
      matchesDate = booking.date === "2024-01-25";
    } else if (dateFilter === "upcoming") {
      matchesDate = new Date(booking.date) >= new Date("2024-01-25");
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const todayBookings = bookings.filter((b) => b.date === "2024-01-25");
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.date) > new Date("2024-01-25")
  );
  const completedBookings = bookings.filter((b) => b.status === "completed");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("professional.bookings.title", "My Bookings")}
          </h1>
          <p className="text-base text-muted-foreground">
            {t(
              "professional.bookings.subtitle",
              "View and manage your assigned bookings"
            )}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Bookings
            </CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              {todayBookings.length}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {todayBookings.filter((b) => b.status === "confirmed").length}{" "}
              confirmed
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              {upcomingBookings.length}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Next 7 days
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              {completedBookings.length}
            </div>
            <div className="text-xs text-muted-foreground mt-2">This month</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">
              €{completedBookings.reduce((sum, b) => sum + b.price, 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-2">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">
            Booking Management
          </CardTitle>
          <CardDescription>
            View and manage your assigned appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by client name or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
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
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{booking.clientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.clientPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.serviceName}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {booking.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.duration}min</TableCell>
                    <TableCell>€{booking.price}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.location}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {booking.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600"
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600"
                          >
                            Complete
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No bookings found matching your criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
