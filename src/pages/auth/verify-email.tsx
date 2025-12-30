import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth-context";
import { authService } from "../../services/auth.service";
import { storage } from "../../lib/storage";
import { getDashboardRoute } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [codeExpiresIn, setCodeExpiresIn] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    if (user?.isEmailVerified) {
      navigate(getDashboardRoute(user));
    }
  }, [user, navigate]);

  // Countdown timer
  useEffect(() => {
    if (codeExpiresIn > 0) {
      const timer = setTimeout(() => setCodeExpiresIn(codeExpiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeExpiresIn]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendCode = async () => {
    if (!user?.email) {
      toast.error("No email found. Please login again.");
      return;
    }

    setIsSending(true);
    try {
      const response = await authService.sendVerificationCode(user.email);
      
      setCodeSent(true);
      setCodeExpiresIn(response.data?.expiresIn || 600);
      
      // If in development mode and code is returned, auto-fill it
      if (response.data?.code) {
        setVerificationCode(response.data.code);
        toast.success(`Code sent! 🔐 DEV CODE: ${response.data.code}`, { duration: 10000 });
      } else {
        toast.success(response.data?.message || "Verification code sent! Check your email.");
      }
    } catch (error: any) {
      console.error("Error sending code:", error);
      toast.error(error.response?.data?.message || "Failed to send verification code");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!user?.email || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      await authService.verifyCode(user.email, verificationCode);
      
      // Clear pending verification
      storage.removePendingVerification();
      
      toast.success("Email verified successfully!");
      
      // Reload to get updated user data
      window.location.href = getDashboardRoute(user);
    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify when 6 digits are entered
  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(numericValue);

    if (numericValue.length === 6) {
      handleVerifyCode();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Session Expired</CardTitle>
            <CardDescription>Please login again to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t("auth.verifyEmail", "Verify Your Email")}
          </CardTitle>
          <CardDescription>
            {codeSent
              ? t("auth.enterCode", "Enter the 6-digit code sent to your email")
              : t("auth.requestCode", "Request a verification code to continue")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            <span>{t("auth.emailTo", "Sending to:")}</span>
            <span className="font-medium text-foreground ml-1">{user.email}</span>
          </div>

          {!codeSent ? (
            <Button
              className="w-full"
              onClick={handleSendCode}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.sending", "Sending...")}
                </>
              ) : (
                t("auth.sendCode", "Send Verification Code")
              )}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code">
                  {t("auth.verificationCode", "Verification Code")}
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  disabled={isVerifying}
                />
              </div>

              {codeExpiresIn > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {t("auth.codeExpires", "Code expires in")} {formatTime(codeExpiresIn)}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.verifying", "Verifying...")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t("auth.verify", "Verify")}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleSendCode}
                  disabled={isSending || codeExpiresIn > 540} // Can resend after 1 minute
                >
                  {t("auth.resendCode", "Resend code")}
                </Button>
              </div>
            </>
          )}

          <div className="flex items-center justify-between text-sm">
            <Link to="/login" className="text-primary hover:underline flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t("auth.backToLogin", "Back to login")}
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              {t("auth.logout", "Logout")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
