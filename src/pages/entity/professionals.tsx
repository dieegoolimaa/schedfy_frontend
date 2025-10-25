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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Edit,
  Trash2,
  User,
  Star,
  Calendar,
  Euro,
  TrendingUp,
  Camera,
} from "lucide-react";

export function ProfessionalsPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock professionals data
  const professionals = [
    {
      id: 1,
      name: "João Santos",
      email: "joao.santos@schedfy.com",
      phone: "+351 123 456 789",
      avatar: "JS",
      role: "Senior Stylist",
      specialities: ["Haircut", "Styling", "Color"],
      status: "active",
      startDate: "2023-01-15",
      schedule: {
        monday: { enabled: true, start: "09:00", end: "18:00" },
        tuesday: { enabled: true, start: "09:00", end: "18:00" },
        wednesday: { enabled: true, start: "09:00", end: "18:00" },
        thursday: { enabled: true, start: "09:00", end: "18:00" },
        friday: { enabled: true, start: "09:00", end: "19:00" },
        saturday: { enabled: true, start: "10:00", end: "17:00" },
        sunday: { enabled: false, start: "10:00", end: "16:00" },
      },
      stats: {
        totalBookings: 342,
        completedBookings: 326,
        averageRating: 4.8,
        totalRevenue: 15420,
        thisMonthBookings: 28,
        thisMonthRevenue: 1260,
      },
      services: [
        { id: 1, name: "Haircut & Styling", commission: 60 },
        { id: 2, name: "Hair Coloring", commission: 55 },
        { id: 3, name: "Beard Trim", commission: 70 },
      ],
    },
    {
      id: 2,
      name: "Sofia Oliveira",
      email: "sofia.oliveira@schedfy.com",
      phone: "+351 987 654 321",
      avatar: "SO",
      role: "Nail Technician",
      specialities: ["Manicure", "Pedicure", "Nail Art"],
      status: "active",
      startDate: "2023-03-10",
      schedule: {
        monday: { enabled: true, start: "10:00", end: "19:00" },
        tuesday: { enabled: true, start: "10:00", end: "19:00" },
        wednesday: { enabled: true, start: "10:00", end: "19:00" },
        thursday: { enabled: true, start: "10:00", end: "19:00" },
        friday: { enabled: true, start: "10:00", end: "19:00" },
        saturday: { enabled: true, start: "09:00", end: "18:00" },
        sunday: { enabled: false, start: "10:00", end: "16:00" },
      },
      stats: {
        totalBookings: 198,
        completedBookings: 187,
        averageRating: 4.9,
        totalRevenue: 6930,
        thisMonthBookings: 22,
        thisMonthRevenue: 770,
      },
      services: [
        { id: 4, name: "Full Manicure", commission: 65 },
        { id: 5, name: "Pedicure", commission: 65 },
        { id: 6, name: "Nail Art", commission: 60 },
      ],
    },
    {
      id: 3,
      name: "Carlos Ferreira",
      email: "carlos.ferreira@schedfy.com",
      phone: "+351 555 123 456",
      avatar: "CF",
      role: "Massage Therapist",
      specialities: ["Deep Tissue", "Relaxation", "Sports Massage"],
      status: "active",
      startDate: "2022-11-20",
      schedule: {
        monday: { enabled: true, start: "08:00", end: "17:00" },
        tuesday: { enabled: true, start: "08:00", end: "17:00" },
        wednesday: { enabled: true, start: "08:00", end: "17:00" },
        thursday: { enabled: true, start: "08:00", end: "17:00" },
        friday: { enabled: true, start: "08:00", end: "17:00" },
        saturday: { enabled: true, start: "09:00", end: "16:00" },
        sunday: { enabled: false, start: "10:00", end: "15:00" },
      },
      stats: {
        totalBookings: 156,
        completedBookings: 148,
        averageRating: 4.7,
        totalRevenue: 9360,
        thisMonthBookings: 18,
        thisMonthRevenue: 1080,
      },
      services: [
        { id: 7, name: "Deep Tissue Massage", commission: 70 },
        { id: 8, name: "Relaxation Massage", commission: 70 },
        { id: 9, name: "Sports Massage", commission: 75 },
      ],
    },
    {
      id: 4,
      name: "Maria Rodrigues",
      email: "maria.rodrigues@schedfy.com",
      phone: "+351 444 555 666",
      avatar: "MR",
      role: "Aesthetician",
      specialities: ["Facial", "Skincare", "Anti-aging"],
      status: "inactive",
      startDate: "2023-06-01",
      schedule: {
        monday: { enabled: true, start: "09:00", end: "18:00" },
        tuesday: { enabled: true, start: "09:00", end: "18:00" },
        wednesday: { enabled: false, start: "09:00", end: "18:00" },
        thursday: { enabled: true, start: "09:00", end: "18:00" },
        friday: { enabled: true, start: "09:00", end: "18:00" },
        saturday: { enabled: false, start: "10:00", end: "17:00" },
        sunday: { enabled: false, start: "10:00", end: "16:00" },
      },
      stats: {
        totalBookings: 89,
        completedBookings: 84,
        averageRating: 4.5,
        totalRevenue: 4620,
        thisMonthBookings: 0,
        thisMonthRevenue: 0,
      },
      services: [
        { id: 10, name: "Facial Treatment", commission: 55 },
        { id: 11, name: "Anti-aging Treatment", commission: 50 },
      ],
    },
  ];

  const roles = [
    "Senior Stylist",
    "Junior Stylist",
    "Nail Technician",
    "Massage Therapist",
    "Aesthetician",
    "Barber",
    "Receptionist",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "vacation":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "sick":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredProfessionals = professionals.filter((professional) => {
    const matchesSearch =
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specialities.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || professional.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: professionals.length,
    active: professionals.filter((p) => p.status === "active").length,
    inactive: professionals.filter((p) => p.status === "inactive").length,
    totalRevenue: professionals.reduce(
      (sum, p) => sum + p.stats.totalRevenue,
      0
    ),
    avgRating:
      professionals.reduce((sum, p) => sum + p.stats.averageRating, 0) /
      professionals.length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("professionals.title", "Professionals")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "professionals.subtitle",
              "Manage attendant profiles and assignments"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Professional
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Professional</DialogTitle>
                <DialogDescription>
                  Create a new professional profile for your team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prof-name">Full Name</Label>
                    <Input id="prof-name" placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof-email">Email</Label>
                    <Input
                      id="prof-email"
                      type="email"
                      placeholder="professional@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prof-phone">Phone</Label>
                    <Input id="prof-phone" placeholder="+351 123 456 789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prof-role">Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem
                            key={role}
                            value={role.toLowerCase().replace(" ", "-")}
                          >
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialities">Specialities</Label>
                  <Input
                    id="specialities"
                    placeholder="e.g. Haircut, Styling, Color (comma separated)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Professional background and experience..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Add Professional</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Professionals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              €{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {stats.avgRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search professionals..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="vacation">On Vacation</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Professionals Content */}
      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfessionals.map((professional) => (
              <Card
                key={professional.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback>{professional.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {professional.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {professional.role}
                        </p>
                        <Badge
                          variant="outline"
                          className={getStatusColor(professional.status)}
                        >
                          {professional.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                      {professional.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                      {professional.phone}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Specialities</div>
                    <div className="flex flex-wrap gap-1">
                      {professional.specialities.map((speciality) => (
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

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="font-medium">
                          {professional.stats.thisMonthBookings}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This Month
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Euro className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="font-medium">
                          €{professional.stats.thisMonthRevenue}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="font-medium">
                          {professional.stats.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="font-medium">
                          {professional.stats.completedBookings}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Professionals Overview</CardTitle>
              <CardDescription>
                Complete list of all professionals with key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professional</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>This Month</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.map((professional) => (
                    <TableRow key={professional.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {professional.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {professional.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {professional.specialities.join(", ")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{professional.role}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{professional.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {professional.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {professional.stats.thisMonthBookings} bookings
                          </div>
                          <div className="text-sm text-muted-foreground">
                            €{professional.stats.thisMonthRevenue}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          €{professional.stats.totalRevenue.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {professional.stats.averageRating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(professional.status)}
                        >
                          {professional.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance View */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Professionals with highest ratings and revenue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...filteredProfessionals]
                  .sort(
                    (a, b) =>
                      b.stats.thisMonthRevenue - a.stats.thisMonthRevenue
                  )
                  .slice(0, 5)
                  .map((professional, index) => (
                    <div
                      key={professional.id}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium">
                          #{index + 1}
                        </span>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {professional.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {professional.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {professional.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          €{professional.stats.thisMonthRevenue}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {professional.stats.thisMonthBookings} bookings
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Assignments</CardTitle>
                <CardDescription>
                  Services assigned to each professional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredProfessionals.map((professional) => (
                  <div key={professional.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="" />
                          <AvatarFallback className="text-xs">
                            {professional.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {professional.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {professional.services.length} services
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {professional.services.map((service) => (
                        <Badge
                          key={service.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {service.name} ({service.commission}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
