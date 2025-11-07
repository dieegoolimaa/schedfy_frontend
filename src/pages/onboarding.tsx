import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/auth-context";
import { useRegion } from "../contexts/region-context";
import type { RegionCode } from "../lib/region-config";
import { entitiesService } from "../services/entities.service";
import { apiClient } from "../lib/api-client";
import { getDashboardRoute } from "../lib/utils";
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
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  MapPin,
  Clock,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function OnboardingPage() {
  const { user, entity } = useAuth();
  const { regionConfig } = useRegion();
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 3;

  // Load existing entity data if available
  useEffect(() => {
    const loadEntityData = async () => {
      if (entity?.id) {
        try {
          const response = await apiClient.get(`/api/entities/${entity.id}`);
          const entityData = response.data as any;

          // Pre-fill form with existing data
          setFormData((prev) => ({
            ...prev,
            street: entityData.address || "",
            city: entityData.city || "",
            state: entityData.state || "",
            zipCode: entityData.postalCode || "",
            country: entityData.country || "BR",
            phone: entityData.phone || "",
            whatsapp: entityData.whatsapp || "",
            workingHours: entityData.workingHours || getDefaultWorkingHours(),
          }));
        } catch (error) {
          console.error("Failed to load entity data:", error);
        }
      }
    };

    loadEntityData();
  }, [entity]);

  // Default working hours based on backend schema
  const getDefaultWorkingHours = () => ({
    monday: {
      enabled: true,
      start: "09:00",
      end: "22:00",
      breakStart: "",
      breakEnd: "",
    },
    tuesday: {
      enabled: true,
      start: "09:00",
      end: "22:00",
      breakStart: "",
      breakEnd: "",
    },
    wednesday: {
      enabled: true,
      start: "09:00",
      end: "22:00",
      breakStart: "",
      breakEnd: "",
    },
    thursday: {
      enabled: true,
      start: "09:00",
      end: "22:00",
      breakStart: "",
      breakEnd: "",
    },
    friday: {
      enabled: true,
      start: "09:00",
      end: "22:00",
      breakStart: "",
      breakEnd: "",
    },
    saturday: {
      enabled: false,
      start: "09:00",
      end: "13:00",
      breakStart: "",
      breakEnd: "",
    },
    sunday: {
      enabled: false,
      start: "09:00",
      end: "13:00",
      breakStart: "",
      breakEnd: "",
    },
  });

  const [formData, setFormData] = useState({
    // Step 1: Address
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: regionConfig.code,

    // Step 2: Contact & Hours
    phone: "",
    whatsapp: "",
    workingHours: getDefaultWorkingHours(),

    // Step 3: First Service
    serviceName: "",
    serviceDuration: 60,
    servicePrice: 0,
    serviceDescription: "",
  });

  // Sync country with region changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      country: regionConfig.code,
    }));
  }, [regionConfig.code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final step - submit
    setIsLoading(true);
    try {
      if (!user?.entityId) {
        toast.error("No entity found for your account");
        return;
      }

      const payload = {
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        phone: formData.phone,
        whatsapp: formData.whatsapp || undefined,
        workingHours: formData.workingHours,
        firstService: formData.serviceName
          ? {
              name: formData.serviceName,
              duration: formData.serviceDuration,
              price: formData.servicePrice,
              description: formData.serviceDescription || undefined,
            }
          : undefined,
      };

      console.log("Submitting onboarding payload:", payload);

      await entitiesService.completeOnboarding(payload);

      toast.success(t("success"));

      // Redirect to appropriate dashboard
      const dashboardRoute = getDashboardRoute(user);
      navigate(dashboardRoute, { replace: true });

      // Reload page to update entity state
      globalThis.location.href = dashboardRoute;
    } catch (error: any) {
      console.error("Onboarding error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      const errorMessage =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message.join(", ")
          : error.message) ||
        t("validation.genericError");

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.street.trim()) {
          toast.error(t("validation.streetRequired"));
          return false;
        }
        if (!formData.city.trim()) {
          toast.error(t("validation.cityRequired"));
          return false;
        }
        if (!formData.state.trim()) {
          toast.error(t("validation.stateRequired"));
          return false;
        }
        if (!formData.zipCode.trim()) {
          toast.error(t("validation.zipCodeRequired"));
          return false;
        }
        return true;

      case 2:
        if (!formData.phone.trim()) {
          toast.error(t("validation.phoneRequired"));
          return false;
        }
        return true;

      case 3:
        // First service is optional
        if (formData.serviceName.trim() && formData.servicePrice <= 0) {
          toast.error(t("validation.servicePriceInvalid"));
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleDayEnabled = (day: keyof typeof formData.workingHours) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          enabled: !formData.workingHours[day].enabled,
        },
      },
    });
  };

  const updateWorkingHours = (
    day: keyof typeof formData.workingHours,
    field: "start" | "end" | "breakStart" | "breakEnd",
    value: string
  ) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day],
          [field]: value,
        },
      },
    });
  };

  // Get region-specific placeholders
  const getPlaceholders = () => {
    const countryCode = formData.country;

    switch (countryCode) {
      case "PT":
        return {
          street: "Rua das Flores, 123",
          city: "Lisboa",
          state: "Lisboa",
          zipCode: "1000-001",
          phone: "+351 912 345 678",
          country: "Portugal",
        };
      case "US":
        return {
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          phone: "+1 (555) 123-4567",
          country: "United States",
        };
      case "BR":
      default:
        return {
          street: "Rua das Flores, 123",
          city: "São Paulo",
          state: "SP",
          zipCode: "01310-100",
          phone: "+55 (11) 98765-4321",
          country: "Brasil",
        };
    }
  };

  const placeholders = getPlaceholders();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {currentStep === 1 && <MapPin className="h-5 w-5 text-primary" />}
              {currentStep === 2 && <Clock className="h-5 w-5 text-primary" />}
              {currentStep === 3 && (
                <Briefcase className="h-5 w-5 text-primary" />
              )}
              <CardTitle>{t("title")}</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              {t("step", { current: currentStep, total: totalSteps })}
            </span>
          </div>
          <CardDescription>
            {currentStep === 1 && t("steps.address.title")}
            {currentStep === 2 && t("steps.contact.title")}
            {currentStep === 3 && t("steps.service.title")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Progress value={(currentStep / totalSteps) * 100} className="mb-6" />

          <form onSubmit={handleSubmit}>
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="street">{t("steps.address.street")} *</Label>
                  <Input
                    id="street"
                    placeholder={placeholders.street}
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("steps.address.city")} *</Label>
                    <Input
                      id="city"
                      placeholder={placeholders.city}
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{t("steps.address.state")} *</Label>
                    <Input
                      id="state"
                      placeholder={placeholders.state}
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">
                      {t("steps.address.zipCode")} *
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder={placeholders.zipCode}
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      {t("steps.address.country")}
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value: RegionCode) =>
                        setFormData({ ...formData, country: value })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger id="country">
                        <SelectValue
                          placeholder={t("steps.address.selectCountry")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PT">🇵🇹 Portugal</SelectItem>
                        <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                        <SelectItem value="US">🇺🇸 United States</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Hours */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Contact Information Section */}
                <div className="p-4 border rounded-lg bg-card space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        1
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">
                      {t("steps.contact.contactInfo")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-10">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {t("steps.contact.phone")} *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={placeholders.phone}
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">
                        {t("steps.contact.whatsapp")}
                      </Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder={placeholders.phone}
                        value={formData.whatsapp}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            whatsapp: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Working Hours Section */}
                <div className="p-4 border rounded-lg bg-card space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        2
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {t("steps.contact.workingHours")}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("steps.contact.workingHoursDescription")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pl-10">
                    {Object.entries(formData.workingHours).map(
                      ([day, hours]) => {
                        const dayKey = `steps.contact.days.${day}` as const;

                        return (
                          <div key={day} className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-24 text-sm font-medium">
                                {t(dayKey)}
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  type="time"
                                  value={hours.start}
                                  onChange={(e) =>
                                    updateWorkingHours(
                                      day as keyof typeof formData.workingHours,
                                      "start",
                                      e.target.value
                                    )
                                  }
                                  disabled={!hours.enabled || isLoading}
                                  className="w-32"
                                />
                                <span className="text-muted-foreground text-sm">
                                  {t("steps.contact.to")}
                                </span>
                                <Input
                                  type="time"
                                  value={hours.end}
                                  onChange={(e) =>
                                    updateWorkingHours(
                                      day as keyof typeof formData.workingHours,
                                      "end",
                                      e.target.value
                                    )
                                  }
                                  disabled={!hours.enabled || isLoading}
                                  className="w-32"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`${day}-enabled`}
                                  checked={hours.enabled}
                                  onCheckedChange={() =>
                                    toggleDayEnabled(
                                      day as keyof typeof formData.workingHours
                                    )
                                  }
                                  disabled={isLoading}
                                />
                                <Label
                                  htmlFor={`${day}-enabled`}
                                  className="text-sm cursor-pointer"
                                >
                                  {t("steps.contact.open")}
                                </Label>
                              </div>
                            </div>

                            {/* Break time (optional) */}
                            {hours.enabled && (
                              <div className="flex items-center gap-3 ml-28 pl-1">
                                <span className="text-xs text-muted-foreground w-16">
                                  {t("steps.contact.interval")}
                                </span>
                                <Input
                                  type="time"
                                  value={hours.breakStart || ""}
                                  onChange={(e) =>
                                    updateWorkingHours(
                                      day as keyof typeof formData.workingHours,
                                      "breakStart",
                                      e.target.value
                                    )
                                  }
                                  disabled={isLoading}
                                  placeholder="--:--"
                                  className="w-28 text-sm h-8"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {t("steps.contact.to")}
                                </span>
                                <Input
                                  type="time"
                                  value={hours.breakEnd || ""}
                                  onChange={(e) =>
                                    updateWorkingHours(
                                      day as keyof typeof formData.workingHours,
                                      "breakEnd",
                                      e.target.value
                                    )
                                  }
                                  disabled={isLoading}
                                  placeholder="--:--"
                                  className="w-28 text-sm h-8"
                                />
                                <span className="text-xs text-muted-foreground">
                                  {t("steps.contact.intervalOptional")}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: First Service */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in-50 duration-500">
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t("steps.service.description")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceName">{t("steps.service.name")}</Label>
                  <Input
                    id="serviceName"
                    placeholder={t("steps.service.namePlaceholder")}
                    value={formData.serviceName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceName: e.target.value,
                      })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceDuration">
                      {t("steps.service.duration")}
                    </Label>
                    <Input
                      id="serviceDuration"
                      type="number"
                      min="15"
                      step="15"
                      placeholder="60"
                      value={formData.serviceDuration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          serviceDuration:
                            Number.parseInt(e.target.value) || 60,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servicePrice">
                      {t("steps.service.price")} ({regionConfig.currencySymbol})
                    </Label>
                    <Input
                      id="servicePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="50.00"
                      value={
                        formData.servicePrice === 0 ? "" : formData.servicePrice
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          servicePrice:
                            e.target.value === ""
                              ? 0
                              : Number.parseFloat(e.target.value),
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">
                    {t("steps.service.priceDescription")}
                  </Label>
                  <Input
                    id="serviceDescription"
                    placeholder={t("steps.service.priceDescriptionPlaceholder")}
                    value={formData.serviceDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceDescription: e.target.value,
                      })
                    }
                    disabled={isLoading}
                  />
                </div>

                {formData.serviceName && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {t("steps.service.preview")}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {t("steps.service.previewText", {
                            name: formData.serviceName,
                            duration: formData.serviceDuration,
                            currency: regionConfig.currencySymbol,
                            price: formData.servicePrice.toFixed(2),
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("buttons.back")}
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading && t("buttons.processing")}
                {!isLoading && currentStep < totalSteps && (
                  <>
                    {t("buttons.next")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
                {!isLoading && currentStep >= totalSteps && (
                  <>
                    {t("buttons.finish")}
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
