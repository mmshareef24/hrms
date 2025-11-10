import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ExpenseReports() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'تقارير المصروفات' : 'Expense Reports'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">{isRTL ? 'التحليلات والتقارير' : 'Analytics & Reporting'}</p>
          <ul className={`text-sm mt-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'} max-w-md mx-auto`}>
            <li>• {isRTL ? 'الإنفاق حسب الشركة/القسم/المشروع' : 'Spend by company/dept/project'}</li>
            <li>• {isRTL ? 'انتهاكات السياسة' : 'Policy violations'}</li>
            <li>• {isRTL ? 'كبار الموردين' : 'Top vendors'}</li>
            <li>• {isRTL ? 'ضريبة القيمة المضافة القابلة للاسترداد' : 'VAT reclaimable'}</li>
            <li>• {isRTL ? 'السلف المفتوحة' : 'Open advances'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}