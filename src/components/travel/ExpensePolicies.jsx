import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ExpensePolicies() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'سياسات المصروفات' : 'Expense Policies'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">{isRTL ? 'تكوين السياسات والحدود' : 'Policy Configuration & Limits'}</p>
          <ul className={`text-sm mt-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'} max-w-md mx-auto`}>
            <li>• {isRTL ? 'حدود حسب نوع المصروف' : 'Limits by expense type'}</li>
            <li>• {isRTL ? 'قواعد لكل درجة/بلد' : 'Per grade/country rules'}</li>
            <li>• {isRTL ? 'متطلبات الإيصالات' : 'Receipt requirements'}</li>
            <li>• {isRTL ? 'معدلات البدل اليومي' : 'Per-diem rates'}</li>
            <li>• {isRTL ? 'حدود الفنادق والطيران' : 'Hotel & flight caps'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}