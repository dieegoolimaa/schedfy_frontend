import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ResponsiveCardGrid,
  MobileStatsCard,
} from "../../components/ui/responsive-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
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
import { Switch } from "../../components/ui/switch";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Edit,
  MoreHorizontal,
  UserCheck,
  UserX,
  Key,
  Activity,
} from "lucide-react";

export function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Handlers
  const handleEditUser = (userId: number) => {
    console.log("Edit user:", userId);
    // TODO: Implement edit user functionality
  };

  const handleResetPassword = (userId: number) => {
    console.log("Reset password for user:", userId);
    // TODO: Implement reset password functionality
  };

  const handleViewActivity = (userId: number) => {
    console.log("View activity for user:", userId);
    // TODO: Implement view activity functionality
  };

  // Mock users data
  const users = [
    {
      id: 1,
      name: "João Santos",
      email: "joao.santos@bellavita.pt",
      phone: "+351 123 456 789",
      role: "Manager",
      status: "active",
      avatar: "JS",
      lastLogin: "2024-01-20T10:30:00Z",
      createdAt: "2023-01-15T09:00:00Z",
      permissions: ["bookings", "services", "reports", "professionals"],
    },
    {
      id: 2,
      name: "Sofia Oliveira",
      email: "sofia.oliveira@bellavita.pt",
      phone: "+351 987 654 321",
      role: "HR",
      status: "active",
      avatar: "SO",
      lastLogin: "2024-01-19T16:45:00Z",
      createdAt: "2023-03-10T11:30:00Z",
      permissions: ["professionals", "users", "reports"],
    },
    {
      id: 3,
      name: "Carlos Ferreira",
      email: "carlos.ferreira@bellavita.pt",
      phone: "+351 555 123 456",
      role: "Attendant",
      status: "active",
      avatar: "CF",
      lastLogin: "2024-01-20T08:15:00Z",
      createdAt: "2022-11-20T14:20:00Z",
      permissions: ["bookings"],
    },
    {
      id: 4,
      name: "Maria Rodrigues",
      email: "maria.rodrigues@bellavita.pt",
      phone: "+351 444 555 666",
      role: "Admin",
      status: "inactive",
      avatar: "MR",
      lastLogin: "2024-01-15T12:00:00Z",
      createdAt: "2023-06-01T10:00:00Z",
      permissions: [
        "bookings",
        "services",
        "reports",
        "professionals",
        "users",
      ],
    },
  ];

  const roles = [
    {
      value: "owner",
      label: "Owner",
      description: "Full access to all features",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Manage all aspects except billing",
    },
    {
      value: "manager",
      label: "Manager",
      description: "Manage bookings and services",
    },
    { value: "hr", label: "HR", description: "Manage staff and users" },
    {
      value: "attendant",
      label: "Attendant",
      description: "View and manage own bookings",
    },
  ];

  const permissions = [
    {
      id: "bookings",
      label: "Booking Management",
      description: "Create, edit, and manage bookings",
    },
    {
      id: "services",
      label: "Service Management",
      description: "Manage services and pricing",
    },
    {
      id: "professionals",
      label: "Professional Management",
      description: "Manage staff profiles",
    },
    {
      id: "reports",
      label: "Reports",
      description: "View analytics and reports",
    },
    {
      id: "users",
      label: "User Management",
      description: "Manage user accounts",
    },
    {
      id: "settings",
      label: "Entity Settings",
      description: "Manage business settings",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "manager":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "hr":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "attendant":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.role.toLowerCase() === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    admins: users.filter((u) =>
      ["owner", "admin"].includes(u.role.toLowerCase())
    ).length,
    attendants: users.filter((u) => u.role.toLowerCase() === "attendant")
      .length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage attendant accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for your team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input id="user-name" placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="user@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-phone">Phone</Label>
                    <Input id="user-phone" placeholder="+351 123 456 789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {role.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Switch id={permission.id} />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <ResponsiveCardGrid>
        <MobileStatsCard
          title="Total"
          value={stats.total}
          subtitle="Users"
          color="blue"
        />
        <MobileStatsCard
          title="Active"
          value={stats.active}
          subtitle="Online"
          color="green"
        />
        <MobileStatsCard
          title="Inactive"
          value={stats.inactive}
          subtitle="Offline"
          color="red"
        />
        <MobileStatsCard
          title="Admins"
          value={stats.admins}
          subtitle="Managers"
          color="purple"
        />
        <MobileStatsCard
          title="Attendants"
          value={stats.attendants}
          subtitle="Staff"
          color="yellow"
        />
      </ResponsiveCardGrid>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage user accounts and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Member since{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRoleColor(user.role)}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Activity className="h-3 w-3 mr-1 text-muted-foreground" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(user.status)}
                    >
                      {user.status === "active" ? (
                        <UserCheck className="h-3 w-3 mr-1" />
                      ) : (
                        <UserX className="h-3 w-3 mr-1" />
                      )}
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map((permission) => (
                        <Badge
                          key={permission}
                          variant="secondary"
                          className="text-xs"
                        >
                          {permission}
                        </Badge>
                      ))}
                      {user.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetPassword(user.id)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewActivity(user.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
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
