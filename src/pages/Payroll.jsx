
import React, { useState, useEffect } from "react";
import { Payroll, Employee, TimeLog } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileSpreadsheet, CheckCircle } from "lucide-react";

import PayrollGeneration from "../components/payroll/PayrollGeneration";
import PayrollList from "../components/payroll/PayrollList";
import PayrollSummary from "../components/payroll/PayrollSummary";

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("generate");
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (activeTab === "records") {
      loadPayrolls();
    }
  }, [activeTab]);

  const loadPayrolls = async () => {
    setLoading(true);
    const data = await Payroll.list("-year,-month");
    setPayrolls(data);
    setLoading(false);
  };

  const handlePayrollGenerated = () => {
    setActiveTab("records");
    loadPayrolls();
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'إدارة الرواتب' : 'Payroll Management'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL ? 'إنشاء وإدارة رواتب الموظفين مع تكامل الوقت' : 'Generate and manage employee payroll with time integration'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="generate" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? 'إنشاء الرواتب' : 'Generate Payroll'}</span>
              <span className="sm:hidden">{isRTL ? 'إنشاء' : 'Generate'}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="records"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? 'سجلات الرواتب' : 'Payroll Records'}</span>
              <span className="sm:hidden">{isRTL ? 'السجلات' : 'Records'}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="summary"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? 'الملخص' : 'Summary'}</span>
              <span className="sm:hidden">{isRTL ? 'الملخص' : 'Summary'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <PayrollGeneration onGenerated={handlePayrollGenerated} />
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <PayrollList 
              payrolls={payrolls}
              loading={loading}
              onUpdate={loadPayrolls}
            />
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <PayrollSummary payrolls={payrolls} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
