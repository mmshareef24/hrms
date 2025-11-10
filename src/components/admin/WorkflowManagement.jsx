import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function WorkflowManagement() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'إدارة سير العمل' : 'Workflow Management'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">
            {isRTL 
              ? 'قريباً - منشئ سير العمل مع الموافقات متعددة الخطوات'
              : 'Coming Soon - Workflow Builder with Multi-Step Approvals'
            }
          </p>
          <ul className={`text-sm mt-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'} max-w-md mx-auto`}>
            <li>• {isRTL ? 'الموافقات المتوازية والتسلسلية' : 'Parallel & Sequential Approvals'}</li>
            <li>• {isRTL ? 'اتفاقيات مستوى الخدمة والتصعيد' : 'SLAs & Escalations'}</li>
            <li>• {isRTL ? 'تفويض الإجازات' : 'Vacation Delegation'}</li>
            <li>• {isRTL ? 'الموافقة التلقائية بناءً على الشروط' : 'Conditional Auto-Approval'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}