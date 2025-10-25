import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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