
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Calculator, 
  FileSpreadsheet, 
  TrendingUp,
  CreditCard,
  Wallet,
  FileCheck,
  Building2
} from "lucide-react";

import PayStructureManagement from "../components/payroll/PayStructureManagement";
import PayrollProcessing from "../components/payroll/PayrollProcessing";
import LoansAdvances from "../components/payroll/LoansAdvances";
import ReimbursementManagement from "../components/payroll/ReimbursementManagement";
import FinalSettlementManagement from "../components/payroll/FinalSettlementManagement";
import BankFilesWPS from "../components/payroll/BankFilesWPS";
import GLPosting from "../components/payroll/GLPosting";
import EOSBManagement from "../components/payroll/EOSBManagement"; // New import for EOSB Management

export default function PayrollCompensation() {
  const [activeTab, setActiveTab] = useState("processing");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'الرواتب والتعويضات' : 'Payroll & Compensation'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'نظام متكامل للرواتب متوافق مع الأنظمة السعودية (GOSI، WPS، EOSB)'
              : 'Comprehensive payroll system with Saudi compliance (GOSI, WPS, EOSB)'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-8 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="processing" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'معالجة الرواتب' : 'Processing'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="structure"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'هيكل الرواتب' : 'Pay Structure'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="loans"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'السلف والقروض' : 'Loans'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="reimbursement"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المصروفات' : 'Claims'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="eosb" // Changed from "settlement" to "eosb"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileCheck className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'مكافأة نهاية الخدمة' : 'EOSB'}</span> {/* Updated text */}
            </TabsTrigger>

            <TabsTrigger 
              value="banks"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'ملفات WPS' : 'WPS Files'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="gl"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الترحيل المحاسبي' : 'GL Posting'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="processing">
            <PayrollProcessing />
          </TabsContent>

          <TabsContent value="structure">
            <PayStructureManagement />
          </TabsContent>

          <TabsContent value="loans">
            <LoansAdvances />
          </TabsContent>

          <TabsContent value="reimbursement">
            <ReimbursementManagement />
          </TabsContent>

          <TabsContent value="eosb"> {/* Changed from "settlement" to "eosb" */}
            <EOSBManagement /> {/* Changed from FinalSettlementManagement to EOSBManagement */}
          </TabsContent>

          <TabsContent value="banks">
            <BankFilesWPS />
          </TabsContent>

          <TabsContent value="gl">
            <GLPosting />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
