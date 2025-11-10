import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  UserCheck
} from "lucide-react";
import { getUserRole, hasPermission, PERMISSIONS } from "@/utils";
import RoleBadge from "../components/common/RoleBadge";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    teamMembers: 0,
    pendingApprovals: 0,
    pendingLeaves: 0,
    todayAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadUserAndStats();
  }, []);

  const loadUserAndStats = async () => {
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
      
      // Load statistics based on role
      await loadStatistics(role, emp);
      
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async (role, emp) => {
    try {
      const newStats = { ...stats };

      // Total employees (for HR Admin)
      if (hasPermission(role, PERMISSIONS.VIEW_ALL_EMPLOYEES)) {
        const allEmployees = await base44.entities.Employee.list();
        newStats.totalEmployees = allEmployees.length;
      }

      // Team members (for Manager)
      if (hasPermission(role, PERMISSIONS.VIEW_TEAM_DATA) && emp) {
        const teamMembers = await base44.entities.Employee.filter({ 
          manager_id: emp.id 
        });
        newStats.teamMembers = teamMembers.length;
      }

      // Pending approvals (for Manager/HR)
      if (hasPermission(role, PERMISSIONS.APPROVE_TEAM_LEAVES) || 
          hasPermission(role, PERMISSIONS.APPROVE_LEAVES)) {
        const pendingLeaves = await base44.entities.LeaveRequest.filter({ 
          status: "Pending" 
        });
        newStats.pendingApprovals = pendingLeaves.length;
      }

      // Pending leaves
      if (emp) {
        const myPendingLeaves = await base44.entities.LeaveRequest.filter({
          employee_id: emp.id,
          status: "Pending"
        });
        newStats.pendingLeaves = myPendingLeaves.length;
      }

      // Today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await base44.entities.TimeLog.filter({ 
        date: today 
      });
      newStats.todayAttendance = todayAttendance.length;

      setStats(newStats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'مرحباً' : 'Welcome'}, {user?.full_name || 'User'}!
            </h1>
            <p className="text-gray-500 mt-1">
              {isRTL ? 'لوحة التحكم الخاصة بك' : 'Your dashboard overview'}
            </p>
          </div>
          <RoleBadge role={userRole} />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hasPermission(userRole, PERMISSIONS.VIEW_ALL_EMPLOYEES) && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'إجمالي الموظفين' : 'Total Employees'}
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {stats.totalEmployees}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          )}

          {hasPermission(userRole, PERMISSIONS.VIEW_TEAM_DATA) && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'أعضاء الفريق' : 'Team Members'}
                    </p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.teamMembers}
                    </p>
                  </div>
                  <UserCheck className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>
          )}

          {(hasPermission(userRole, PERMISSIONS.APPROVE_TEAM_LEAVES) || 
            hasPermission(userRole, PERMISSIONS.APPROVE_LEAVES)) && (
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'الموافقات المعلقة' : 'Pending Approvals'}
                    </p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {stats.pendingApprovals}
                    </p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'طلبات الإجازة' : 'Leave Requests'}
                  </p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {stats.pendingLeaves}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-teal-50 to-teal-100">
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-600">
                    {isRTL ? 'الحضور اليوم' : 'Attendance Today'}
                  </p>
                  <p className="text-3xl font-bold text-teal-600 mt-2">
                    {stats.todayAttendance}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-teal-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'الإجراءات السريعة' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-600 hover:shadow-md transition-all">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {isRTL ? 'طلب إجازة' : 'Request Leave'}
                </p>
              </button>

              <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-600 hover:shadow-md transition-all">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {isRTL ? 'كشف الراتب' : 'View Payslip'}
                </p>
              </button>

              {hasPermission(userRole, PERMISSIONS.VIEW_TEAM_DATA) && (
                <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-600 hover:shadow-md transition-all">
                  <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {isRTL ? 'إدارة الفريق' : 'Manage Team'}
                  </p>
                </button>
              )}

              {hasPermission(userRole, PERMISSIONS.VIEW_ALL_EMPLOYEES) && (
                <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-600 hover:shadow-md transition-all">
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {isRTL ? 'إدارة الموظفين' : 'Manage Employees'}
                  </p>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}