import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/auth-context";
import { entitiesService } from "../services/entities.service";
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
  MapPin,
  Clock,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function OnboardingPage() {
  const { user, entity } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    // Step 1: Address
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "BR",

    // Step 2: Contact & Hours
    phone: "",
    whatsapp: "",
    businessHours: {
      monday: { open: "09:00", close: "18:00", closed: false },
      tuesday: { open: "09:00", close: "18:00", closed: false },
      wednesday: { open: "09:00", close: "18:00", closed: false },
      thursday: { open: "09:00", close: "18:00", closed: false },
      friday: { open: "09:00", close: "18:00", closed: false },
      saturday: { open: "09:00", close: "13:00", closed: false },
      sunday: { open: "", close: "", closed: true },
    },

    // Step 3: First Service
    serviceName: "",
    serviceDuration: 60,
    servicePrice: 0,
    serviceDescription: "",
  });

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

      await entitiesService.completeOnboarding(user.entityId, {
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        phone: formData.phone,
        whatsapp: formData.whatsapp || undefined,
        businessHours: formData.businessHours,
        firstService: formData.serviceName
          ? {
              name: formData.serviceName,
              duration: formData.serviceDuration,
              price: formData.servicePrice,
              description: formData.serviceDescription || undefined,
            }
          : undefined,
      });

      toast.success("Configuração concluída! Bem-vindo ao Schedfy!");

      // Redirect to appropriate dashboard
      const dashboardRoute = getDashboardRoute(user);
      navigate(dashboardRoute, { replace: true });

      // Reload page to update entity state
      window.location.href = dashboardRoute;
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(
        error.response?.data?.message ||
          "Não foi possível concluir a configuração. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.street.trim()) {
          toast.error("Por favor, informe o endereço da sua empresa");
          return false;
        }
        if (!formData.city.trim()) {
          toast.error("Por favor, informe a cidade");
          return false;
        }
        if (!formData.state.trim()) {
          toast.error("Por favor, informe o estado");
          return false;
        }
        if (!formData.zipCode.trim()) {
          toast.error("Por favor, informe o CEP");
          return false;
        }
        return true;

      case 2:
        if (!formData.phone.trim()) {
          toast.error("Por favor, informe um número de telefone para contato");
          return false;
        }
        return true;

      case 3:
        // First service is optional
        if (formData.serviceName.trim() && formData.servicePrice <= 0) {
          toast.error("Por favor, defina um preço válido para o serviço");
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

  const toggleDayOff = (day: keyof typeof formData.businessHours) => {
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours,
        [day]: {
          ...formData.businessHours[day],
          closed: !formData.businessHours[day].closed,
        },
      },
    });
  };

  const updateBusinessHours = (
    day: keyof typeof formData.businessHours,
    field: "open" | "close",
    value: string
  ) => {
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours,
        [day]: {
          ...formData.businessHours[day],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {currentStep === 1 && <MapPin className="h-5 w-5 text-primary" />}
              {currentStep === 2 && <Clock className="h-5 w-5 text-primary" />}
              {currentStep === 3 && (
                <Briefcase className="h-5 w-5 text-primary" />
              )}
              <CardTitle>Complete a configuração do seu negócio</CardTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              Etapa {currentStep} de {totalSteps}
            </span>
          </div>
          <CardDescription>
            {currentStep === 1 && "Vamos começar com o endereço do seu negócio"}
            {currentStep === 2 &&
              "Configure suas informações de contato e horários"}
            {currentStep === 3 && "Crie seu primeiro serviço (opcional)"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Progress value={(currentStep / totalSteps) * 100} className="mb-6" />

          <form onSubmit={handleSubmit}>
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="street">Endereço *</Label>
                  <Input
                    id="street"
                    placeholder="Rua das Flores, 123"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      placeholder="São Paulo"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      placeholder="SP"
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
                    <Label htmlFor="zipCode">CEP *</Label>
                    <Input
                      id="zipCode"
                      placeholder="01310-100"
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={
                        formData.country === "BR"
                          ? "Brasil"
                          : formData.country === "PT"
                          ? "Portugal"
                          : "Estados Unidos"
                      }
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Hours */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in-50 duration-500">
                <div className="space-y-4">
                  <h3 className="font-medium">Informações de contato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 98765-4321"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        placeholder="(11) 98765-4321"
                        value={formData.whatsapp}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsapp: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Horário de funcionamento</h3>
                  <div className="space-y-3">
                    {Object.entries(formData.businessHours).map(
                      ([day, hours]) => {
                        const dayNames: Record<string, string> = {
                          monday: "Segunda",
                          tuesday: "Terça",
                          wednesday: "Quarta",
                          thursday: "Quinta",
                          friday: "Sexta",
                          saturday: "Sábado",
                          sunday: "Domingo",
                        };

                        return (
                          <div key={day} className="flex items-center gap-3">
                            <div className="w-24 text-sm">{dayNames[day]}</div>
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) =>
                                  updateBusinessHours(
                                    day as keyof typeof formData.businessHours,
                                    "open",
                                    e.target.value
                                  )
                                }
                                disabled={hours.closed || isLoading}
                                className="w-32"
                              />
                              <span className="text-muted-foreground">às</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) =>
                                  updateBusinessHours(
                                    day as keyof typeof formData.businessHours,
                                    "close",
                                    e.target.value
                                  )
                                }
                                disabled={hours.closed || isLoading}
                                className="w-32"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`${day}-closed`}
                                checked={hours.closed}
                                onCheckedChange={() =>
                                  toggleDayOff(
                                    day as keyof typeof formData.businessHours
                                  )
                                }
                                disabled={isLoading}
                              />
                              <Label
                                htmlFor={`${day}-closed`}
                                className="text-sm cursor-pointer"
                              >
                                Fechado
                              </Label>
                            </div>
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
                    Criar seu primeiro serviço é opcional, mas recomendado para
                    começar rapidamente. Você pode adicionar mais serviços
                    depois no seu painel.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceName">Nome do serviço</Label>
                  <Input
                    id="serviceName"
                    placeholder="Ex: Corte de cabelo, Massagem, Consulta"
                    value={formData.serviceName}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceName: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceDuration">Duração (minutos)</Label>
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
                          serviceDuration: parseInt(e.target.value) || 60,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servicePrice">
                      Preço ({entity?.name ? "R$" : "$"})
                    </Label>
                    <Input
                      id="servicePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="50.00"
                      value={formData.servicePrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          servicePrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceDescription">
                    Descrição (opcional)
                  </Label>
                  <Input
                    id="serviceDescription"
                    placeholder="Breve descrição do serviço"
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
                          Pré-visualização do serviço
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {formData.serviceName} • {formData.serviceDuration}{" "}
                          min • {entity?.name ? "R$" : "$"}
                          {formData.servicePrice.toFixed(2)}
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
                Voltar
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  "Processando..."
                ) : currentStep < totalSteps ? (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Concluir configuração
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
