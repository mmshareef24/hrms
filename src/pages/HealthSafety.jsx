import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Activity, 
  Shield, 
  Heart,
  Stethoscope,
  HardHat,
  TrendingUp,
  PhoneCall
} from "lucide-react";

import IncidentManagement from "../components/health/IncidentManagement";
import SafetyDrills from "../components/health/SafetyDrills";
import MedicalRecords from "../components/health/MedicalRecords";
import PPEManagement from "../components/health/PPEManagement";
import WellnessSurveys from "../components/health/WellnessSurveys";
import WellnessTips from "../components/health/WellnessTips";
import EAPResources from "../components/health/EAPResources";
import SafetyReports from "../components/health/SafetyReports";

export default function HealthSafety() {
  const [activeTab, setActiveTab] = useState("incidents");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'الصحة والسلامة والعافية' : 'Health, Safety & Wellbeing'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'إدارة الحوادث، السلامة، السجلات الطبية، وبرامج العافية' 
              : 'Incident management, safety tracking, medical records, and wellness programs'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="incidents" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الحوادث' : 'Incidents'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="drills"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التدريبات' : 'Drills'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="medical"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Stethoscope className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الطبية' : 'Medical'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="ppe"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <HardHat className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'معدات السلامة' : 'PPE'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="surveys"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الاستطلاعات' : 'Surveys'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="tips"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Heart className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'نصائح' : 'Tips'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="eap"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الدعم' : 'EAP'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="reports"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التقارير' : 'Reports'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents">
            <IncidentManagement />
          </TabsContent>

          <TabsContent value="drills">
            <SafetyDrills />
          </TabsContent>

          <TabsContent value="medical">
            <MedicalRecords />
          </TabsContent>

          <TabsContent value="ppe">
            <PPEManagement />
          </TabsContent>

          <TabsContent value="surveys">
            <WellnessSurveys />
          </TabsContent>

          <TabsContent value="tips">
            <WellnessTips />
          </TabsContent>

          <TabsContent value="eap">
            <EAPResources />
          </TabsContent>

          <TabsContent value="reports">
            <SafetyReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}