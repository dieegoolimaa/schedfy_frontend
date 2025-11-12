import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookingsService } from "../../services/bookings.service";
import { toast } from "sonner";

export default function PaymentsSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const [status, setStatus] = useState<
    "pending" | "paid" | "timeout" | "error" | "completed"
  >("pending");

  useEffect(() => {
    if (!bookingId) {
      toast.error("Missing booking id");
      navigate("/");
      return;
    }

    let mounted = true;
    const start = Date.now();
    const timeoutMs = 1000 * 60 * 2; // 2 minutes

    const poll = async () => {
      try {
        const res = await bookingsService.getById(String(bookingId));
        const booking = res.data as any;
        // Check payment status; backend should expose paymentStatus or paid flag
        const paymentStatus =
          booking.paymentStatus || booking.paid ? "paid" : "pending";

        if (!mounted) return;

        if (paymentStatus === "paid") {
          setStatus("paid");
          // attempt to mark booking as completed
          try {
            await bookingsService.complete(String(bookingId));
            setStatus("completed");
            toast.success("Payment confirmed and booking completed");
            // redirect back to bookings page
            navigate("/entity/bookings");
          } catch (err) {
            console.error(err);
            setStatus("error");
            toast.error("Payment confirmed but failed to complete booking");
            navigate("/entity/bookings");
          }
          return;
        }

        if (Date.now() - start > timeoutMs) {
          setStatus("timeout");
          toast.error(
            "Payment confirmation timed out. Please check your booking status later."
          );
          navigate("/entity/bookings");
          return;
        }

        // wait and poll again
        setTimeout(poll, 3000);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setStatus("error");
        toast.error("Failed to verify payment status");
        navigate("/entity/bookings");
      }
    };

    // start polling
    poll();

    return () => {
      mounted = false;
    };
  }, [bookingId, navigate]);

  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <h2 className="text-2xl font-semibold">Processing payment</h2>
      <p className="mt-4 text-sm text-muted-foreground">
        We are verifying your payment. This page will complete the booking once
        payment is confirmed.
      </p>

      <div className="mt-8">
        {status === "pending" && (
          <div className="animate-pulse">Waiting for payment confirmation…</div>
        )}
        {status === "paid" && <div>Payment received. Completing booking…</div>}
        {status === "completed" && <div>Booking completed — redirecting…</div>}
        {status === "timeout" && (
          <div>Payment not confirmed in time. Check your booking later.</div>
        )}
        {status === "error" && (
          <div>
            There was an error verifying payment. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
}
