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
import { Separator } from "@/components/ui/separator";

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

  const handleOAuthLogin = async (provider: string) => {
    try {
      // This would be handled by the auth context
      // await oauthLogin(provider);
      toast.info(
        t("auth.oauthRedirect", "Redirecting to {provider}...").replace(
          "{provider}",
          provider
        )
      );
    } catch (err) {
      console.error("OAuth login error:", err);
      toast.error(t("auth.oauthError", "OAuth login failed"));
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
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
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
            <CardHeader className="hidden lg:block text-center pb-8">
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

            <CardContent className="space-y-6">
              {/* OAuth Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin("google")}
                  type="button"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t("auth.continueWithGoogle", "Continue with Google")}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin("microsoft")}
                  type="button"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M0 0h11.377v11.372H0z" />
                    <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z" />
                    <path fill="#7fba00" d="M0 12.628h11.377V24H0z" />
                    <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z" />
                  </svg>
                  {t("auth.continueWithMicrosoft", "Continue with Microsoft")}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t("auth.orContinueWith", "Or continue with email")}
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errors.root && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                    {errors.root.message}
                  </div>
                )}

                <div className="space-y-2">
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

                <div className="space-y-2">
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

                <div className="flex items-center justify-between">
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
                  className="w-full"
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
