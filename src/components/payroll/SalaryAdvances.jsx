import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function SalaryAdvances() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'سلف الرواتب' : 'Salary Advances'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">{isRTL ? 'نظام السلف السريعة' : 'Quick Advance System'}</p>
          <ul className={`text-sm mt-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'} max-w-md mx-auto`}>
            <li>• {isRTL ? 'طلب سريع للسلف' : 'Fast advance requests'}</li>
            <li>• {isRTL ? 'الاسترداد التلقائي من الراتب' : 'Auto-recovery from salary'}</li>
            <li>• {isRTL ? 'خطط استرداد مرنة (دفعة واحدة أو متعددة)' : 'Flexible recovery (single/multiple)'}</li>
            <li>• {isRTL ? 'سلف الطوارئ' : 'Emergency advances'}</li>
            <li>• {isRTL ? 'سلف تذاكر السفر' : 'Ticket/leave advances'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}