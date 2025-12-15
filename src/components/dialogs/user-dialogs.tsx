import { useState, useEffect } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    isProfessional?: boolean;
    status: string;
    permissions?: string[];
}

interface EditUserDialogProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: string, data: Partial<User>) => void;
}

const ROLES = [
    { value: "owner", label: "Owner" },
    { value: "admin", label: "Admin" },
    { value: "professional", label: "Professional" },
];

export function EditUserDialog({
    user,
    isOpen,
    onClose,
    onSave,
}: Readonly<EditUserDialogProps>) {
    // const { t } = useTranslation();
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            });
        }
    }, [user, isOpen]);

    const handleSave = () => {
        if (user && formData) {
            onSave(user.id, formData);
            onClose();
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user details and role
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName || ""}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName || ""}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.phone || ""}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface PermissionsDialogProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: string, permissions: string[]) => void;
    planType?: 'simple' | 'individual' | 'business';
}

const AVAILABLE_PERMISSIONS = [
    // Bookings
    { id: "canViewAllBookings", label: "View All Bookings" },
    { id: "canManageBookings", label: "Manage Bookings" },

    // Clients
    { id: "canViewClients", label: "View Clients" },
    { id: "canManageClients", label: "Manage Clients" },

    // Services
    { id: "canViewServices", label: "View Services" },
    { id: "canManageServices", label: "Manage Services" },

    // Team
    { id: "canViewTeam", label: "View Team" },
    { id: "canInviteMembers", label: "Invite Members" },
    { id: "canRemoveMembers", label: "Remove Members" },

    // Financial
    { id: "canViewFinancialReports", label: "View Financial Reports" },
    { id: "canManagePayments", label: "Manage Payments" },

    // Settings
    { id: "canEditEntitySettings", label: "Edit Entity Settings" },
    { id: "canManageSubscription", label: "Manage Subscription" },

    // AI
    { id: "canViewAIInsights", label: "View AI Insights" },
];

export function PermissionsDialog({
    user,
    isOpen,
    onClose,
    onSave,
    planType = 'simple',
}: Readonly<PermissionsDialogProps>) {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            setSelectedPermissions(user.permissions || []);
        }
    }, [user, isOpen]);

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSave = () => {
        if (user) {
            onSave(user.id, selectedPermissions);
            onClose();
        }
    };

    if (!user) return null;

    // Filter permissions based on plan
    // Filter permissions based on plan
    const filteredPermissions = AVAILABLE_PERMISSIONS.filter(p => {
        // Financial reports only for Business (or maybe Individual?)
        // Plan says: "Simple account não deve poder ver/gerenciar Financial Reports"
        if (planType === 'simple' && (p.id === 'canViewFinancialReports' || p.id === 'canManagePayments' || p.id === 'canManageSubscription')) return false;

        // AI Insights only for Business
        if (planType !== 'business' && p.id === 'canViewAIInsights') return false;

        return true;
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manage Permissions</DialogTitle>
                    <DialogDescription>
                        Configure granular permissions for {user.firstName} {user.lastName}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                        {filteredPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={permission.id}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <Label htmlFor={permission.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {permission.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Permissions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
