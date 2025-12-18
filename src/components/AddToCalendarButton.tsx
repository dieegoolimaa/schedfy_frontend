import React, { useState } from 'react';
import { Calendar, ChevronDown, ExternalLink, Download, Check } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useToast } from '../hooks/use-toast';

export interface CalendarLinksData {
    googleCalendar: string;
    appleCalendarUrl: string;
    icsContent: string;
    canProfessionalAdd: boolean;
    canClientAdd: boolean;
    bookingId: string;
}

interface AddToCalendarButtonProps {
    bookingId: string;
    isClient?: boolean; // true if the user is a client, false if professional/owner
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    disabled?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AddToCalendarButton({
    bookingId,
    isClient = true,
    variant = 'outline',
    size = 'default',
    className = '',
    disabled = false,
}: AddToCalendarButtonProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [calendarData, setCalendarData] = useState<CalendarLinksData | null>(null);
    const [added, setAdded] = useState(false);

    const fetchCalendarLinks = async () => {
        if (calendarData) return calendarData;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}/calendar-links`);
            if (!response.ok) {
                throw new Error('Failed to fetch calendar links');
            }
            const data = await response.json();
            setCalendarData(data);
            return data;
        } catch (error) {
            console.error('Error fetching calendar links:', error);
            toast({
                title: 'Error',
                description: 'Não foi possível gerar os links do calendário',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleCalendar = async () => {
        const data = await fetchCalendarLinks();
        if (!data) return;

        // Check permissions
        if (!isClient && !data.canProfessionalAdd) {
            toast({
                title: 'Indisponível',
                description: 'Esta funcionalidade não está disponível no seu plano',
                variant: 'destructive',
            });
            return;
        }

        window.open(data.googleCalendar, '_blank');
        setAdded(true);
        toast({
            title: 'Sucesso!',
            description: 'O Google Calendar foi aberto em uma nova aba',
        });
    };

    const handleAppleCalendar = async () => {
        const data = await fetchCalendarLinks();
        if (!data) return;

        // Check permissions
        if (!isClient && !data.canProfessionalAdd) {
            toast({
                title: 'Indisponível',
                description: 'Esta funcionalidade não está disponível no seu plano',
                variant: 'destructive',
            });
            return;
        }

        // Download ICS file
        const icsUrl = `${API_URL}/bookings/${bookingId}/calendar.ics`;
        const link = document.createElement('a');
        link.href = icsUrl;
        link.download = `booking-${bookingId}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setAdded(true);
        toast({
            title: 'Sucesso!',
            description: 'Arquivo do calendário baixado',
        });
    };

    const handleOutlookCalendar = async () => {
        const data = await fetchCalendarLinks();
        if (!data) return;

        // Check permissions
        if (!isClient && !data.canProfessionalAdd) {
            toast({
                title: 'Indisponível',
                description: 'Esta funcionalidade não está disponível no seu plano',
                variant: 'destructive',
            });
            return;
        }

        // Outlook also uses ICS files
        const icsUrl = `${API_URL}/bookings/${bookingId}/calendar.ics`;
        const link = document.createElement('a');
        link.href = icsUrl;
        link.download = `booking-${bookingId}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setAdded(true);
        toast({
            title: 'Sucesso!',
            description: 'Arquivo do calendário baixado (compatível com Outlook)',
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={className}
                    disabled={disabled || loading}
                >
                    {added ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                        <Calendar className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Carregando...' : 'Adicionar ao Calendário'}
                    <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleGoogleCalendar}>
                    <div className="flex items-center gap-3 w-full">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.54 6.42a6.31 6.31 0 0 0-.09-.87A5 5 0 0 0 19.5 3h-15A5 5 0 0 0 1.55 5.55a6.31 6.31 0 0 0-.09.87v12.16a5 5 0 0 0 5 5h15a5 5 0 0 0 3.09-2.55 5.09 5.09 0 0 0 .91-2.87V6.42z"
                            />
                            <path
                                fill="#FFF"
                                d="M12 9.5l5-5h-15v10l5-5 5 5 5-5z"
                            />
                        </svg>
                        <span className="flex-1">Google Calendar</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleAppleCalendar}>
                    <div className="flex items-center gap-3 w-full">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.02.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        <span className="flex-1">Apple Calendar</span>
                        <Download className="h-3 w-3 text-muted-foreground" />
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleOutlookCalendar}>
                    <div className="flex items-center gap-3 w-full">
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="#0072C6"
                                d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.152-.362.228-.612.228h-8.4v-8.1l3.15 2.25 1.35-1.35-4.5-4.05v-.03h8.4c.25 0 .454.076.612.228.158.152.238.346.238.58zM8.25 18.669v-12l-8.25 2.4v7.2l8.25 2.4z"
                            />
                            <path
                                fill="#0072C6"
                                d="M14.75 5.331v2.988h-6v11.55l-8.75-2.55V2.331l8.75 2.55 6 .45z"
                            />
                        </svg>
                        <span className="flex-1">Outlook / Outro</span>
                        <Download className="h-3 w-3 text-muted-foreground" />
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Simple button version for email templates (no dropdown, direct link)
export function GoogleCalendarLink({ url }: { url: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#4285F4',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
            }}
        >
            <Calendar size={16} />
            Add to Google Calendar
        </a>
    );
}

export function AppleCalendarLink({ url }: { url: string }) {
    return (
        <a
            href={url}
            download
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#1D1D1F',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
            }}
        >
            <Calendar size={16} />
            Add to Apple Calendar
        </a>
    );
}
