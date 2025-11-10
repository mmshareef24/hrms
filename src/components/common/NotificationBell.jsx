import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (user && user.email) {
      loadNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const allNotifications = await base44.entities.Notification.filter(
        { employee_id: user.email },
        '-created_date',
        10
      );
      
      setNotifications(allNotifications || []);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.log("No notifications yet:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await base44.entities.Notification.update(notificationId, {
        read: true,
        read_date: new Date().toISOString()
      });
      await loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    
    // Navigate to action URL if available
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Leave Approval':
        return '📅';
      case 'Payslip Available':
        return '💰';
      case 'Policy Update':
        return '📋';
      case 'Goal Reminder':
        return '🎯';
      case 'Birthday':
        return '🎂';
      case 'Anniversary':
        return '🎉';
      case 'System Alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isRTL ? "start" : "end"} 
        className="w-80"
      >
        <div className={`p-3 border-b ${isRTL ? 'text-right' : ''}`}>
          <h3 className="font-semibold text-sm">
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? `لديك ${unreadCount} إشعار غير مقروء`
                : `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              }
            </p>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`flex items-start gap-3 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-2xl">{getNotificationIcon(notification.notification_type)}</span>
                  <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                    <p className={`font-medium text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {isRTL ? notification.title_arabic || notification.title : notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {isRTL ? notification.message_arabic || notification.message : notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.sent_date && format(parseISO(notification.sent_date), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="justify-center text-sm text-blue-600 cursor-pointer"
          onClick={() => navigate(createPageUrl('ESS') + '?tab=notifications')}
        >
          {isRTL ? 'عرض كل الإشعارات' : 'View All Notifications'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}