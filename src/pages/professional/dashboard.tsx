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
import { Label } from "../../components/ui/label";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Clock,
  Users,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Award,
  Target,
  Activity,
} from "lucide-react";

export function ProfessionalDashboard() {
  const [timeFilter, setTimeFilter] = useState("week");

  // Mock professional data
  const professionalData = {
    id: 1,
    name: "João Santos",
    role: "Senior Stylist",
    avatar: "JS",
    email: "joao.santos@schedfy.com",
    phone: "+351 123 456 789",
    businessName: "Bella Vita Salon & Spa",
    startDate: "2023-01-15",
    specialities: ["Haircut", "Styling", "Color"],
    rating: 4.8,
    totalReviews: 156,
  };

  // Today's schedule
  const todaySchedule = [
    {
      id: 1,
      time: "09:00",
      duration: 60,
      client: "Ana Silva",
      service: "Haircut & Styling",
      status: "confirmed",
      phone: "+351 123 456 789",
      notes: "First time client",
    },
    {
      id: 2,
      time: "10:30",
      duration: 45,
      client: "Maria Oliveira",
      service: "Hair Styling",
      status: "confirmed",
      phone: "+351 987 654 321",
      notes: "Regular client, prefers volume",
    },
    {
      id: 3,
      time: "12:00",
      duration: 90,
      client: "Sofia Costa",
      service: "Hair Coloring",
      status: "pending",
      phone: "+351 555 123 456",
      notes: "Wants to go blonde",
    },
    {
      id: 4,
      time: "14:30",
      duration: 60,
      client: "Pedro Santos",
      service: "Haircut",
      status: "confirmed",
      phone: "+351 444 555 666",
      notes: "",
    },
    {
      id: 5,
      time: "16:00",
      duration: 45,
      client: "Luisa Fernandes",
      service: "Styling",
      status: "confirmed",
      phone: "+351 777 888 999",
      notes: "Special occasion styling",
    },
  ];

  // Performance data
  const weeklyData = [
    { day: "Mon", bookings: 6, revenue: 240 },
    { day: "Tue", bookings: 8, revenue: 320 },
    { day: "Wed", bookings: 5, revenue: 200 },
    { day: "Thu", bookings: 7, revenue: 280 },
    { day: "Fri", bookings: 9, revenue: 360 },
    { day: "Sat", bookings: 11, revenue: 440 },
    { day: "Sun", bookings: 3, revenue: 120 },
  ];

  const monthlyData = [
    { month: "Jan", bookings: 52, revenue: 2080 },
    { month: "Feb", bookings: 48, revenue: 1920 },
    { month: "Mar", bookings: 56, revenue: 2240 },
    { month: "Apr", bookings: 61, revenue: 2440 },
    { month: "May", bookings: 58, revenue: 2320 },
    { month: "Jun", bookings: 67, revenue: 2680 },
  ];

  const currentData = timeFilter === "week" ? weeklyData : monthlyData;

  // Stats
  const stats = {
    today: {
      bookings: todaySchedule.length,
      confirmed: todaySchedule.filter((b) => b.status === "confirmed").length,
      pending: todaySchedule.filter((b) => b.status === "pending").length,
      revenue: todaySchedule.reduce((sum, b) => {
        let servicePrice;
        if (b.service === "Haircut & Styling") {
          servicePrice = 35;
        } else if (b.service === "Hair Coloring") {
          servicePrice = 85;
        } else if (b.service === "Haircut") {
          servicePrice = 25;
        } else {
          servicePrice = 30;
        }
        return sum + servicePrice;
      }, 0),
    },
    thisMonth: {
      bookings: 67,
      revenue: 2680,
      commission: 1608, // 60% commission
      rating: 4.8,
      newClients: 12,
    },
    overall: {
      totalBookings: 342,
      totalRevenue: 13680,
      totalCommission: 8208,
      averageRating: 4.8,
      totalClients: 198,
    },
  };

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {professionalData.name}!
          </h1>
          <p className="text-muted-foreground">
            {professionalData.role} at {professionalData.businessName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{professionalData.rating}</span>
            <span className="text-muted-foreground">
              ({professionalData.totalReviews} reviews)
            </span>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback>{professionalData.avatar}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.today.bookings}</div>
            <p className="text-xs text-muted-foreground">Today's Bookings</p>
            <div className="text-xs text-green-600 mt-1">
              {stats.today.confirmed} confirmed, {stats.today.pending} pending
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">€{stats.today.revenue}</div>
            <p className="text-xs text-muted-foreground">Expected Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.thisMonth.bookings}</div>
            <p className="text-xs text-muted-foreground">This Month</p>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              €{stats.thisMonth.commission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Commission</p>
            <div className="text-xs text-muted-foreground mt-1">
              60% of €{stats.thisMonth.revenue}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {stats.thisMonth.newClients}
            </div>
            <p className="text-xs text-muted-foreground">New Clients</p>
            <div className="text-xs text-muted-foreground mt-1">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* Today's Schedule */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Today's Appointments - {new Date().toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                Your schedule for today with client details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaySchedule.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="font-medium">
                            {appointment.time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {appointment.client}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {appointment.service}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span>{appointment.duration} min</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(appointment.status)} flex items-center gap-1 w-fit`}
                        >
                          {getStatusIcon(appointment.status)}
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {appointment.notes || "No notes"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            Contact
                          </Button>
                          {appointment.status === "pending" && (
                            <Button size="sm">Confirm</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Performance Analytics</h3>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bookings Trend</CardTitle>
                <CardDescription>
                  Number of appointments{" "}
                  {timeFilter === "week" ? "this week" : "over time"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeFilter === "week" ? "day" : "month"} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Earnings {timeFilter === "week" ? "this week" : "over time"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeFilter === "week" ? "day" : "month"} />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.overall.totalBookings}
                </div>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  €{stats.overall.totalCommission.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.overall.averageRating}
                </div>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {stats.overall.totalClients}
                </div>
                <p className="text-xs text-muted-foreground">Total Clients</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Clients */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                My Clients
              </CardTitle>
              <CardDescription>Clients you've served recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Client Management</h3>
                <p className="text-muted-foreground mb-4">
                  View your client history and build relationships.
                </p>
                <Button variant="outline">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
                <CardDescription>Your professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-lg">
                      {professionalData.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {professionalData.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {professionalData.role}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="h-3 w-3 mr-1 text-yellow-500" />
                      <span className="text-sm">
                        {professionalData.rating} (
                        {professionalData.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      EMAIL
                    </Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{professionalData.email}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      PHONE
                    </Label>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{professionalData.phone}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      BUSINESS
                    </Label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{professionalData.businessName}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      SPECIALITIES
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {professionalData.specialities.map((speciality) => (
                        <Badge
                          key={speciality}
                          variant="secondary"
                          className="text-xs"
                        >
                          {speciality}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Your milestones and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Award className="h-8 w-8 text-gold-500" />
                    <div>
                      <div className="font-medium">Top Performer</div>
                      <div className="text-sm text-muted-foreground">
                        Highest rated professional this month
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">Goal Achiever</div>
                      <div className="text-sm text-muted-foreground">
                        Exceeded monthly booking target
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Activity className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="font-medium">Client Favorite</div>
                      <div className="text-sm text-muted-foreground">
                        95% client satisfaction rate
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    Member since:{" "}
                    {new Date(professionalData.startDate).toLocaleDateString()}
                  </div>
                  <Button variant="outline" className="w-full">
                    View All Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
