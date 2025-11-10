import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  BarChart3, 
  Settings
} from "lucide-react";

import StandardReports from "../components/reporting/StandardReports";
import HRDashboards from "../components/reporting/HRDashboards";
import CustomReportBuilder from "../components/reporting/CustomReportBuilder";

export default function Reporting() {
  const [activeTab, setActiveTab] = useState("standard");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'التقارير والتحليلات' : 'Reports & Analytics'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'تقارير قياسية، لوحات معلومات، وبناء تقارير مخصصة' 
              : 'Standard reports, dashboards, and custom report builder'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm p-1">
            <TabsTrigger 
              value="standard" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التقارير القياسية' : 'Standard Reports'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="dashboards"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'لوحات المعلومات' : 'Dashboards'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="custom"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'تقارير مخصصة' : 'Custom Builder'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standard">
            <StandardReports />
          </TabsContent>

          <TabsContent value="dashboards">
            <HRDashboards />
          </TabsContent>

          <TabsContent value="custom">
            <CustomReportBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}