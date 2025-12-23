import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { usersService } from "@/services";

export function AcceptInvitationPage() {
  const { t } = useTranslation("invitation");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    jobFunction: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [invitationData, setInvitationData] = useState<any>(null);

  useEffect(() => {
    if (token) {
      validateToken(token);
    } else {
      setValidating(false);
    }
  }, [token]);

  const validateToken = async (token: string) => {
    try {
      const data = await usersService.validateInvitation(token);
      setInvitationData(data);
      setFormData((prev) => ({
        ...prev,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        jobFunction: data.professionalInfo?.jobFunction || "",
      }));
    } catch (error) {
      console.error("Invalid token:", error);
      toast.error("Invalid or expired invitation link");
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid invitation link");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      // We might want to send jobFunction update as well, but acceptInvitation endpoint currently only takes basic info.
      // For now, we'll stick to the existing endpoint contract.
      // If we need to update professional info, we might need to update the backend endpoint first.
      // Assuming for now we just accept.

      const response = await usersService.acceptInvitation({
        token,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        professionalInfo: formData.jobFunction ? { jobFunction: formData.jobFunction } : undefined,
      });

      const data = response.data as { message?: string };
      toast.success(data.message || "Invitation accepted! Please login.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error(
        error.response?.data?.message || "Failed to accept invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("invalidInvitation.title")}</CardTitle>
            <CardDescription>
              {t("invalidInvitation.description")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isSimplePlan = invitationData.entityId?.plan === 'simple';
  const isProfessional = invitationData.role === 'professional';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {isSimplePlan
              ? t("description.simple")
              : t("description.complete")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("form.firstName")}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder={t("form.firstNamePlaceholder")}
                  required
                  disabled={isSimplePlan}
                  className={isSimplePlan ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("form.lastName")}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder={t("form.lastNamePlaceholder")}
                  required
                  disabled={isSimplePlan}
                  className={isSimplePlan ? "bg-muted" : ""}
                />
              </div>
            </div>

            {/* Show Job Function only for Business Plan Professionals */}
            {!isSimplePlan && isProfessional && (
              <div className="space-y-2">
                <Label htmlFor="jobFunction">{t("form.jobFunction")}</Label>
                <Input
                  id="jobFunction"
                  value={formData.jobFunction}
                  onChange={(e) =>
                    setFormData({ ...formData, jobFunction: e.target.value })
                  }
                  placeholder={t("form.jobFunctionPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("form.jobFunctionHint")}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">{t("form.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={t("form.passwordPlaceholder")}
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("form.passwordHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("form.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder={t("form.confirmPasswordPlaceholder")}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
