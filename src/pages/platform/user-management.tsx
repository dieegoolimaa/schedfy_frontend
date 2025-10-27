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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  Users,
  Calendar,
  Brain,
  Building2,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "superuser" | "admin" | "support" | "analyst";
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  createdAt: string;
  loginCount: number;
  permissions: string[];
  region: "GLOBAL" | "PT" | "BR" | "US";
  avatar?: string;
}

export function UserManagementPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data for platform users
  const platformUsers: PlatformUser[] = [
    {
      id: "usr_001",
      name: "Diego Lima",
      email: "diego@schedfy.com",
      role: "owner",
      status: "active",
      lastLogin: "2024-01-20T10:30:00Z",
      createdAt: "2023-12-01T00:00:00Z",
      loginCount: 245,
      permissions: ["all"],
      region: "GLOBAL",
      avatar: "https://avatar.vercel.sh/diego",
    },
    {
      id: "usr_002",
      name: "Ana Sofia",
      email: "ana@schedfy.com",
      role: "superuser",
      status: "active",
      lastLogin: "2024-01-20T09:15:00Z",
      createdAt: "2024-01-05T08:30:00Z",
      loginCount: 89,
      permissions: [
        "entity_management",
        "user_management",
        "support",
        "reports",
      ],
      region: "PT",
      avatar: "https://avatar.vercel.sh/ana",
    },
    {
      id: "usr_003",
      name: "Carlos Roberto",
      email: "carlos@schedfy.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-19T16:45:00Z",
      createdAt: "2024-01-10T12:00:00Z",
      loginCount: 34,
      permissions: ["entity_management", "reports"],
      region: "BR",
      avatar: "https://avatar.vercel.sh/carlos",
    },
    {
      id: "usr_004",
      name: "Sarah Johnson",
      email: "sarah@schedfy.com",
      role: "support",
      status: "active",
      lastLogin: "2024-01-20T14:20:00Z",
      createdAt: "2024-01-15T09:30:00Z",
      loginCount: 67,
      permissions: ["support", "user_management"],
      region: "US",
      avatar: "https://avatar.vercel.sh/sarah",
    },
    {
      id: "usr_005",
      name: "Maria Gonzalez",
      email: "maria@schedfy.com",
      role: "analyst",
      status: "inactive",
      lastLogin: "2024-01-18T11:10:00Z",
      createdAt: "2024-01-12T14:45:00Z",
      loginCount: 23,
      permissions: ["reports", "analytics"],
      region: "US",
      avatar: "https://avatar.vercel.sh/maria",
    },
  ];

  const filteredUsers = platformUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;
    const matchesRegion =
      selectedRegion === "all" || user.region === selectedRegion;

    return matchesSearch && matchesRole && matchesStatus && matchesRegion;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="h-4 w-4" />;
      case "superuser":
        return <Users className="h-4 w-4" />;
      case "admin":
        return <Building2 className="h-4 w-4" />;
      case "support":
        return <Calendar className="h-4 w-4" />;
      case "analyst":
        return <Brain className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "destructive";
      case "superuser":
        return "default";
      case "admin":
        return "secondary";
      case "support":
        return "outline";
      case "analyst":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
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
      case "GLOBAL":
        return "🌍";
      default:
        return "🌍";
    }
  };

  const handleActivateUser = (userId: string) => {
    console.log("Activating user:", userId);
  };

  const handleSuspendUser = (userId: string) => {
    console.log("Suspending user:", userId);
  };

  const handleDeleteUser = (userId: string) => {
    console.log("Deleting user:", userId);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("platform.userManagement.title", "User Management")}
        </h2>
        <div className="flex items-center space-x-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("platform.userManagement.createUser", "Create User")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {t("platform.userManagement.createUser", "Create User")}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    "platform.userManagement.createUserDescription",
                    "Create a new platform user with specific roles and permissions."
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t("common.name", "Name")}
                  </Label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    {t("common.email", "Email")}
                  </Label>
                  <Input id="email" type="email" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    {t("common.role", "Role")}
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="region" className="text-right">
                    {t("common.region", "Region")}
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GLOBAL">Global</SelectItem>
                      <SelectItem value="PT">Portugal</SelectItem>
                      <SelectItem value="BR">Brazil</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.userManagement.totalUsers", "Total Users")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 {t("platform.userManagement.fromLastMonth", "from last month")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.userManagement.activeUsers", "Active Users")}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {platformUsers.filter((u) => u.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (platformUsers.filter((u) => u.status === "active").length /
                  platformUsers.length) *
                  100
              )}
              % {t("platform.userManagement.ofTotal", "of total")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.userManagement.adminUsers", "Admin Users")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                platformUsers.filter((u) =>
                  ["owner", "superuser", "admin"].includes(u.role)
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {t(
                "platform.userManagement.withAdminAccess",
                "with admin access"
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.userManagement.avgLoginCount", "Avg Login Count")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                platformUsers.reduce((acc, u) => acc + u.loginCount, 0) /
                  platformUsers.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("platform.userManagement.perUser", "per user")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("platform.userManagement.platformUsers", "Platform Users")}
          </CardTitle>
          <CardDescription>
            {t(
              "platform.userManagement.platformUsersDescription",
              "Manage internal users with access to the Schedfy platform administration."
            )}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t(
                  "platform.userManagement.searchUsers",
                  "Search users..."
                )}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("common.role", "Role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                <SelectItem value="owner">
                  {t("common.owner", "Owner")}
                </SelectItem>
                <SelectItem value="superuser">
                  {t("common.superuser", "Superuser")}
                </SelectItem>
                <SelectItem value="admin">
                  {t("common.admin", "Admin")}
                </SelectItem>
                <SelectItem value="support">
                  {t("common.support", "Support")}
                </SelectItem>
                <SelectItem value="analyst">
                  {t("common.analyst", "Analyst")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("common.status", "Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                <SelectItem value="active">
                  {t("common.active", "Active")}
                </SelectItem>
                <SelectItem value="inactive">
                  {t("common.inactive", "Inactive")}
                </SelectItem>
                <SelectItem value="suspended">
                  {t("common.suspended", "Suspended")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("common.region", "Region")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                <SelectItem value="GLOBAL">
                  {t("common.global", "Global")}
                </SelectItem>
                <SelectItem value="PT">
                  {t("common.portugal", "Portugal")}
                </SelectItem>
                <SelectItem value="BR">
                  {t("common.brazil", "Brazil")}
                </SelectItem>
                <SelectItem value="US">
                  {t("common.unitedStates", "United States")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.user", "User")}</TableHead>
                <TableHead>{t("common.role", "Role")}</TableHead>
                <TableHead>{t("common.status", "Status")}</TableHead>
                <TableHead>{t("common.region", "Region")}</TableHead>
                <TableHead>
                  {t("platform.userManagement.lastLogin", "Last Login")}
                </TableHead>
                <TableHead>
                  {t("platform.userManagement.loginCount", "Login Count")}
                </TableHead>
                <TableHead>{t("common.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{getRegionFlag(user.region)}</span>
                      <Badge variant="outline">{user.region}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.loginCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
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
                        {user.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-orange-600"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            {t("common.suspend", "Suspend")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleActivateUser(user.id)}
                            className="text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            {t("common.activate", "Activate")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
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
