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

    // Business/Entity users (business plan)
    if (user.plan === "business" || user.role === "owner" || user.role === "manager" || user.role === "hr") {
        return "/entity/dashboard";
    }

    // Professional users
    if (user.role === "professional" || user.role === "attendant") {
        return "/professional/dashboard";
    }

    // Individual plan users
    if (user.plan === "individual") {
        return "/individual/dashboard";
    }

    // Simple plan users (fallback)
    return "/simple/dashboard";
}