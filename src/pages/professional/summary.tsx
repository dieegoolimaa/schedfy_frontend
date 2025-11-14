import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
} from "lucide-react";

export function ProfessionalSummaryPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  // Mock data
  const summary = {
    todayBookings: 5,
    monthlyRevenue: 1250,
    averageRating: 4.8,
    totalClients: 67,
    completionRate: 96,
    rebookingRate: 78,
    completedThisMonth: 45,
  };

  const weeklyData = [
    { day: "Mon", bookings: 6 },
    { day: "Tue", bookings: 8 },
    { day: "Wed", bookings: 5 },
    { day: "Thu", bookings: 7 },
    { day: "Fri", bookings: 9 },
    { day: "Sat", bookings: 4 },
    { day: "Sun", bookings: 2 },
  ];

  const serviceData = [
    { name: "Haircut", value: 45, color: "#8884d8" },
    { name: "Hair Color", value: 30, color: "#82ca9d" },
    { name: "Styling", value: 15, color: "#ffc658" },
    { name: "Treatment", value: 10, color: "#ff7300" },
  ];

  const upcomingAppointments = [
    {
      id: "1",
      clientName: "Ana Silva",
      service: "Haircut & Style",
      time: "09:00",
      duration: 60,
      status: "confirmed",
    },
    {
      id: "2",
      clientName: "Carlos Santos",
      service: "Beard Trim",
      time: "10:30",
      duration: 30,
      status: "confirmed",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("professional.summary.title", "Professional Summary")}
          </h1>
          <p className="text-base text-muted-foreground">
            {t("professional.summary.subtitle", "Your performance overview and upcoming schedule")}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Bookings
            </CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">{summary.todayBookings}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+2</span>
              <span>from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">{formatCurrency(summary.monthlyRevenue)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+12%</span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating
            </CardTitle>
            <Star className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">{summary.averageRating}</div>
            <div className="flex items-center space-x-1 mt-2">
              {renderStars(Math.floor(summary.averageRating))}
              <span className="text-xs text-muted-foreground ml-2">({summary.totalClients} reviews)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <Target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-foreground">{summary.completionRate}%</div>
            <Progress value={summary.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Weekly Performance</CardTitle>
            <CardDescription>Bookings for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Service Distribution</CardTitle>
            <CardDescription>Services provided this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Today's Schedule</CardTitle>
          <CardDescription>Your upcoming appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-medium">{appointment.clientName}</div>
                  <div className="text-sm text-muted-foreground">{appointment.service}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {appointment.time} ({appointment.duration}min)
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold">Performance Insights</CardTitle>
          <CardDescription>Key metrics and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Client Retention</span>
              </div>
              <div className="text-2xl font-bold">{summary.rebookingRate}%</div>
              <Progress value={summary.rebookingRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Monthly Completion</span>
              </div>
              <div className="text-2xl font-bold">{summary.completedThisMonth}</div>
              <div className="text-xs text-muted-foreground">appointments completed</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <div className="text-2xl font-bold">{summary.completionRate}%</div>
              <div className="text-xs text-emerald-600">Exceeds target (90%)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}