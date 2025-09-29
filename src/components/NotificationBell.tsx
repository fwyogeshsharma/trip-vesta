import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Target,
  Shield,
  TrendingUp,
  DollarSign,
  Activity,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type UserMessageReceiver
} from "@/services/notificationService";

export const NotificationBell = () => {
  const { user } = useAuth();
  const [notificationsList, setNotificationsList] = useState<UserMessageReceiver[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserNotifications(user.id, 20, 0);
      setNotificationsList(response._items);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const markAllNotificationsAsSeen = useCallback(async () => {
    if (!user?.id) return;

    try {
      await markAllNotificationsAsRead(user.id);

      // Update local state to mark all as read (format: YYYY-MM-DDTHH:mm:ss)
      const readTimestamp = new Date().toISOString().slice(0, 19);
      setNotificationsList(prev =>
        prev.map(notification => ({
          ...notification,
          read_on: notification.read_on || readTimestamp
        }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user?.id]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id, loadNotifications]);

  // Note: Removed auto-marking when dropdown opens - now using hover instead

  const unreadCount = notificationsList.filter(n => !n.read_on).length;

  const markAsRead = async (notificationId: string, etag: string) => {
    try {
      setMarkingAsRead(prev => new Set(prev).add(notificationId));

      await markNotificationAsRead(notificationId, etag);

      // Update local state (format: YYYY-MM-DDTHH:mm:ss)
      const readTimestamp = new Date().toISOString().slice(0, 19);
      setNotificationsList(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, read_on: readTimestamp }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleNotificationHover = async (notification: UserMessageReceiver) => {
    // Only mark as read if it's currently unread and not already being marked
    if (!notification.read_on && !markingAsRead.has(notification._id)) {
      await markAsRead(notification._id, notification._etag);
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'new_trip':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'profit':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      case 'update':
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  if (error) {
    return (
      <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0" disabled>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllNotificationsAsSeen}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {isLoading && notificationsList.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Loading notifications...
            </div>
          ) : notificationsList.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notificationsList.map((notification) => {
              const isBeingMarked = markingAsRead.has(notification._id);
              const isUnread = !notification.read_on;

              return (
                <DropdownMenuItem
                  key={notification._id}
                  className={`p-4 cursor-pointer border-b last:border-b-0 transition-all duration-200 ${
                    isUnread
                      ? isBeingMarked
                        ? 'bg-green-50/50 hover:bg-green-100/50'
                        : 'bg-blue-50/50 hover:bg-blue-100/50'
                      : 'hover:bg-gray-50'
                  } ${isBeingMarked ? 'opacity-75' : ''}`}
                  onMouseEnter={() => handleNotificationHover(notification)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.message.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.message.subject || 'New Message'}
                        </p>
                        {isUnread && (
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isBeingMarked
                              ? 'bg-green-500 animate-pulse'
                              : 'bg-blue-500 animate-pulse'
                          }`}></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {notification.message.content || notification.message.body || 'No content'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notification._created)}
                        </p>
                        {notification.message.from?.name && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-400">
                              from {notification.message.from.name}
                            </p>
                          </>
                        )}
                        {isBeingMarked && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-green-600 font-medium">
                              marking as read...
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        {notificationsList.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={loadNotifications}
            >
              Refresh notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};