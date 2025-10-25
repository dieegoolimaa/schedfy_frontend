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
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";

export function BookingsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock appointments data
  const appointments = [
    {
      id: 1,
      client: {
        name: "Maria Silva",
        email: "maria@email.com",
        phone: "+351 123 456 789",
        avatar: "MS",
      },
      service: "Haircut & Styling",
      date: "2024-01-15",
      time: "10:00",
      duration: 60,
      price: 45,
      status: "confirmed",
      notes: "Client prefers shorter layers",
    },
    {
      id: 2,
      client: {
        name: "João Santos",
        email: "joao@email.com",
        phone: "+351 987 654 321",
        avatar: "JS",
      },
      service: "Beard Trim",
      date: "2024-01-15",
      time: "11:30",
      duration: 30,
      price: 25,
      status: "confirmed",
      notes: "",
    },
    {
      id: 3,
      client: {
        name: "Ana Costa",
        email: "ana@email.com",
        phone: "+351 555 123 456",
        avatar: "AC",
      },
      service: "Full Manicure",
      date: "2024-01-15",
      time: "14:00",
      duration: 90,
      price: 35,
      status: "pending",
      notes: "First time client",
    },
    {
      id: 4,
      client: {
        name: "Pedro Lima",
        email: "pedro@email.com",
        phone: "+351 444 555 666",
        avatar: "PL",
      },
      service: "Massage Therapy",
      date: "2024-01-15",
      time: "15:30",
      duration: 60,
      price: 60,
      status: "completed",
      notes: "Regular client - deep tissue massage",
    },
    {
      id: 5,
      client: {
        name: "Sofia Oliveira",
        email: "sofia@email.com",
        phone: "+351 777 888 999",
        avatar: "SO",
      },
      service: "Facial Treatment",
      date: "2024-01-16",
      time: "09:00",
      duration: 75,
      price: 55,
      status: "confirmed",
      notes: "Sensitive skin - hypoallergenic products",
    },
  ];

  const services = [
    { id: 1, name: "Haircut & Styling", duration: 60, price: 45 },
    { id: 2, name: "Beard Trim", duration: 30, price: 25 },
    { id: 3, name: "Full Manicure", duration: 90, price: 35 },
    { id: 4, name: "Massage Therapy", duration: 60, price: 60 },
    { id: 5, name: "Facial Treatment", duration: 75, price: 55 },
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.client.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayAppointments = filteredAppointments.filter(
    (appointment) => appointment.date === "2024-01-15"
  );

  const upcomingAppointments = filteredAppointments.filter(
    (appointment) => new Date(appointment.date) > new Date("2024-01-15")
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("bookings.title", "Bookings")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "bookings.subtitle",
                "Manage your appointments and reservations"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Booking</DialogTitle>
                  <DialogDescription>
                    Schedule a new appointment for your client.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-name">Client Name</Label>
                      <Input id="client-name" placeholder="Enter client name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="client@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-phone">Phone</Label>
                      <Input id="client-phone" placeholder="+351 123 456 789" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem
                              key={service.id}
                              value={service.id.toString()}
                            >
                              {service.name} - {service.duration}min - €
                              {service.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Select>
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
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or notes..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Booking</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">
              Today ({todayAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="all">All Appointments</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          {/* Today's Appointments */}
          <TabsContent value="today" className="space-y-4">
            <div className="grid gap-4">
              {todayAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary/10">
                            {appointment.client.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {appointment.client.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getStatusColor(appointment.status)}
                            >
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">
                                {appointment.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.time} ({appointment.duration}min)
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.client.phone}
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {appointment.client.email}
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            €{appointment.price}
                          </p>
                          <p className="text-sm text-muted-foreground">Price</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Upcoming Appointments */}
          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary/10">
                            {appointment.client.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {appointment.client.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getStatusColor(appointment.status)}
                            >
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">
                                {appointment.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {appointment.date}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.time} ({appointment.duration}min)
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.client.phone}
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            €{appointment.price}
                          </p>
                          <p className="text-sm text-muted-foreground">Price</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* All Appointments */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary/10">
                            {appointment.client.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {appointment.client.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getStatusColor(appointment.status)}
                            >
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">
                                {appointment.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {appointment.date}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.time} ({appointment.duration}min)
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.client.phone}
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            €{appointment.price}
                          </p>
                          <p className="text-sm text-muted-foreground">Price</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  Visual calendar with appointment scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 text-center font-medium text-sm"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div
                      key={i}
                      className="aspect-square border rounded-lg p-2 hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="text-sm font-medium">
                        {i + 1 <= 31 ? i + 1 : ""}
                      </div>
                      {i + 1 === 15 && (
                        <div className="space-y-1 mt-1">
                          <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded">
                            10:00 Maria
                          </div>
                          <div className="text-xs bg-green-100 text-green-800 p-1 rounded">
                            11:30 João
                          </div>
                          <div className="text-xs bg-yellow-100 text-yellow-800 p-1 rounded">
                            14:00 Ana
                          </div>
                        </div>
                      )}
                      {i + 1 === 16 && (
                        <div className="space-y-1 mt-1">
                          <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded">
                            09:00 Sofia
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
