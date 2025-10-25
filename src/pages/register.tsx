import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Separator } from "../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Building,
  ArrowLeft,
  Check,
  X,
} from "lucide-react";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters"),
    businessType: z.string().min(1, "Please select a business type"),
    region: z.string().min(1, "Please select your region"),
    acceptTerms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions"
      ),
    acceptMarketing: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const businessTypes = [
  { value: "healthcare", label: "Healthcare" },
  { value: "beauty", label: "Beauty & Wellness" },
  { value: "fitness", label: "Fitness & Sports" },
  { value: "education", label: "Education" },
  { value: "consulting", label: "Consulting" },
  { value: "legal", label: "Legal Services" },
  { value: "automotive", label: "Automotive" },
  { value: "home-services", label: "Home Services" },
  { value: "professional", label: "Professional Services" },
  { value: "other", label: "Other" },
];

const regions = [
  { value: "pt", label: "Portugal", currency: "EUR" },
  { value: "br", label: "Brazil", currency: "BRL" },
  { value: "us", label: "United States", currency: "USD" },
];

export function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      businessType: "",
      region: "",
      acceptTerms: false,
      acceptMarketing: false,
    },
  });

  const password = watch("password");

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(password || "");

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength >= 80) return "Strong";
    if (strength >= 60) return "Good";
    if (strength >= 30) return "Fair";
    return "Weak";
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength >= 80) return "text-green-600";
    if (strength >= 60) return "text-blue-600";
    if (strength >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        businessName: data.businessName,
        businessType: data.businessType,
        region: data.region,
        acceptTerms: true, // Add this required field
        acceptMarketing: data.acceptMarketing,
      });
      toast.success(
        t(
          "auth.registerSuccess",
          "Account created successfully! Welcome to Schedfy!"
        )
      );
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(
        t("auth.registerError", "Failed to create account. Please try again.")
      );
    }
  };

  const handleOAuthRegister = async (provider: string) => {
    try {
      // This would be handled by the auth context
      // await oauthRegister(provider);
      toast.info(
        t("auth.oauthRedirect", "Redirecting to {provider}...").replace(
          "{provider}",
          provider
        )
      );
    } catch (err) {
      console.error("OAuth registration error:", err);
      toast.error(t("auth.oauthError", "OAuth registration failed"));
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["firstName", "lastName", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["password", "confirmPassword"];
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t("auth.firstName", "First Name")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder={t(
                      "auth.firstNamePlaceholder",
                      "Enter your first name"
                    )}
                    className="pl-10"
                    {...register("firstName")}
                    aria-invalid={errors.firstName ? "true" : "false"}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t("auth.lastName", "Last Name")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder={t(
                      "auth.lastNamePlaceholder",
                      "Enter your last name"
                    )}
                    className="pl-10"
                    {...register("lastName")}
                    aria-invalid={errors.lastName ? "true" : "false"}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email", "Email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.emailPlaceholder", "Enter your email")}
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password", "Password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t(
                    "auth.passwordPlaceholder",
                    "Create a strong password"
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

              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Password strength
                    </span>
                    <span
                      className={`font-medium ${getPasswordStrengthColor(passwordStrength)}`}
                    >
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div
                      className={`flex items-center space-x-2 ${password.length >= 8 ? "text-green-600" : ""}`}
                    >
                      {password.length >= 8 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}
                    >
                      {/[A-Z]/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>One uppercase letter</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${/\d/.test(password) ? "text-green-600" : ""}`}
                    >
                      {/\d/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>One number</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}
                    >
                      {/[^A-Za-z0-9]/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>One special character</span>
                    </div>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("auth.confirmPassword", "Confirm Password")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t(
                    "auth.confirmPasswordPlaceholder",
                    "Confirm your password"
                  )}
                  className="pl-10 pr-10"
                  {...register("confirmPassword")}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">
                {t("auth.businessName", "Business Name")}
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="businessName"
                  placeholder={t(
                    "auth.businessNamePlaceholder",
                    "Enter your business name"
                  )}
                  className="pl-10"
                  {...register("businessName")}
                  aria-invalid={errors.businessName ? "true" : "false"}
                />
              </div>
              {errors.businessName && (
                <p className="text-sm text-destructive">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">
                {t("auth.businessType", "Business Type")}
              </Label>
              <Select
                onValueChange={(value) => setValue("businessType", value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "auth.selectBusinessType",
                      "Select your business type"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-sm text-destructive">
                  {errors.businessType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">{t("auth.region", "Region")}</Label>
              <Select onValueChange={(value) => setValue("region", value)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("auth.selectRegion", "Select your region")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label} ({region.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-destructive">
                  {errors.region.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptTerms"
                  {...register("acceptTerms")}
                  aria-invalid={errors.acceptTerms ? "true" : "false"}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="acceptTerms" className="text-sm font-normal">
                    {t("auth.acceptTerms", "I agree to the")}{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      {t("auth.termsOfService", "Terms of Service")}
                    </Link>{" "}
                    {t("common.and", "and")}{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                    >
                      {t("auth.privacyPolicy", "Privacy Policy")}
                    </Link>
                  </Label>
                </div>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">
                  {errors.acceptTerms.message}
                </p>
              )}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptMarketing"
                  {...register("acceptMarketing")}
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="acceptMarketing"
                    className="text-sm font-normal"
                  >
                    {t(
                      "auth.acceptMarketing",
                      "I'd like to receive marketing communications and product updates"
                    )}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
              {t("auth.joinSchedulfy", "Join thousands of businesses")}
            </h1>
            <p className="text-xl opacity-90">
              {t(
                "auth.registerSubtitle",
                "Start your 14-day free trial and transform how you manage appointments"
              )}
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>
                  {t("features.noSetupFee", "No setup fees or hidden costs")}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>
                  {t(
                    "features.cancelAnytime",
                    "Cancel anytime, no commitments"
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>
                  {t("features.instantSetup", "Get started in under 5 minutes")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm opacity-75">
          {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
          <Link
            to="/login"
            className="underline font-medium hover:no-underline"
          >
            {t("auth.signIn", "Sign in")}
          </Link>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2">
            <Link to="/" className="text-2xl font-bold text-primary">
              Schedfy
            </Link>
            <h1 className="text-2xl font-bold">
              {t("auth.createAccount", "Create Account")}
            </h1>
            <p className="text-muted-foreground">
              {t("auth.registerDescription", "Start your free trial today")}
            </p>
          </div>

          <Card className="lg:border-none lg:shadow-none">
            <CardHeader className="hidden lg:block text-center pb-8">
              <CardTitle className="text-2xl font-bold">
                {t("auth.createAccount", "Create Account")}
              </CardTitle>
              <CardDescription>
                {t("auth.registerDescription", "Start your free trial today")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span>
                    {Math.round((currentStep / totalSteps) * 100)}% complete
                  </span>
                </div>
                <Progress
                  value={(currentStep / totalSteps) * 100}
                  className="h-2"
                />
              </div>

              {/* OAuth Buttons - Only on step 1 */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleOAuthRegister("google")}
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
                      onClick={() => handleOAuthRegister("microsoft")}
                      type="button"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#f25022" d="M0 0h11.377v11.372H0z" />
                        <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z" />
                        <path fill="#7fba00" d="M0 12.628h11.377V24H0z" />
                        <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z" />
                      </svg>
                      {t(
                        "auth.continueWithMicrosoft",
                        "Continue with Microsoft"
                      )}
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
                </>
              )}

              {/* Multi-step Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}

                <div className="flex space-x-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      {t("common.previous", "Previous")}
                    </Button>
                  )}

                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={nextStep} className="flex-1">
                      {t("common.next", "Next")}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("auth.creatingAccount", "Creating Account...")}
                        </>
                      ) : (
                        t("auth.createAccount", "Create Account")
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Mobile Footer */}
          <div className="lg:hidden text-center text-sm text-muted-foreground">
            {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t("auth.signIn", "Sign in")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
