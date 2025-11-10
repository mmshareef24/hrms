
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CalendarDays, 
  Timer,
  Settings,
  AlertCircle,
  FileSpreadsheet,
  MapPin,
  FileText
} from "lucide-react";
import { hasPermission, getUserRole, PERMISSIONS } from "@/utils";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleBadge from "../components/common/RoleBadge";

import TimePunch from "../components/time/TimePunch";
import ShiftManagement from "../components/time/ShiftManagement";
import AttendanceRules from "../components/time/AttendanceRules";
import LeaveManagement from "../components/time/LeaveManagement";
import AttendanceExceptions from "../components/time/AttendanceExceptions";
import Timesheets from "../components/time/Timesheets";
import HolidayCalendar from "../components/time/HolidayCalendar";
import Forms from "../components/time/Forms";

import LeaveRequestList from "../components/leave/LeaveRequestList"; // Not used in this file but included as per outline
import LeaveRequestForm from "../components/leave/LeaveRequestForm"; // Not used in this file but included as per outline
import LeaveBalances from "../components/leave/LeaveBalances"; // Not used in this file but included as per outline
import LeaveTypes from "../components/leave/LeaveTypes"; // Not used in this file but included as per outline
import LeaveCalendar from "../components/leave/LeaveCalendar"; // Not used in this file but included as per outline
import LeaveAccrualManagement from "../components/leave/LeaveAccrualManagement"; // Not used in this file but included as per outline
import LeaveWorkflowConfig from "../components/leave/LeaveWorkflowConfig";

export default function TimeManagement() {
  const [activeTab, setActiveTab] = useState("punch");
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRTL = typeof document !== 'undefined' ? document.documentElement.getAttribute('dir') === 'rtl' : false;

  useEffect(() => {
    loadUserAndRole();
  }, []);

  const loadUserAndRole = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Try to find employee record
      const employees = await base44.entities.Employee.filter({ 
        work_email: userData.email 
      });
      
      const emp = employees.length > 0 ? employees[0] : null;
      setEmployee(emp);
      
      // Determine user role
      const role = getUserRole(userData, emp);
      setUserRole(role);
      
      // Set default tab based on role
      if (role === 'HR Admin' || role === 'Manager') {
        setActiveTab('leaves');
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const canManageShifts = hasPermission(userRole, PERMISSIONS.MANAGE_SHIFTS);
  const canManageRules = hasPermission(userRole, PERMISSIONS.MANAGE_ATTENDANCE_RULES);
  const canManageHolidays = hasPermission(userRole, PERMISSIONS.MANAGE_HOLIDAYS);
  const canViewAllExceptions = hasPermission(userRole, PERMISSIONS.VIEW_ALL_ATTENDANCE);
  const canViewTimesheets = hasPermission(userRole, PERMISSIONS.VIEW_OWN_ATTENDANCE) || 
                            hasPermission(userRole, PERMISSIONS.VIEW_ALL_ATTENDANCE);
  const canManageWorkflow = hasPermission(userRole, PERMISSIONS.MANAGE_LEAVE_TYPES);

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 ${isRTL ? 'text-right' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'إدارة الوقت' : 'Time Management'}
            </h1>
            <RoleBadge role={userRole} />
          </div>
          <p className="text-gray-500 mt-2">
            {isRTL 
              ? 'نظام شامل لإدارة الحضور والانصراف والورديات' 
              : 'Comprehensive attendance, shifts, and time tracking system'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 lg:w-auto lg:inline-grid bg-white shadow-sm p-1">
            <TabsTrigger 
              value="punch" 
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'البصمة' : 'Punch'}</span>
            </TabsTrigger>
            
            {canManageShifts && (
              <TabsTrigger 
                value="shifts"
                className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Timer className="w-4 h-4" />
                <span className="hidden lg:inline">{isRTL ? 'الورديات' : 'Shifts'}</span>
              </TabsTrigger>
            )}

            {canManageRules && (
              <TabsTrigger 
                value="rules"
                className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">{isRTL ? 'القواعد' : 'Rules'}</span>
              </TabsTrigger>
            )}

            <TabsTrigger 
              value="leaves"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'الإجازات' : 'Leaves'}</span>
            </TabsTrigger>

            {canManageWorkflow && (
              <TabsTrigger 
                value="workflow"
                className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden lg:inline">{isRTL ? 'سير العمل' : 'Workflow'}</span>
              </TabsTrigger>
            )}

            {canManageHolidays && (
              <TabsTrigger 
                value="holidays"
                className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden lg:inline">{isRTL ? 'العطلات' : 'Holidays'}</span>
              </TabsTrigger>
            )}

            {canViewAllExceptions && (
              <TabsTrigger 
                value="exceptions"
                className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="hidden lg:inline">{isRTL ? 'الاستثناءات' : 'Exceptions'}</span>
              </TabsTrigger>
            )}

            {canViewTimesheets && (
              <TabsTrigger 
                value="timesheets"
                className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden lg:inline">{isRTL ? 'السجلات' : 'Timesheets'}</span>
              </TabsTrigger>
            )}

            <TabsTrigger 
              value="forms"
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">{isRTL ? 'النماذج' : 'Forms'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="punch">
            <TimePunch user={user} employee={employee} />
          </TabsContent>

          {canManageShifts && (
            <TabsContent value="shifts">
              <ProtectedRoute hasAccess={canManageShifts}>
                <ShiftManagement />
              </ProtectedRoute>
            </TabsContent>
          )}

          {canManageRules && (
            <TabsContent value="rules">
              <ProtectedRoute hasAccess={canManageRules}>
                <AttendanceRules />
              </ProtectedRoute>
            </TabsContent>
          )}

          <TabsContent value="leaves">
            <LeaveManagement userRole={userRole} employee={employee} />
          </TabsContent>

          {canManageWorkflow && (
            <TabsContent value="workflow">
              <ProtectedRoute hasAccess={canManageWorkflow}>
                <LeaveWorkflowConfig />
              </ProtectedRoute>
            </TabsContent>
          )}

          {canManageHolidays && (
            <TabsContent value="holidays">
              <ProtectedRoute hasAccess={canManageHolidays}>
                <HolidayCalendar />
              </ProtectedRoute>
            </TabsContent>
          )}

          {canViewAllExceptions && (
            <TabsContent value="exceptions">
              <ProtectedRoute hasAccess={canViewAllExceptions}>
                <AttendanceExceptions userRole={userRole} employee={employee} />
              </ProtectedRoute>
            </TabsContent>
          )}

          {canViewTimesheets && (
            <TabsContent value="timesheets">
              <ProtectedRoute hasAccess={canViewTimesheets}>
                <Timesheets userRole={userRole} employee={employee} />
              </ProtectedRoute>
            </TabsContent>
          )}

          <TabsContent value="forms">
            <Forms user={user} employee={employee} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
