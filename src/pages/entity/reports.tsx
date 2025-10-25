import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Star,
} from 'lucide-react';

export function ReportsPage() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('last-30-days');

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4200, appointments: 240, newClients: 18 },
    { month: 'Feb', revenue: 3800, appointments: 220, newClients: 15 },
    { month: 'Mar', revenue: 5100, appointments: 290, newClients: 22 },
    { month: 'Apr', revenue: 4600, appointments: 260, newClients: 19 },
    { month: 'May', revenue: 6200, appointments: 340, newClients: 28 },
    { month: 'Jun', revenue: 5800, appointments: 320, newClients: 25 },
    { month: 'Jul', revenue: 6400, appointments: 350, newClients: 30 },
    { month: 'Aug', revenue: 5900, appointments: 330, newClients: 24 },
    { month: 'Sep', revenue: 6800, appointments: 380, newClients: 32 },
    { month: 'Oct', revenue: 7200, appointments: 400, newClients: 35 },
    { month: 'Nov', revenue: 6600, appointments: 370, newClients: 29 },
    { month: 'Dec', revenue: 7800, appointments: 450, newClients: 40 },
  ];

  const servicePerformance = [
    { service: 'Haircut & Styling', bookings: 87, revenue: 3915, avgRating: 4.8 },
    { service: 'Massage Therapy', bookings: 45, revenue: 2700, avgRating: 4.7 },
    { service: 'Full Manicure', bookings: 62, revenue: 2170, avgRating: 4.9 },
    { service: 'Facial Treatment', bookings: 29, revenue: 1595, avgRating: 4.5 },
    { service: 'Beard Trim', bookings: 38, revenue: 950, avgRating: 4.6 },
  ];

  const clientDemographics = [
    { age: '18-25', count: 45, percentage: 18 },
    { age: '26-35', count: 78, percentage: 31 },
    { age: '36-45', count: 65, percentage: 26 },
    { age: '46-55', count: 42, percentage: 17 },
    { age: '56+', count: 20, percentage: 8 },
  ];

  const appointmentTrends = [
    { day: 'Monday', morning: 8, afternoon: 12, evening: 6 },
    { day: 'Tuesday', morning: 10, afternoon: 15, evening: 8 },
    { day: 'Wednesday', morning: 12, afternoon: 18, evening: 10 },
    { day: 'Thursday', morning: 9, afternoon: 14, evening: 7 },
    { day: 'Friday', morning: 15, afternoon: 20, evening: 12 },
    { day: 'Saturday', morning: 18, afternoon: 25, evening: 15 },
    { day: 'Sunday', morning: 6, afternoon: 8, evening: 4 },
  ];

  const hourlyBookings = [
    { hour: '9:00', bookings: 8 },
    { hour: '10:00', bookings: 12 },
    { hour: '11:00', bookings: 15 },
    { hour: '12:00', bookings: 10 },
    { hour: '14:00', bookings: 18 },
    { hour: '15:00', bookings: 22 },
    { hour: '16:00', bookings: 20 },
    { hour: '17:00', bookings: 16 },
    { hour: '18:00', bookings: 14 },
  ];

  const pieChartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const totalAppointments = revenueData.reduce((sum, month) => sum + month.appointments, 0);
  const totalNewClients = revenueData.reduce((sum, month) => sum + month.newClients, 0);
  const avgRating = servicePerformance.reduce((sum, service) => sum + service.avgRating, 0) / servicePerformance.length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('reports.title', 'Reports')}
            </h1>
            <p className="text-muted-foreground">
              {t('reports.subtitle', 'Analytics and insights for your business')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
                <SelectItem value="last-3-months">Last 3 months</SelectItem>
                <SelectItem value="last-year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +12.5% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +8.2% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNewClients}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                +15.3% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                -0.1 from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over the past year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Distribution</CardTitle>
                  <CardDescription>Appointments by time of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="morning" fill="#8884d8" name="Morning" />
                        <Bar dataKey="afternoon" fill="#82ca9d" name="Afternoon" />
                        <Bar dataKey="evening" fill="#ffc658" name="Evening" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Revenue breakdown by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Appointments</CardTitle>
                  <CardDescription>Correlation between revenue and appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#8884d8" 
                          name="Revenue (€)" 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="appointments" 
                          stroke="#82ca9d" 
                          name="Appointments" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Detailed breakdown of service metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg Rating</TableHead>
                      <TableHead>Revenue per Booking</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicePerformance.map((service) => (
                      <TableRow key={service.service}>
                        <TableCell className="font-medium">{service.service}</TableCell>
                        <TableCell>{service.bookings}</TableCell>
                        <TableCell>€{service.revenue}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {service.avgRating.toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>€{(service.revenue / service.bookings).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Client Demographics</CardTitle>
                  <CardDescription>Age distribution of your clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clientDemographics}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {clientDemographics.map((entry, index) => (
                            <Cell key={entry.age} fill={pieChartColors[index % pieChartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>New Clients Trend</CardTitle>
                  <CardDescription>Monthly new client acquisition</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="newClients" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Client Demographics Breakdown</CardTitle>
                <CardDescription>Detailed age group analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientDemographics.map((demo) => (
                    <div key={demo.age} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{demo.age} years</span>
                        <span className="text-sm text-muted-foreground">
                          {demo.count} clients ({demo.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${demo.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                  <CardDescription>Busiest times of the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyBookings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="bookings" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Patterns</CardTitle>
                  <CardDescription>Appointment patterns by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={appointmentTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="morning"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                        <Area
                          type="monotone"
                          dataKey="afternoon"
                          stackId="1"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                        />
                        <Area
                          type="monotone"
                          dataKey="evening"
                          stackId="1"
                          stroke="#ffc658"
                          fill="#ffc658"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
