import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { notificationService, Notification } from "@/services/notificationService";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { NotificationList } from "@/components/notifications/NotificationList";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ListSkeleton } from "@/components/feedback/Skeletons";
import { CitizenHeader } from "@/components/layout/CitizenHeader";

const CitizenNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        limit: 50,
        unreadOnly: false,
      });
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "resolution_approved":
      case "task_completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "status_change":
      case "task_started":
      case "work_resumed":
        return <Clock className="w-5 h-5 text-warning" />;
      case "task_assigned":
        return <AlertCircle className="w-5 h-5 text-info" />;
      case "task_acknowledged":
      case "verification_required":
        return <MessageSquare className="w-5 h-5 text-status-assigned" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(notif => notif.id !== id));
      toast({
        title: "Notification Deleted",
        description: "The notification has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
      toast({
        title: "All Marked as Read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    // Use related entities to navigate (ignore action_url as it may be incorrect)
    if (notification.related_report_id) {
      navigate(`/citizen/track/${notification.related_report_id}`);
    } else if (notification.action_url) {
      // Fallback to action_url if no related entities
      navigate(notification.action_url);
    }
  };

  return (
    <div className="min-h-dvh bg-[#fbfcfd] relative text-slate-900">
      {/* Background radial dot grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.35] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">
        <CitizenHeader />
        <PageShell width="narrow">
          <PageHeader
            title="Notifications & Activity"
            description={unreadCount > 0 ? `${unreadCount} unread civic alerts` : "All notifications are reviewed and acknowledged."}
            actions={
              unreadCount > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="rounded-full border-slate-200 bg-white/90 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                >
                  Mark all read
                </Button>
              ) : undefined
            }
          />
          {loading ? (
            <ListSkeleton rows={4} />
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-xs text-center">
              <EmptyState
                icon={Bell}
                title="No new notifications"
                description="Live status changes, officer assignments, and resolution proofs regarding your reports will stream here."
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
              <NotificationList
                notifications={notifications}
                getIcon={getNotificationIcon}
                onOpen={handleNotificationClick}
                onMarkRead={handleMarkAsRead}
                onDelete={handleDelete}
                shortcut={(n) => n.related_report_id ? { label: 'View report', onClick: () => navigate(`/citizen/track/${n.related_report_id}`) } : null}
              />
            </div>
          )}
        </PageShell>
      </div>
    </div>
  );
};

export default CitizenNotifications;
