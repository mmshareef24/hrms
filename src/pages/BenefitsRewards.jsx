import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gift, 
  Heart, 
  Award, 
  TrendingUp,
  Shield,
  DollarSign,
  Star,
  Target
} from "lucide-react";

import BenefitPlans from "../components/benefits/BenefitPlans";
import EmployeeBenefits from "../components/benefits/EmployeeBenefits";
import BenefitClaims from "../components/benefits/BenefitClaims";
import SpotAwards from "../components/rewards/SpotAwards";
import BonusCycles from "../components/rewards/BonusCycles";
import SalesIncentives from "../components/rewards/SalesIncentives";
import EquityManagement from "../components/rewards/EquityManagement";

export default function BenefitsRewards() {
  const [activeTab, setActiveTab] = useState("plans");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'المزايا والمكافآت' : 'Benefits & Rewards'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'إدارة التأمينات والمزايا والمكافآت والحوافز' 
              : 'Manage insurance, benefits, rewards, and incentives'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="plans" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الخطط' : 'Plans'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="employee-benefits"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Heart className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المزايا' : 'Benefits'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="claims"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المطالبات' : 'Claims'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="spot-awards"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Star className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الجوائز' : 'Awards'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="bonuses"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Gift className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المكافآت' : 'Bonuses'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="sales"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Target className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المبيعات' : 'Sales'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="equity"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الأسهم' : 'Equity'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <BenefitPlans />
          </TabsContent>

          <TabsContent value="employee-benefits">
            <EmployeeBenefits />
          </TabsContent>

          <TabsContent value="claims">
            <BenefitClaims />
          </TabsContent>

          <TabsContent value="spot-awards">
            <SpotAwards />
          </TabsContent>

          <TabsContent value="bonuses">
            <BonusCycles />
          </TabsContent>

          <TabsContent value="sales">
            <SalesIncentives />
          </TabsContent>

          <TabsContent value="equity">
            <EquityManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}