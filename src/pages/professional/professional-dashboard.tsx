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
import {
  ResponsiveCardGrid,
  MobileStatsCard,
} from "../../components/ui/responsive-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
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
import {
  Clock,
  Star,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Filter,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";

export function ProfessionalDashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");

  // Mock professional data
  const professional = {
    name: "Sofia Oliveira",
    role: "Senior Hair Stylist",
    avatar: "SO",
    email: "sofia@bellavista.pt",
    phone: "+351 123 456 789",
    rating: 4.9,
    totalReviews: 124,
    joinDate: "2023-01-15",
    specialties: ["Hair Coloring", "Styling", "Hair Treatment"],
    workingHours: "09:00 - 18:00",
    nextBreak: "13:00 - 14:00",
  };

  const stats = {
    todayBookings: 8,
    weeklyBookings: 32,
    monthlyBookings: 124,
    todayRevenue: 320,
    weeklyRevenue: 1280,
    monthlyRevenue: 4960,
    completionRate: 96.8,
    clientSatisfaction: 4.9,
    averageSessionTime: 45,
    noShowRate: 3.2,
  };

  const todaySchedule = [
    {
      id: 1,
      time: "09:00",
      duration: 60,
      client: "Ana Silva",
      service: "Hair Coloring",
      status: "completed",
      amount: 65,
      notes: "First time client, prefers natural colors",
    },
    {
      id: 2,
      time: "10:30",
      duration: 45,
      client: "Maria Santos",
      service: "Haircut & Styling",
      status: "completed",
      amount: 35,
      notes: "Regular client, usual style",
    },
    {
      id: 3,
      time: "11:30",
      duration: 30,
      client: "João Costa",
      service: "Beard Trim",
      status: "completed",
      amount: 15,
      notes: "Quick trim before meeting",
    },
    {
      id: 4,
      time: "14:00",
      duration: 90,
      client: "Carla Oliveira",
      service: "Hair Treatment",
      status: "in-progress",
      amount: 85,
      notes: "Deep conditioning treatment",
    },
    {
      id: 5,
      time: "16:00",
      duration: 60,
      client: "Pedro Silva",
      service: "Hair Coloring",
      status: "scheduled",
      amount: 70,
      notes: "Cover gray roots",
    },
    {
      id: 6,
      time: "17:30",
      duration: 45,
      client: "Rita Fernandes",
      service: "Styling",
      status: "scheduled",
      amount: 40,
      notes: "Special event styling",
    },
  ];

  const recentClients = [
    {
      id: 1,
      name: "Ana Silva",
      avatar: "AS",
      lastVisit: "2024-01-20",
      totalVisits: 8,
      preferredService: "Hair Coloring",
      rating: 5,
      notes: "Allergic to ammonia",
    },
    {
      id: 2,
      name: "Maria Santos",
      avatar: "MS",
      lastVisit: "2024-01-19",
      totalVisits: 15,
      preferredService: "Haircut",
      rating: 5,
      notes: "Comes every 6 weeks",
    },
    {
      id: 3,
      name: "Carla Oliveira",
      avatar: "CO",
      lastVisit: "2024-01-18",
      totalVisits: 12,
      preferredService: "Hair Treatment",
      rating: 4,
      notes: "Prefers morning appointments",
    },
  ];

  const upcomingBookings = [
    {
      id: 1,
      date: "2024-01-21",
      time: "10:00",
      client: "Luisa Costa",
      service: "Hair Coloring",
      duration: 120,
      amount: 95,
    },
    {
      id: 2,
      date: "2024-01-21",
      time: "14:30",
      client: "Miguel Santos",
      service: "Haircut",
      duration: 45,
      amount: 30,
    },
    {
      id: 3,
      date: "2024-01-22",
      time: "09:00",
      client: "Sofia Ribeiro",
      service: "Styling",
      duration: 60,
      amount: 45,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="text-lg">
              {professional.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {professional.name}
            </h1>
            <p className="text-muted-foreground">{professional.role}</p>
            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="font-medium">{professional.rating}</span>
              <span className="text-muted-foreground ml-1">
                ({professional.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Today</SelectItem>
              <SelectItem value="7d">This Week</SelectItem>
              <SelectItem value="30d">This Month</SelectItem>
              <SelectItem value="90d">3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats - Mobile-First Responsive Layout */}
      <ResponsiveCardGrid>
        <MobileStatsCard
          title="Today's Bookings"
          value={stats.todayBookings}
          subtitle="6 completed"
          color="blue"
        />
        <MobileStatsCard
          title="Today's Revenue"
          value={`€${stats.todayRevenue}`}
          subtitle="+15.2% vs yesterday"
          color="green"
        />
        <MobileStatsCard
          title="Client Satisfaction"
          value={stats.clientSatisfaction}
          subtitle="Excellent rating"
          color="yellow"
        />
        <MobileStatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          subtitle="This month"
          color="purple"
        />
      </ResponsiveCardGrid>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Your appointments for {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Booking
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todaySchedule.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {appointment.time}
                    </div>
                  </TableCell>
                  <TableCell>{appointment.client}</TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>{appointment.duration}min</TableCell>
                  <TableCell>€{appointment.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(appointment.status)}
                      <Badge
                        variant="outline"
                        className={`ml-2 ${getStatusColor(appointment.status)}`}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {appointment.notes}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>Clients you've served recently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback>{client.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {client.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last visit:{" "}
                    {new Date(client.lastVisit).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {client.totalVisits} visits • Prefers{" "}
                    {client.preferredService}
                  </p>
                  {client.notes && (
                    <p className="text-xs text-blue-600">
                      Note: {client.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{client.rating}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your next appointments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">{booking.client}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.date).toLocaleDateString()} at{" "}
                    {booking.time}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.service} • {booking.duration}min
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">€{booking.amount}</p>
                  <Badge variant="outline" className="text-xs">
                    Scheduled
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Your profile and work details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {professional.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {professional.phone}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Work Schedule</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Working Hours: {professional.workingHours}
                  </div>
                  <div className="flex items-center text-sm">
                    <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                    Next Break: {professional.nextBreak}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {professional.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avg. Session Time</span>
                    <span>{stats.averageSessionTime} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>No-Show Rate</span>
                    <span className="text-green-600">{stats.noShowRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Member Since</span>
                    <span>
                      {new Date(professional.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
