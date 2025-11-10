
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  Shield, 
  Hash,
  FileText,
  Settings,
  Link as LinkIcon,
  Bell // Added Bell icon
} from "lucide-react";

import WorkflowManagement from "../components/admin/WorkflowManagement";
import RolesPermissions from "../components/admin/RolesPermissions";
import NumberRanges from "../components/admin/NumberRanges";
import AuditLogs from "../components/admin/AuditLogs";
import SystemSettings from "../components/admin/SystemSettings";
import IntegrationHub from "../components/admin/IntegrationHub";
import NotificationManagement from "../components/admin/NotificationManagement"; // Added NotificationManagement import

export default function Administration() {
  const [activeTab, setActiveTab] = useState("workflows");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'الإدارة والإعدادات' : 'Administration & Settings'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'إدارة سير العمل، الأدوار، والإعدادات' 
              : 'Manage workflows, roles, and system settings'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Updated grid-cols-6 to grid-cols-7 */}
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 bg-white shadow-sm p-1">
            <TabsTrigger 
              value="workflows" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <GitBranch className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'سير العمل' : 'Workflows'}</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="roles"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الأدوار' : 'Roles'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="numbers"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Hash className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التسلسلات' : 'Numbers'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="audit"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'السجلات' : 'Audit'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="integrations"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <LinkIcon className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التكاملات' : 'Integrations'}</span>
            </TabsTrigger>

            {/* New Notifications Tab Trigger */}
            <TabsTrigger 
              value="notifications"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Bell className="w-4 h-4" /> {/* Bell icon */}
              <span className="hidden lg:inline">{isRTL ? 'الإشعارات' : 'Notifications'}</span>
            </TabsTrigger>

            <TabsTrigger 
              value="settings"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الإعدادات' : 'Settings'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows">
            <WorkflowManagement />
          </TabsContent>

          <TabsContent value="roles">
            <RolesPermissions />
          </TabsContent>

          <TabsContent value="numbers">
            <NumberRanges />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogs />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationHub />
          </TabsContent>

          {/* New Notifications Tab Content */}
          <TabsContent value="notifications">
            <NotificationManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
