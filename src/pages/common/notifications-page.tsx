import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/use-notifications";
import { InAppNotification } from "../../services/in-app-notifications.service";
import {
    Calendar,
    DollarSign,
    AlertTriangle,
    MessageSquare,
    Info,
    Check,
    Trash2,
    CheckCircle2,
    Clock,
    Filter
} from "lucide-react";
import { cn } from "../../lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
} from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export function NotificationsPage() {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications
    } = useNotifications();

    // Use a ref to prevent double fetching due to Strict Mode or fast re-renders,
    // although useNotifications likely handles this, being explicit helps.
    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchNotifications();
            initialFetchDone.current = true;
        }
    }, [fetchNotifications]);

    const handleNotificationClick = (notification: InAppNotification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        if (notification.action) {
            if (notification.action.type === 'navigate') {
                navigate(notification.action.payload);
            } else if (notification.action.type === 'external') {
                window.location.href = notification.action.payload;
            }
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "booking":
                return <Calendar className="h-5 w-5" />;
            case "financial":
                return <DollarSign className="h-5 w-5" />;
            case "alert":
                return <AlertTriangle className="h-5 w-5" />;
            case "support":
                return <MessageSquare className="h-5 w-5" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-900';
            case 'medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800/60 border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Central de Notificações
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie suas atualizações, alertas e lembretes.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2"
                            onClick={() => markAllAsRead()}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Tabs defaultValue="all" className="w-[400px]">
                                <TabsList>
                                    <TabsTrigger value="all">Todas</TabsTrigger>
                                    <TabsTrigger value="unread">Não lidas ({unreadCount})</TabsTrigger>
                                    <TabsTrigger value="high">Alta Prioridade</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Agendamentos</DropdownMenuItem>
                                    <DropdownMenuItem>Financeiro</DropdownMenuItem>
                                    <DropdownMenuItem>Sistema</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-pulse">
                            <div className="h-10 w-10 bg-muted rounded-full mb-4" />
                            <div className="h-4 w-32 bg-muted rounded mb-2" />
                            <div className="h-3 w-48 bg-muted rounded" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground/80">
                            <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                                <Check className="h-10 w-10 opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">Tudo limpo por aqui!</h3>
                            <p className="max-w-xs mx-auto mt-2 text-sm">
                                Você não tem novas notificações no momento.
                            </p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px] min-h-[400px]">
                            <div className="divide-y divide-border/50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={cn(
                                            "flex gap-4 p-5 transition-all duration-200 hover:bg-muted/30 group",
                                            !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : ""
                                        )}
                                    >
                                        {/* Icon */}
                                        <div className={cn(
                                            "flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm",
                                            getPriorityColor(notification.priority)
                                        )}>
                                            {getCategoryIcon(notification.category)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 py-0.5">
                                            <div className="flex items-start justify-between gap-4 mb-1">
                                                <div>
                                                    <h4 className={cn(
                                                        "text-base font-medium leading-none mb-1.5",
                                                        !notification.isRead ? "text-foreground font-semibold" : "text-foreground/90"
                                                    )}>
                                                        {notification.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {format(new Date(notification.createdAt), "PPP 'às' HH:mm", { locale: ptBR })}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ptBR })}</span>
                                                    </div>
                                                </div>
                                                {!notification.isRead && (
                                                    <Badge variant="default" className="bg-primary h-5 px-2 text-[10px] uppercase tracking-wider">
                                                        Nova
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-sm text-foreground/70 leading-relaxed mb-3 max-w-3xl">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center gap-3 pt-1">
                                                {notification.action?.label && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-8 text-xs font-medium"
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        {notification.action.label}
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    Ver detalhes
                                                </Button>

                                                <div className="flex-1" />

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => deleteNotification(notification._id, e)}
                                                    title="Excluir notificação"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>

                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => markAsRead(notification._id)}
                                                        title="Marcar como lida"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
