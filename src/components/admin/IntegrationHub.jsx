import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Clock, 
  Mail, 
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";

import ERPIntegrations from "@/api/integrations/ERPIntegrations";
import AttendanceDevices from "@/api/integrations/AttendanceDevices";
import CommunicationChannels from "@/api/integrations/CommunicationChannels";
import ComplianceExports from "@/api/integrations/ComplianceExports";

export default function IntegrationHub() {
  const [activeTab, setActiveTab] = useState("erp");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const integrationStatus = {
    erp: { active: false, name: "ERP/Finance" },
    attendance: { active: false, name: "Attendance Devices" },
    communication: { active: true, name: "Communication" },
    compliance: { active: true, name: "Compliance Exports" }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Settings className="w-5 h-5 text-blue-600" />
            <span>{isRTL ? 'مركز التكاملات' : 'Integration Hub'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(integrationStatus).map(([key, status]) => (
              <div key={key} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="font-medium text-gray-900">{status.name}</span>
                  {status.active ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <Badge variant="outline" className={status.active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}>
                  {status.active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white shadow-sm p-1">
          <TabsTrigger 
            value="erp"
            className={`flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isRTL ? 'ERP/المالية' : 'ERP/Finance'}</span>
          </TabsTrigger>

          <TabsTrigger 
            value="attendance"
            className={`flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Clock className="w-4 h-4" />
            <span>{isRTL ? 'أجهزة الحضور' : 'Attendance'}</span>
          </TabsTrigger>

          <TabsTrigger 
            value="communication"
            className={`flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Mail className="w-4 h-4" />
            <span>{isRTL ? 'الاتصالات' : 'Communication'}</span>
          </TabsTrigger>

          <TabsTrigger 
            value="compliance"
            className={`flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isRTL ? 'التصدير' : 'Exports'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="erp">
          <ERPIntegrations />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceDevices />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationChannels />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceExports />
        </TabsContent>
      </Tabs>
    </div>
  );
}