import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NumberRanges() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'نطاقات الأرقام والأكواد' : 'Number Ranges & Codes'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">
            {isRTL 
              ? 'قريباً - إدارة التسلسل الآلي للأرقام'
              : 'Coming Soon - Automated Number Sequence Management'
            }
          </p>
          <ul className={`text-sm mt-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'} max-w-md mx-auto`}>
            <li>• {isRTL ? 'أرقام الموظفين' : 'Employee IDs'}</li>
            <li>• {isRTL ? 'أرقام الطلبات والتذاكر' : 'Requisitions & Tickets'}</li>
            <li>• {isRTL ? 'أرقام المستندات' : 'Document Numbers'}</li>
            <li>• {isRTL ? 'خاصة بكل شركة/فرع' : 'Per Company/Branch'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}