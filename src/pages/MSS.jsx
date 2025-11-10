
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  TrendingUp,
  UserPlus,
  Bot
} from "lucide-react";

import MSSTeamDashboard from "../components/mss/MSSTeamDashboard";
import MSSApprovals from "../components/mss/MSSApprovals";
import MSSScheduling from "../components/mss/MSSScheduling";
import MSSPerformance from "../components/mss/MSSPerformance";
import MSSHiring from "../components/mss/MSSHiring";
import MSSOnboarding from "../components/mss/MSSOnboarding"; // Added import
import AIAssistant from "../components/mss/AIAssistant";

export default function MSS() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current user
      const userData = await base44.auth.me();
      setUser(userData);

      // Find employee record for current user
      const employees = await base44.entities.Employee.list();
      const currentEmployee = employees.find(e =>
        e.work_email === userData.email ||
        e.personal_email === userData.email ||
        e.email === userData.email
      );

      if (!currentEmployee) {
        setError(isRTL ? "لم يتم العثور على سجل الموظف" : "Employee record not found");
        setLoading(false);
        return;
      }

      setEmployee(currentEmployee);

      // Load team members (employees who report to this manager)
      const team = employees.filter(e =>
        e.manager_id === currentEmployee.id &&
        e.status === "Active"
      );

      setTeamMembers(team || []);
    } catch (err) {
      console.error("Error loading MSS data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B11116] mx-auto mb-4"></div>
          <p className="text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#B11116] text-white rounded-lg hover:bg-[#991014]"
          >
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRTL ? 'الخدمة الذاتية للمديرين' : 'Manager Self-Service'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRTL
              ? `إدارة فريقك (${teamMembers.length} ${teamMembers.length === 1 ? 'عضو' : 'أعضاء'}) والموافقات والأداء`
              : `Manage your team (${teamMembers.length} ${teamMembers.length === 1 ? 'member' : 'members'}), approvals, and performance`
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger
              value="dashboard"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</span>
            </TabsTrigger>

            <TabsTrigger
              value="approvals"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <CheckSquare className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الموافقات' : 'Approvals'}</span>
            </TabsTrigger>

            <TabsTrigger
              value="scheduling"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الجدولة' : 'Scheduling'}</span>
            </TabsTrigger>

            <TabsTrigger
              value="performance"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الأداء' : 'Performance'}</span>
            </TabsTrigger>

            <TabsTrigger
              value="hiring"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'التوظيف' : 'Hiring'}</span>
            </TabsTrigger>

            <TabsTrigger
              value="onboarding"
              className={`flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الإعداد' : 'Onboarding'}</span>
            </TabsTrigger>

            <TabsTrigger
              value="assistant"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Bot className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'المساعد الذكي' : 'AI Assistant'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <MSSTeamDashboard employee={employee} teamMembers={teamMembers} />
          </TabsContent>

          <TabsContent value="approvals">
            <MSSApprovals employee={employee} teamMembers={teamMembers} />
          </TabsContent>

          <TabsContent value="scheduling">
            <MSSScheduling employee={employee} teamMembers={teamMembers} />
          </TabsContent>

          <TabsContent value="performance">
            <MSSPerformance employee={employee} teamMembers={teamMembers} />
          </TabsContent>

          <TabsContent value="hiring">
            <MSSHiring employee={employee} />
          </TabsContent>

          <TabsContent value="onboarding">
            <MSSOnboarding employee={employee} teamMembers={teamMembers} />
          </TabsContent>

          <TabsContent value="assistant">
            <AIAssistant employee={employee} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
