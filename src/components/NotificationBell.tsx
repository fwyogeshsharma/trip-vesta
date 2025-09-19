import { useState } from "react";
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
  Activity
} from "lucide-react";

// Notifications data
const notifications = [
  {
    id: 1,
    title: "New Trip Available",
    message: "Berger Paints has opened a new investment opportunity with 15% expected returns",
    time: "2 hours ago",
    type: "new_trip",
    unread: true
  },
  {
    id: 2,
    title: "Trip Completed",
    message: "Your Asian Paints investment trip has been completed successfully. Withdrawal amount has been credited to your account.",
    time: "1 day ago",
    type: "completed",
    unread: true
  },
  {
    id: 3,
    title: "Investment Opportunity",
    message: "Tesla Motors trip is now open for investments - Limited slots available",
    time: "3 hours ago",
    type: "new_trip",
    unread: true
  },
  {
    id: 4,
    title: "Profit Distribution",
    message: "Your profit of ₹45,230 from Coca Cola trip has been processed and credited",
    time: "2 days ago",
    type: "profit",
    unread: false
  },
  {
    id: 5,
    title: "Trip Update",
    message: "Dynamic Cable investment has reached 80% funding target",
    time: "5 hours ago",
    type: "update",
    unread: true
  },
  {
    id: 6,
    title: "Withdrawal Successful",
    message: "Amount ₹1,25,000 has been successfully withdrawn to your bank account",
    time: "1 week ago",
    type: "withdrawal",
    unread: false
  }
];

export const NotificationBell = () => {
  const [notificationsList, setNotificationsList] = useState(notifications);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = notificationsList.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotificationsList(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationsList(prev =>
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const getNotificationIcon = (type: string) => {
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

  return (
    <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notificationsList.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-4 cursor-pointer border-b last:border-b-0 ${
                notification.unread ? 'bg-blue-50/50' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};