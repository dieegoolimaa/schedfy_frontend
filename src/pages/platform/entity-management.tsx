import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Building2,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Pause,
  Play,
  Trash2,
  Users,
  Calendar,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";

interface Entity {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  plan: "simple" | "individual" | "business";
  region: "PT" | "BR" | "US";
  status: "active" | "suspended" | "pending";
  createdAt: string;
  lastLogin: string;
  monthlyRevenue: number;
  totalUsers: number;
  totalBookings: number;
  category: string;
  phone?: string;
  website?: string;
  address?: string;
}

export function EntityManagementPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data for entities
  const entities: Entity[] = [
    {
      id: "ent_001",
      name: "Beautiful Salon",
      ownerName: "Maria Silva",
      ownerEmail: "maria@beautifulsalon.pt",
      plan: "business",
      region: "PT",
      status: "active",
      createdAt: "2024-01-15T10:00:00Z",
      lastLogin: "2024-01-20T09:30:00Z",
      monthlyRevenue: 149.97,
      totalUsers: 8,
      totalBookings: 245,
      category: "Beauty & Wellness",
      phone: "+351 912 345 678",
      website: "https://beautifulsalon.pt",
      address: "Rua das Flores, 123, Lisboa",
    },
    {
      id: "ent_002",
      name: "Hair Studio Pro",
      ownerName: "João Santos",
      ownerEmail: "joao@hairstudiopro.pt",
      plan: "individual",
      region: "PT",
      status: "active",
      createdAt: "2024-01-10T14:20:00Z",
      lastLogin: "2024-01-19T16:45:00Z",
      monthlyRevenue: 59.97,
      totalUsers: 3,
      totalBookings: 89,
      category: "Beauty & Wellness",
      phone: "+351 965 432 109",
      address: "Avenida Central, 45, Porto",
    },
    {
      id: "ent_003",
      name: "Wellness Center",
      ownerName: "Ana Costa",
      ownerEmail: "ana@wellnesscenter.pt",
      plan: "simple",
      region: "PT",
      status: "suspended",
      createdAt: "2024-01-05T08:15:00Z",
      lastLogin: "2024-01-18T11:20:00Z",
      monthlyRevenue: 0,
      totalUsers: 1,
      totalBookings: 12,
      category: "Health & Fitness",
      phone: "+351 987 654 321",
    },
    {
      id: "ent_004",
      name: "Spa Paradise",
      ownerName: "Carlos Oliveira",
      ownerEmail: "carlos@spaparadise.com.br",
      plan: "business",
      region: "BR",
      status: "active",
      createdAt: "2024-01-08T12:30:00Z",
      lastLogin: "2024-01-20T08:15:00Z",
      monthlyRevenue: 149.97,
      totalUsers: 12,
      totalBookings: 378,
      category: "Beauty & Wellness",
      phone: "+55 11 98765-4321",
      website: "https://spaparadise.com.br",
      address: "Rua Augusta, 1000, São Paulo",
    },
    {
      id: "ent_005",
      name: "Elite Fitness",
      ownerName: "Michael Johnson",
      ownerEmail: "michael@elitefitness.com",
      plan: "individual",
      region: "US",
      status: "pending",
      createdAt: "2024-01-18T16:45:00Z",
      lastLogin: "2024-01-19T10:30:00Z",
      monthlyRevenue: 0,
      totalUsers: 0,
      totalBookings: 0,
      category: "Health & Fitness",
      phone: "+1 555 123 4567",
      website: "https://elitefitness.com",
      address: "123 Main St, New York, NY",
    },
  ];

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch =
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === "all" || entity.plan === selectedPlan;
    const matchesRegion =
      selectedRegion === "all" || entity.region === selectedRegion;
    const matchesStatus =
      selectedStatus === "all" || entity.status === selectedStatus;

    return matchesSearch && matchesPlan && matchesRegion && matchesStatus;
  });

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "simple":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "individual":
        return "bg-green-100 text-green-800 border-green-200";
      case "business":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case "PT":
        return "🇵🇹";
      case "BR":
        return "🇧🇷";
      case "US":
        return "🇺🇸";
      default:
        return "🌍";
    }
  };

  const handleSuspendEntity = (entityId: string) => {
    // Implementation for suspending entity
    console.log("Suspending entity:", entityId);
  };

  const handleActivateEntity = (entityId: string) => {
    // Implementation for activating entity
    console.log("Activating entity:", entityId);
  };

  const handleDeleteEntity = (entityId: string) => {
    // Implementation for deleting entity
    console.log("Deleting entity:", entityId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("platform.entities.title", "Entity Management")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "platform.entities.subtitle",
              "Manage all entities in the Schedfy platform"
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("common.export", "Export")}
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("platform.entities.create", "Create Entity")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {t(
                    "platform.entities.createDialog.title",
                    "Create New Entity"
                  )}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    "platform.entities.createDialog.description",
                    "Create a new entity in the platform"
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="entity-name" className="text-right">
                    {t("platform.entities.name", "Name")}
                  </Label>
                  <Input id="entity-name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="owner-name" className="text-right">
                    {t("platform.entities.owner", "Owner")}
                  </Label>
                  <Input id="owner-name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="owner-email" className="text-right">
                    {t("common.email", "Email")}
                  </Label>
                  <Input id="owner-email" type="email" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plan" className="text-right">
                    {t("platform.entities.plan", "Plan")}
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="region" className="text-right">
                    {t("platform.entities.region", "Region")}
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PT">🇵🇹 Portugal</SelectItem>
                      <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                      <SelectItem value="US">🇺🇸 United States</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("common.create", "Create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t(
                    "platform.entities.search",
                    "Search entities..."
                  )}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="PT">🇵🇹 Portugal</SelectItem>
                <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                <SelectItem value="US">🇺🇸 United States</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            {t("platform.entities.list", "Entities")} ({filteredEntities.length}
            )
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("platform.entities.name", "Name")}</TableHead>
                <TableHead>{t("platform.entities.owner", "Owner")}</TableHead>
                <TableHead>{t("platform.entities.plan", "Plan")}</TableHead>
                <TableHead>{t("platform.entities.region", "Region")}</TableHead>
                <TableHead>{t("platform.entities.status", "Status")}</TableHead>
                <TableHead>
                  {t("platform.entities.revenue", "Revenue")}
                </TableHead>
                <TableHead>{t("platform.entities.users", "Users")}</TableHead>
                <TableHead>
                  {t("platform.entities.bookings", "Bookings")}
                </TableHead>
                <TableHead>
                  {t("platform.entities.lastLogin", "Last Login")}
                </TableHead>
                <TableHead className="text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{entity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {entity.category}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{entity.ownerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {entity.ownerEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getPlanBadgeColor(entity.plan)}
                    >
                      {entity.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{getRegionFlag(entity.region)}</span>
                      <span>{entity.region}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(entity.status)}
                    >
                      {entity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>€{entity.monthlyRevenue.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{entity.totalUsers}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{entity.totalBookings}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(entity.lastLogin).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                          {t("common.actions", "Actions")}
                        </DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          {t("common.view", "View")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          {t("common.edit", "Edit")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {entity.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() => handleSuspendEntity(entity.id)}
                            className="text-orange-600"
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            {t("common.suspend", "Suspend")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleActivateEntity(entity.id)}
                            className="text-green-600"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            {t("common.activate", "Activate")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteEntity(entity.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("common.delete", "Delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
