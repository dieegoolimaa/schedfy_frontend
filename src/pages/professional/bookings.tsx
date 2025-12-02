import { BookingManagementPage } from "../common/booking-management";
import { useAuth } from "../../contexts/auth-context";

export default function ProfessionalBookingsPage() {
  const { user } = useAuth();
  return <BookingManagementPage forcedProfessionalId={user?.id} />;
}
