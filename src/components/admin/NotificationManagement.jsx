
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Users, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const [formData, setFormData] = useState({
    notification_type: "Company Announcement",
    title: "",
    title_arabic: "",
    message: "",
    message_arabic: "",
    priority: "Medium",
    target_audience: "All Employees",
    department: "",
    send_to_all: true,
    selected_employees: []
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    const data = await base44.entities.Employee.filter({ status: "Active" });
    setEmployees(data || []);
    setLoading(false);
  };

  const sendNotification = async () => {
    if (!formData.title || !formData.message) {
      alert(isRTL ? 'يرجى ملء العنوان والرسالة' : 'Please fill in title and message');
      return;
    }

    setSending(true);
    try {
      let targetEmployees = [];
      
      if (formData.send_to_all) {
        targetEmployees = employees;
      } else if (formData.target_audience === 'Department' && formData.department) {
        targetEmployees = employees.filter(e => e.department === formData.department);
      } else if (formData.selected_employees.length > 0) {
        targetEmployees = employees.filter(e => formData.selected_employees.includes(e.id));
      }

      const notificationsToCreate = targetEmployees.map(emp => ({
        employee_id: emp.id,
        employee_name: emp.full_name,
        notification_type: formData.notification_type,
        title: formData.title,
        title_arabic: formData.title_arabic,
        message: formData.message,
        message_arabic: formData.message_arabic,
        priority: formData.priority,
        channels: JSON.stringify(['in-app', 'email']),
        sent_date: new Date().toISOString(),
        read: false
      }));

      await base44.entities.Notification.bulkCreate(notificationsToCreate);

      // Send browser notifications to users with permission
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(formData.title, {
          body: formData.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'hr-notification',
          requireInteraction: formData.priority === 'High'
        });
      }

      alert(isRTL 
        ? `تم إرسال ${notificationsToCreate.length} إشعار بنجاح`
        : `Successfully sent ${notificationsToCreate.length} notifications`
      );

      // Reset form
      setFormData({
        notification_type: "Company Announcement",
        title: "",
        title_arabic: "",
        message: "",
        message_arabic: "",
        priority: "Medium",
        target_audience: "All Employees",
        department: "",
        send_to_all: true,
        selected_employees: []
      });
    } catch (error) {
      console.error("Error sending notifications:", error);
      alert(isRTL ? 'حدث خطأ في إرسال الإشعارات' : 'Error sending notifications');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-red-50 to-red-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Bell className="w-5 h-5 text-[#B11116]" />
            <span>{isRTL ? 'إرسال إشعار جديد' : 'Send New Notification'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'نوع الإشعار' : 'Notification Type'}
              </Label>
              <Select
                value={formData.notification_type}
                onValueChange={(value) => setFormData({...formData, notification_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Company Announcement">{isRTL ? 'إعلان الشركة' : 'Company Announcement'}</SelectItem>
                  <SelectItem value="Holiday Announcement">{isRTL ? 'إعلان العطلة' : 'Holiday Announcement'}</SelectItem>
                  <SelectItem value="Policy Update">{isRTL ? 'تحديث السياسة' : 'Policy Update'}</SelectItem>
                  <SelectItem value="System Alert">{isRTL ? 'تنبيه النظام' : 'System Alert'}</SelectItem>
                  <SelectItem value="Training Due">{isRTL ? 'التدريب المستحق' : 'Training Due'}</SelectItem>
                  <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الأولوية' : 'Priority'}
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({...formData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">{isRTL ? 'منخفضة' : 'Low'}</SelectItem>
                  <SelectItem value="Medium">{isRTL ? 'متوسطة' : 'Medium'}</SelectItem>
                  <SelectItem value="High">{isRTL ? 'عالية' : 'High'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={isRTL ? "عنوان الإشعار" : "Notification title"}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
              </Label>
              <Input
                value={formData.title_arabic}
                onChange={(e) => setFormData({...formData, title_arabic: e.target.value})}
                placeholder="عنوان الإشعار"
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الرسالة (إنجليزي)' : 'Message (English)'}
              </Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                placeholder={isRTL ? "محتوى الإشعار" : "Notification message"}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الرسالة (عربي)' : 'Message (Arabic)'}
              </Label>
              <Textarea
                value={formData.message_arabic}
                onChange={(e) => setFormData({...formData, message_arabic: e.target.value})}
                rows={4}
                placeholder="محتوى الإشعار"
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الجمهور المستهدف' : 'Target Audience'}
              </Label>
              <Select
                value={formData.target_audience}
                onValueChange={(value) => {
                  setFormData({
                    ...formData, 
                    target_audience: value,
                    send_to_all: value === 'All Employees'
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Employees">{isRTL ? 'جميع الموظفين' : 'All Employees'}</SelectItem>
                  <SelectItem value="Department">{isRTL ? 'قسم محدد' : 'Specific Department'}</SelectItem>
                  <SelectItem value="Custom">{isRTL ? 'مخصص' : 'Custom Selection'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.target_audience === 'Department' && (
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'القسم' : 'Department'}
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({...formData, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر القسم" : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">{isRTL ? 'الموارد البشرية' : 'HR'}</SelectItem>
                    <SelectItem value="Finance">{isRTL ? 'المالية' : 'Finance'}</SelectItem>
                    <SelectItem value="Operations">{isRTL ? 'العمليات' : 'Operations'}</SelectItem>
                    <SelectItem value="IT">{isRTL ? 'تقنية المعلومات' : 'IT'}</SelectItem>
                    <SelectItem value="Sales">{isRTL ? 'المبيعات' : 'Sales'}</SelectItem>
                    <SelectItem value="Marketing">{isRTL ? 'التسويق' : 'Marketing'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm font-medium text-blue-900">
                {isRTL ? 'المستلمون:' : 'Recipients:'} 
                {formData.send_to_all 
                  ? ` ${employees.length} ${isRTL ? 'موظف' : 'employees'}`
                  : formData.target_audience === 'Department' && formData.department
                  ? ` ${employees.filter(e => e.department === formData.department).length} ${isRTL ? 'موظف في' : 'employees in'} ${formData.department}`
                  : ` ${formData.selected_employees.length} ${isRTL ? 'مختار' : 'selected'}`
                }
              </p>
            </div>
          </div>

          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
            <Button
              onClick={sendNotification}
              disabled={sending || !formData.title || !formData.message}
              className={`bg-gradient-to-r from-[#B11116] to-[#991014] ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {sending ? (
                <>
                  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white ${isRTL ? 'ml-2' : 'mr-2'}`}></div>
                  {isRTL ? 'جاري الإرسال...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إرسال الإشعار' : 'Send Notification'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Templates */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'قوالب سريعة' : 'Quick Templates'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className={`h-auto p-4 ${isRTL ? 'text-right' : 'text-left'}`}
              onClick={() => setFormData({
                ...formData,
                notification_type: "Holiday Announcement",
                title: "Upcoming Holiday",
                title_arabic: "عطلة قادمة",
                message: "A holiday is coming up. Please check the calendar for details.",
                message_arabic: "عطلة قادمة. يرجى التحقق من التقويم للحصول على التفاصيل."
              })}
            >
              <div className={`flex items-start gap-3 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">{isRTL ? 'إعلان عطلة' : 'Holiday Announcement'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL ? 'إخطار الموظفين بالعطلات القادمة' : 'Notify employees about upcoming holidays'}
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className={`h-auto p-4 ${isRTL ? 'text-right' : 'text-left'}`}
              onClick={() => setFormData({
                ...formData,
                notification_type: "Policy Update",
                title: "Policy Update",
                title_arabic: "تحديث السياسة",
                message: "A company policy has been updated. Please review and acknowledge.",
                message_arabic: "تم تحديث سياسة الشركة. يرجى المراجعة والإقرار.",
                priority: "High"
              })}
            >
              <div className={`flex items-start gap-3 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Bell className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">{isRTL ? 'تحديث السياسة' : 'Policy Update'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL ? 'إخطار بتحديثات السياسة' : 'Notify about policy updates'}
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className={`h-auto p-4 ${isRTL ? 'text-right' : 'text-left'}`}
              onClick={() => setFormData({
                ...formData,
                notification_type: "System Alert",
                title: "System Maintenance",
                title_arabic: "صيانة النظام",
                message: "The system will undergo maintenance on [DATE]. Please save your work.",
                message_arabic: "سيخضع النظام للصيانة في [التاريخ]. يرجى حفظ عملك.",
                priority: "High"
              })}
            >
              <div className={`flex items-start gap-3 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Bell className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">{isRTL ? 'صيانة النظام' : 'System Maintenance'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL ? 'إخطار بصيانة النظام' : 'Notify about system maintenance'}
                  </p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className={`h-auto p-4 ${isRTL ? 'text-right' : 'text-left'}`}
              onClick={() => setFormData({
                ...formData,
                notification_type: "Company Announcement",
                title: "Important Announcement",
                title_arabic: "إعلان مهم",
                message: "Dear Team, we have an important update to share...",
                message_arabic: "عزيزي الفريق، لدينا تحديث مهم لمشاركته..."
              })}
            >
              <div className={`flex items-start gap-3 w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">{isRTL ? 'إعلان عام' : 'General Announcement'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL ? 'إعلان عام للشركة' : 'General company announcement'}
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
