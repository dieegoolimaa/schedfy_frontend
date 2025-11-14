import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
import { useAuth } from "../../contexts/auth-context";
import { useClients } from "../../hooks/useClients";
import { useBookings } from "../../hooks/useBookings";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { StatCard } from "../../components/ui/stat-card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Phone,
  Mail,
  TrendingUp,
  Euro,
  Heart,
  Users,
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";

export function ClientProfilePage() {
  const { t } = useTranslation("clients");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClientData, setEditingClientData] = useState<any>(null);
  const [clientToDelete, setClientToDelete] = useState<any>(null);

  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const entityId = user?.entityId || user?.id || "";

  const {
    clients,
    loading: clientsLoading,
    fetchClients,
    getClientWithBookings,
    createClient,
    updateClient,
    deleteClient,
  } = useClients({ entityId, autoFetch: true });

  const { bookings, loading: bookingsLoading } = useBookings({
    entityId,
    autoFetch: true,
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: undefined as Date | undefined,
    notes: "",
  });

  const handleViewClient = async (client: any) => {
    try {
      toast.loading("Loading client details...", { id: "view-client" });

      const full = await getClientWithBookings(String(client.id));
      // Ensure full name is available
      if (full && !full.name) {
        full.name = `${full.firstName || ""} ${full.lastName || ""}`.trim();
      }
      setSelectedClient(full);
      setShowClientDetails(true);

      toast.success("Client details loaded", { id: "view-client" });
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load client details";
      toast.error(errorMessage, { id: "view-client" });
    }
  };

  const openEditClient = (client: any) => {
    // Format date for input[type="date"] which expects "yyyy-MM-dd"
    const formatDateForInput = (dateValue: any): string => {
      if (!dateValue) return "";
      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        // Get local date in yyyy-MM-dd format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch {
        return "";
      }
    };

    setEditingClientData({
      ...client,
      birthDate: formatDateForInput(client.dateOfBirth || client.birthDate),
    });
    setIsEditDialogOpen(true);
  };

  const handleEditClientSave = async () => {
    if (!editingClientData?.id) return;

    // Validação de campos obrigatórios
    if (
      !editingClientData.name?.trim() &&
      !editingClientData.firstName?.trim()
    ) {
      toast.error("Client name is required");
      return;
    }

    if (!editingClientData.email?.trim()) {
      toast.error("Email is required");
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editingClientData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validação de duplicidade (exceto o cliente atual)
    const emailExists = clientsArray.some(
      (c) =>
        c.id !== editingClientData.id &&
        c.email.toLowerCase() === editingClientData.email.toLowerCase()
    );
    if (emailExists) {
      toast.error("Another client with this email already exists");
      return;
    }

    if (editingClientData.phone) {
      const phoneExists = clientsArray.some(
        (c) =>
          c.id !== editingClientData.id && c.phone === editingClientData.phone
      );
      if (phoneExists) {
        toast.error("Another client with this phone number already exists");
        return;
      }
    }

    try {
      toast.loading("Updating client...", { id: "update-client" });

      // Split name into firstName and lastName if needed
      let firstName = editingClientData.firstName;
      let lastName = editingClientData.lastName;

      if (!firstName && !lastName && editingClientData.name) {
        const parts = editingClientData.name.trim().split(" ");
        firstName = parts[0] || "";
        lastName = parts.slice(1).join(" ") || "";
      }

      await updateClient(String(editingClientData.id), {
        firstName: firstName?.trim() || "",
        lastName: lastName?.trim() || "",
        email: editingClientData.email.toLowerCase().trim() || "",
        phone: editingClientData.phone?.trim() || "",
        notes: editingClientData.notes?.trim() || "",
        dateOfBirth: editingClientData.birthDate || undefined,
      });

      setIsEditDialogOpen(false);
      await fetchClients();

      toast.success(`Client ${firstName} ${lastName} updated successfully`, {
        id: "update-client",
      });
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update client";

      if (errorMessage.includes("email already exists")) {
        toast.error("Another client with this email already exists", {
          id: "update-client",
        });
      } else if (errorMessage.includes("phone already exists")) {
        toast.error("Another client with this phone number already exists", {
          id: "update-client",
        });
      } else {
        toast.error(errorMessage, { id: "update-client" });
      }
    }
  };

  const confirmDeleteClient = (client: any) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete?.id) return;

    const clientName =
      clientToDelete.name ||
      `${clientToDelete.firstName} ${clientToDelete.lastName}`;

    try {
      toast.loading("Deleting client...", { id: "delete-client" });

      await deleteClient(String(clientToDelete.id));

      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
      await fetchClients();

      toast.success(`Client ${clientName} deleted successfully`, {
        id: "delete-client",
      });
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete client";
      toast.error(errorMessage, { id: "delete-client" });
    }
  };

  const getClientBookings = (clientId: number) => {
    return recentBookings.filter((booking) => booking.clientId === clientId);
  };

  // Build a small recent bookings feed by fetching bookings for the first
  // few clients (kept lightweight). This populates the "Recent Activity" tab.
  // Load recent bookings from useBookings hook
  useEffect(() => {
    if (!bookings || bookings.length === 0) {
      setRecentBookings([]);
      return;
    }

    // Transform bookings with client names and sort by date
    const transformedBookings = bookings
      .map((booking: any) => {
        const client = clients.find(
          (c: any) =>
            String(c.id) === String(booking.clientId) ||
            String(c._id) === String(booking.clientId)
        );

        return {
          id: booking.id || booking._id,
          clientName: client
            ? `${client.firstName || ""} ${client.lastName || ""}`.trim() ||
              client.name
            : booking.client?.name || "Unknown Client",
          service: booking.service?.name || "Unknown Service",
          professional:
            booking.professional?.name ||
            (booking.professional?.firstName && booking.professional?.lastName
              ? `${booking.professional.firstName} ${booking.professional.lastName}`.trim()
              : "Unknown Professional"),
          date: booking.startDateTime || booking.date,
          time: booking.startDateTime
            ? new Date(booking.startDateTime).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : booking.time || "N/A",
          amount: booking.totalPrice || booking.price || 0,
          status: booking.status || "pending",
        };
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 20);

    setRecentBookings(transformedBookings);
  }, [bookings, clients]);

  // Keep old implementation as fallback if bookings hook doesn't load
  useEffect(() => {
    if (bookings && bookings.length > 0) return; // Skip if we have bookings from hook

    let cancelled = false;
    if (!clients || clients.length === 0) {
      setRecentBookings([]);
      return;
    }

    (async () => {
      try {
        const topClients = clients.slice(0, 10);
        const results = await Promise.all(
          topClients.map((c: any) =>
            getClientWithBookings(String(c.id)).catch(() => null)
          )
        );

        const bookings = results
          .filter(Boolean)
          .flatMap((res: any) =>
            (res.bookings || []).map((b: any) => ({
              ...b,
              clientName: res.name,
            }))
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 20);

        if (!cancelled) setRecentBookings(bookings as any[]);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clients, getClientWithBookings, bookings]);

  const handleAddClientSubmit = async () => {
    // Validação de campos obrigatórios
    if (!newClient.firstName.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!newClient.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }
    if (!newClient.email.trim()) {
      toast.error("Email is required");
      return;
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClient.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validação de duplicidade local (antes de enviar ao backend)
    const emailExists = clientsArray.some(
      (c) => c.email.toLowerCase() === newClient.email.toLowerCase()
    );
    if (emailExists) {
      toast.error("❌ This email is already registered", {
        duration: 5000,
        description: `A client with the email ${newClient.email} already exists in your system.`,
      });
      return;
    }

    if (newClient.phone) {
      const phoneExists = clientsArray.some((c) => c.phone === newClient.phone);
      if (phoneExists) {
        toast.error("❌ This phone number is already registered", {
          duration: 5000,
          description: `A client with the phone ${newClient.phone} already exists in your system.`,
        });
        return;
      }
    }

    try {
      toast.loading("Creating client...", { id: "create-client" });

      console.log("[Client Profile] Creating client with entityId:", entityId);

      await createClient({
        entityId,
        firstName: newClient.firstName.trim(),
        lastName: newClient.lastName.trim(),
        email: newClient.email.toLowerCase().trim(),
        phone: newClient.phone?.trim() || undefined,
        notes: newClient.notes?.trim() || undefined,
        dateOfBirth:
          newClient.birthDate?.toISOString().split("T")[0] || undefined,
        createdBy: user?.id || entityId,
      });

      setNewClient({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: undefined,
        notes: "",
      });

      // refresh list (createClient already appends but ensure consistency)
      console.log("[Client Profile] Fetching updated client list...");
      await fetchClients();

      toast.success(
        `✅ Client ${newClient.firstName} ${newClient.lastName} created successfully!`,
        { id: "create-client", duration: 3000 }
      );
    } catch (err: any) {
      console.error("[Client Profile] Error creating client:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create client";

      // Tratamento específico de erros do backend com mensagens claras
      if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("already")
      ) {
        toast.error("❌ Client Already Exists", {
          id: "create-client",
          duration: 6000,
          description: `A client with the email ${newClient.email} is already registered in your system. Please use a different email address.`,
        });
      } else if (
        errorMessage.toLowerCase().includes("phone") &&
        errorMessage.toLowerCase().includes("already")
      ) {
        toast.error("❌ Phone Number Already Registered", {
          id: "create-client",
          duration: 6000,
          description: `A client with the phone number ${newClient.phone} is already registered in your system. Please use a different phone number.`,
        });
      } else if (errorMessage.toLowerCase().includes("duplicate")) {
        toast.error("❌ Duplicate Client Information", {
          id: "create-client",
          duration: 6000,
          description:
            "This client information is already registered. Please check the email and phone number.",
        });
      } else {
        toast.error(`Failed to create client: ${errorMessage}`, {
          id: "create-client",
          duration: 5000,
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Ensure client has name field constructed from firstName/lastName
  const ensureClientName = (client: any) => {
    if (!client.name && (client.firstName || client.lastName)) {
      client.name = `${client.firstName || ""} ${client.lastName || ""}`.trim();
    }
    return client;
  };

  // Ensure clients is always an array
  const clientsArray = Array.isArray(clients) ? clients : [];

  const filteredClients = clientsArray
    .map(ensureClientName)
    .filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone || "").includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  console.log("[Client Profile] Filtering results:", {
    totalClients: clientsArray.length,
    filteredCount: filteredClients.length,
    searchTerm,
    statusFilter,
  });

  const stats = {
    total: clientsArray.length,
    active: clientsArray.filter((c) => c.status === "active").length,
    totalRevenue: clientsArray.reduce(
      (sum, c) => sum + (c.stats?.totalSpent || 0),
      0
    ),
    averageSpent:
      clientsArray.length > 0
        ? clientsArray.reduce((sum, c) => sum + (c.stats?.totalSpent || 0), 0) /
          clientsArray.length
        : 0,
    totalBookings: clientsArray.reduce(
      (sum, c) => sum + (c.stats?.totalBookings || 0),
      0
    ),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title", "Client Profiles")}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle", "Manage client profiles and link to bookings")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("actions.addClient", "Add Client")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  {t("form.addTitle", "Add New Client")}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    "form.addDescription",
                    "Create a client profile with essential information."
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="client-firstName"
                      className="text-sm font-medium"
                    >
                      {t("form.firstName", "First Name")} *
                    </Label>
                    <Input
                      id="client-firstName"
                      placeholder="John"
                      value={newClient.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewClient({
                          ...newClient,
                          firstName: e.target.value,
                        })
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="client-lastName"
                      className="text-sm font-medium"
                    >
                      {t("form.lastName", "Last Name")} *
                    </Label>
                    <Input
                      id="client-lastName"
                      placeholder="Doe"
                      value={newClient.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewClient({ ...newClient, lastName: e.target.value })
                      }
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-1.5">
                  <Label htmlFor="client-email" className="text-sm font-medium">
                    {t("form.email", "Email")} *
                  </Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={newClient.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewClient({ ...newClient, email: e.target.value })
                    }
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="client-phone" className="text-sm font-medium">
                    {t("form.phone", "Phone")} ({t("form.optional", "Optional")}
                    )
                  </Label>
                  <Input
                    id="client-phone"
                    placeholder="+351 123 456 789"
                    value={newClient.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewClient({ ...newClient, phone: e.target.value })
                    }
                    className="h-10"
                  />
                </div>

                {/* Optional Fields - Collapsible */}
                <div className="pt-2 border-t">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <span>
                        {t("form.additionalInfo", "Additional Information")} (
                        {t("form.optional", "Optional")})
                      </span>
                      <span className="transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-4 space-y-4">
                      {/* Birth Date */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="birth-date"
                          className="text-sm font-medium"
                        >
                          {t("form.birthDate", "Birth Date")}
                        </Label>
                        <Input
                          id="birth-date"
                          type="date"
                          value={
                            newClient.birthDate
                              ? newClient.birthDate instanceof Date
                                ? newClient.birthDate
                                    .toISOString()
                                    .split("T")[0]
                                : newClient.birthDate
                              : ""
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewClient({
                              ...newClient,
                              birthDate: e.target.value
                                ? new Date(e.target.value)
                                : undefined,
                            })
                          }
                          max={new Date().toISOString().split("T")[0]}
                          className="h-10"
                        />
                      </div>

                      {/* Notes */}
                      <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-sm font-medium">
                          {t("form.notes", "Notes")}
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder={t(
                            "form.notesPlaceholder",
                            "Allergies, preferences, special requests..."
                          )}
                          rows={3}
                          value={newClient.notes}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) =>
                            setNewClient({
                              ...newClient,
                              notes: e.target.value,
                            })
                          }
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </details>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button">
                      {t("common:actions.cancel", "Cancel")}
                    </Button>
                  </DialogTrigger>
                  <Button onClick={handleAddClientSubmit}>
                    {t("form.addClientButton", "Add Client")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {clientsLoading ? (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            title={t("stats.total", "Total")}
            value={stats.total}
            subtitle={t("stats.clients", "Clients")}
            icon={Users}
          />
          <StatCard
            title={t("stats.active", "Active")}
            value={stats.active}
            subtitle={t("stats.engaged", "Engaged")}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title={t("stats.bookings", "Bookings")}
            value={stats.totalBookings}
            subtitle={t("stats.totalSub", "Total")}
            icon={Calendar}
            variant="info"
          />
          <StatCard
            title={t("stats.revenue", "Revenue")}
            value={formatCurrency(stats.totalRevenue)}
            subtitle={t("stats.totalSub", "Total")}
            icon={Euro}
            variant="success"
          />
          <StatCard
            title={t("stats.avgSpent", "Avg. Spent")}
            value={formatCurrency(stats.averageSpent)}
            subtitle={t("stats.perClient", "Per Client")}
            icon={Euro}
            variant="warning"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search.placeholder", "Search clients...")}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("filters.allStatus", "All Status")}
              </SelectItem>
              <SelectItem value="active">
                {t("filters.active", "Active")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {t("filters.more", "More Filters")}
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="clients" className="space-y-6">
        <div className="border-b overflow-x-auto">
          <TabsList className="w-full justify-start flex-nowrap h-auto p-0 bg-transparent inline-flex min-w-full">
            <TabsTrigger value="clients" className="whitespace-nowrap">
              {t("tabs.allClients", "All Clients")}
            </TabsTrigger>
            <TabsTrigger value="recent" className="whitespace-nowrap">
              {t("tabs.recentActivity", "Recent Activity")}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="whitespace-nowrap">
              {t("tabs.analytics", "Analytics")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Clients List */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>{t("directory.title", "Client Directory")}</CardTitle>
              <CardDescription>
                {t(
                  "directory.description",
                  "Complete list of all clients with their details"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.client", "Client")}</TableHead>
                    <TableHead>{t("table.contact", "Contact")}</TableHead>
                    <TableHead>{t("table.activity", "Activity")}</TableHead>
                    <TableHead>{t("table.spending", "Spending")}</TableHead>
                    <TableHead>{t("table.status", "Status")}</TableHead>
                    <TableHead className="w-[100px]">
                      {t("table.actions", "Actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientsLoading
                    ? Array.from({ length: 4 }).map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                        </TableRow>
                      ))
                    : filteredClients.map((client) => {
                        const totalSpent = client.stats?.totalSpent || 0;
                        const totalBookings = client.stats?.totalBookings || 0;
                        const lastVisit =
                          client.stats?.lastBookingDate || client.createdAt;
                        const averageSpent =
                          client.stats?.averageBookingValue || 0;

                        // Generate initials for avatar
                        const initials = `${client.firstName?.[0] || ""}${
                          client.lastName?.[0] || ""
                        }`.toUpperCase();

                        return (
                          <TableRow key={client.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src="" />
                                  <AvatarFallback className="text-xs">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {client.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Member since{" "}
                                    {new Date(
                                      client.createdAt
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {client.email}
                                </div>
                                {client.phone && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {client.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {totalBookings} bookings
                                </div>
                                {lastVisit && (
                                  <div className="text-sm text-muted-foreground">
                                    Last:{" "}
                                    {new Date(lastVisit).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {formatCurrency(totalSpent)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Avg: {formatCurrency(averageSpent)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={getStatusColor(
                                  client.status || "active"
                                )}
                              >
                                {client.status || "active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewClient(client)}
                                  title="View Details"
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditClient(client)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDeleteClient(client)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("activity.title", "Recent Client Activity")}
              </CardTitle>
              <CardDescription>
                {t(
                  "activity.description",
                  "Latest bookings and client interactions"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {t("activity.noActivity", "No recent activity")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(
                      "activity.noActivityDescription",
                      "Bookings will appear here once clients make appointments"
                    )}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("activity.tableClient", "Client")}
                      </TableHead>
                      <TableHead>
                        {t("activity.tableService", "Service")}
                      </TableHead>
                      <TableHead>
                        {t("activity.tableProfessional", "Professional")}
                      </TableHead>
                      <TableHead>
                        {t("activity.tableDateTime", "Date & Time")}
                      </TableHead>
                      <TableHead>
                        {t("activity.tableAmount", "Amount")}
                      </TableHead>
                      <TableHead>
                        {t("activity.tableStatus", "Status")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">
                            {booking.clientName}
                          </div>
                        </TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{booking.professional}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {booking.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(Number(booking.amount))}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              booking.status === "completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : booking.status === "confirmed"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("analytics.topClients", "Top Clients")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "analytics.topClientsDescription",
                    "Clients with highest spending"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clientsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t("analytics.noClients", "No clients yet")}
                    </p>
                  </div>
                ) : (
                  [...clients]
                    .map(ensureClientName)
                    .sort(
                      (a, b) =>
                        (b.stats?.totalSpent || 0) - (a.stats?.totalSpent || 0)
                    )
                    .slice(0, 5)
                    .map((client, index) => {
                      const initials = `${client.firstName?.[0] || ""}${
                        client.lastName?.[0] || ""
                      }`.toUpperCase();
                      const totalSpent = client.stats?.totalSpent || 0;
                      const totalBookings = client.stats?.totalBookings || 0;

                      return (
                        <div
                          key={client.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-medium">
                              #{index + 1}
                            </span>
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {client.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {totalBookings}{" "}
                              {t("analytics.bookings", "bookings")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(totalSpent)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {totalBookings}{" "}
                              {t("analytics.bookings", "bookings")}
                            </p>
                          </div>
                        </div>
                      );
                    })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t("analytics.statistics", "Client Statistics")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "analytics.statisticsDescription",
                    "Key metrics about your client base"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {clientsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm font-medium">
                          Active Clients
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {
                          clients.filter((c: any) => c.status === "active")
                            .length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(
                          (clients.filter((c: any) => c.status === "active")
                            .length /
                            (clients.length || 1)) *
                          100
                        ).toFixed(0)}
                        % of total
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm font-medium">
                          Avg. Lifetime Value
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        €
                        {(
                          clients.reduce(
                            (sum: number, c: any) =>
                              sum + (c.stats?.totalSpent || 0),
                            0
                          ) / (clients.length || 1)
                        ).toFixed(0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Per client
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-red-500" />
                        <span className="text-sm font-medium">
                          Total Revenue
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        €
                        {clients
                          .reduce(
                            (sum: number, c: any) =>
                              sum + (c.stats?.totalSpent || 0),
                            0
                          )
                          .toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="text-sm font-medium">
                          Total Bookings
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {clients.reduce(
                          (sum: number, c: any) =>
                            sum + (c.stats?.totalBookings || 0),
                          0
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(
                          clients.reduce(
                            (sum: number, c: any) =>
                              sum + (c.stats?.totalBookings || 0),
                            0
                          ) / (clients.length || 1)
                        ).toFixed(1)}{" "}
                        avg per client
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Client Details Dialog */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback>{selectedClient?.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedClient?.name}</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Client Profile & Booking History
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              View complete client information, booking history, and business
              insights
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <>
              {/* Executive Summary Card */}
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Client Summary
                  </CardTitle>
                  <CardDescription>
                    Key metrics and insights for business decisions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Member Since */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          Member Since
                        </span>
                      </div>
                      <p className="text-lg font-bold">
                        {selectedClient.createdAt
                          ? new Date(
                              selectedClient.createdAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedClient.createdAt
                          ? Math.floor(
                              (Date.now() -
                                new Date(selectedClient.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24 * 30)
                            )
                          : 0}{" "}
                        months ago
                      </p>
                    </div>

                    {/* Total Appointments */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          Total Bookings
                        </span>
                      </div>
                      <p className="text-lg font-bold">
                        {selectedClient.stats?.totalBookings ||
                          selectedClient.totalBookings ||
                          getClientBookings(selectedClient.id).length ||
                          0}
                      </p>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </div>

                    {/* Last Visit */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Last Visit</span>
                      </div>
                      <p className="text-lg font-bold">
                        {(() => {
                          const bookings = getClientBookings(selectedClient.id);
                          const lastBooking =
                            bookings.length > 0
                              ? bookings.sort(
                                  (a, b) =>
                                    new Date(b.date).getTime() -
                                    new Date(a.date).getTime()
                                )[0]
                              : null;
                          return lastBooking
                            ? new Date(lastBooking.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "Never";
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const bookings = getClientBookings(selectedClient.id);
                          const lastBooking =
                            bookings.length > 0
                              ? bookings.sort(
                                  (a, b) =>
                                    new Date(b.date).getTime() -
                                    new Date(a.date).getTime()
                                )[0]
                              : null;
                          if (!lastBooking) return "No visits";
                          const daysAgo = Math.floor(
                            (Date.now() -
                              new Date(lastBooking.date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          );
                          return daysAgo === 0
                            ? "Today"
                            : `${daysAgo} days ago`;
                        })()}
                      </p>
                    </div>

                    {/* Total Revenue */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Euro className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Total Spent</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        €
                        {(
                          selectedClient.stats?.totalSpent ||
                          selectedClient.totalSpent ||
                          0
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lifetime value
                      </p>
                    </div>

                    {/* Average Booking Value */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">
                          Avg. Booking
                        </span>
                      </div>
                      <p className="text-lg font-bold">
                        €
                        {(() => {
                          const totalSpent =
                            selectedClient.stats?.totalSpent ||
                            selectedClient.totalSpent ||
                            0;
                          const totalBookings =
                            selectedClient.stats?.totalBookings ||
                            selectedClient.totalBookings ||
                            getClientBookings(selectedClient.id).length ||
                            1;
                          return (totalSpent / totalBookings).toFixed(2);
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Per appointment
                      </p>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Status</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(
                          selectedClient.status
                        )} mt-1`}
                      >
                        {selectedClient.status || "active"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Current state
                      </p>
                    </div>

                    {/* Visit Frequency */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Frequency</span>
                      </div>
                      <p className="text-lg font-bold">
                        {(() => {
                          const bookings = getClientBookings(selectedClient.id);
                          if (bookings.length < 2) return "New";

                          const memberSince = selectedClient.createdAt
                            ? new Date(selectedClient.createdAt)
                            : new Date();
                          const monthsSince = Math.max(
                            1,
                            Math.floor(
                              (Date.now() - memberSince.getTime()) /
                                (1000 * 60 * 60 * 24 * 30)
                            )
                          );
                          const visitsPerMonth = (
                            bookings.length / monthsSince
                          ).toFixed(1);

                          return `${visitsPerMonth}x/mo`;
                        })()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Visit rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="profile" className="space-y-4">
                <div className="border-b overflow-x-auto">
                  <TabsList className="w-full justify-start flex-nowrap h-auto p-0 bg-transparent inline-flex min-w-full">
                    <TabsTrigger value="profile" className="whitespace-nowrap">
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className="whitespace-nowrap">
                      Booking History
                    </TabsTrigger>
                    <TabsTrigger
                      value="preferences"
                      className="whitespace-nowrap"
                    >
                      Preferences
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedClient.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedClient.phone}</span>
                        </div>
                        {(selectedClient.dateOfBirth ||
                          selectedClient.birthDate) && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Born:{" "}
                              {new Date(
                                selectedClient.dateOfBirth ||
                                  selectedClient.birthDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="pt-2">
                          <Label className="text-sm font-medium">Address</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedClient.address}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Client Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Total Bookings</Label>
                            <p className="text-2xl font-bold">
                              {selectedClient.totalBookings}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm">Total Spent</Label>
                            <p className="text-2xl font-bold">
                              {formatCurrency(selectedClient.totalSpent)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm">Average Spent</Label>
                            <p className="text-xl font-semibold">
                              {formatCurrency(selectedClient.averageSpent)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedClient.notes}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Booking History Tab */}
                <TabsContent value="bookings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking History</CardTitle>
                      <CardDescription>
                        Complete history of {selectedClient.name}'s appointments
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Professional</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getClientBookings(selectedClient.id).length > 0 ? (
                            getClientBookings(selectedClient.id).map(
                              (booking) => (
                                <TableRow key={booking.id}>
                                  <TableCell className="font-medium">
                                    {booking.service}
                                  </TableCell>
                                  <TableCell>{booking.professional}</TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                        {new Date(
                                          booking.date
                                        ).toLocaleDateString()}
                                      </div>
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {booking.time}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-medium">
                                      {formatCurrency(booking.amount)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        booking.status === "completed"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : "bg-blue-100 text-blue-800 border-blue-200"
                                      }
                                    >
                                      {booking.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No bookings found for this client
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Preferences</CardTitle>
                      <CardDescription>
                        {selectedClient.name}'s preferred services and
                        professionals
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Preferred Services
                        </Label>
                        <div className="flex gap-2 mt-2">
                          {selectedClient.preferredServices &&
                          selectedClient.preferredServices.length > 0 ? (
                            selectedClient.preferredServices.map(
                              (
                                service:
                                  | string
                                  | number
                                  | boolean
                                  | ReactElement<
                                      any,
                                      string | JSXElementConstructor<any>
                                    >
                                  | Iterable<ReactNode>
                                  | ReactPortal
                                  | Iterable<ReactNode>
                                  | null
                                  | undefined,
                                index: Key | null | undefined
                              ) => (
                                <Badge key={index} variant="outline">
                                  {service}
                                </Badge>
                              )
                            )
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No preferred services
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium">
                            Client Since
                          </Label>
                          <p className="text-sm mt-1">
                            {new Date(
                              selectedClient.joinDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Last Visit
                          </Label>
                          <p className="text-sm mt-1">
                            {new Date(
                              selectedClient.lastVisit
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Referrals Made
                          </Label>
                          <p className="text-sm mt-1">
                            {selectedClient.referrals} clients
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <Badge
                            variant="outline"
                            className={`mt-1 ${getStatusColor(
                              selectedClient.status
                            )}`}
                          >
                            {selectedClient.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information</DialogDescription>
          </DialogHeader>
          {editingClientData && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={editingClientData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingClientData({
                        ...editingClientData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingClientData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingClientData({
                        ...editingClientData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editingClientData.phone || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingClientData({
                        ...editingClientData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birth Date (Optional)</Label>
                  <Input
                    type="date"
                    value={editingClientData.birthDate || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingClientData({
                        ...editingClientData,
                        birthDate: e.target.value,
                      })
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={editingClientData.notes || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditingClientData({
                      ...editingClientData,
                      notes: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditClientSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {clientToDelete?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white"
              onClick={handleDeleteClient}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
