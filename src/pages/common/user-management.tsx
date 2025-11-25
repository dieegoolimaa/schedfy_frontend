import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Avatar, Avatar Fallback } from "../../components/ui/avatar";
import {
    Users,
    UserPlus,
    Briefcase,
    Search,
    Mail,
    Phone,
    Edit,
    Shield,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth-context";
import { usersService } from "../../services/users.service";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    isProfessional?: boolean;
    status: string;
    professionalInfo?: {
        jobFunction?: string;
        specialties?: string[];
        bio?: string;
    };
    permissions?: string[];
    createdAt?: string;
}

const ROLES = [
    { value: "owner", label: "Owner" },
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "hr", label: "HR" },
    { value: "attendant", label: "Attendant" },
    { value: "professional", label: "Professional" },
];

const ROLE_COLORS: Record<string, string> = {
    owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    manager: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    hr: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    attendant: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    professional: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    active: { icon: CheckCircle2, color: "text-green-600", label: "Active" },
    pending: { icon: Clock, color: "text-yellow-600", label: "Pending" },
    inactive: { icon: XCircle, color: "text-gray-600", label: "Inactive" },
    suspended: { icon: XCircle, color: "text-red-600", label: "Suspended" },
};

export default function TeamManagementPage() {
    const { t } = useTranslation();
    const { user: currentUser } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("team");

    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

    const [inviteForm, setInviteForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "professional" as string,
        isProfessional: true,
        professionalInfo: {
            jobFunction: "",
            specialties: [] as string[],
        },
    });

    useEffect(() => {
        if (currentUser?.entityId) {
            fetchUsers();
        }
    }, [currentUser?.entityId]);

    const fetchUsers = async () => {
        if (!currentUser?.entityId) {
            toast.error("No entity ID found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log("[TeamManagement] Fetching users for entity:", currentUser.entityId);
            const data = await usersService.getTeamMembers(currentUser.entityId);
            console.log("[TeamManagement] Users loaded:", data);
            setUsers(data as User[]);
        } catch (error: any) {
            console.error("[TeamManagement] Failed to fetch users:", error);
            toast.error(error?.response?.data?.message || "Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    const handleInviteUser = async () => {
        if (!currentUser?.entityId) {
            toast.error("No entity ID found");
            return;
        }

        try {
            toast.loading("Sending invitation...", { id: "invite-user" });

            const payload = {
                firstName: inviteForm.firstName,
                lastName: inviteForm.lastName,
                email: inviteForm.email,
                phone: inviteForm.phone,
                role: inviteForm.role,
                isProfessional: inviteForm.isProfessional,
                entityId: currentUser.entityId,
                createdBy: currentUser.id,
                professionalInfo: inviteForm.isProfessional ? {
                    jobFunction: inviteForm.professionalInfo.jobFunction || undefined,
                    specialties: inviteForm.professionalInfo.specialties.length > 0
                        ? inviteForm.professionalInfo.specialties
                        : undefined,
                } : undefined,
            };

            console.log("[TeamManagement] Sending invite:", payload);
            await usersService.inviteUser(payload as any);

            toast.success("Invitation sent successfully!", { id: "invite-user" });
            setIsInviteDialogOpen(false);
            setInviteForm({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                role: "professional",
                isProfessional: true,
                professionalInfo: {
                    jobFunction: "",
                    specialties: [],
                },
            });
            fetchUsers();
        } catch (error: any) {
            console.error("[TeamManagement] Invite failed:", error);
            toast.error(
                error?.response?.data?.message || "Failed to send invitation",
                { id: "invite-user" }
            );
        }
    };

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            toast.loading("Updating user...", { id: "update-user" });

            if (updates.role) {
                await usersService.updateUserRole(userId, updates.role);
            }
            if (updates.isProfessional !== undefined) {
                await usersService.updateProfessionalStatus(userId, updates.isProfessional);
            }
            if (updates.status) {
                await usersService.updateUserStatus(userId, updates.status);
            }

            toast.success("User updated successfully!", { id: "update-user" });
            fetchUsers();
        } catch (error: any) {
            console.error("[TeamManagement] Update failed:", error);
            toast.error(
                error?.response?.data?.message || "Failed to update user",
                { id: "update-user" }
            );
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const professionals = filteredUsers.filter((user) => user.isProfessional);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="inline-block animate-spin h-8 w-8 border-b-2 border-primary" />
                    <p className="mt-2 text-muted-foreground">Loading team members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t("teamManagement.title", "Team Management")}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t("teamManagement.description", "Manage team members, professionals, roles, and permissions")}
                    </p>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("teamManagement.inviteUser", "Invite Team Member")}
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="team">
                        <Users className="h-4 w-4 mr-2" />
                        All Team ({users.length})
                    </TabsTrigger>
                    <TabsTrigger value="professionals">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Service Providers ({professionals.length})
                    </TabsTrigger>
                </TabsList>

                {/* All Team Members Tab */}
                <TabsContent value="team" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t("teamManagement.searchPlaceholder", "Search team members...")}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {ROLES.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>
                                All team members with their roles and status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Professional</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No team members found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => {
                                            const StatusIcon = STATUS_CONFIG[user.status]?.icon || Clock;
                                            return (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>
                                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {user.firstName} {user.lastName}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {user.professionalInfo?.jobFunction || "No job function"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={ROLE_COLORS[user.role] || ""}>
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                                {user.email}
                                                            </div>
                                                            {user.phone && (
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Phone className="h-3 w-3" />
                                                                    {user.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Switch
                                                            checked={user.isProfessional || false}
                                                            onCheckedChange={(checked) =>
                                                                handleUpdateUser(user.id, { isProfessional: checked })
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <StatusIcon className={`h-4 w-4 ${STATUS_CONFIG[user.status]?.color}`} />
                                                            <span className="text-sm">
                                                                {STATUS_CONFIG[user.status]?.label || user.status}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                title="Edit user"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                title="Manage permissions"
                                                            >
                                                                <Shield className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Service Providers Tab */}
                <TabsContent value="professionals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Providers</CardTitle>
                            <CardDescription>
                                Team members who provide services to clients
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {professionals.map((professional) => (
                                    <Card key={professional.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback>
                                                        {professional.firstName?.[0]}{professional.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <div>
                                                        <h3 className="font-semibold">
                                                            {professional.firstName} {professional.lastName}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {professional.professionalInfo?.jobFunction || "Service Provider"}
                                                        </p>
                                                    </div>
                                                    {professional.professionalInfo?.specialties &&
                                                        professional.professionalInfo.specialties.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {professional.professionalInfo.specialties.map((specialty, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                                        {specialty}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {professional.email}
                                                        </div>
                                                        {professional.phone && (
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Phone className="h-3 w-3" />
                                                                {professional.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {professionals.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No service providers found</p>
                                    <p className="text-sm mt-2">
                                        Enable the "Professional" toggle for team members to mark them as service providers
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Invite Dialog */}
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                            Send an invitation to join your team
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={inviteForm.firstName}
                                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={inviteForm.lastName}
                                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={inviteForm.phone}
                                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={inviteForm.role}
                                    onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLES.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobFunction">Job Function</Label>
                                <Input
                                    id="jobFunction"
                                    value={inviteForm.professionalInfo.jobFunction}
                                    onChange={(e) => setInviteForm({
                                        ...inviteForm,
                                        professionalInfo: {
                                            ...inviteForm.professionalInfo,
                                            jobFunction: e.target.value,
                                        },
                                    })}
                                    placeholder="e.g., Hairstylist, Barber"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isProfessional">Service Provider</Label>
                            <Switch
                                id="isProfessional"
                                checked={inviteForm.isProfessional}
                                onCheckedChange={(checked) =>
                                    setInviteForm({ ...inviteForm, isProfessional: checked })
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInviteUser}
                            disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email}
                        >
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
