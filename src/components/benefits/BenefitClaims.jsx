import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function BenefitClaims() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'مطالبات المزايا' : 'Benefit Claims'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'قريباً - إدارة مطالبات التأمين الطبي' : 'Coming Soon - Medical Insurance Claims'}</p>
        </div>
      </CardContent>
    </Card>
  );
}