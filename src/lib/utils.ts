import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the appropriate dashboard route based on user plan and role
 */
export function getDashboardRoute(user: any): string {
  if (!user) return "/";

  // Professional users go to their own dashboard
  if (user.role === "professional") {
    return "/professional/dashboard";
  }

  // Based on plan type
  switch (user.plan) {
    case "simple":
      return "/simple/dashboard";
    case "individual":
      return "/individual/dashboard";
    case "business":
    case "entity":
      return "/entity/dashboard";
    default:
      // Fallback based on role
      if (user.role === "owner" || user.role === "admin" || user.role === "manager") {
        return "/entity/dashboard";
      }
      return "/simple/dashboard";
  }
}
