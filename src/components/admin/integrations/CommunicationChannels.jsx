import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Send, Settings, CheckCircle } from "lucide-react";

export default function CommunicationChannels() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const channels = [
    {
      name: "Email (SMTP)",
      icon: Mail,
      status: "active",
      description: "Send payslips, notifications, and reports via email",
      features: ["Transactional Emails", "Bulk Notifications", "Attachments Support"]
    },
    {
      name: "SMS Gateway",
      icon: MessageSquare,
      status: "configured",
      description: "SMS notifications for urgent alerts and OTPs",
      features: ["Leave Approvals", "Punch Reminders", "Emergency Alerts"]
    },
    {
      name: "WhatsApp Business",
      icon: Send,
      status: "configured",
      description: "Rich messaging via WhatsApp Business API",
      features: ["Interactive Messages", "Document Sharing", "Status Updates"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <Card key={channel.name} className="shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <CardTitle className="text-xl">{channel.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{channel.description}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      channel.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    } ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {channel.status === 'active' && <CheckCircle className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />}
                    {channel.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'مُكوَّن' : 'Configured')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className={`font-medium text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
                      {isRTL ? 'حالات الاستخدام' : 'Use Cases'}
                    </h4>
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 ${isRTL ? 'text-right' : ''}`}>
                      {channel.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                    <Button variant="outline">
                      {isRTL ? 'اختبار الاتصال' : 'Test Connection'}
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إدارة' : 'Manage'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}