import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AuditLogs() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'سجلات التدقيق' : 'Audit Logs'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">
            {isRTL 
              ? 'قريباً - سجلات الوصول والتغييرات والصادرات'
              : 'Coming Soon - Access Logs, Data Changes & Exports'
            }
          </p>
          <ul className={`text-sm mt-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'} max-w-md mx-auto`}>
            <li>• {isRTL ? 'تسجيل الدخول/الخروج' : 'Login/Logout Tracking'}</li>
            <li>• {isRTL ? 'تتبع تغييرات البيانات' : 'Data Change Tracking'}</li>
            <li>• {isRTL ? 'سجل الصادرات' : 'Export History'}</li>
            <li>• {isRTL ? 'مسار التدقيق للموافقات' : 'Approval Audit Trail'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}