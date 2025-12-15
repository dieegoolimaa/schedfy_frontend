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
import { Textarea } from "../../components/ui/textarea";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
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
    UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth-context";
import { usePlanRestrictions } from "../../hooks/use-plan-restrictions";
import { usersService } from "../../services/users.service";
import { EditUserDialog, PermissionsDialog } from "../../components/dialogs/user-dialogs";

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

const STATUS_CONFIG: Record<string, { icon: any; color: string }> = {
    active: { icon: CheckCircle2, color: "text-green-600" },
    pending: { icon: Clock, color: "text-yellow-600" },
    inactive: { icon: XCircle, color: "text-gray-600" },
    suspended: { icon: XCircle, color: "text-red-600" },
    absent: { icon: Clock, color: "text-orange-500" },
};

export default function TeamManagementPage() {
    const { t } = useTranslation("team");
    const { user: currentUser } = useAuth();
    const { isSimplePlan } = usePlanRestrictions();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("team");

    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

    const [newInviteSpecialty, setNewInviteSpecialty] = useState("");

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
            bio: "",
        },
    });

    useEffect(() => {
        if (currentUser?.entityId) {
            fetchUsers();
        }
    }, [currentUser?.entityId]);

    const fetchUsers = async () => {
        if (!currentUser?.entityId) {
            toast.error(t("errors.loginAgain"));
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
            toast.error(error?.response?.data?.message || t("errors.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleAddInviteSpecialty = () => {
        if (newInviteSpecialty.trim() && !inviteForm.professionalInfo.specialties.includes(newInviteSpecialty.trim())) {
            setInviteForm({
                ...inviteForm,
                professionalInfo: {
                    ...inviteForm.professionalInfo,
                    specialties: [...inviteForm.professionalInfo.specialties, newInviteSpecialty.trim()]
                }
            });
            setNewInviteSpecialty("");
        }
    };

    const handleRemoveInviteSpecialty = (specialty: string) => {
        setInviteForm({
            ...inviteForm,
            professionalInfo: {
                ...inviteForm.professionalInfo,
                specialties: inviteForm.professionalInfo.specialties.filter(s => s !== specialty)
            }
        });
    };

    const handleInviteUser = async () => {
        if (!currentUser?.entityId) {
            toast.error("No entity ID found");
            return;
        }

        try {
            toast.loading(t("loading.invite"), { id: "invite-user" });

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
                    bio: inviteForm.professionalInfo.bio || undefined,
                } : undefined,
            };

            console.log("[TeamManagement] Sending invite:", payload);
            await usersService.inviteUser(payload as any);

            toast.success(t("messages.invitationSent"), { id: "invite-user" });
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
                    bio: "",
                },
            });
            setNewInviteSpecialty("");
            fetchUsers();
        } catch (error: any) {
            console.error("[TeamManagement] Invite failed:", error);
            toast.error(
                error?.response?.data?.message || t("errors.inviteFailed"),
                { id: "invite-user" }
            );
        }
    };

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            toast.loading("Updating user...", { id: "update-user" });

            const genericUpdates: any = {};
            if (updates.firstName) genericUpdates.firstName = updates.firstName;
            if (updates.lastName) genericUpdates.lastName = updates.lastName;
            if (updates.email) genericUpdates.email = updates.email;
            if (updates.phone) genericUpdates.phone = updates.phone;

            // Call generic update if there are any generic fields
            if (Object.keys(genericUpdates).length > 0) {
                await usersService.updateUser(userId, genericUpdates);
            }

            if (updates.role) {
                await usersService.updateUserRole(userId, updates.role);
            }
            if (updates.isProfessional !== undefined) {
                await usersService.updateProfessionalStatus(userId, updates.isProfessional);
            }
            if (updates.status) {
                await usersService.updateUserStatus(userId, updates.status);
            }

            toast.success(t("messages.userUpdated"), { id: "update-user" });
            fetchUsers();
        } catch (error: any) {
            console.error("[TeamManagement] Update failed:", error);
            toast.error(
                error?.response?.data?.message || t("errors.updateFailed"),
                { id: "update-user" }
            );
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleManagePermissions = (user: User) => {
        setSelectedUser(user);
        setIsPermissionsDialogOpen(true);
    };

    const handleSaveUser = async (userId: string, updates: Partial<User>) => {
        await handleUpdateUser(userId, updates);
    };

    const handleSavePermissions = async (userId: string, permissions: string[]) => {
        try {
            toast.loading(t("loading.permissions"), { id: "update-permissions" });
            await usersService.updateUserPermissions(userId, permissions);
            toast.success(t("messages.permissionsUpdated"), { id: "update-permissions" });
            fetchUsers();
        } catch (error: any) {
            console.error("[TeamManagement] Permission update failed:", error);
            toast.error(
                error?.response?.data?.message || t("errors.permissionsFailed"),
                { id: "update-permissions" }
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
                    <p className="mt-2 text-muted-foreground">{t("loading.team")}</p>
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
                        {t("title")}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t("subtitle")}
                    </p>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("inviteUser")}
                </Button>
            </div>

            {/* Warning if no professionals */}
            {!loading && professionals.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-yellow-700 font-bold">!</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-yellow-800">{t("warnings.noProfessionalsTitle", "Bookings Disabled")}</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                            {t("warnings.noProfessionalsDesc", "You must enable at least one service provider to receive bookings. Use the toggle in the table below to mark a user (or yourself) as a Professional.")}
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="team">
                        <Users className="h-4 w-4 mr-2" />
                        {t("tabs.allTeam")} ({users.length})
                    </TabsTrigger>
                    <TabsTrigger value="professionals">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {t("tabs.serviceProviders")} ({professionals.length})
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
                                        <SelectValue placeholder={t("filters.allRoles")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("filters.allRoles")}</SelectItem>
                                        {ROLES.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {t(`roles.${role.value}`, role.label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder={t("filters.allStatus")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("filters.allStatus")}</SelectItem>
                                        <SelectItem value="active">{t("status.active")}</SelectItem>
                                        <SelectItem value="pending">{t("status.pending")}</SelectItem>
                                        <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
                                        <SelectItem value="suspended">{t("status.suspended", "Suspended")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team Members Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("table.title")}</CardTitle>
                            <CardDescription>
                                {t("table.subtitle")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("table.member")}</TableHead>
                                        <TableHead>{t("table.role")}</TableHead>
                                        <TableHead>{t("table.contact")}</TableHead>
                                        <TableHead>{t("table.professional")}</TableHead>
                                        <TableHead>{t("table.status")}</TableHead>
                                        <TableHead className="text-right">{t("table.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                {t("noTeamMembers")}
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
                                                                    {user.professionalInfo?.jobFunction || t("noJobFunction")}
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
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 flex items-center gap-2 px-2">
                                                                    <StatusIcon className={`h-4 w-4 ${STATUS_CONFIG[user.status]?.color}`} />
                                                                    <span className="text-sm">
                                                                        {t(`status.${user.status}`)}
                                                                    </span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start">
                                                                <DropdownMenuItem onClick={() => handleUpdateUser(user.id, { status: "active" })}>
                                                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                                                    {t("status.active")}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateUser(user.id, { status: "absent" })}>
                                                                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                                                    {t("status.absent")}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateUser(user.id, { status: "inactive" })}>
                                                                    <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                                                                    {t("status.inactive")}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                title="Edit user"
                                                                onClick={() => handleEditUser(user)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            {!isSimplePlan && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    title="Manage permissions"
                                                                    onClick={() => handleManagePermissions(user)}
                                                                >
                                                                    <Shield className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                title="Manage Full Profile"
                                                                onClick={() => window.open(`/entity/users/${user.id}/profile`, '_blank')}
                                                            >
                                                                <UserCog className="h-4 w-4" />
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
                                                            {professional.professionalInfo?.jobFunction || t("roles.professional")}
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
                                    <p>{t("noServiceProviders")}</p>
                                    <p className="text-sm mt-2">
                                        {t("enableProfessionalToggle")}
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
                        <DialogTitle>{t("invite.title")}</DialogTitle>
                        <DialogDescription>
                            {t("invite.description")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">{t("invite.firstName")} *</Label>
                                <Input
                                    id="firstName"
                                    value={inviteForm.firstName}
                                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">{t("invite.lastName")} *</Label>
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
                                <Label htmlFor="email">{t("invite.email")} *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t("invite.phone")}</Label>
                                <Input
                                    id="phone"
                                    value={inviteForm.phone}
                                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">{t("invite.role")} *</Label>
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
                                                {t(`roles.${role.value}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobFunction">{t("invite.jobFunction")}</Label>
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
                                    placeholder={t("placeholders.jobFunction")}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="isProfessional">{t("invite.serviceProvider")}</Label>
                            <Switch
                                id="isProfessional"
                                checked={inviteForm.isProfessional}
                                onCheckedChange={(checked) =>
                                    setInviteForm({ ...inviteForm, isProfessional: checked })
                                }
                            />
                        </div>

                        {inviteForm.isProfessional && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="bio">{t("invite.bio", "Professional Bio")}</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder={t("invite.bioPlaceholder", "Describe the professional...")}
                                        value={inviteForm.professionalInfo.bio}
                                        onChange={(e) => setInviteForm({
                                            ...inviteForm,
                                            professionalInfo: { ...inviteForm.professionalInfo, bio: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("invite.specialties", "Specialties")}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newInviteSpecialty}
                                            onChange={(e) => setNewInviteSpecialty(e.target.value)}
                                            placeholder={t("invite.addSpecialty", "Add specialty")}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddInviteSpecialty()}
                                        />
                                        <Button type="button" variant="outline" onClick={handleAddInviteSpecialty}>
                                            Add
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {inviteForm.professionalInfo.specialties.map((specialty, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                                onClick={() => handleRemoveInviteSpecialty(specialty)}
                                            >
                                                {specialty} ×
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                            {t("invite.cancel")}
                        </Button>
                        <Button
                            onClick={handleInviteUser}
                            disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email}
                        >
                            {t("invite.sendInvitation")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <EditUserDialog
                user={selectedUser}
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSaveUser}
            />

            <PermissionsDialog
                user={selectedUser}
                isOpen={isPermissionsDialogOpen}
                onClose={() => setIsPermissionsDialogOpen(false)}
                onSave={handleSavePermissions}
                planType={currentUser?.plan || 'simple'}
            />
        </div>
    );
}
