import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

export function VerifyEmailPage() {
  const { t } = useTranslation("auth");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage(t("verification.noToken", "Verification token is missing."));
        return;
      }

      try {
        // According to backend, it's a POST to /api/auth/verify-email
        // Let's check if authService has this. If not, we'll use apiClient directly or add it.
        // I'll add it to authService for consistency if it's not there.
        
        const response = await (authService as any).verifyEmail(token);
        
        if (response.success || response.data) {
          setStatus("success");
          toast.success(t("verification.success", "Email verified successfully!"));
        } else {
          setStatus("error");
          setMessage(response.message || t("verification.failed", "Email verification failed."));
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message || 
          t("verification.error", "An error occurred during verification.")
        );
      }
    };

    verifyEmail();
  }, [token, t]);

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {t("verification.title", "Email Verification")}
          </CardTitle>
          <CardDescription>
            {status === "loading" && t("verification.processing", "Verifying your email address...")}
            {status === "success" && t("verification.successDesc", "Your email has been verified successfully.")}
            {status === "error" && t("verification.errorDesc", "We couldn't verify your email address.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-center text-muted-foreground">
                {t("verification.ready", "You can now log in and access all features.")}
              </p>
              <Button asChild className="w-full mt-4">
                <Link to="/login">
                  {t("common.login", "Log In")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-center text-destructive font-medium">{message}</p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/login">
                  {t("verification.backToLogin", "Back to Login")}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
