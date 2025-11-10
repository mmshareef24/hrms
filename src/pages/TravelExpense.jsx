import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Receipt, 
  DollarSign, 
  FileText,
  Settings,
  BarChart3
} from "lucide-react";

import TravelRequests from "../components/travel/TravelRequests";
import ExpenseClaims from "../components/travel/ExpenseClaims";
import TravelAdvances from "../components/travel/TravelAdvances";
import ExpensePolicies from "../components/travel/ExpensePolicies";
import ExpenseReports from "../components/travel/ExpenseReports";

export default function TravelExpense() {
  const [activeTab, setActiveTab] = useState("travel");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'السفر والمصروفات' : 'Travel & Expense'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'إدارة طلبات السفر والمطالبات بالمصروفات' 
              : 'Manage travel requests and expense claims'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="travel" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Plane className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'طلبات السفر' : 'Travel Requests'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="expenses"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المطالبات' : 'Expense Claims'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="advances"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'السلف' : 'Advances'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="reports"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التقارير' : 'Reports'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="policies"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'السياسات' : 'Policies'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="travel">
            <TravelRequests />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseClaims />
          </TabsContent>

          <TabsContent value="advances">
            <TravelAdvances />
          </TabsContent>

          <TabsContent value="reports">
            <ExpenseReports />
          </TabsContent>

          <TabsContent value="policies">
            <ExpensePolicies />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}