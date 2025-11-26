import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
    { value: "manager", label: "Manager" },
    { value: "hr", label: "HR" },
    { value: "attendant", label: "Attendant" },
    { value: "professional", label: "Professional" },
];

export function EditUserDialog({
    user,
    isOpen,
    onClose,
    onSave,
}: Readonly<EditUserDialogProps>) {
    const { t } = useTranslation();
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
}

const AVAILABLE_PERMISSIONS = [
    { id: "bookings", label: "Manage Bookings" },
    { id: "services", label: "Manage Services" },
    { id: "professionals", label: "Manage Professionals" },
    { id: "users", label: "Manage Users" },
    { id: "clients", label: "Manage Clients" },
    { id: "reports", label: "View Reports" },
    { id: "financial_reports", label: "View Financial Reports" },
    { id: "settings", label: "Manage Settings" },
];

export function PermissionsDialog({
    user,
    isOpen,
    onClose,
    onSave,
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
                        {AVAILABLE_PERMISSIONS.map((permission) => (
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
