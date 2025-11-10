import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, Trash2, Settings } from "lucide-react";
import { format, parseISO, isToday, isYesterday, isThisWeek } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NotificationCenter({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (user && user.email) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const allNotifications = await base44.entities.Notification.filter(
        { employee_id: user.email },
        '-created_date',
        100
      );
      
      setNotifications(allNotifications || []);
    } catch (error) {
      console.log("No notifications yet:", error);
      setNotifications([]);
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

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      await Promise.all(
        unreadIds.map(id => 
          base44.entities.Notification.update(id, {
            read: true,
            read_date: new Date().toISOString()
          })
        )
      );
      await loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await base44.entities.Notification.delete(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'Leave Approval': '📅',
      'Payslip Available': '💰',
      'Policy Update': '📋',
      'Goal Reminder': '🎯',
      'Birthday': '🎂',
      'Anniversary': '🎉',
      'System Alert': '⚠️',
      'Other': '📢'
    };
    return icons[type] || '📢';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupNotificationsByDate = (notifications) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    notifications.forEach(notification => {
      if (!notification.sent_date) {
        groups.older.push(notification);
        return;
      }

      const date = parseISO(notification.sent_date);
      if (isToday(date)) {
        groups.today.push(notification);
      } else if (isYesterday(date)) {
        groups.yesterday.push(notification);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const getDateGroupLabel = (group) => {
    const labels = {
      today: isRTL ? 'اليوم' : 'Today',
      yesterday: isRTL ? 'أمس' : 'Yesterday',
      thisWeek: isRTL ? 'هذا الأسبوع' : 'This Week',
      older: isRTL ? 'أقدم' : 'Older'
    };
    return labels[group];
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Bell className="w-6 h-6 text-blue-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <CardTitle>{isRTL ? 'مركز الإشعارات' : 'Notification Center'}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount > 0 
                    ? (isRTL 
                      ? `لديك ${unreadCount} إشعار غير مقروء`
                      : `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    )
                    : (isRTL ? 'جميع الإشعارات مقروءة' : 'All notifications read')
                  }
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{isRTL ? 'تعليم الكل كمقروء' : 'Mark All Read'}</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(createPageUrl('ESS') + '?tab=notifications&settings=true')}
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Settings className="w-4 h-4" />
                <span>{isRTL ? 'الإعدادات' : 'Settings'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                {isRTL ? `الكل (${notifications.length})` : `All (${notifications.length})`}
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                {isRTL ? `غير مقروء (${unreadCount})` : `Unread (${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="read" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                {isRTL ? `مقروء (${notifications.length - unreadCount})` : `Read (${notifications.length - unreadCount})`}
              </TabsTrigger>
            </TabsList>

            {Object.entries(groupedNotifications).map(([group, groupNotifications]) => {
              if (groupNotifications.length === 0) return null;

              return (
                <div key={group} className="space-y-3">
                  <h3 className={`text-sm font-semibold text-gray-600 ${isRTL ? 'text-right' : ''}`}>
                    {getDateGroupLabel(group)}
                  </h3>
                  <div className="space-y-2">
                    {groupNotifications.map((notification) => (
                      <Card 
                        key={notification.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-4">
                          <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-3xl flex-shrink-0">
                              {getNotificationIcon(notification.notification_type)}
                            </span>
                            <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                              <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                <h4 className="font-semibold text-gray-900">
                                  {isRTL ? notification.title_arabic || notification.title : notification.title}
                                </h4>
                                {notification.priority && notification.priority !== 'Medium' && (
                                  <Badge className={getPriorityColor(notification.priority)}>
                                    {notification.priority}
                                  </Badge>
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {isRTL ? notification.message_arabic || notification.message : notification.message}
                              </p>
                              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-xs text-gray-500">
                                  {notification.sent_date && format(parseISO(notification.sent_date), 'MMM dd, yyyy HH:mm')}
                                </span>
                                {notification.action_label && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    {notification.action_label}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`flex gap-1 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</p>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}