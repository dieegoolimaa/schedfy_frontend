import React from "react";
import { Outlet } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Navigation } from "./navigation";
import { PaymentAlert } from "../subscription/payment-alert";
import { PaymentGuard } from "../auth/payment-guard";

interface LayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: Readonly<LayoutProps>) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        className
      )}
    >
      <div className="relative flex min-h-screen flex-col">
        <Navigation />
        <PaymentAlert />
        <main className="flex-1 container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
          <PaymentGuard>
            {children || <Outlet />}
          </PaymentGuard>
        </main>
      </div>
    </div>
  );
}
