import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale, 
  AlertTriangle, 
  FileText, 
  Shield,
  ClipboardList,
  TrendingUp,
  AlertCircle
} from "lucide-react";

import CaseManagement from "../components/relations/CaseManagement";
import DisciplinaryActions from "../components/relations/DisciplinaryActions";
import PolicyCenter from "../components/relations/PolicyCenter";
import ComplianceReports from "../components/relations/ComplianceReports";
import LaborLawLibrary from "../components/relations/LaborLawLibrary";

export default function EmployeeRelations() {
  const [activeTab, setActiveTab] = useState("cases");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'العلاقات الوظيفية والامتثال' : 'Employee Relations & Compliance'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'إدارة القضايا، السياسات، والامتثال للأنظمة' 
              : 'Case management, policies, and regulatory compliance'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="cases" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <AlertCircle className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'القضايا' : 'Cases'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="disciplinary"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الإجراءات' : 'Disciplinary'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="policies"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'السياسات' : 'Policies'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="compliance"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الامتثال' : 'Compliance'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="labor-law"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Scale className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'قانون العمل' : 'Labor Law'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <CaseManagement />
          </TabsContent>

          <TabsContent value="disciplinary">
            <DisciplinaryActions />
          </TabsContent>

          <TabsContent value="policies">
            <PolicyCenter />
          </TabsContent>

          <TabsContent value="compliance">
            <ComplianceReports />
          </TabsContent>

          <TabsContent value="labor-law">
            <LaborLawLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}