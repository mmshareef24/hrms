import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, FileText, List, UserX } from "lucide-react";

import EOSBCalculator from "./EOSBCalculator";
import EOSBList from "./EOSBList";
import EOSBClearance from "./EOSBClearance";

export default function EOSBManagement() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [eosbRecords, setEosbRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadEOSBRecords();
  }, []);

  const loadEOSBRecords = async () => {
    setLoading(true);
    try {
      const records = await base44.entities.EOSB.list('-created_date');
      setEosbRecords(records || []);
    } catch (error) {
      console.error("Error loading EOSB records:", error);
      setEosbRecords([]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
          <TabsTrigger 
            value="calculator"
            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Calculator className="w-4 h-4" />
            {isRTL ? 'حاسبة المكافأة' : 'EOSB Calculator'}
          </TabsTrigger>

          <TabsTrigger 
            value="list"
            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <List className="w-4 h-4" />
            {isRTL ? 'السجلات' : 'Records'}
          </TabsTrigger>

          <TabsTrigger 
            value="clearance"
            className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <UserX className="w-4 h-4" />
            {isRTL ? 'المخالصات' : 'Clearance'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <EOSBCalculator onSave={loadEOSBRecords} />
        </TabsContent>

        <TabsContent value="list">
          <EOSBList records={eosbRecords} loading={loading} onRefresh={loadEOSBRecords} />
        </TabsContent>

        <TabsContent value="clearance">
          <EOSBClearance records={eosbRecords} onRefresh={loadEOSBRecords} />
        </TabsContent>
      </Tabs>
    </div>
  );
}