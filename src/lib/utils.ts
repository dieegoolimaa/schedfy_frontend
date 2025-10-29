/**
 * Retorna slots disponíveis para um serviço considerando múltiplos profissionais
 * Esta versão melhorada lida com bookings do backend corretamente
 * @param slots - Array de horários possíveis ("HH:MM")
 * @param date - Data do agendamento (YYYY-MM-DD)
 * @param duration - Duração do serviço em minutos
 * @param bookings - Lista de bookings existentes do backend
 * @param professionalIds - IDs dos profissionais que podem atender o serviço
 * @returns Array de objetos { slot: string, availableProfessionals: string[] }
 */
export function getAvailableTimeSlotsForProfessionals(
    slots: string[],
    date: string,
    duration: number,
    bookings: any[],
    professionalIds: string[]
): Array<{ slot: string; availableProfessionals: string[] }> {
    if (!professionalIds || professionalIds.length === 0) {
        console.warn('[utils] No professionals provided for availability check');
        return [];
    }

    console.log('[utils] Checking availability:', {
        slots: slots.length,
        date,
        duration,
        bookings: bookings.length,
        professionals: professionalIds.length
    });

    return slots.map((slot) => {
        // Para cada profissional, verifica se está livre nesse slot
        const availableProfessionals = professionalIds.filter((profId) => {
            // Criar datetime do slot
            const slotStart = new Date(`${date}T${slot}:00`);
            const slotEnd = new Date(slotStart.getTime() + duration * 60000);

            // Verifica se há conflito para esse profissional nesse horário
            const hasConflict = bookings.some((booking) => {
                // Ignora bookings de outros profissionais
                if (booking.professionalId !== profId && booking.professional?.id !== profId) {
                    return false;
                }

                // Ignora bookings cancelados
                if (booking.status === 'cancelled' || booking.status === 'no-show') {
                    return false;
                }

                // Parse booking times (suporta diferentes formatos do backend)
                let bookingStart: Date;
                let bookingEnd: Date;

                if (booking.startTime) {
                    bookingStart = new Date(booking.startTime);
                    bookingEnd = new Date(booking.endTime);
                } else if (booking.startDateTime) {
                    bookingStart = new Date(booking.startDateTime);
                    bookingEnd = new Date(booking.endDateTime);
                } else if (booking.date && booking.time) {
                    bookingStart = new Date(`${booking.date}T${booking.time}:00`);
                    bookingEnd = new Date(bookingStart.getTime() + (booking.duration || duration) * 60000);
                } else {
                    console.warn('[utils] Booking with invalid time format:', booking);
                    return false;
                }

                // Verifica sobreposição: há conflito se os intervalos se sobrepõem
                const hasOverlap = slotStart < bookingEnd && slotEnd > bookingStart;

                if (hasOverlap) {
                    console.log('[utils] Conflict found:', {
                        professional: profId,
                        slot,
                        slotRange: { start: slotStart, end: slotEnd },
                        bookingRange: { start: bookingStart, end: bookingEnd }
                    });
                }

                return hasOverlap;
            });

            return !hasConflict;
        });

        return { slot, availableProfessionals };
    }).filter((result) => {
        // Apenas retorna slots que têm pelo menos 1 profissional disponível
        const hasAvailability = result.availableProfessionals.length > 0;

        if (!hasAvailability) {
            console.log(`[utils] Slot ${result.slot} has no available professionals`);
        }

        return hasAvailability;
    });
}
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "../types/auth";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR"): string {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency,
    }).format(amount);
}

export function formatDate(date: Date | string, locale = "pt-PT"): string {
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

export function formatTime(date: Date | string, locale = "pt-PT"): string {
    return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

/**
 * Determina o dashboard correto baseado no plano e role do usuário
 */
export function getDashboardRoute(user: User): string {
    // Platform Admin - maior prioridade
    if (user.role === "platform_admin") {
        return "/admin/dashboard";
    }

    // Admin users
    if (user.role === "admin") {
        return "/admin/dashboard";
    }

    // Route based on PLAN first (for owners and managers)
    // This ensures plan restrictions are respected

    // Business plan - full entity features
    if (user.plan === "business") {
        return "/entity/dashboard";
    }

    // Individual plan - AI-powered features for solo professionals
    if (user.plan === "individual") {
        return "/individual/dashboard";
    }

    // Simple plan - basic features
    if (user.plan === "simple") {
        return "/simple/dashboard";
    }

    // Fallback for any edge cases
    console.warn(`[getDashboardRoute] Unknown user config:`, user);
    return "/simple/dashboard";
}

/**
 * Gera slots de horário disponíveis para um dia específico
 * @param startHour - Hora inicial (padrão: 9)
 * @param endHour - Hora final (padrão: 18)
 * @param intervalMinutes - Intervalo entre slots em minutos (padrão: 60)
 * @returns Array de strings no formato "HH:MM"
 */
export function generateTimeSlots(
    startHour: number = 9,
    endHour: number = 18,
    intervalMinutes: number = 60
): string[] {
    const slots: string[] = [];
    const totalMinutes = (endHour - startHour) * 60;

    for (let minutes = 0; minutes <= totalMinutes; minutes += intervalMinutes) {
        const hour = startHour + Math.floor(minutes / 60);
        const minute = minutes % 60;

        if (hour < endHour || (hour === endHour && minute === 0)) {
            slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
    }

    return slots;
}

/**
 * Verifica se um slot de horário conflita com agendamentos existentes
 * @param slotTime - Horário do slot (HH:MM)
 * @param slotDate - Data do slot
 * @param duration - Duração do serviço em minutos
 * @param existingBookings - Lista de agendamentos existentes
 * @returns true se há conflito, false caso contrário
 */
export function hasTimeSlotConflict(
    slotTime: string,
    slotDate: string,
    duration: number,
    existingBookings: any[]
): boolean {
    const slotDateTime = new Date(`${slotDate}T${slotTime}`);
    const slotEndTime = new Date(slotDateTime.getTime() + duration * 60 * 1000);

    return existingBookings.some(booking => {
        if (booking.status === 'cancelled') return false;

        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);

        // Verifica se há sobreposição
        return (
            (slotDateTime >= bookingStart && slotDateTime < bookingEnd) ||
            (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
            (slotDateTime <= bookingStart && slotEndTime >= bookingEnd)
        );
    });
}

/**
 * Filtra slots de horário disponíveis removendo conflitos
 * @param slots - Array de slots de horário (HH:MM)
 * @param selectedDate - Data selecionada
 * @param serviceDuration - Duração do serviço em minutos
 * @param existingBookings - Lista de agendamentos existentes
 * @returns Array de slots disponíveis
 */
export function getAvailableTimeSlots(
    slots: string[],
    selectedDate: string,
    serviceDuration: number,
    existingBookings: any[]
): string[] {
    return slots.filter(slot =>
        !hasTimeSlotConflict(slot, selectedDate, serviceDuration, existingBookings)
    );
}