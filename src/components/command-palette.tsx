import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "./ui/command";
import {
    Calendar,
    CreditCard,
    FileText,
    Users,
    Settings,
    BarChart3,
    DollarSign,
    Clock,
    Plus,
    Eye,
    Mail,
    Download,
    TrendingUp,
    Package,
    Bell
} from "lucide-react";

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAction?: (action: string, data?: any) => void;
    bookings?: any[];
}

export function CommandPalette({
    open,
    onOpenChange,
    onAction,
    bookings = []
}: CommandPaletteProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    // Reset search when dialog closes
    useEffect(() => {
        if (!open) {
            setSearchQuery("");
        }
    }, [open]);

    // Filter bookings based on search
    const filteredBookings = useMemo(() => {
        if (!searchQuery) return [];

        return bookings
            .filter(b =>
                b.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.id?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5); // Limit to 5 results
    }, [bookings, searchQuery]);

    const handleAction = (action: string, data?: any) => {
        onOpenChange(false);
        if (onAction) {
            onAction(action, data);
        }
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput
                placeholder="Type a command or search..."
                value={searchQuery}
                onValueChange={setSearchQuery}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {/* Quick Actions */}
                <CommandGroup heading="Quick Actions">
                    <CommandItem onSelect={() => handleAction('new-booking')}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Booking</span>
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>N
                        </kbd>
                    </CommandItem>

                    <CommandItem onSelect={() => handleAction('new-client')}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Add New Client</span>
                    </CommandItem>

                    <CommandItem onSelect={() => handleAction('process-payment')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Process Payment</span>
                    </CommandItem>

                    <CommandItem onSelect={() => handleAction('send-invoice')}>
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Send Invoice</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Navigation */}
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => navigate('/dashboard')}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>

                    <CommandItem onSelect={() => navigate('/bookings')}>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>All Bookings</span>
                    </CommandItem>

                    <CommandItem onSelect={() => navigate('/clients')}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Clients</span>
                    </CommandItem>

                    <CommandItem onSelect={() => navigate('/services')}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>Services & Packages</span>
                    </CommandItem>

                    <CommandItem onSelect={() => navigate('/financial-reports')}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Financial Reports</span>
                    </CommandItem>

                    <CommandItem onSelect={() => navigate('/operational-reports')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Operational Reports</span>
                    </CommandItem>
                </CommandGroup>

                {/* Search Results */}
                {filteredBookings.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Search Results">
                            {filteredBookings.map(booking => (
                                <CommandItem
                                    key={booking.id}
                                    onSelect={() => handleAction('view-booking', booking)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    <div className="flex flex-col">
                                        <span>{booking.client?.name} - {booking.service?.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(booking.startTime).toLocaleDateString()} • {booking.status}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />

                {/* Reports & Analytics */}
                <CommandGroup heading="Reports & Analytics">
                    <CommandItem onSelect={() => handleAction('show-revenue-today')}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>Show Today's Revenue</span>
                    </CommandItem>

                    <CommandItem onSelect={() => handleAction('show-revenue-week')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Show This Week's Revenue</span>
                    </CommandItem>

                    <CommandItem onSelect={() => handleAction('export-bookings')}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Export Bookings (CSV)</span>
                    </CommandItem>

                    <CommandItem onSelect={() => handleAction('generate-report')}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Generate Monthly Report</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Settings */}
                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </CommandItem>

                    <CommandItem onSelect={() => navigate('/notifications')}>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
