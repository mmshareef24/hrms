import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Mail, MessageSquare, Globe, Clock, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NOTIFICATION_TYPES = [
  { value: 'Leave Approval', label: 'Leave Approvals', labelAr: 'موافقات الإجازات', icon: '📅' },
  { value: 'Payslip Available', label: 'Payslip Available', labelAr: 'كشف الراتب متاح', icon: '💰' },
  { value: 'Policy Update', label: 'Policy Updates', labelAr: 'تحديثات السياسات', icon: '📋' },
  { value: 'Goal Reminder', label: 'Goal Reminders', labelAr: 'تذكيرات الأهداف', icon: '🎯' },
  { value: 'Pending Approvals', label: 'Pending Approvals', labelAr: 'الموافقات المعلقة', icon: '⏳' },
  { value: 'Document Expiry', label: 'Document Expiry', labelAr: 'انتهاء صلاحية الوثائق', icon: '📄' },
  { value: 'Task Assignment', label: 'Task Assignments', labelAr: 'تعيينات المهام', icon: '✅' },
  { value: 'Training Due', label: 'Training Due', labelAr: 'تدريب مستحق', icon: '🎓' },
  { value: 'Holiday Announcement', label: 'Holiday Announcements', labelAr: 'إعلانات العطلات', icon: '🎉' },
  { value: 'Company Announcement', label: 'Company Announcements', labelAr: 'إعلانات الشركة', icon: '📢' },
  { value: 'Performance Review', label: 'Performance Reviews', labelAr: 'مراجعات الأداء', icon: '⭐' },
  { value: 'Birthday', label: 'Birthdays', labelAr: 'أعياد الميلاد', icon: '🎂' },
  { value: 'Anniversary', label: 'Work Anniversaries', labelAr: 'ذكرى العمل', icon: '🏆' }
];

export default function NotificationPreferences({ user }) {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (user && user.email) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const prefs = await base44.entities.NotificationPreference.filter({
        employee_id: user.email
      });

      if (prefs.length === 0) {
        // Create default preferences
        const defaultPrefs = await Promise.all(
          NOTIFICATION_TYPES.map(type =>
            base44.entities.NotificationPreference.create({
              employee_id: user.email,
              employee_name: user.full_name,
              notification_type: type.value,
              email_enabled: true,
              in_app_enabled: true,
              browser_push_enabled: false,
              sms_enabled: false,
              whatsapp_enabled: false,
              frequency: 'Immediate',
              priority_filter: 'All'
            })
          )
        );
        setPreferences(defaultPrefs);
      } else {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      setPreferences([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (notificationType, field, value) => {
    try {
      const pref = preferences.find(p => p.notification_type === notificationType);
      if (pref) {
        await base44.entities.NotificationPreference.update(pref.id, {
          [field]: value
        });
        await loadPreferences();
      }
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  const saveAllPreferences = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await Promise.all(
        preferences.map(pref =>
          base44.entities.NotificationPreference.update(pref.id, pref)
        )
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

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
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Bell className="w-6 h-6 text-purple-600" />
              <CardTitle>{isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}</CardTitle>
            </div>
            <Button 
              onClick={saveAllPreferences}
              disabled={saving}
              className={`bg-purple-600 hover:bg-purple-700 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className={isRTL ? 'text-right' : ''}>
                {isRTL ? 'تم حفظ التفضيلات بنجاح!' : 'Preferences saved successfully!'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Global Settings */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h3 className={`font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الإعدادات العامة' : 'Global Settings'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                    <Label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <Clock className="w-4 h-4" />
                      {isRTL ? 'الساعات الهادئة' : 'Quiet Hours'}
                    </Label>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Input type="time" className="w-32" placeholder="22:00" />
                      <span>{isRTL ? 'إلى' : 'to'}</span>
                      <Input type="time" className="w-32" placeholder="07:00" />
                    </div>
                    <p className="text-xs text-gray-500">
                      {isRTL ? 'لن تتلقى إشعارات خلال هذه الأوقات' : 'No notifications during these hours'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Type Settings */}
            <div className="space-y-4">
              <h3 className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'تفضيلات حسب نوع الإشعار' : 'Notification Type Settings'}
              </h3>
              
              {NOTIFICATION_TYPES.map((type) => {
                const pref = preferences.find(p => p.notification_type === type.value) || {
                  email_enabled: true,
                  in_app_enabled: true,
                  browser_push_enabled: false,
                  sms_enabled: false,
                  whatsapp_enabled: false,
                  frequency: 'Immediate',
                  priority_filter: 'All'
                };

                return (
                  <Card key={type.value} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-2xl">{type.icon}</span>
                          <h4 className="font-medium flex-1">
                            {isRTL ? type.labelAr : type.label}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Label className={`text-xs flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Mail className="w-3 h-3" />
                              {isRTL ? 'بريد' : 'Email'}
                            </Label>
                            <Switch
                              checked={pref.email_enabled}
                              onCheckedChange={(checked) => 
                                updatePreference(type.value, 'email_enabled', checked)
                              }
                            />
                          </div>

                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Label className={`text-xs flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Bell className="w-3 h-3" />
                              {isRTL ? 'داخلي' : 'In-App'}
                            </Label>
                            <Switch
                              checked={pref.in_app_enabled}
                              onCheckedChange={(checked) => 
                                updatePreference(type.value, 'in_app_enabled', checked)
                              }
                            />
                          </div>

                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Label className={`text-xs flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Globe className="w-3 h-3" />
                              {isRTL ? 'متصفح' : 'Push'}
                            </Label>
                            <Switch
                              checked={pref.browser_push_enabled}
                              onCheckedChange={(checked) => 
                                updatePreference(type.value, 'browser_push_enabled', checked)
                              }
                            />
                          </div>

                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Label className={`text-xs flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <MessageSquare className="w-3 h-3" />
                              {isRTL ? 'واتساب' : 'WhatsApp'}
                            </Label>
                            <Switch
                              checked={pref.whatsapp_enabled}
                              onCheckedChange={(checked) => 
                                updatePreference(type.value, 'whatsapp_enabled', checked)
                              }
                            />
                          </div>

                          <Select
                            value={pref.frequency}
                            onValueChange={(value) => 
                              updatePreference(type.value, 'frequency', value)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Immediate">{isRTL ? 'فوري' : 'Immediate'}</SelectItem>
                              <SelectItem value="Hourly Digest">{isRTL ? 'كل ساعة' : 'Hourly'}</SelectItem>
                              <SelectItem value="Daily Digest">{isRTL ? 'يومي' : 'Daily'}</SelectItem>
                              <SelectItem value="Off">{isRTL ? 'معطل' : 'Off'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}