import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "../contexts/auth-context";
import { useRegion } from "../contexts/region-context";
import { REGIONS, RegionCode } from "../lib/region-config";
import { authService } from "../services/auth.service";
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
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const registerSchema = z
  .object({
    plan: z.enum(["simple", "individual", "business"], {
      errorMap: () => ({ message: "Please select a plan" }),
    }),
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

export function RegisterPage() {
  const { t } = useTranslation("auth");

  const businessTypes = [
    { value: "healthcare", label: t("businessTypes.healthcare") },
    { value: "beauty", label: t("businessTypes.beauty") },
    { value: "fitness", label: t("businessTypes.fitness") },
    { value: "education", label: t("businessTypes.education") },
    { value: "consulting", label: t("businessTypes.consulting") },
    { value: "legal", label: t("businessTypes.legal") },
    { value: "automotive", label: t("businessTypes.automotive") },
    { value: "home-services", label: t("businessTypes.homeServices") },
    { value: "professional", label: t("businessTypes.professional") },
    { value: "other", label: t("businessTypes.other") },
  ];
  const { isLoading } = useAuth();
  const { availableRegions, getPriceDisplay } = useRegion();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeExpiresIn, setCodeExpiresIn] = useState(0);
  const totalSteps = 5; // Plan, Personal, Password, Company, Verification

  // Get plan from URL params
  const planFromUrl = searchParams.get("plan") as
    | "simple"
    | "individual"
    | "business"
    | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
    control,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      plan: planFromUrl || undefined,
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
  const email = watch("email");

  // Countdown timer for code expiration
  useEffect(() => {
    if (codeExpiresIn > 0) {
      const timer = setTimeout(() => setCodeExpiresIn(codeExpiresIn - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [codeExpiresIn]);

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
    if (strength >= 80) return t("passwordStrength.strong");
    if (strength >= 60) return t("passwordStrength.good");
    if (strength >= 30) return t("passwordStrength.fair");
    return t("passwordStrength.weak");
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength >= 80) return "text-green-600";
    if (strength >= 60) return "text-blue-600";
    if (strength >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendVerificationCode = async () => {
    // Validate all previous steps before sending code
    const fieldsToValidate: (keyof RegisterFormData)[] = [
      "plan",
      "firstName",
      "lastName",
      "email",
      "password",
      "confirmPassword",
      "businessName",
      "businessType",
      "region",
      "acceptTerms",
    ];

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      console.log("[Register] Sending verification code to:", email);

      const response = await authService.sendVerificationCode(email);

      console.log("[Register] Code sent successfully");

      // If in development mode and code is returned, auto-fill it and show in toast
      if (response.data?.code) {
        console.log(
          "🔐 [DEV MODE] Verification code received:",
          response.data.code
        );
        setVerificationCode(response.data.code);
        toast.success(
          `${response.data?.message || "Code sent!"}\n🔐 DEV CODE: ${response.data.code
          }`,
          { duration: 10000 }
        );
      } else {
        toast.success(
          response.data?.message || "Verification code sent! Check your email."
        );
      }

      setCodeExpiresIn(response.data?.expiresIn || 600); // 10 minutes
      setCurrentStep(5); // Move to verification step
    } catch (error: any) {
      console.error("[Register] Error sending code:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send verification code";
      toast.error(errorMessage);
    }
  };

  const handleResendCode = async () => {
    setIsCodeVerified(false);
    setVerificationCode("");
    await handleSendVerificationCode();
  };

  // Auto-verify code when 6 digits are entered
  const handleCodeChange = async (value: string) => {
    // eslint-disable-next-line prefer-named-capture-group
    const numericValue = value.replace(/\D/g, "");
    setVerificationCode(numericValue);
    setIsCodeVerified(false);

    // Auto-verify when 6 digits are entered
    if (numericValue.length === 6) {
      setIsVerifyingCode(true);
      try {
        await authService.verifyCode(email, numericValue);
        setIsCodeVerified(true);
        toast.success("Code verified successfully!");
        console.log("[Register] Code auto-verified successfully");
      } catch (error: any) {
        setIsCodeVerified(false);
        console.error("[Register] Code auto-verification failed:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Invalid verification code";
        toast.error(errorMessage);
      } finally {
        setIsVerifyingCode(false);
      }
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (verificationCode?.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    if (!isCodeVerified) {
      toast.error("Please wait for the code to be verified");
      return;
    }

    try {
      const selectedRegion = REGIONS[data.region as RegionCode];

      console.log("[Register] Creating account with verified code...");

      // Create account with verified code (code already verified via auto-verify)
      await authService.registerWithVerification({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        verificationCode: verificationCode,
        businessName: data.businessName,
        businessType: data.businessType,
        plan: data.plan, // Include selected plan
        region: data.region, // Include region code (e.g., 'BR', 'PT', 'US')
        timezone: selectedRegion.timezone,
        locale: selectedRegion.locale,
        currency: selectedRegion.currency,
      });

      console.log("[Register] Account created successfully!");
      toast.success("Account created successfully! Welcome to Schedfy!");

      // Redirect to onboarding
      setTimeout(() => {
        globalThis.location.href = "/onboarding";
      }, 1000);
    } catch (error: any) {
      console.error("[Register] Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create account";
      toast.error(errorMessage);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ["plan"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["firstName", "lastName", "email"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["password", "confirmPassword"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["businessName", "businessType", "region"];
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
        // Plan Selection
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">
                {t("register.steps.plan.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("register.steps.plan.subtitle")}
              </p>
            </div>

            <Controller
              name="plan"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-4">
                  {/* Simple Plan */}
                  <button
                    type="button"
                    onClick={() => field.onChange("simple")}
                    className={`p-6 border-2 rounded-lg text-left transition-all ${field.value === "simple"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-lg">
                          {t("register.steps.plan.simple.name")}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t("register.steps.plan.simple.description")}
                        </p>
                        <p className="text-2xl font-bold mt-2">
                          {getPriceDisplay("simple", "monthly")}
                          <span className="text-sm font-normal text-muted-foreground">
                            {t("register.steps.plan.simple.perMonth")}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("pricing.taxNotice", "Prices exclude VAT")}
                        </p>
                      </div>
                      {field.value === "simple" && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </button>

                  {/* Individual Plan */}
                  <button
                    type="button"
                    onClick={() => field.onChange("individual")}
                    className={`p-6 border-2 rounded-lg text-left transition-all relative ${field.value === "individual"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-lg">
                          {t("register.steps.plan.individual.name")}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t("register.steps.plan.individual.description")}
                        </p>
                        <p className="text-2xl font-bold mt-2">
                          {getPriceDisplay("individual", "monthly")}
                          <span className="text-sm font-normal text-muted-foreground">
                            {t("register.steps.plan.individual.perMonth")}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("pricing.taxNotice", "Prices exclude VAT")}
                        </p>
                      </div>
                    </div>
                    {field.value === "individual" && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </button>

                  {/* Business Plan */}
                  <button
                    type="button"
                    onClick={() => field.onChange("business")}
                    className={`p-6 border-2 rounded-lg text-left transition-all ${field.value === "business"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-lg">
                          {t("register.steps.plan.business.name")}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {t("register.steps.plan.business.description")}
                        </p>
                        <p className="text-2xl font-bold mt-2">
                          {getPriceDisplay("business", "monthly")}
                          <span className="text-sm font-normal text-muted-foreground">
                            {t("register.steps.plan.business.perMonth")}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("pricing.taxNotice", "Prices exclude VAT")}
                        </p>
                      </div>
                      {field.value === "business" && (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  </button>
                </div >
              )
              }
            />

            {
              errors.plan && (
                <p className="text-sm text-destructive text-center">
                  {errors.plan.message}
                </p>
              )
            }
          </div >
        );

      case 2:
        // Personal Information
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-xl font-semibold">
                {t("register.steps.personal.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("register.steps.personal.subtitle")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("register.firstName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder={t("register.firstNamePlaceholder")}
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
                <Label htmlFor="lastName">{t("register.lastName")}</Label>
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

      case 3:
        // Password
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
                      {t("passwordStrength.label")}
                    </span>
                    <span
                      className={`font-medium ${getPasswordStrengthColor(
                        passwordStrength
                      )}`}
                    >
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <Progress value={passwordStrength} className="h-2" />
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div
                      className={`flex items-center space-x-2 ${password.length >= 8 ? "text-green-600" : ""
                        }`}
                    >
                      {password.length >= 8 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>
                        {t("passwordStrength.requirements.minLength")}
                      </span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${/[A-Z]/.test(password) ? "text-green-600" : ""
                        }`}
                    >
                      {/[A-Z]/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>
                        {t("passwordStrength.requirements.uppercase")}
                      </span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${/\d/.test(password) ? "text-green-600" : ""
                        }`}
                    >
                      {/\d/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>{t("passwordStrength.requirements.number")}</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""
                        }`}
                    >
                      {/[^A-Za-z0-9]/.test(password) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>{t("passwordStrength.requirements.special")}</span>
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

      case 4:
        // Business Information
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
                  {availableRegions.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.flag} {region.country} ({region.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-3 mt-2 border border-yellow-200 dark:border-yellow-900/50">
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    <strong>{t("register.regionWarning.title", "Important:")}</strong> {t("register.regionWarning.desc", "Accounts are region-specific. An account created for one region cannot be used to manage services in another (e.g., US account for Brazil services).")}
                  </p>
                </div>
              </div>
              {errors.region && (
                <p className="text-sm text-destructive">
                  {errors.region.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Controller
                  name="acceptTerms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="acceptTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={errors.acceptTerms ? "true" : "false"}
                    />
                  )}
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
                <Controller
                  name="acceptMarketing"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="acceptMarketing"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
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

      case 5:
        // Email Verification
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("auth.verifyEmail", "Verify Your Email")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("auth.verificationCodeSent", "We sent a 6-digit code to")}{" "}
                  <strong>{email}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">
                {t("auth.verificationCode", "Verification Code")} *
              </Label>
              <div className="relative">
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  disabled={isSubmitting || isVerifyingCode}
                  className={`text-center text-2xl font-mono tracking-widest ${isCodeVerified
                    ? "border-green-500 focus:border-green-500"
                    : ""
                    }`}
                />
                {isVerifyingCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {isCodeVerified && !isVerifyingCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {isCodeVerified && (
                <p className="text-sm text-green-600 text-center flex items-center justify-center gap-1">
                  <Check className="h-4 w-4" />
                  {t("auth.codeVerified", "Code verified successfully!")}
                </p>
              )}
              <p className="text-sm text-muted-foreground text-center">
                {codeExpiresIn > 0 ? (
                  <>
                    {t("auth.codeExpires", "Code expires in")}:{" "}
                    <strong>{formatTime(codeExpiresIn)}</strong>
                  </>
                ) : (
                  <span className="text-destructive">
                    {t("auth.codeExpired", "Code expired")}
                  </span>
                )}
              </p>
            </div>

            {codeExpiresIn === 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={isSubmitting}
              >
                <Mail className="h-4 w-4 mr-2" />
                {t("auth.resendCode", "Resend Code")}
              </Button>
            )}
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
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-4 sm:space-y-8">
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
            <CardHeader className="hidden lg:block text-center pb-6 lg:pb-8">
              <CardTitle className="text-2xl font-bold">
                {t("auth.createAccount", "Create Account")}
              </CardTitle>
              <CardDescription>
                {t("auth.registerDescription", "Start your free trial today")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Progress Indicator */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {t("common.step", "Step")} {currentStep} {t("common.of")}{" "}
                    {totalSteps}
                  </span>
                  <span>
                    {Math.round((currentStep / totalSteps) * 100)}%{" "}
                    {t("common.complete")}
                  </span>
                </div>
                <Progress
                  value={(currentStep / totalSteps) * 100}
                  className="h-2"
                />
              </div>

              {/* Multi-step Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}

                <div className="flex space-x-4">
                  {currentStep > 1 && currentStep !== 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      {t("common.previous", "Previous")}
                    </Button>
                  )}

                  {currentStep === 4 ? (
                    // Step 4: Send Verification Code
                    <Button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("auth.sendingCode", "Sending Code...")}
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          {t(
                            "auth.sendVerificationCode",
                            "Send Verification Code"
                          )}
                        </>
                      )}
                    </Button>
                  ) : currentStep === 5 ? (
                    // Step 5: Create Account with verification
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(4)}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {t("common.back", "Back")}
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={
                          isSubmitting ||
                          isLoading ||
                          isVerifyingCode ||
                          !isCodeVerified ||
                          codeExpiresIn === 0 ||
                          verificationCode.length !== 6
                        }
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
                    </>
                  ) : (
                    // Steps 1-3: Regular Next button
                    <Button type="button" onClick={nextStep} className="flex-1">
                      {t("common.next", "Next")}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Mobile Footer */}
          <div className="lg:hidden text-center text-sm text-muted-foreground">
            {t("register.hasAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline">
              {t("register.signIn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
