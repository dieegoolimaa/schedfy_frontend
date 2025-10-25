import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Star,
  ChevronRight,
  Calendar,
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4000, appointments: 240 },
    { month: 'Feb', revenue: 3000, appointments: 180 },
    { month: 'Mar', revenue: 5000, appointments: 320 },
    { month: 'Apr', revenue: 4500, appointments: 280 },
    { month: 'May', revenue: 6000, appointments: 380 },
    { month: 'Jun', revenue: 5500, appointments: 340 },
  ];

  const appointmentData = [
    { day: 'Mon', scheduled: 12, completed: 10, cancelled: 2 },
    { day: 'Tue', scheduled: 15, completed: 13, cancelled: 2 },
    { day: 'Wed', scheduled: 18, completed: 16, cancelled: 2 },
    { day: 'Thu', scheduled: 14, completed: 12, cancelled: 2 },
    { day: 'Fri', scheduled: 20, completed: 18, cancelled: 2 },
    { day: 'Sat', scheduled: 25, completed: 22, cancelled: 3 },
    { day: 'Sun', scheduled: 8, completed: 7, cancelled: 1 },
  ];

  const serviceData = [
    { name: 'Haircut', value: 35, color: '#0088FE' },
    { name: 'Massage', value: 25, color: '#00C49F' },
    { name: 'Manicure', value: 20, color: '#FFBB28' },
    { name: 'Facial', value: 15, color: '#FF8042' },
    { name: 'Other', value: 5, color: '#8884D8' },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      client: 'Maria Silva',
      service: 'Haircut & Styling',
      time: '10:00 AM',
      avatar: 'MS',
      status: 'confirmed',
    },
    {
      id: 2,
      client: 'João Santos',
      service: 'Beard Trim',
      time: '11:30 AM',
      avatar: 'JS',
      status: 'confirmed',
    },
    {
      id: 3,
      client: 'Ana Costa',
      service: 'Full Manicure',
      time: '2:00 PM',
      avatar: 'AC',
      status: 'pending',
    },
    {
      id: 4,
      client: 'Pedro Lima',
      service: 'Massage Therapy',
      time: '3:30 PM',
      avatar: 'PL',
      status: 'confirmed',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'appointment',
      message: 'New appointment booked by Maria Silva',
      time: '5 minutes ago',
      icon: Calendar,
    },
    {
      id: 2,
      type: 'payment',
      message: 'Payment received from João Santos - €45.00',
      time: '15 minutes ago',
      icon: DollarSign,
    },
    {
      id: 3,
      type: 'review',
      message: 'New 5-star review from Ana Costa',
      time: '1 hour ago',
      icon: Star,
    },
    {
      id: 4,
      type: 'cancellation',
      message: 'Appointment cancelled by Pedro Lima',
      time: '2 hours ago',
      icon: Clock,
    },
  ];

  const stats = [
    {
      title: 'Total Revenue',
      value: '€5,400',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Appointments Today',
      value: '24',
      change: '+8.2%',
      trend: 'up',
      icon: CalendarDays,
      color: 'text-blue-600',
    },
    {
      title: 'Active Clients',
      value: '147',
      change: '+3.1%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Average Rating',
      value: '4.8',
      change: '-0.2%',
      trend: 'down',
      icon: Star,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button size="sm">
            <CalendarDays className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue and appointment trends
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs defaultValue="revenue" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                </TabsList>
                <TabsContent value="revenue" className="space-y-4">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="appointments" className="space-y-4">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" fill="#22c55e" name="Completed" />
                        <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Service Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Service Distribution</CardTitle>
              <CardDescription>
                Popular services this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>
                {upcomingAppointments.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center space-x-4 rounded-lg border p-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {appointment.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {appointment.client}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.service}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <p className={`text-xs ${
                      appointment.status === 'confirmed' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {appointment.status}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" size="sm">
                <ChevronRight className="h-4 w-4 mr-2" />
                View All Appointments
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-none">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Performance Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Goals</CardTitle>
              <CardDescription>
                Track your progress this month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Revenue Goal</span>
                  <span>€5,400 / €8,000</span>
                </div>
                <Progress value={67.5} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Appointments</span>
                  <span>180 / 250</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>New Clients</span>
                  <span>12 / 20</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;