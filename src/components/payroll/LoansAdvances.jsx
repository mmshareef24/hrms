import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, DollarSign, FileText, Settings } from "lucide-react";

import LoanProducts from "./LoanProducts";
import ActiveLoans from "./ActiveLoans";
import LoanApplications from "./LoanApplications";
import SalaryAdvances from "./SalaryAdvances";

export default function LoansAdvances() {
  const [activeTab, setActiveTab] = useState("active");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white shadow-sm">
          <TabsTrigger 
            value="active"
            className={`data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isRTL ? 'القروض النشطة' : 'Active Loans'}
          </TabsTrigger>
          <TabsTrigger 
            value="advances"
            className={`data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {isRTL ? 'السلف' : 'Advances'}
          </TabsTrigger>
          <TabsTrigger 
            value="applications"
            className={`data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isRTL ? 'الطلبات' : 'Applications'}
          </TabsTrigger>
          <TabsTrigger 
            value="products"
            className={`data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isRTL ? 'المنتجات' : 'Products'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveLoans />
        </TabsContent>

        <TabsContent value="advances">
          <SalaryAdvances />
        </TabsContent>

        <TabsContent value="applications">
          <LoanApplications />
        </TabsContent>

        <TabsContent value="products">
          <LoanProducts />
        </TabsContent>
      </Tabs>
    </div>
  );
}