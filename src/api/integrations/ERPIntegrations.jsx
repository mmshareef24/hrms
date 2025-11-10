import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export default function ERPIntegrations() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle className={isRTL ? 'text-right' : ''}>
          <span className="inline-flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {isRTL ? 'تكاملات ERP/المالية' : 'ERP/Finance Integrations'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={isRTL ? 'text-right' : ''}>
          <p className="text-gray-600">
            {isRTL ? 'هذه مكونات مؤقتة للعرض.' : 'Placeholder component for preview.'}
          </p>
          <div className={`mt-3 ${isRTL ? 'flex-row-reverse' : ''} flex gap-2`}>
            <Badge variant="outline">Oracle</Badge>
            <Badge variant="outline">SAP</Badge>
            <Badge variant="outline">Dynamics 365</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}