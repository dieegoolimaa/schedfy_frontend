import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Calendar,
  DollarSign,
  AlertTriangle,
  Info,
  MessageSquare,
  Trash2
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { InAppNotification } from "@/services/in-app-notifications.service";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications();

  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Handle Action
    if (notification.action) {
      if (notification.action.type === 'navigate') {
        navigate(notification.action.payload);
        setOpen(false);
      } else if (notification.action.type === 'external') {
        window.location.href = notification.action.payload;
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "booking":
        return <Calendar className="h-4 w-4" />;
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4" />;
      case "support":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800/50';
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) fetchNotifications();
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative transition-all duration-200 hover:bg-muted/50">
          <Bell className="h-5 w-5 text-foreground/80" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] sm:w-[420px] p-0 rounded-xl shadow-xl border-border/50 backdrop-blur-sm bg-background/95">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 h-5 text-[10px] bg-primary/10 text-primary hover:bg-primary/20">
                {unreadCount} novas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs hover:text-primary transition-colors"
              onClick={() => markAllAsRead()}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Carregando...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 opacity-30" />
              </div>
              <p>Nenhuma notificação por aqui</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "flex gap-4 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-all duration-200 group border-b border-border/40 last:border-0",
                    !notification.isRead ? "bg-primary/5 dark:bg-primary/5" : "opacity-80 hover:opacity-100"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon Column */}
                  <div className={cn(
                    "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center mt-0.5",
                    getPriorityColor(notification.priority)
                  )}>
                    {getCategoryIcon(notification.category)}
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-sm font-medium leading-none truncate", !notification.isRead && "text-foreground font-semibold")}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Action & Metadata Row */}
                    <div className="flex items-center justify-between pt-1">
                      {notification.action?.label && (
                        <span className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
                          {notification.action.label}
                          {/* Could add arrow icon here */}
                        </span>
                      )}

                      {/* Hover Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => deleteNotification(notification._id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Unread Dot */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0 self-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border/50 bg-muted/20 text-center">
          <Button variant="link" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => {
            setOpen(false);
            navigate('/notifications'); // Assuming a dedicated page exists or will exist, otherwise remove
          }}>
            Ver todas as notificações
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
