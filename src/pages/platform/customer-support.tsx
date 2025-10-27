import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  MessageSquare,
  Search,
  Plus,
  Download,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Check,
  X,
  Clock,
  User,
  Building2,
  Globe,
  AlertCircle,
  MessageCircle,
  FileText,
  Star,
  TrendingUp,
} from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  entityId: string;
  entityName: string;
  customerName: string;
  customerEmail: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  category:
    | "technical"
    | "billing"
    | "feature_request"
    | "bug_report"
    | "account";
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  responseTime?: number; // in hours
  resolutionTime?: number; // in hours
  satisfaction?: number; // 1-5 rating
  language: "en" | "pt";
  region: "PT" | "BR" | "US";
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  language: "en" | "pt";
  views: number;
  rating: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export function CustomerSupportPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAssignee] = useState<string>("all");
  const [isCreateTicketDialogOpen, setIsCreateTicketDialogOpen] =
    useState(false);
  const [isCreateArticleDialogOpen, setIsCreateArticleDialogOpen] =
    useState(false);

  // Mock data for support tickets
  const supportTickets: SupportTicket[] = [
    {
      id: "TK-001",
      subject: "Payment processing issue",
      description:
        "Unable to process payments for the last 2 hours. All transactions are failing.",
      entityId: "ent_001",
      entityName: "Beautiful Salon",
      customerName: "Maria Silva",
      customerEmail: "maria@beautifulsalon.pt",
      priority: "urgent",
      status: "in_progress",
      category: "technical",
      assignedTo: "usr_005",
      assignedToName: "Pedro Oliveira",
      createdAt: "2024-01-20T10:00:00Z",
      updatedAt: "2024-01-20T10:30:00Z",
      responseTime: 0.5,
      language: "pt",
      region: "PT",
    },
    {
      id: "TK-002",
      subject: "Feature request: Custom booking fields",
      description:
        "Would like to add custom fields to the booking form for collecting additional client information.",
      entityId: "ent_002",
      entityName: "Hair Studio Pro",
      customerName: "João Santos",
      customerEmail: "joao@hairstudiopro.pt",
      priority: "medium",
      status: "open",
      category: "feature_request",
      createdAt: "2024-01-20T09:30:00Z",
      updatedAt: "2024-01-20T09:30:00Z",
      language: "pt",
      region: "PT",
    },
    {
      id: "TK-003",
      subject: "Account activation help",
      description:
        "Need help with activating my account and setting up my first service.",
      entityId: "ent_003",
      entityName: "Wellness Center",
      customerName: "Ana Costa",
      customerEmail: "ana@wellnesscenter.pt",
      priority: "low",
      status: "resolved",
      category: "account",
      assignedTo: "usr_006",
      assignedToName: "Lisa Williams",
      createdAt: "2024-01-20T08:15:00Z",
      updatedAt: "2024-01-20T09:45:00Z",
      responseTime: 1.5,
      resolutionTime: 1.5,
      satisfaction: 5,
      language: "pt",
      region: "PT",
    },
    {
      id: "TK-004",
      subject: "Billing discrepancy",
      description:
        "Charged twice for the same subscription period. Need refund for duplicate charge.",
      entityId: "ent_004",
      entityName: "Spa Paradise",
      customerName: "Carlos Oliveira",
      customerEmail: "carlos@spaparadise.com.br",
      priority: "high",
      status: "waiting_customer",
      category: "billing",
      assignedTo: "usr_005",
      assignedToName: "Pedro Oliveira",
      createdAt: "2024-01-19T16:20:00Z",
      updatedAt: "2024-01-20T08:30:00Z",
      responseTime: 2,
      language: "pt",
      region: "BR",
    },
    {
      id: "TK-005",
      subject: "Calendar sync not working",
      description:
        "Google Calendar integration stopped working after last update.",
      entityId: "ent_005",
      entityName: "Elite Fitness",
      customerName: "Michael Johnson",
      customerEmail: "michael@elitefitness.com",
      priority: "medium",
      status: "open",
      category: "bug_report",
      createdAt: "2024-01-19T14:45:00Z",
      updatedAt: "2024-01-19T14:45:00Z",
      language: "en",
      region: "US",
    },
  ];

  // Mock data for knowledge base articles
  const knowledgeBaseArticles: KnowledgeBaseArticle[] = [
    {
      id: "kb_001",
      title: "How to set up your first service",
      content: "Step-by-step guide to creating your first service offering...",
      category: "Getting Started",
      language: "en",
      views: 1247,
      rating: 4.8,
      published: true,
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-18T00:00:00Z",
    },
    {
      id: "kb_002",
      title: "Como configurar seu primeiro serviço",
      content:
        "Guia passo a passo para criar sua primeira oferta de serviço...",
      category: "Primeiros Passos",
      language: "pt",
      views: 892,
      rating: 4.6,
      published: true,
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-18T00:00:00Z",
    },
    {
      id: "kb_003",
      title: "Troubleshooting payment issues",
      content: "Common payment problems and their solutions...",
      category: "Billing",
      language: "en",
      views: 634,
      rating: 4.2,
      published: true,
      createdAt: "2024-01-12T00:00:00Z",
      updatedAt: "2024-01-16T00:00:00Z",
    },
  ];

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority =
      selectedPriority === "all" || ticket.priority === selectedPriority;
    const matchesStatus =
      selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesCategory =
      selectedCategory === "all" || ticket.category === selectedCategory;
    const matchesAssignee =
      selectedAssignee === "all" || ticket.assignedTo === selectedAssignee;

    return (
      matchesSearch &&
      matchesPriority &&
      matchesStatus &&
      matchesCategory &&
      matchesAssignee
    );
  });

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "waiting_customer":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <AlertCircle className="h-4 w-4" />;
      case "billing":
        return <MessageSquare className="h-4 w-4" />;
      case "feature_request":
        return <Star className="h-4 w-4" />;
      case "bug_report":
        return <X className="h-4 w-4" />;
      case "account":
        return <User className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case "PT":
        return "🇵🇹";
      case "BR":
        return "🇧🇷";
      case "US":
        return "🇺🇸";
      default:
        return "🌍";
    }
  };

  // Support metrics
  const totalTickets = supportTickets.length;
  const openTickets = supportTickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length;
  const averageResponseTime =
    supportTickets
      .filter((t) => t.responseTime)
      .reduce((acc, t) => acc + (t.responseTime || 0), 0) /
    supportTickets.filter((t) => t.responseTime).length;
  const customerSatisfaction =
    supportTickets
      .filter((t) => t.satisfaction)
      .reduce((acc, t) => acc + (t.satisfaction || 0), 0) /
    supportTickets.filter((t) => t.satisfaction).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("platform.support.title", "Customer Support")}
          </h1>
          <p className="text-muted-foreground">
            {t(
              "platform.support.subtitle",
              "Manage support tickets and knowledge base"
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("common.export", "Export")}
          </Button>
          <Dialog
            open={isCreateArticleDialogOpen}
            onOpenChange={setIsCreateArticleDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t("platform.support.createArticle", "Create Article")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {t(
                    "platform.support.articleDialog.title",
                    "Create Knowledge Base Article"
                  )}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    "platform.support.articleDialog.description",
                    "Create a new help article"
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="article-title" className="text-right">
                    {t("platform.support.article.title", "Title")}
                  </Label>
                  <Input id="article-title" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="article-category" className="text-right">
                    {t("platform.support.article.category", "Category")}
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="getting_started">
                        Getting Started
                      </SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="article-language" className="text-right">
                    {t("platform.support.article.language", "Language")}
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="pt">🇵🇹 Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="article-content" className="text-right">
                    {t("platform.support.article.content", "Content")}
                  </Label>
                  <Textarea
                    id="article-content"
                    rows={8}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("common.create", "Create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isCreateTicketDialogOpen}
            onOpenChange={setIsCreateTicketDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("platform.support.createTicket", "Create Ticket")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {t(
                    "platform.support.ticketDialog.title",
                    "Create Support Ticket"
                  )}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    "platform.support.ticketDialog.description",
                    "Create a new support ticket"
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticket-subject" className="text-right">
                    {t("platform.support.ticket.subject", "Subject")}
                  </Label>
                  <Input id="ticket-subject" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticket-entity" className="text-right">
                    {t("platform.support.ticket.entity", "Entity")}
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ent_001">Beautiful Salon</SelectItem>
                      <SelectItem value="ent_002">Hair Studio Pro</SelectItem>
                      <SelectItem value="ent_003">Wellness Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticket-priority" className="text-right">
                    {t("platform.support.ticket.priority", "Priority")}
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="ticket-description" className="text-right">
                    {t("platform.support.ticket.description", "Description")}
                  </Label>
                  <Textarea
                    id="ticket-description"
                    rows={4}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{t("common.create", "Create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Support Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.support.stats.totalTickets", "Total Tickets")}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-600">+5.2%</span>
              <span>from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.support.stats.openTickets", "Open Tickets")}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <div className="text-xs text-muted-foreground">
              {((openTickets / totalTickets) * 100).toFixed(1)}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("platform.support.stats.avgResponse", "Avg Response Time")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageResponseTime.toFixed(1)}h
            </div>
            <div className="text-xs text-muted-foreground">
              Within SLA target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t(
                "platform.support.stats.satisfaction",
                "Customer Satisfaction"
              )}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerSatisfaction.toFixed(1)}/5
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={`customer-satisfaction-star-${i}`}
                  className={`h-3 w-3 ${i < Math.floor(customerSatisfaction) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">
            {t("platform.support.tabs.tickets", "Support Tickets")}
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            {t("platform.support.tabs.knowledge", "Knowledge Base")}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            {t("platform.support.tabs.analytics", "Analytics")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t(
                        "platform.support.search",
                        "Search tickets..."
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_customer">
                      Waiting Customer
                    </SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature_request">
                      Feature Request
                    </SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                {t("platform.support.ticketsList", "Support Tickets")} (
                {filteredTickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("platform.support.ticket.id", "ID")}
                    </TableHead>
                    <TableHead>
                      {t("platform.support.ticket.subject", "Subject")}
                    </TableHead>
                    <TableHead>
                      {t("platform.support.ticket.customer", "Customer")}
                    </TableHead>
                    <TableHead>
                      {t("platform.support.ticket.priority", "Priority")}
                    </TableHead>
                    <TableHead>
                      {t("platform.support.ticket.status", "Status")}
                    </TableHead>
                    <TableHead>
                      {t("platform.support.ticket.category", "Category")}
                    </TableHead>
                    <TableHead>
                      {t("platform.support.ticket.assignee", "Assignee")}
                    </TableHead>
                    <TableHead>
                      {t("platform.support.ticket.created", "Created")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("common.actions", "Actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.id}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {ticket.subject}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-2">
                            <Building2 className="h-3 w-3" />
                            <span>{ticket.entityName}</span>
                            <span>{getRegionFlag(ticket.region)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {ticket.customerName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ticket.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPriorityBadgeColor(ticket.priority)}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeColor(ticket.status)}
                        >
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(ticket.category)}
                          <span className="text-sm">
                            {ticket.category.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.assignedToName ? (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {ticket.assignedToName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {ticket.assignedToName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {t("common.actions", "Actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              {t("common.view", "View")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("common.edit", "Edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              {t("platform.support.actions.assign", "Assign")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Check className="mr-2 h-4 w-4" />
                              {t("platform.support.actions.resolve", "Resolve")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          {/* Knowledge Base Articles */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeBaseArticles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription>{article.category}</CardDescription>
                    </div>
                    <Badge
                      variant={article.published ? "default" : "secondary"}
                    >
                      {article.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>
                          {article.language === "en"
                            ? "🇺🇸 English"
                            : "🇵🇹 Português"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={`article-rating-star-${article.id}-${i}`}
                            className={`h-4 w-4 ${i < Math.floor(article.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {article.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        {t("common.view", "View")}
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        {t("common.edit", "Edit")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.support.analytics.ticketsByCategory",
                    "Tickets by Category"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.support.analytics.categoryDesc",
                    "Distribution of support tickets by category"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "technical",
                    "billing",
                    "feature_request",
                    "bug_report",
                    "account",
                  ].map((category) => {
                    const count = supportTickets.filter(
                      (t) => t.category === category
                    ).length;
                    const percentage = (count / totalTickets) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(category)}
                            <span className="capitalize">
                              {category.replace("_", " ")}
                            </span>
                          </div>
                          <span>
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t(
                    "platform.support.analytics.responseTime",
                    "Response Time Analysis"
                  )}
                </CardTitle>
                <CardDescription>
                  {t(
                    "platform.support.analytics.responseDesc",
                    "Support response time metrics"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {averageResponseTime.toFixed(1)}h
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Response
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">97%</div>
                      <div className="text-sm text-muted-foreground">
                        Within SLA
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>&lt; 1 hour</span>
                      <span>65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: "65%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>1-4 hours</span>
                      <span>25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>&gt; 4 hours</span>
                      <span>10%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: "10%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
