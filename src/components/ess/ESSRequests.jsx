import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Plane, DollarSign, Package, FileText } from "lucide-react";

import ESSLoanRequests from "./ESSLoanRequests";
import ESSTravelRequests from "./ESSTravelRequests";
import ESSExpenseRequests from "./ESSExpenseRequests";
import ESSAssetRequests from "./ESSAssetRequests";
import ESSLetterRequests from "./ESSLetterRequests";

export default function ESSRequests({ user }) {
  const [activeTab, setActiveTab] = useState("loans");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white shadow-sm">
          <TabsTrigger 
            value="loans"
            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden lg:inline">{isRTL ? 'القروض' : 'Loans'}</span>
          </TabsTrigger>

          <TabsTrigger 
            value="travel"
            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plane className="w-4 h-4" />
            <span className="hidden lg:inline">{isRTL ? 'السفر' : 'Travel'}</span>
          </TabsTrigger>

          <TabsTrigger 
            value="expenses"
            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="hidden lg:inline">{isRTL ? 'المصروفات' : 'Expenses'}</span>
          </TabsTrigger>

          <TabsTrigger 
            value="assets"
            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden lg:inline">{isRTL ? 'الأصول' : 'Assets'}</span>
          </TabsTrigger>

          <TabsTrigger 
            value="letters"
            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">{isRTL ? 'الخطابات' : 'Letters'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loans">
          <ESSLoanRequests user={user} />
        </TabsContent>

        <TabsContent value="travel">
          <ESSTravelRequests user={user} />
        </TabsContent>

        <TabsContent value="expenses">
          <ESSExpenseRequests user={user} />
        </TabsContent>

        <TabsContent value="assets">
          <ESSAssetRequests user={user} />
        </TabsContent>

        <TabsContent value="letters">
          <ESSLetterRequests user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}