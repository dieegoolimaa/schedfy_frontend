import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "../contexts/auth-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { t } = useTranslation();
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isRememberMe, setIsRememberMe] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error) {
      setError("root", { message: error });
    }
  }, [error, setError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success(t("auth.loginSuccess", "Welcome back!"));
      navigate(redirectTo);
    } catch (err) {
      console.error("Login error:", err);
      toast.error(t("auth.loginError", "Invalid email or password"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center text-2xl font-bold mb-8">
            <ArrowLeft className="mr-2 h-6 w-6" />
            Schedfy
          </Link>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              {t("auth.welcome", "Welcome back")}
            </h1>
            <p className="text-xl opacity-90">
              {t(
                "auth.loginSubtitle",
                "Sign in to your account and continue managing your business"
              )}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>{t("features.secure", "Bank-level security")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>
                  {t("features.global", "Available in Portugal, Brazil & USA")}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>{t("features.support", "24/7 customer support")}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm opacity-75">
          {t("auth.newUser", "New to Schedfy?")}{" "}
          <Link
            to="/register"
            className="underline font-medium hover:no-underline"
          >
            {t("auth.createAccount", "Create an account")}
          </Link>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-4 sm:space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2">
            <Link to="/" className="text-2xl font-bold text-primary">
              Schedfy
            </Link>
            <h1 className="text-2xl font-bold">
              {t("auth.signIn", "Sign In")}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "auth.loginSubtitleMobile",
                "Enter your credentials to access your account"
              )}
            </p>
          </div>

          <Card className="lg:border-none lg:shadow-none">
            <CardHeader className="hidden lg:block text-center pb-6 lg:pb-8">
              <CardTitle className="text-2xl font-bold">
                {t("auth.signIn", "Sign In")}
              </CardTitle>
              <CardDescription>
                {t(
                  "auth.loginDescription",
                  "Enter your credentials to access your account"
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Login Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-4"
              >
                {errors.root && (
                  <div className="p-2.5 sm:p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {errors.root.message}
                  </div>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="email">{t("auth.email", "Email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t(
                        "auth.emailPlaceholder",
                        "Enter your email"
                      )}
                      className="pl-10"
                      {...register("email")}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="password">
                    {t("auth.password", "Password")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t(
                        "auth.passwordPlaceholder",
                        "Enter your password"
                      )}
                      className="pl-10 pr-10"
                      {...register("password")}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={isRememberMe}
                      onChange={(e) => setIsRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="remember" className="text-sm">
                      {t("auth.rememberMe", "Remember me")}
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("auth.forgotPassword", "Forgot password?")}
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full py-2 sm:py-2.5"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading", "Loading...")}
                    </>
                  ) : (
                    t("auth.signIn", "Sign In")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Mobile Footer */}
          <div className="lg:hidden text-center text-sm text-muted-foreground">
            {t("auth.noAccount", "Don't have an account?")}{" "}
            <Link to="/register" className="text-primary hover:underline">
              {t("auth.signUp", "Sign up")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
