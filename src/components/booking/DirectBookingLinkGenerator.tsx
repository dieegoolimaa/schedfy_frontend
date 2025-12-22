import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Link2,
    Copy,
    Check,
    Calendar,
    User,
    Briefcase,
    Send,
    Info,
} from "lucide-react";
import { toast } from "sonner";

interface Professional {
    id: string;
    name: string;
    email?: string;
}

interface Service {
    id: string;
    name: string;
    duration?: number;
    price?: number;
}

import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

interface DirectBookingLinkGeneratorProps {
    entitySlug: string;
    entityId?: string;
    professionals?: Professional[];
    services?: Service[];
    onSendEmail?: (email: string, link: string, clientName?: string) => Promise<void>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialServiceId?: string;
    initialProfessionalId?: string;
}

export function DirectBookingLinkGenerator({
    entitySlug,
    entityId,
    professionals = [],
    services = [],
    onSendEmail,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
    initialServiceId,
    initialProfessionalId,
}: DirectBookingLinkGeneratorProps) {
    const { t } = useTranslation("bookings");
    const { entity: authEntity } = useAuth();

    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsOpen = externalOnOpenChange || setInternalOpen;

    const [copied, setCopied] = useState(false);
    const [sending, setSending] = useState(false);

    // Form state with initialization from props if available
    const [selectedProfessional, setSelectedProfessional] = useState<string>(initialProfessionalId || "");
    const [selectedService, setSelectedService] = useState<string>(initialServiceId || "");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [clientEmail, setClientEmail] = useState<string>("");
    const [clientName, setClientName] = useState<string>("");

    // Initialize/Update state when initial props change
    useState(() => {
        if (initialServiceId) setSelectedService(initialServiceId);
        if (initialProfessionalId) setSelectedProfessional(initialProfessionalId);
    });

    // Update state when initial values change physically
    if (initialServiceId && selectedService !== initialServiceId && !selectedService) {
        setSelectedService(initialServiceId);
    }
    if (initialProfessionalId && selectedProfessional !== initialProfessionalId && !selectedProfessional) {
        setSelectedProfessional(initialProfessionalId);
    }

    // Logic for link generation
    const baseUrl = window.location.origin;
    const bookingPath = "/book"; // Or whatever path creates the link
    const queryParams = new URLSearchParams();
    queryParams.set("entity", entitySlug);
    if (selectedService) queryParams.set("service", selectedService);
    if (selectedProfessional) queryParams.set("professional", selectedProfessional);
    if (selectedDate) queryParams.set("date", selectedDate);

    // Additional params if needed (e.g. source=invite)
    queryParams.set("source", "invite");

    const generatedLink = `${baseUrl}${bookingPath}?${queryParams.toString()}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            toast.success(t("directLink.copied", "Link copied to clipboard!"));
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error(t("directLink.copyError", "Failed to copy link"));
        }
    };

    const handleSendEmail = async () => {
        if (!clientEmail) {
            toast.error(t("directLink.emailRequired", "Please enter client email"));
            return;
        }

        if (!selectedProfessional) {
            toast.error(t("directLink.professionalRequired", "Please select a professional"));
            return;
        }

        setSending(true);
        try {
            if (onSendEmail) {
                await onSendEmail(clientEmail, generatedLink, clientName);
            } else {
                // Default backend handler
                // Need entityId for backend
                const targetEntityId = entityId || ""; // logic to get entityId if missing? 

                if (!targetEntityId) {
                    // Try to get from localStorage or context if possible, or error
                    // For now, assume it's passed or fail
                    if (!entityId) {
                        throw new Error("Entity ID missing for sending invite");
                    }
                }

                await apiClient.post('/api/bookings/invite', {
                    email: clientEmail,
                    link: generatedLink,
                    clientName: clientName || "Client",
                    serviceName: selectedServiceData?.name,
                    professionalName: selectedProfessionalData?.name,
                    date: selectedDate,
                    entityName: authEntity?.name,
                    subject: t("directLink.emailSubject", "Book your appointment"),
                    message: t("directLink.emailBody", {
                        clientName: clientName || "there",
                        link: generatedLink,
                        defaultValue: `Hi ${clientName || "there"},\n\nClick the link below to book your appointment:\n\n${generatedLink}\n\nSee you soon!`,
                    }),
                    entityId: targetEntityId,
                });
                toast.success(t("emailSent", "Invitation sent successfully"));
            }
            setClientEmail("");
            setClientName("");
            // Don't auto-close to allow sending to another person? Or maybe close.
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to send email:", error);
            toast.error(t("directLink.sendError", "Failed to send email"));
        } finally {
            setSending(false);
        }
    };

    const resetForm = () => {
        setSelectedProfessional(initialProfessionalId || "");
        setSelectedService(initialServiceId || "");
        setSelectedDate("");
        setClientEmail("");
        setClientName("");
        setCopied(false);
    };

    // Get selected items for display
    const selectedProfessionalData = professionals.find(
        (p) => p.id === selectedProfessional
    );
    const selectedServiceData = services.find((s) => s.id === selectedService);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Link2 className="h-4 w-4" />
                    {t("directLink.button", "Generate Booking Link")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-primary" />
                        {t("directLink.title", "Direct Booking Link")}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            "directLink.description",
                            "Create a custom booking link and send it to your client. They will only see available times for the selected options."
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Professional Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="professional" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {t("directLink.professional", "Professional")} *
                        </Label>
                        <Select
                            value={selectedProfessional}
                            onValueChange={setSelectedProfessional}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={t(
                                        "directLink.selectProfessional",
                                        "Select a professional"
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {professionals.map((professional) => (
                                    <SelectItem key={professional.id} value={professional.id}>
                                        {professional.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Service Selection (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="service" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            {t("directLink.service", "Service")}
                            <Badge variant="outline" className="ml-2 text-xs">
                                {t("directLink.optional", "Optional")}
                            </Badge>
                        </Label>
                        <Select
                            value={selectedService || "all"}
                            onValueChange={(val) => setSelectedService(val === "all" ? "" : val)}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={t("directLink.selectService", "Any service")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t("directLink.anyService", "Any service")}
                                </SelectItem>
                                {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id}>
                                        {service.name}
                                        {service.duration && (
                                            <span className="text-muted-foreground ml-2">
                                                ({service.duration} min)
                                            </span>
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Selection (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {t("directLink.date", "Date")}
                            <Badge variant="outline" className="ml-2 text-xs">
                                {t("directLink.optional", "Optional")}
                            </Badge>
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    {/* Generated Link Preview */}
                    {selectedProfessional && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs">
                                {t("directLink.generatedLink", "Generated Link")}
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={generatedLink}
                                    readOnly
                                    className="text-sm font-mono bg-muted"
                                />
                                <Button variant="outline" size="icon" onClick={handleCopy}>
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Link Summary */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedProfessionalData && (
                                    <Badge variant="secondary" className="text-xs">
                                        <User className="h-3 w-3 mr-1" />
                                        {selectedProfessionalData.name}
                                    </Badge>
                                )}
                                {selectedServiceData && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Briefcase className="h-3 w-3 mr-1" />
                                        {selectedServiceData.name}
                                    </Badge>
                                )}
                                {selectedDate && (
                                    <Badge variant="secondary" className="text-xs">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(selectedDate).toLocaleDateString()}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                {t("directLink.orSendEmail", "Or send by email")}
                            </span>
                        </div>
                    </div>

                    {/* Email Section */}
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="clientName">
                                    {t("directLink.clientName", "Client Name")}
                                </Label>
                                <Input
                                    id="clientName"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder={t("directLink.clientNamePlaceholder", "John")}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clientEmail">
                                    {t("directLink.clientEmail", "Client Email")} *
                                </Label>
                                <Input
                                    id="clientEmail"
                                    type="email"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    placeholder="client@email.com"
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleSendEmail}
                            disabled={!selectedProfessional || !clientEmail || sending}
                        >
                            {sending ? (
                                <>
                                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    {t("directLink.sending", "Sending...")}
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    {t("directLink.sendLink", "Send Booking Link")}
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Info Alert */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                            {t(
                                "directLink.info",
                                "The client will receive a link to book directly with the selected professional. They will only see available time slots."
                            )}
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        {t("directLink.close", "Close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DirectBookingLinkGenerator;
