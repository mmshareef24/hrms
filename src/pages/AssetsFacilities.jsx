import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Laptop, 
  Package, 
  Wrench, 
  IdCard,
  Building2,
  BarChart3
} from "lucide-react";

import AssetInventory from "../components/assets/AssetInventory";
import AssetAssignments from "../components/assets/AssetAssignments";
import AssetMaintenance from "../components/assets/AssetMaintenance";
import FacilityRequests from "../components/assets/FacilityRequests";
import AssetReports from "../components/assets/AssetReports";

export default function AssetsFacilities() {
  const [activeTab, setActiveTab] = useState("inventory");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'الأصول والمرافق' : 'Assets & Facilities'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'إدارة الأصول والمعدات وطلبات المرافق' 
              : 'Manage company assets, equipment, and facility requests'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="inventory" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المخزون' : 'Inventory'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="assignments"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Laptop className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التخصيصات' : 'Assignments'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="maintenance"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Wrench className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الصيانة' : 'Maintenance'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="facilities"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <IdCard className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المرافق' : 'Facilities'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="reports"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التقارير' : 'Reports'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <AssetInventory />
          </TabsContent>

          <TabsContent value="assignments">
            <AssetAssignments />
          </TabsContent>

          <TabsContent value="maintenance">
            <AssetMaintenance />
          </TabsContent>

          <TabsContent value="facilities">
            <FacilityRequests />
          </TabsContent>

          <TabsContent value="reports">
            <AssetReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}