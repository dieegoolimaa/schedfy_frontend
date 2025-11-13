import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, Briefcase, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickBookingWidgetProps {
  entityId?: string;
  className?: string;
}

export function QuickBookingWidget({ className }: QuickBookingWidgetProps) {
  const navigate = useNavigate();
  const [loading] = useState(false);

  const handleQuickBooking = () => {
    // For now, redirect to booking management with new booking dialog
    navigate("/entity/bookings?action=new");
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Quick Booking
        </CardTitle>
        <CardDescription>Create a new booking in seconds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
            onClick={handleQuickBooking}
          >
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium">Select Client</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
            onClick={handleQuickBooking}
          >
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-medium">Select Service</span>
          </Button>
        </div>

        <Button
          className="w-full"
          onClick={handleQuickBooking}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Create Booking
            </>
          )}
        </Button>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Opens full booking form with pre-selection
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
