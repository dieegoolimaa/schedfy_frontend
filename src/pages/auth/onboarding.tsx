import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../contexts/auth-context";
import { entitiesService } from "../../services/entities.service";
import { getDashboardRoute } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { Logo } from "../../components/ui/logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { PaymentMethodStep } from "@/components/onboarding/payment-step";
import { CompleteOnboardingDto, WorkingHours } from "@/types/models/entities.interface";

const STEPS = [
  {
    id: 1,
    title: "Company Info",
    description: "Basic details about your business",
  },
  {
    id: 2,
    title: "Contact & Hours",
    description: "How customers can reach you",
  },
  {
    id: 3,
    title: "First Service",
    description: "Add your first service to get started",
  },
  {
    id: 4,
    title: "Payment Method",
    description: "Setup billing for your subscription",
  },
];

export function OnboardingPage() {
  const { t } = useTranslation("onboarding");
  const { user, logout } = useAuth();
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState({
    // Step 1
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    // Step 2
    phone: "",
    whatsapp: "",
    workingHours: {
      monday: { enabled: true, start: "09:00", end: "18:00" },
      tuesday: { enabled: true, start: "09:00", end: "18:00" },
      wednesday: { enabled: true, start: "09:00", end: "18:00" },
      thursday: { enabled: true, start: "09:00", end: "18:00" },
      friday: { enabled: true, start: "09:00", end: "18:00" },
      saturday: { enabled: true, start: "09:00", end: "13:00" },
      sunday: { enabled: false, start: "09:00", end: "13:00" },
    } as WorkingHours,
    defaultSlotDuration: 30,
    // Step 3
    firstService: {
      name: "",
      duration: "60",
      price: "",
      description: "",
    },
    // Step 4
    paymentMethodId: "",
  });

  const handleNext = () => {
    if (activeStep < STEPS.length) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Prepare payload
      const payload: CompleteOnboardingDto = {
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        workingHours: formData.workingHours,
        defaultSlotDuration: formData.defaultSlotDuration,
        paymentMethodId: formData.paymentMethodId,
      };

      // Only add first service if name is provided
      if (formData.firstService.name) {
        payload.firstService = {
          name: formData.firstService.name,
          duration: Number(formData.firstService.duration),
          price: Number(formData.firstService.price),
          description: formData.firstService.description,
        };
      }

      console.log("Submitting onboarding data:", payload);
      await entitiesService.completeOnboarding(payload);

      toast.success("Onboarding completed successfully!");

      // Force reload user profile to update state
      // Then redirect to dashboard
      window.location.href = getDashboardRoute(user?.plan || 'simple');

    } catch (error: any) {
      console.error("Onboarding failed:", error);
      toast.error(error.response?.data?.message || "Failed to complete onboarding");
    }
  };

  // Validation
  const isStep1Valid =
    formData.address.street &&
    formData.address.city &&
    formData.address.state &&
    formData.address.zipCode &&
    formData.address.country;

  const isStep2Valid = formData.phone;

  const isStep3Valid =
    formData.firstService.name &&
    Number(formData.firstService.duration) > 0 &&
    (user?.plan === 'simple' || formData.firstService.price !== "");

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" onClick={() => logout()}>
            {t("signOut")}
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("welcome")}</h1>
          <p className="text-muted-foreground">
            {t("welcomeDescription")}
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-5 transform -translate-y-1/2 w-full h-1 bg-muted -z-10" />
            {STEPS.map((step) => {
              const isActive = step.id === activeStep;
              const isCompleted = step.id < activeStep;

              return (
                <div key={step.id} className="flex flex-col items-center px-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : step.id}
                  </div>
                  <span
                    className={`text-sm mt-2 font-medium ${isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
          {activeStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t("steps.address.title")}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">{t("steps.address.street")} *</Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value },
                        })
                      }
                      placeholder={t("steps.address.streetPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("steps.address.city")} *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      placeholder={t("steps.address.cityPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">{t("steps.address.state")} *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      placeholder={t("steps.address.statePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">{t("steps.address.zipCode")} *</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, zipCode: e.target.value },
                        })
                      }
                      placeholder={t("steps.address.zipCodePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t("steps.address.country")} *</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, country: e.target.value },
                        })
                      }
                      placeholder={t("steps.address.countryPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleNext} disabled={!isStep1Valid}>
                  {t("nextStep")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t("steps.contact.title")}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("steps.contact.phone")} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder={t("steps.contact.phonePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">{t("steps.contact.whatsapp")}</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder={t("steps.contact.whatsappPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-xl font-semibold">{t("steps.bookingSettings.title")}</h2>
                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="slotDuration">{t("steps.bookingSettings.slotDuration")}</Label>
                  <Select
                    value={String(formData.defaultSlotDuration)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, defaultSlotDuration: Number(value) })
                    }
                  >
                    <SelectTrigger id="slotDuration">
                      <SelectValue placeholder={t("steps.bookingSettings.selectDuration")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">{t("steps.bookingSettings.minutes15")}</SelectItem>
                      <SelectItem value="30">{t("steps.bookingSettings.minutes30")}</SelectItem>
                      <SelectItem value="45">{t("steps.bookingSettings.minutes45")}</SelectItem>
                      <SelectItem value="60">{t("steps.bookingSettings.minutes60")}</SelectItem>
                      <SelectItem value="90">{t("steps.bookingSettings.minutes90")}</SelectItem>
                      <SelectItem value="120">{t("steps.bookingSettings.hours2")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("steps.bookingSettings.durationDescription")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-xl font-semibold">{t("steps.workingHours.title")}</h2>
                <div className="space-y-4">
                  {Object.entries(formData.workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-24 font-medium capitalize">{day}</div>
                      <Switch
                        checked={hours.enabled}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            workingHours: {
                              ...formData.workingHours,
                              [day]: { ...hours, enabled: checked },
                            },
                          })
                        }
                      />
                      {hours.enabled ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.start}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingHours: {
                                  ...formData.workingHours,
                                  [day]: { ...hours, start: e.target.value },
                                },
                              })
                            }
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={hours.end}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingHours: {
                                  ...formData.workingHours,
                                  [day]: { ...hours, end: e.target.value },
                                },
                              })
                            }
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!isStep2Valid}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Create Your First Service</h2>
                <p className="text-muted-foreground">
                  Add a service to start accepting bookings. You can add more later.
                </p>

                <div className="grid gap-4 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="serviceName">Service Name *</Label>
                    <Input
                      id="serviceName"
                      value={formData.firstService.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstService: { ...formData.firstService, name: e.target.value },
                        })
                      }
                      placeholder="e.g., Haircut, Consultation, Massage"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (min) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="5"
                        step="5"
                        value={formData.firstService.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstService: {
                              ...formData.firstService,
                              duration: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    {user?.plan !== 'simple' && (
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            className="pl-8"
                            value={formData.firstService.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstService: {
                                  ...formData.firstService,
                                  price: e.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.firstService.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstService: {
                            ...formData.firstService,
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder="Brief description of the service..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!isStep3Valid}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <PaymentMethodStep
                planType={user?.plan || "Simple"}
                onBack={handleBack}
                onNext={(data) => {
                  setFormData(prev => ({ ...prev, paymentMethodId: data.paymentMethodId }));

                  // Auto submit after payment method is added
                  const payload: CompleteOnboardingDto = {
                    address: formData.address,
                    phone: formData.phone,
                    whatsapp: formData.whatsapp,
                    workingHours: formData.workingHours,
                    defaultSlotDuration: formData.defaultSlotDuration,
                    paymentMethodId: data.paymentMethodId,
                  };

                  if (formData.firstService.name) {
                    payload.firstService = {
                      name: formData.firstService.name,
                      duration: Number(formData.firstService.duration),
                      price: Number(formData.firstService.price),
                      description: formData.firstService.description,
                    };
                  }

                  entitiesService.completeOnboarding(payload)
                    .then(() => {
                      toast.success("Onboarding completed successfully!");
                      window.location.href = getDashboardRoute(user?.plan || 'simple');
                    })
                    .catch((error) => {
                      console.error("Onboarding failed:", error);
                      toast.error(error.response?.data?.message || "Failed to complete onboarding");
                    });
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
