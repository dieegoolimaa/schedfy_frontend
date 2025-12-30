import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useTranslation } from "react-i18next";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "../../lib/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
} from "../../types/models/services.interface";


import {
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Search,
} from "lucide-react";

const SimpleServicesPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation("services");

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnerOrManager = user?.role === "owner" || user?.role === "manager" || user?.role === "admin";



  // Service filters and search
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("all");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all");

  // Service CRUD states
  const [isServiceCreateModalOpen, setIsServiceCreateModalOpen] =
    useState(false);
  const [isServiceEditModalOpen, setIsServiceEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    category: "",
    customCategory: "",
    duration: "",
    isActive: true,
    isPublic: true,
    requireManualConfirmation: false,
    meetingType: "in-person" as "in-person" | "online",
    onlineProvider: "" as "" | "google-meet" | "custom",
    customMeetingLink: "",
  });

  const fetchData = async () => {
    try {
      if (!user?.entityId) return;
      setLoading(true);

      const servicesRes = await apiClient.get<Service[]>(
        `/api/services/entity/${user?.entityId}`
      );
      console.log("[DEBUG] Services loaded:", servicesRes.data?.length || 0);
      setServices(servicesRes.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(t("messages.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.entityId) {
      fetchData();
    }
  }, [user]);



  // Service metrics and filtering
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      (service.description?.toLowerCase() || "").includes(
        serviceSearchTerm.toLowerCase()
      );

    const matchesCategory =
      serviceCategoryFilter === "all" ||
      service.category === serviceCategoryFilter;

    const matchesStatus =
      serviceStatusFilter === "all" ||
      (serviceStatusFilter === "active" && service.status !== "inactive") ||
      (serviceStatusFilter === "inactive" && service.status === "inactive");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeServices = services.filter((s) => s.status !== "inactive");

  // Service CRUD Functions
  const handleCreateService = async () => {
    if (!isOwnerOrManager) {
      toast.error(t("messages.unauthorized"));
      return;
    }
    try {
      if (
        !serviceFormData.name ||
        !serviceFormData.category ||
        !serviceFormData.duration
      ) {
        toast.error(t("messages.fillRequiredFields"));
        return;
      }

      const payload: CreateServiceDto = {
        entityId: user?.entityId!,
        name: serviceFormData.name,
        description: serviceFormData.description || undefined,
        category: serviceFormData.category,
        status: serviceFormData.isActive ? "active" : "inactive",
        duration: {
          durationType: "fixed",
          duration: parseInt(serviceFormData.duration),
        },
        pricing: {
          basePrice: 0, // No price for Simple plan
          currency: "EUR",
        },
        bookingSettings: {
          requiresManualConfirmation: serviceFormData.requireManualConfirmation,
        },
        onlineMeeting: serviceFormData.meetingType !== 'in-person' ? {
          meetingType: serviceFormData.meetingType,
          onlineProvider: serviceFormData.onlineProvider || undefined,
          customMeetingLink: serviceFormData.customMeetingLink || undefined,
          autoCreateMeeting: serviceFormData.onlineProvider !== 'custom' && serviceFormData.onlineProvider !== '',
        } : undefined,
        createdBy: user?.id!,
      };

      console.log(
        "[DEBUG] Creating service with payload:",
        JSON.stringify(payload, null, 2)
      );

      await apiClient.post("/api/services", payload);

      toast.success(t("messages.serviceCreated"));
      setIsServiceCreateModalOpen(false);
      resetServiceForm();
      fetchData();
    } catch (error: any) {
      console.error("[ERROR] Error creating service:", error);
      console.error("[ERROR] Error response:", error.response?.data);
      toast.error(error.response?.data?.message || t("messages.error"));
    }
  };

  const handleUpdateService = async () => {
    if (!isOwnerOrManager) {
      toast.error(t("messages.unauthorized"));
      return;
    }
    try {
      if (!editingService) return;

      const serviceId = editingService._id || editingService.id;
      if (!serviceId) {
        toast.error(t("messages.error"));
        return;
      }

      const payload: UpdateServiceDto = {
        name: serviceFormData.name,
        description: serviceFormData.description || undefined,
        category: serviceFormData.category,
        status: serviceFormData.isActive ? "active" : "inactive",
        duration: {
          durationType: "fixed",
          duration: parseInt(serviceFormData.duration),
        },
        pricing: {
          basePrice: 0, // No price for Simple plan
          currency: "EUR",
        },
        bookingSettings: {
          requiresManualConfirmation: serviceFormData.requireManualConfirmation,
        },
        onlineMeeting: serviceFormData.meetingType !== 'in-person' ? {
          meetingType: serviceFormData.meetingType,
          onlineProvider: serviceFormData.onlineProvider || undefined,
          customMeetingLink: serviceFormData.customMeetingLink || undefined,
          autoCreateMeeting: serviceFormData.onlineProvider !== 'custom' && serviceFormData.onlineProvider !== '',
        } : undefined,
        updatedBy: user?.id!,
      };

      console.log(
        "[DEBUG] Updating service with payload:",
        JSON.stringify(payload, null, 2)
      );

      await apiClient.patch(`/api/services/${serviceId}`, payload);

      toast.success(t("messages.serviceUpdated"));
      setIsServiceEditModalOpen(false);
      resetServiceForm();
      fetchData();
    } catch (error: any) {
      console.error("[ERROR] Error updating service:", error);
      console.error("[ERROR] Error response:", error.response?.data);
      toast.error(error.response?.data?.message || t("messages.error"));
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!isOwnerOrManager) {
      toast.error(t("messages.unauthorized"));
      return;
    }
    try {
      if (!confirm(t("messages.confirmDelete"))) return;

      await apiClient.delete(`/api/services/${serviceId}`);
      toast.success(t("messages.serviceDeleted"));
      fetchData();
    } catch (error: any) {
      console.error("Error deleting service:", error);
      toast.error(error.response?.data?.message || t("messages.error"));
    }
  };

  const openServiceEditModal = (service: Service) => {
    setEditingService(service);

    const durationValue = service.duration.duration;

    setServiceFormData({
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      customCategory: "",
      duration: String(durationValue),
      isActive: service.status !== "inactive",
      isPublic: service.seo?.isPublic !== false,
      requireManualConfirmation:
        service.bookingSettings?.requiresManualConfirmation || false,
      meetingType: (service as any).onlineMeeting?.meetingType || "in-person",
      onlineProvider: (service as any).onlineMeeting?.onlineProvider || "",
      customMeetingLink: (service as any).onlineMeeting?.customMeetingLink || "",
    });
    setShowCustomCategory(false);
    setIsServiceEditModalOpen(true);
  };

  const resetServiceForm = () => {
    setServiceFormData({
      name: "",
      description: "",
      category: "",
      customCategory: "",
      duration: "",
      isActive: true,
      isPublic: true,
      requireManualConfirmation: false,
      meetingType: "in-person",
      onlineProvider: "",
      customMeetingLink: "",
    });
    setShowCustomCategory(false);
    setEditingService(null);
  };


  // Calculate statistics
  const totalServices = services.length;


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            Services
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("stats.totalServices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeServices.length} {t("stats.active")}
            </p>
          </CardContent>
        </Card>


      </div>

      {/* Tabs */}
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{t("services.title")} ({totalServices})</h2>
        </div>
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("services.searchPlaceholder")}
              value={serviceSearchTerm}
              onChange={(e) => setServiceSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={serviceCategoryFilter}
              onValueChange={setServiceCategoryFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("services.form.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("services.filters.allCategories")}</SelectItem>
                {Array.from(
                  new Set(services.map((s) => s.category).filter((c): c is string => !!c))
                )
                  .sort()
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select
              value={serviceStatusFilter}
              onValueChange={setServiceStatusFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t("services.table.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("services.filters.allStatus")}</SelectItem>
                <SelectItem value="active">{t("services.status.active")}</SelectItem>
                <SelectItem value="inactive">{t("services.status.inactive")}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setServiceSearchTerm("");
                setServiceCategoryFilter("all");
                setServiceStatusFilter("all");
              }}
            >
              {t("services.filters.clear")}
            </Button>

            {/* Create Service Button - Moved here for alignment */}
            {isOwnerOrManager && (
              <Dialog
                open={isServiceCreateModalOpen}
                onOpenChange={setIsServiceCreateModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="ml-2">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("services.addService")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t("modal.createTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("modal.createDescription")}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-name">{t("services.form.name")} *</Label>
                        <Input
                          id="service-name"
                          value={serviceFormData.name}
                          onChange={(e) =>
                            setServiceFormData({
                              ...serviceFormData,
                              name: e.target.value,
                            })
                          }
                          placeholder={t("services.form.namePlaceholder")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="service-category">{t("services.form.category")} *</Label>
                        <Select
                          value={
                            showCustomCategory
                              ? "custom"
                              : serviceFormData.category
                          }
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setShowCustomCategory(true);
                              setServiceFormData({
                                ...serviceFormData,
                                category: "",
                              });
                            } else {
                              setShowCustomCategory(false);
                              setServiceFormData({
                                ...serviceFormData,
                                category: value,
                                customCategory: "",
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("services.form.categoryPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="haircut">
                              {t("categories.haircut")}
                            </SelectItem>
                            <SelectItem value="color">{t("categories.color")}</SelectItem>
                            <SelectItem value="treatment">{t("categories.treatment")}</SelectItem>
                            <SelectItem value="styling">{t("categories.styling")}</SelectItem>
                            <SelectItem value="massage">{t("categories.massage")}</SelectItem>
                            <SelectItem value="facial">{t("categories.facial")}</SelectItem>
                            <SelectItem value="manicure">{t("categories.manicure")}</SelectItem>
                            <SelectItem value="pedicure">{t("categories.pedicure")}</SelectItem>
                            <SelectItem value="other">{t("categories.other")}</SelectItem>
                            <SelectItem value="custom">
                              {t("categories.custom")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showCustomCategory && (
                          <Input
                            placeholder={t("services.form.customCategoryPlaceholder")}
                            value={serviceFormData.customCategory}
                            onChange={(e) =>
                              setServiceFormData({
                                ...serviceFormData,
                                customCategory: e.target.value,
                                category: e.target.value,
                              })
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service-description">{t("services.form.description")}</Label>
                      <Textarea
                        id="service-description"
                        value={serviceFormData.description}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            description: e.target.value,
                          })
                        }
                        placeholder={t("services.form.descriptionPlaceholder")}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-duration">
                          {t("services.form.duration")} *
                        </Label>
                        <Input
                          id="service-duration"
                          type="number"
                          min="5"
                          value={serviceFormData.duration}
                          onChange={(e) =>
                            setServiceFormData({
                              ...serviceFormData,
                              duration: e.target.value,
                            })
                          }
                          placeholder={t("services.form.durationPlaceholder")}
                        />
                      </div>

                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="service-active"
                          checked={serviceFormData.isActive}
                          onCheckedChange={(checked) =>
                            setServiceFormData({
                              ...serviceFormData,
                              isActive: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="service-active"
                          className="cursor-pointer"
                        >
                          {t("services.form.isActive")}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="service-public"
                          checked={serviceFormData.isPublic}
                          onCheckedChange={(checked) =>
                            setServiceFormData({
                              ...serviceFormData,
                              isPublic: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="service-public"
                          className="cursor-pointer"
                        >
                          {t("services.form.isPublic")}
                        </Label>
                      </div>


                    </div>

                    {/* Meeting Type Section */}
                    <div className="space-y-3 pt-4 border-t">
                      <Label className="text-sm font-medium">
                        {t("services.form.meetingType", "Meeting Type")}
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant={serviceFormData.meetingType === "in-person" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setServiceFormData({ ...serviceFormData, meetingType: "in-person", onlineProvider: "", customMeetingLink: "" })}
                        >
                          🏢 {t("services.form.inPerson", "In Person")}
                        </Button>
                        <Button
                          type="button"
                          variant={serviceFormData.meetingType === "online" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setServiceFormData({ ...serviceFormData, meetingType: "online" })}
                        >
                          💻 {t("services.form.online", "Online")}
                        </Button>
                      </div>

                      {/* Online Provider Selection */}
                      {serviceFormData.meetingType === "online" && (
                        <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                          <Label className="text-sm">
                            {t("services.form.onlineProvider", "Video Platform")}
                          </Label>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              type="button"
                              variant={serviceFormData.onlineProvider === "google-meet" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setServiceFormData({ ...serviceFormData, onlineProvider: "google-meet", customMeetingLink: "" })}
                            >
                              Google Meet
                            </Button>
                            <Button
                              type="button"
                              variant={serviceFormData.onlineProvider === "custom" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setServiceFormData({ ...serviceFormData, onlineProvider: "custom" })}
                            >
                              {t("services.form.customLink", "Custom Link")}
                            </Button>
                          </div>

                          {serviceFormData.onlineProvider === "custom" && (
                            <div className="space-y-2">
                              <Label htmlFor="custom-link" className="text-xs text-muted-foreground">
                                {t("services.form.customMeetingLink", "Meeting Link (optional - will be added to all bookings)")}
                              </Label>
                              <Input
                                id="custom-link"
                                type="url"
                                placeholder="https://meet.google.com/abc-defg-hij"
                                value={serviceFormData.customMeetingLink}
                                onChange={(e) => setServiceFormData({ ...serviceFormData, customMeetingLink: e.target.value })}
                              />
                            </div>
                          )}

                          {serviceFormData.onlineProvider && serviceFormData.onlineProvider !== "custom" && (
                            <p className="text-xs text-muted-foreground">
                              ✨ {t("services.form.autoCreateMeeting", "Meeting links will be created automatically for each booking")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsServiceCreateModalOpen(false);
                        resetServiceForm();
                      }}
                    >
                      {t("actions.cancel")}
                    </Button>
                    <Button onClick={handleCreateService}>{t("services.addService")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("services.card.title")}</CardTitle>
            <CardDescription>
              {t("services.card.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("services.table.name")}</TableHead>
                  <TableHead>{t("services.table.category")}</TableHead>
                  <TableHead>{t("services.table.status")}</TableHead>
                  <TableHead className="text-right">{t("services.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t("services.noServices")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell className="font-medium">
                        {service.name}
                      </TableCell>
                      <TableCell className="capitalize">
                        {service.category || "-"}
                      </TableCell>
                      <TableCell>
                        {(service as any).status !== "inactive" ? (
                          <Badge variant="default">{t("services.status.active")}</Badge>
                        ) : (
                          <Badge variant="secondary">{t("services.status.inactive")}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openServiceEditModal(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteService(
                                service._id || service.id || ""
                              )
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Service Dialog */}
        <Dialog
          open={isServiceEditModalOpen}
          onOpenChange={setIsServiceEditModalOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("modal.updateTitle")}</DialogTitle>
            </DialogHeader>

            <div className="w-full">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-service-name">{t("services.form.name")} *</Label>
                    <Input
                      id="edit-service-name"
                      value={serviceFormData.name}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-service-category">{t("services.form.category")} *</Label>
                    <Select
                      value={
                        showCustomCategory ? "custom" : serviceFormData.category
                      }
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setShowCustomCategory(true);
                          setServiceFormData({
                            ...serviceFormData,
                            category: "",
                          });
                        } else {
                          setShowCustomCategory(false);
                          setServiceFormData({
                            ...serviceFormData,
                            category: value,
                            customCategory: "",
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="haircut">{t("categories.haircut")}</SelectItem>
                        <SelectItem value="color">{t("categories.color")}</SelectItem>
                        <SelectItem value="treatment">{t("categories.treatment")}</SelectItem>
                        <SelectItem value="styling">{t("categories.styling")}</SelectItem>
                        <SelectItem value="massage">{t("categories.massage")}</SelectItem>
                        <SelectItem value="facial">{t("categories.facial")}</SelectItem>
                        <SelectItem value="manicure">{t("categories.manicure")}</SelectItem>
                        <SelectItem value="pedicure">{t("categories.pedicure")}</SelectItem>
                        <SelectItem value="other">{t("categories.other")}</SelectItem>
                        <SelectItem value="custom">
                          {t("categories.custom")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {showCustomCategory && (
                      <Input
                        placeholder={t("services.form.customCategoryPlaceholder")}
                        value={serviceFormData.customCategory}
                        onChange={(e) =>
                          setServiceFormData({
                            ...serviceFormData,
                            customCategory: e.target.value,
                            category: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-service-description">{t("services.form.description")}</Label>
                  <Textarea
                    id="edit-service-description"
                    value={serviceFormData.description}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceFormData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-service-duration">
                      {t("services.form.duration")} *
                    </Label>
                    <Input
                      id="edit-service-duration"
                      type="number"
                      min="5"
                      value={serviceFormData.duration}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>


                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-service-active"
                      checked={serviceFormData.isActive}
                      onCheckedChange={(checked) =>
                        setServiceFormData({
                          ...serviceFormData,
                          isActive: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="edit-service-active"
                      className="cursor-pointer"
                    >
                      {t("services.form.isActive")}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-service-public"
                      checked={serviceFormData.isPublic}
                      onCheckedChange={(checked) =>
                        setServiceFormData({
                          ...serviceFormData,
                          isPublic: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="edit-service-public"
                      className="cursor-pointer"
                    >
                      {t("services.form.isPublic")}
                    </Label>
                  </div>


                </div>

                {/* Meeting Type Section */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-sm font-medium">
                    {t("services.form.meetingType", "Meeting Type")}
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant={serviceFormData.meetingType === "in-person" ? "default" : "outline"}
                      onClick={() => setServiceFormData({ ...serviceFormData, meetingType: "in-person", onlineProvider: "" })}
                    >
                      🏢 {t("services.form.inPerson", "In Person")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={serviceFormData.meetingType === "online" ? "default" : "outline"}
                      onClick={() => setServiceFormData({ ...serviceFormData, meetingType: "online" })}
                    >
                      💻 {t("services.form.online", "Online")}
                    </Button>
                  </div>

                  {/* Online Meeting Provider Selection */}
                  {serviceFormData.meetingType === "online" && (
                    <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                      <Label className="text-sm text-muted-foreground">
                        {t("services.form.selectProvider", "Select video platform")}
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          type="button"
                          size="sm"
                          variant={serviceFormData.onlineProvider === "google_meet" ? "default" : "outline"}
                          onClick={() => setServiceFormData({ ...serviceFormData, onlineProvider: "google_meet", customMeetingLink: "" })}
                        >
                          📹 Google Meet
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={serviceFormData.onlineProvider === "custom" ? "default" : "outline"}
                          onClick={() => setServiceFormData({ ...serviceFormData, onlineProvider: "custom" })}
                        >
                          🔗 {t("services.form.customLink", "Custom Link")}
                        </Button>
                      </div>

                      {/* Custom Link Input */}
                      {serviceFormData.onlineProvider === "custom" && (
                        <div className="space-y-2">
                          <Label htmlFor="edit-custom-meeting-link" className="text-sm">
                            {t("services.form.customMeetingLink", "Meeting Link")}
                          </Label>
                          <Input
                            id="edit-custom-meeting-link"
                            type="url"
                            placeholder="https://meet.example.com/your-room"
                            value={serviceFormData.customMeetingLink}
                            onChange={(e) => setServiceFormData({ ...serviceFormData, customMeetingLink: e.target.value })}
                          />
                        </div>
                      )}

                      {/* Auto-create meeting hint */}
                      {serviceFormData.onlineProvider && serviceFormData.onlineProvider !== "custom" && (
                        <p className="text-xs text-muted-foreground">
                          ✨ {t("services.form.autoCreateMeeting", "Meeting link will be automatically created for each booking")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsServiceEditModalOpen(false);
                  resetServiceForm();
                }}
              >
                {t("actions.cancel")}
              </Button>
              <Button onClick={handleUpdateService}>{t("modal.updateTitle")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

    </div>
  );
};

export default SimpleServicesPage;
