import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Navigation } from "./navigation";
import { PaymentAlert } from "../subscription/payment-alert";
import { PaymentGuard } from "../auth/payment-guard";
import { AIFloatingButton } from "../ai/ai-floating-button";
import { useAIFeatures } from "../../hooks/useAIFeatures";
import { useLocalAIInsights } from "../../hooks/useAIInsights";

interface LayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: Readonly<LayoutProps>) {
  const location = useLocation();
  const { hasSubscription } = useAIFeatures();

  // Determine page type based on current route
  const getPageType = (): 'dashboard' | 'financial' | 'operational' | 'bookings' | 'clients' | 'general' => {
    const path = location.pathname;
    if (path.includes('financial')) return 'financial';
    if (path.includes('operational') || path.includes('reports')) return 'operational';
    if (path.includes('booking')) return 'bookings';
    if (path.includes('client')) return 'clients';
    if (path.includes('dashboard') || path === '/') return 'dashboard';
    return 'general';
  };

  // Don't show floating button on reports pages (they have Smart Banner)
  const isReportsPage = location.pathname.includes('reports');

  const aiInsights = useLocalAIInsights({
    pageType: getPageType(),
  });

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

        {/* AI Floating Button - Hidden on reports pages */}
        {hasSubscription && !isReportsPage && (
          <AIFloatingButton
            insights={aiInsights}
          />
        )}
      </div>
    </div>
  );
}
