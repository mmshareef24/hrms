import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function SystemSettings() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'إعدادات النظام' : 'System Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">
            {isRTL 
              ? 'قريباً - إعدادات النظام العامة'
              : 'Coming Soon - Global System Configuration'
            }
          </p>
          <ul className={`text-sm mt-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'} max-w-md mx-auto`}>
            <li>• {isRTL ? 'إعدادات التقويم (هجري/ميلادي)' : 'Calendar Settings (Hijri/Gregorian)'}</li>
            <li>• {isRTL ? 'إعدادات متعددة الشركات' : 'Multi-Company Settings'}</li>
            <li>• {isRTL ? 'تكامل SSO و MFA' : 'SSO & MFA Integration'}</li>
            <li>• {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}