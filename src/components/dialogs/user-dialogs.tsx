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
    deniedPermissions?: string[];
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
    onSave: (userId: string, permissions: string[], deniedPermissions: string[]) => void;
    planType?: 'simple' | 'individual' | 'business';
    userRole?: string;
}

interface AvailablePermission {
    page: string;
    pageName: string;
    availableActions: string[];
}

/**
 * Enhanced Permissions Dialog
 * Shows role defaults and allows adding extras or denying permissions
 */
export function PermissionsDialog({
    user,
    isOpen,
    onClose,
    onSave,
    planType = 'simple',
    userRole,
}: Readonly<PermissionsDialogProps>) {
    const [extraPermissions, setExtraPermissions] = useState<string[]>([]);
    const [deniedPermissions, setDeniedPermissions] = useState<string[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<AvailablePermission[]>([]);
    const [roleDefaults, setRoleDefaults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch available permissions and role defaults when dialog opens
    useEffect(() => {
        if (isOpen && user) {
            fetchPermissionsData();
        }
    }, [isOpen, user]);

    const fetchPermissionsData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Fetch available permissions for entity context
            const availableRes = await fetch('/api/role-permissions/available/entity', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const availableData = await availableRes.json();
            if (availableData.success) {
                setAvailablePermissions(availableData.data);
            }

            // Fetch role defaults for this user's role
            const role = userRole || user.role;
            const defaultsRes = await fetch(`/api/role-permissions/defaults/${role}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const defaultsData = await defaultsRes.json();
            if (defaultsData.success) {
                // Convert to flat permissions
                const flat: string[] = [];
                defaultsData.data.forEach((perm: any) => {
                    perm.actions.forEach((action: string) => {
                        flat.push(`${perm.page}:${action}`);
                    });
                });
                setRoleDefaults(flat);
            }

            // Set current user permissions
            setExtraPermissions(user.permissions || []);
            setDeniedPermissions((user as any).deniedPermissions || []);
        } catch (error) {
            console.error('Failed to fetch permissions data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPermissionState = (permKey: string): 'default' | 'extra' | 'denied' | 'none' => {
        if (deniedPermissions.includes(permKey)) return 'denied';
        if (extraPermissions.includes(permKey)) return 'extra';
        if (roleDefaults.includes(permKey)) return 'default';
        return 'none';
    };

    const togglePermission = (permKey: string) => {
        const currentState = getPermissionState(permKey);

        switch (currentState) {
            case 'none':
                // Add as extra permission
                setExtraPermissions(prev => [...prev, permKey]);
                break;
            case 'extra':
                // Remove from extras
                setExtraPermissions(prev => prev.filter(p => p !== permKey));
                break;
            case 'default':
                // Add to denied
                setDeniedPermissions(prev => [...prev, permKey]);
                break;
            case 'denied':
                // Remove from denied (restore default)
                setDeniedPermissions(prev => prev.filter(p => p !== permKey));
                break;
        }
    };

    const handleSave = () => {
        if (user) {
            onSave(user.id, extraPermissions, deniedPermissions);
            onClose();
        }
    };

    if (!user) return null;

    const getStateIcon = (state: 'default' | 'extra' | 'denied' | 'none') => {
        switch (state) {
            case 'default': return '✓';
            case 'extra': return '+';
            case 'denied': return '✗';
            case 'none': return '○';
        }
    };

    const getStateColor = (state: 'default' | 'extra' | 'denied' | 'none') => {
        switch (state) {
            case 'default': return 'text-blue-600';
            case 'extra': return 'text-green-600';
            case 'denied': return 'text-red-600';
            case 'none': return 'text-gray-400';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manage Permissions</DialogTitle>
                    <DialogDescription>
                        Configure permissions for {user.firstName} {user.lastName} ({user.role})
                    </DialogDescription>
                </DialogHeader>

                <div className="text-xs text-muted-foreground mb-2 flex gap-4">
                    <span className="text-blue-600">✓ Role Default</span>
                    <span className="text-green-600">+ Extra</span>
                    <span className="text-red-600">✗ Denied</span>
                    <span className="text-gray-400">○ None</span>
                </div>

                <ScrollArea className="h-[350px] pr-4">
                    {loading ? (
                        <div className="flex justify-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-6">
                            {availablePermissions.map((page) => (
                                <div key={page.page} className="space-y-2">
                                    <h4 className="font-medium text-sm">{page.pageName}</h4>
                                    <div className="grid grid-cols-2 gap-2 pl-4">
                                        {page.availableActions.map((action) => {
                                            const permKey = `${page.page}:${action}`;
                                            const state = getPermissionState(permKey);
                                            return (
                                                <div
                                                    key={permKey}
                                                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                                    onClick={() => togglePermission(permKey)}
                                                >
                                                    <span className={`font-mono text-lg ${getStateColor(state)}`}>
                                                        {getStateIcon(state)}
                                                    </span>
                                                    <Label className="text-sm cursor-pointer capitalize">
                                                        {action}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
