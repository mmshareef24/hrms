import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function EAPResources() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'برنامج مساعدة الموظفين' : 'Employee Assistance Program (EAP)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'قريباً - موارد الدعم والاستشارات' : 'Coming Soon - Support & Counseling Resources'}</p>
        </div>
      </CardContent>
    </Card>
  );
}