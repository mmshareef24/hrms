
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  BookOpen,
  Bell,
  CreditCard,
  Plane,
  Receipt,
  Package,
  Mail,
  Sparkles,
  UserPlus // Added UserPlus icon
} from "lucide-react";

import ESSProfile from "../components/ess/ESSProfile";
import ESSLeaveAttendance from "../components/ess/ESSLeaveAttendance";
import ESSPayroll from "../components/ess/ESSPayroll";
import ESSRequests from "../components/ess/ESSRequests";
import ESSPerformance from "../components/ess/ESSPerformance";
import ESSLearning from "../components/ess/ESSLearning";
import ESSLoanRequests from "../components/ess/ESSLoanRequests";
import ESSTravelRequests from "../components/ess/ESSTravelRequests";
import ESSExpenseRequests from "../components/ess/ESSExpenseRequests";
import ESSAssetRequests from "../components/ess/ESSAssetRequests";
import ESSLetterRequests from "../components/ess/ESSLetterRequests";
import ESSInsights from "../components/ess/ESSInsights";
import NotificationCenter from "../components/ess/NotificationCenter";
import NotificationPreferences from "../components/ess/NotificationPreferences";
import ESSOnboarding from "../components/ess/ESSOnboarding"; // Added ESSOnboarding import

export default function ESS() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    // Check URL parameters for tab and set activeTab
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    // Load user data
    loadUser();
  }, []); // Run once on component mount

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null); // Ensure user is null on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{isRTL ? 'فشل تحميل بيانات المستخدم' : 'Failed to load user data'}</p>
          <p className="text-gray-500 text-sm mt-2">{isRTL ? 'يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا.' : 'Please refresh the page or try again later.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-6 md:mb-8 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {isRTL ? 'الخدمة الذاتية للموظفين' : 'Employee Self-Service'}
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            {isRTL
              ? 'إدارة معلوماتك وطلباتك الشخصية'
              : 'Manage your personal information and requests'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            {/* Updated grid-cols-13 to grid-cols-14 to accommodate the new tab */}
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-14 lg:w-auto lg:inline-grid bg-white shadow-sm p-1 gap-1">
              {/* New Insights Tab Trigger */}
              <TabsTrigger
                value="insights"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'رؤى ذكية' : 'AI Insights'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="profile"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'الملف الشخصي' : 'Profile'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="attendance"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'الحضور' : 'Attendance'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="payroll"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'الرواتب' : 'Payroll'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="requests"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'الطلبات' : 'Requests'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="performance"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'الأداء' : 'Performance'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="learning"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'التعلم' : 'Learning'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="loans"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'القروض' : 'Loans'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="travel"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plane className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'السفر' : 'Travel'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="expenses"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Receipt className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'المصروفات' : 'Expenses'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="assets"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Package className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'الأصول' : 'Assets'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="letters"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'الخطابات' : 'Letters'}</span>
              </TabsTrigger>
              
              {/* New Onboarding Tab Trigger */}
              <TabsTrigger
                value="onboarding"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <UserPlus className="w-4 h-4 flex-shrink-0" />
                <span>{isRTL ? 'الإعداد' : 'Onboarding'}</span>
              </TabsTrigger>

              <TabsTrigger
                value="notifications"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Bell className="w-4 h-4 flex-shrink-0 lg:mr-2" />
                <span className="hidden lg:inline">{isRTL ? 'الإشعارات' : 'Notifications'}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* New Insights Tab Content */}
          <TabsContent value="insights">
            <ESSInsights user={user} />
          </TabsContent>

          <TabsContent value="profile">
            <ESSProfile user={user} />
          </TabsContent>

          <TabsContent value="attendance">
            <ESSLeaveAttendance user={user} />
          </TabsContent>

          <TabsContent value="payroll">
            <ESSPayroll user={user} />
          </TabsContent>

          <TabsContent value="requests">
            <ESSRequests user={user} />
          </TabsContent>

          <TabsContent value="performance">
            <ESSPerformance user={user} />
          </TabsContent>

          <TabsContent value="learning">
            <ESSLearning user={user} />
          </TabsContent>

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

          {/* New Onboarding Tab Content */}
          <TabsContent value="onboarding">
            <ESSOnboarding user={user} />
          </TabsContent>

          <TabsContent value="notifications">
            {window.location.search.includes('settings=true') ? (
              <NotificationPreferences user={user} />
            ) : (
              <NotificationCenter user={user} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
