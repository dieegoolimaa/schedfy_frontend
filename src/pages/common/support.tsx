import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
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
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Separator } from "../../components/ui/separator";
import {
    MessageSquare,
    Search,
    Plus,
    MoreHorizontal,
    Eye,
    AlertCircle,
    MessageCircle,
    Star,
    X,
    User,
    Globe,
    BookOpen,
    Paperclip,
    FileText,
    Image as ImageIcon,
    File,
    ChevronRight,
    HelpCircle,
    CreditCard,
    CalendarDays,
    Settings,
    ShieldCheck,
    CheckCircle2,
    Info,
    Users,
    Layers,
    Briefcase,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { supportService, SupportTicket, KnowledgeBaseArticle } from "../../services/support.service";
import { formatDateTime } from "../../lib/region-config";
import { EntityPlan, PLAN_LIMITS } from "../../types/enums/entity-plan.enum";

export function SupportPage() {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("manual");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPriority, setSelectedPriority] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [isCreateTicketDialogOpen, setIsCreateTicketDialogOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: "",
        category: "",
        priority: "",
        description: ""
    });
    const [ticketAttachments, setTicketAttachments] = useState<File[]>([]);
    const [messageAttachments, setMessageAttachments] = useState<File[]>([]);

    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [knowledgeBaseArticles, setKnowledgeBaseArticles] = useState<KnowledgeBaseArticle[]>([]);
    const [_loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
    const [isViewArticleOpen, setIsViewArticleOpen] = useState(false);
    const [activeManualTheme, setActiveManualTheme] = useState<string>("");

    useEffect(() => {
        if (knowledgeBaseArticles.length > 0 && !activeManualTheme) {
            const manualCategories = Array.from(new Set(knowledgeBaseArticles
                .filter(a => a.category.startsWith("Manual:"))
                .map(a => a.category)
            )).sort();

            if (manualCategories.length > 0) {
                // Try to find Plans/Planos first, otherwise take the first one
                const defaultTheme = manualCategories.find(c => c.includes("Planos") || c.includes("Plans")) || manualCategories[0];
                setActiveManualTheme(defaultTheme);
            }
        }
    }, [knowledgeBaseArticles, activeManualTheme]);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (searchParams.get("action") === "create-ticket") {
            setNewTicket(prev => ({
                ...prev,
                subject: searchParams.get("subject") || prev.subject,
                category: searchParams.get("category") || prev.category || "billing",
                priority: "high",
                description: searchParams.get("description") || prev.description
            }));
            setIsCreateTicketDialogOpen(true);
        }
    }, [searchParams]);

    const handleViewArticle = (article: KnowledgeBaseArticle) => {
        setSelectedArticle(article);
        setIsViewArticleOpen(true);
    };

    // Ticket View Logic
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isViewTicketDialogOpen, setIsViewTicketDialogOpen] = useState(false);
    const [newMessage, setNewMessage] = useState("");

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsViewTicketDialogOpen(true);
    };

    const handleSendMessage = async () => {
        if (!selectedTicket || !newMessage.trim()) return;

        try {
            const id = selectedTicket._id || selectedTicket.id;
            if (!id) return;

            // If user replies, maybe reopen ticket if it was resolved
            // Backend handles dynamic status updates (e.g. reopen if resolved)
            const updatedTicket = await supportService.addMessage(id, newMessage); // Pass undefined implies dynamic logic

            setSelectedTicket(updatedTicket);
            setNewMessage("");
            toast({
                title: t("platform.support.messageSent", "Message Sent"),
            });
            loadData();
        } catch (error) {
            console.error("Failed to send message", error);
            toast({
                variant: 'destructive',
                title: t("common.error", "Error"),
                description: t("messages.opFailed", "Failed to send message")
            });
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [tickets, articles] = await Promise.all([
                supportService.getTickets(),
                supportService.getArticles()
            ]);
            setSupportTickets(tickets);
            setKnowledgeBaseArticles(articles);
        } catch (error) {
            console.error("Failed to load support data", error);
            toast({
                variant: 'destructive',
                title: t("common.error", "Error"),
                description: t("messages.loadFailed", "Failed to load data")
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.subject || !newTicket.category || !newTicket.priority || !newTicket.description) {
            toast({
                variant: 'destructive',
                title: t("common.error", "Error"),
                description: t("messages.fillAllFields", "Please fill all required fields")
            });
            return;
        }

        try {
            // Upload attachments if any
            let attachmentUrls: string[] = [];
            if (ticketAttachments.length > 0) {
                attachmentUrls = await Promise.all(
                    ticketAttachments.map(file => supportService.uploadAttachment(file))
                );
            }
            
            await supportService.createTicket({
                ...newTicket,
                description: attachmentUrls.length > 0 
                    ? `${newTicket.description}\n\nAttachments:\n${attachmentUrls.join('\n')}`
                    : newTicket.description
            });
            
            toast({
                title: t("platform.support.ticketCreated", "Ticket Created"),
                description: t("platform.support.ticketCreatedDesc", "Your support ticket has been created successfully."),
            });
            setIsCreateTicketDialogOpen(false);
            setNewTicket({ subject: "", category: "", priority: "", description: "" });
            setTicketAttachments([]);
            loadData(); // Reload tickets
        } catch (error) {
            console.error("Failed to create ticket", error);
            toast({
                variant: 'destructive',
                title: t("common.error", "Error"),
                description: t("messages.createFailed", "Failed to create ticket")
            });
        }
    };

    // File attachment helpers
    const handleTicketFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setTicketAttachments(prev => [...prev, ...files]);
        }
    };

    const handleMessageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setMessageAttachments(prev => [...prev, ...files]);
        }
    };

    const removeTicketAttachment = (index: number) => {
        setTicketAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const removeMessageAttachment = (index: number) => {
        setMessageAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
            return <ImageIcon className="h-4 w-4" />;
        }
        if (['pdf', 'doc', 'docx'].includes(ext || '')) {
            return <FileText className="h-4 w-4" />;
        }
        return <File className="h-4 w-4" />;
    };


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

    const filteredTickets = supportTickets.filter((ticket) => {
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ticket.id || ticket._id).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority =
            selectedPriority === "all" || ticket.priority === selectedPriority;
        const matchesStatus =
            selectedStatus === "all" || ticket.status === selectedStatus;

        return (
            matchesSearch &&
            matchesPriority &&
            matchesStatus
        );
    });

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
                                    <Input
                                        id="ticket-subject"
                                        className="col-span-3"
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        placeholder="Brief summary of the issue"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="ticket-priority" className="text-right">
                                        {t("platform.support.ticket.priority", "Priority")}
                                    </Label>
                                    <Select value={newTicket.priority} onValueChange={(val) => setNewTicket({ ...newTicket, priority: val })}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder={t("platform.support.placeholders.selectPriority", "Select priority")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">{t("platform.support.priorities.low", "Low")}</SelectItem>
                                            <SelectItem value="medium">{t("platform.support.priorities.medium", "Medium")}</SelectItem>
                                            <SelectItem value="high">{t("platform.support.priorities.high", "High")}</SelectItem>
                                            <SelectItem value="urgent">{t("platform.support.priorities.urgent", "Urgent")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="ticket-category" className="text-right">
                                        {t("platform.support.ticket.category", "Category")}
                                    </Label>
                                    <Select value={newTicket.category} onValueChange={(val) => setNewTicket({ ...newTicket, category: val })}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder={t("platform.support.placeholders.selectCategory", "Select category")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technical">{t("platform.support.categories.technical", "Technical")}</SelectItem>
                                            <SelectItem value="billing">{t("platform.support.categories.billing", "Billing")}</SelectItem>
                                            <SelectItem value="feature_request">{t("platform.support.categories.feature_request", "Feature Request")}</SelectItem>
                                            <SelectItem value="bug_report">{t("platform.support.categories.bug_report", "Bug Report")}</SelectItem>
                                            <SelectItem value="account">{t("platform.support.categories.account", "Account")}</SelectItem>
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
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                        placeholder="Please describe the issue in detail"
                                    />
                                </div>
                                {/* Attachments Section */}
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label className="text-right">
                                        {t("platform.support.ticket.attachments", "Attachments")}
                                    </Label>
                                    <div className="col-span-3 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                id="ticket-attachments"
                                                multiple
                                                className="hidden"
                                                onChange={handleTicketFileSelect}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('ticket-attachments')?.click()}
                                            >
                                                <Paperclip className="h-4 w-4 mr-2" />
                                                {t("platform.support.attachFile", "Attach Files")}
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                                {t("platform.support.attachHint", "Max 10MB per file")}
                                            </span>
                                        </div>
                                        {ticketAttachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {ticketAttachments.map((file, index) => (
                                                    <div
                                                        key={`${file.name}-${index}`}
                                                        className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 text-sm"
                                                    >
                                                        {getFileIcon(file.name)}
                                                        <span className="max-w-[120px] truncate">{file.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({formatFileSize(file.size)})
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTicketAttachment(index)}
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" onClick={handleCreateTicket}>{t("common.create", "Create")}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="manual">
                        {t("platform.support.tabs.manual", "User Manual")}
                    </TabsTrigger>
                    <TabsTrigger value="tickets">
                        {t("platform.support.tabs.tickets", "My Tickets")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Manual Sidebar/Navigation */}
                        <div className="md:col-span-1 space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase px-3 py-2">
                                {t("platform.support.manual.themes", "Themes")}
                            </h3>
                            {Array.from(new Set(knowledgeBaseArticles
                                .filter(a => a.category.startsWith("Manual:") && a.language === (i18n.language?.split('-')[0] || 'en'))
                                .map(a => a.category)
                            )).sort().map(category => (
                                <Button
                                    key={category}
                                    variant={activeManualTheme === category ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2"
                                    onClick={() => setActiveManualTheme(category)}
                                >
                                    {category.includes("Planos") || category.includes("Plans") ? <ShieldCheck className="h-4 w-4" /> :
                                        category.includes("Agendamentos") || category.includes("Bookings") ? <CalendarDays className="h-4 w-4" /> :
                                            category.includes("Pagamentos") || category.includes("Payments") ? <CreditCard className="h-4 w-4" /> :
                                                category.includes("Comissões") || category.includes("Commissions") ? <MoreHorizontal className="h-4 w-4" /> :
                                                    category.includes("Marketing") ? <Star className="h-4 w-4" /> :
                                                        category.includes("Pacotes") || category.includes("Packages") ? <BookOpen className="h-4 w-4" /> :
                                                            category.includes("Notificações") || category.includes("Notifications") ? <MessageCircle className="h-4 w-4" /> :
                                                                category.includes("Clientes") || category.includes("Clients") ? <Users className="h-4 w-4" /> :
                                                                    category.includes("Serviços") || category.includes("Services") ? <Layers className="h-4 w-4" /> :
                                                                        category.includes("Equipa") || category.includes("Team") ? <Briefcase className="h-4 w-4" /> :
                                                                            category.includes("Relatórios") || category.includes("Reports") ? <FileText className="h-4 w-4" /> :
                                                                                category.includes("Mobile") ? <User className="h-4 w-4" /> :
                                                                                    category.includes("Segurança") || category.includes("Security") ? <ShieldCheck className="h-4 w-4" /> :
                                                                                        <Settings className="h-4 w-4" />}
                                    {category.replace("Manual: ", "")}
                                </Button>
                            ))}
                        </div>

                        {/* Manual Content Area */}
                        <div className="md:col-span-3 space-y-8 animate-in fade-in duration-500">
                            {knowledgeBaseArticles
                                .filter(a => a.category === activeManualTheme && a.language === (i18n.language?.split('-')[0] || 'en'))
                                .map(article => (
                                    <div key={article._id} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="inline-flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
                                                <Info className="h-4 w-4" />
                                                {article.category.replace("Manual: ", "")}
                                            </div>
                                            <h2 className="text-3xl font-bold">{article.title}</h2>
                                        </div>

                                        <Separator />

                                        <Separator />

                                        <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed bg-muted/30 p-6 rounded-xl border border-border/50">
                                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{article.content}</ReactMarkdown>
                                        </div>

                                        {/* Dynamic Modeling/Details for specific themes could go here */}
                                        {activeManualTheme.includes("Planos") || activeManualTheme.includes("Plans") ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(EntityPlan).map(([key, value]) => (
                                                    <Card key={key} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                                        <CardHeader className="pb-2">
                                                            <div className="flex items-center justify-between">
                                                                <Badge variant="outline" className="font-bold text-primary">{key}</Badge>
                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="text-sm space-y-2">
                                                            <div><strong>{PLAN_LIMITS[value as EntityPlan].maxProfessionals === Infinity ? "∞" : PLAN_LIMITS[value as EntityPlan].maxProfessionals}</strong> {t("platform.support.manual.professional", "Professionals")}</div>
                                                            <div><strong>{PLAN_LIMITS[value as EntityPlan].maxServices === Infinity ? "∞" : PLAN_LIMITS[value as EntityPlan].maxServices}</strong> {t("platform.support.manual.services", "Services")}</div>
                                                            <div><strong>{PLAN_LIMITS[value as EntityPlan].maxClients === Infinity ? "∞" : PLAN_LIMITS[value as EntityPlan].maxClients}</strong> {t("platform.support.manual.clients", "Clients")}</div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}

                            {knowledgeBaseArticles.filter(a => a.category === activeManualTheme).length === 0 && (
                                <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border/50">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-muted-foreground">
                                        {t("platform.support.manual.selectTheme", "Select a theme to view the manual")}
                                    </h3>
                                </div>
                            )}

                            {/* Help Section */}
                            <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl flex items-center gap-4">
                                <HelpCircle className="h-10 w-10 text-primary/60" />
                                <div>
                                    <h4 className="font-semibold">{t("platform.support.manual.stillConfused", "Still confused about something?")}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {t("platform.support.manual.helpLink", "Our support team is ready to help you directly via tickets.")}
                                    </p>
                                    <Button variant="link" className="p-0 h-auto mt-2 text-primary" onClick={() => setActiveTab("tickets")}>
                                        {t("platform.support.manual.goToTickets", "Go to my tickets")} <ChevronRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

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
                                        <SelectValue placeholder={t("platform.support.placeholders.priority", "Priority")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("platform.support.filters.allPriorities", "All Priorities")}</SelectItem>
                                        <SelectItem value="urgent">{t("platform.support.priorities.urgent", "Urgent")}</SelectItem>
                                        <SelectItem value="high">{t("platform.support.priorities.high", "High")}</SelectItem>
                                        <SelectItem value="medium">{t("platform.support.priorities.medium", "Medium")}</SelectItem>
                                        <SelectItem value="low">{t("platform.support.priorities.low", "Low")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={setSelectedStatus}
                                >
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder={t("platform.support.placeholders.status", "Status")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("platform.support.filters.allStatus", "All Status")}</SelectItem>
                                        <SelectItem value="open">{t("platform.support.status.open", "Open")}</SelectItem>
                                        <SelectItem value="in_progress">{t("platform.support.status.in_progress", "In Progress")}</SelectItem>
                                        <SelectItem value="waiting_customer">
                                            {t("platform.support.status.waiting_customer", "Waiting Customer")}
                                        </SelectItem>
                                        <SelectItem value="resolved">{t("platform.support.status.resolved", "Resolved")}</SelectItem>
                                        <SelectItem value="closed">{t("platform.support.status.closed", "Closed")}</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        {t("platform.support.ticket.id", "ID")}
                                                    </TableHead>
                                                    <TableHead>
                                                        {t("platform.support.ticket.subject", "Subject")}
                                                    </TableHead>
                                                    {/* Removed Customer Column */}
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
                                                        {t("platform.support.ticket.created", "Created")}
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        {t("common.actions", "Actions")}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredTickets.map((ticket) => (
                                                    <TableRow key={ticket.id || ticket._id}>
                                                        <TableCell className="font-medium">
                                                            {(ticket.id || ticket._id).substring(0, 8).toUpperCase()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="font-medium text-sm">
                                                                    {ticket.subject}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={getPriorityBadgeColor(
                                                                    ticket.priority
                                                                )}
                                                            >
                                                                {t(`platform.support.priorities.${ticket.priority}`, ticket.priority)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={getStatusBadgeColor(ticket.status)}
                                                            >
                                                                {t(`platform.support.status.${ticket.status}`, ticket.status.replace("_", " "))}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                {getCategoryIcon(ticket.category)}
                                                                <span className="text-sm">
                                                                    {t(`platform.support.categories.${ticket.category}`, ticket.category.replace("_", " "))}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {new Date(
                                                                    ticket.createdAt
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>
                                                                        {t("common.actions", "Actions")}
                                                                    </DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        {t("common.view", "View")}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {filteredTickets.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="h-24 text-center">
                                                            {t("common.noResults", "No results found.")}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* View Article Dialog */}
            <Dialog open={isViewArticleOpen} onOpenChange={setIsViewArticleOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{selectedArticle?.title}</DialogTitle>
                        <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2 mt-2">
                                <Badge>{selectedArticle?.category}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {selectedArticle?.language === "en" ? "English" : "Português"}
                                </span>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        <div className="prose dark:prose-invert max-w-none">
                            {selectedArticle?.content.split('\n').map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsViewArticleOpen(false)}>
                            {t("common.close", "Close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Ticket Dialog */}
            <Dialog open={isViewTicketDialogOpen} onOpenChange={setIsViewTicketDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="text-muted-foreground">#{(selectedTicket?._id || selectedTicket?.id || '').substring(0, 8).toUpperCase()}</span>
                            <span>{selectedTicket?.subject}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedTicket && (
                        <div className="flex-1 space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border">
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase">{t("platform.support.ticket.status", "Status")}</Label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={getStatusBadgeColor(selectedTicket.status)}>
                                            {t(`platform.support.status.${selectedTicket.status}`, selectedTicket.status.replace("_", " "))}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground uppercase">{t("platform.support.ticket.priority", "Priority")}</Label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={getPriorityBadgeColor(selectedTicket.priority)}>
                                            {t(`platform.support.priorities.${selectedTicket.priority}`, selectedTicket.priority)}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-base font-semibold">{t("platform.support.ticket.description", "Description")}</Label>
                                    <div className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">{selectedTicket.description}</div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    {t("platform.support.ticket.timeline", "Conversation")}
                                </h3>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto p-2 pr-4 custom-scrollbar">
                                    {selectedTicket.history?.map((item, idx) => (
                                        <div key={idx} className={`flex flex-col ${item.type === 'status_change' ? 'items-center my-4' : 'items-start'}`}>
                                            {item.type === 'status_change' ? (
                                                <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                                                    {item.content} - {formatDateTime(item.createdAt)}
                                                </span>
                                            ) : (
                                                <div className={`w-full flex flex-col ${item.senderId === selectedTicket.userId ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[85%] rounded-lg p-3 ${item.senderId === selectedTicket.userId ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                        <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                                        {item.senderName} • {formatDateTime(item.createdAt)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!selectedTicket.history || selectedTicket.history.length === 0) && (
                                        <div className="text-center text-sm text-muted-foreground py-8">
                                            {t("platform.support.noHistory", "No messages yet.")}
                                        </div>
                                    )}
                                </div>

                                {['resolved', 'closed'].includes(selectedTicket.status) ? (
                                    <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground mt-4">
                                        {t("platform.support.ticketResolved", "This ticket is resolved. No further replies can be sent.")}
                                    </div>
                                ) : (
                                    <>
                                        <div className="mt-4 space-y-3">
                                            <Textarea
                                                placeholder={t("platform.support.placeholders.reply", "Type your reply...")}
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                className="min-h-[80px]"
                                            />
                                            {/* Message Attachments */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <input
                                                    type="file"
                                                    id="message-attachments"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleMessageFileSelect}
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById('message-attachments')?.click()}
                                                >
                                                    <Paperclip className="h-4 w-4 mr-2" />
                                                    {t("platform.support.attachFile", "Attach")}
                                                </Button>
                                                {messageAttachments.map((file, index) => (
                                                    <div
                                                        key={`${file.name}-${index}`}
                                                        className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs"
                                                    >
                                                        {getFileIcon(file.name)}
                                                        <span className="max-w-[80px] truncate">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMessageAttachment(index)}
                                                            className="text-muted-foreground hover:text-destructive"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-2 flex justify-end gap-2">
                                            <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                                {t("common.send", "Send Reply")}
                                            </Button>
                                        </div>
                                    </>

                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewTicketDialogOpen(false)}>
                            {t("common.close", "Close")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
