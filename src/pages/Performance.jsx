import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  TrendingUp, 
  Users, 
  Star,
  ClipboardCheck,
  Award,
  GraduationCap,
  Settings
} from "lucide-react";

import GoalsOKRs from "../components/performance/GoalsOKRs";
import PerformanceReviews from "../components/performance/PerformanceReviews";
import Feedback360 from "../components/performance/Feedback360";
import Competencies from "../components/performance/Competencies";
import Calibration from "../components/performance/Calibration";
import DevelopmentPlans from "../components/performance/DevelopmentPlans";
import Mentoring from "../components/performance/Mentoring";

export default function Performance() {
  const [activeTab, setActiveTab] = useState("goals");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'إدارة الأداء' : 'Performance Management'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'الأهداف، OKRs، المراجعات، والتطوير المهني' 
              : 'Goals, OKRs, Reviews, and Professional Development'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="goals" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Target className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الأهداف' : 'Goals'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="reviews"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التقييمات' : 'Reviews'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="360feedback"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? '360°' : '360°'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="competencies"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Star className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الكفاءات' : 'Competencies'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="calibration"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المعايرة' : 'Calibration'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="development"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التطوير' : 'Development'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="mentoring"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Award className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الإرشاد' : 'Mentoring'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            <GoalsOKRs />
          </TabsContent>

          <TabsContent value="reviews">
            <PerformanceReviews />
          </TabsContent>

          <TabsContent value="360feedback">
            <Feedback360 />
          </TabsContent>

          <TabsContent value="competencies">
            <Competencies />
          </TabsContent>

          <TabsContent value="calibration">
            <Calibration />
          </TabsContent>

          <TabsContent value="development">
            <DevelopmentPlans />
          </TabsContent>

          <TabsContent value="mentoring">
            <Mentoring />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}