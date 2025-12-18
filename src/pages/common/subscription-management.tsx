/**
 * Subscription Management Page
 * 
 * This page is now consolidated to use the shared SubscriptionDetails component.
 * All subscription logic, pricing, and display is centralized in one place.
 */
import { SubscriptionDetails } from "@/components/subscription/subscription-details";

export function SubscriptionManagementPage() {
  return <SubscriptionDetails />;
}

export default SubscriptionManagementPage;
