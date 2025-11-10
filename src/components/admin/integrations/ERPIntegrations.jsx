import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ERPIntegrations() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const erpSystems = [
    {
      name: "SAP ECC 6.0",
      status: "available",
      description: "General Ledger posting via RFC/BAPI",
      features: ["Journal Vouchers", "Cost Center Posting", "Employee Master Sync"]
    },
    {
      name: "SAP S/4HANA",
      status: "available",
      description: "Real-time integration with S/4HANA Finance",
      features: ["Fiori APIs", "OData Services", "Real-time GL Posting"]
    },
    {
      name: "Zoho Books",
      status: "available",
      description: "Accounting integration via REST API",
      features: ["Chart of Accounts", "Journal Entries", "Vendor/Employee Sync"]
    },
    {
      name: "Odoo",
      status: "available",
      description: "Open-source ERP integration",
      features: ["XML-RPC API", "HR Module Sync", "Accounting Module"]
    },
    {
      name: "QuickBooks",
      status: "available",
      description: "QuickBooks Online API integration",
      features: ["Payroll Export", "Expense Tracking", "Vendor Management"]
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className={isRTL ? 'text-right' : ''}>
          {isRTL 
            ? 'تتم إدارة تكاملات ERP/المالية من خلال لوحة إعدارات base44. انقر على "إدارة" لكل نظام للتكوين.'
            : 'ERP/Finance integrations are managed through base44 settings dashboard. Click "Configure" for each system to set up.'
          }
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {erpSystems.map((system) => (
          <Card key={system.name} className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="border-b border-gray-100">
              <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <CardTitle className="text-xl">{system.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{system.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {isRTL ? 'متاح' : 'Available'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className={`font-medium text-gray-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'المميزات' : 'Features'}
                  </h4>
                  <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 ${isRTL ? 'text-right' : ''}`}>
                    {system.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                  <Button variant="outline" className={isRTL ? 'flex-row-reverse' : ''}>
                    <ExternalLink className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'الوثائق' : 'Documentation'}
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'تكوين' : 'Configure'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}