import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import AttendanceCorrectionForm from "./AttendanceCorrectionForm";

export default function ESSLeaveAttendance({ user }) {
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (user && user.email) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user || !user.email) {
      setLoading(false);
      setError("User data is not available. Please ensure you are logged in correctly.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get employee
      const employees = await base44.entities.Employee.filter({ work_email: user.email });
      if (employees.length === 0) {
        setLoading(false);
        setError("Employee not found for the given user email.");
        return;
      }
      
      const emp = employees[0];
      setEmployee(emp);
      
      // Load leave balances, requests, attendance, and correction requests with error handling
      try {
        const balances = await base44.entities.LeaveBalance.filter({ employee_id: emp.id });
        setLeaveBalances(balances || []);
      } catch (e) {
        console.log("No leave balances:", e);
        setLeaveBalances([]);
      }

      try {
        const requests = await base44.entities.LeaveRequest.filter({ employee_id: emp.id }, '-created_date', 10);
        setLeaveRequests(requests || []);
      } catch (e) {
        console.log("No leave requests:", e);
        setLeaveRequests([]);
      }

      try {
        const attendanceRecords = await base44.entities.TimeLog.filter({ employee_id: emp.id }, '-date', 10);
        setAttendance(attendanceRecords || []);
      } catch (e) {
        console.log("No attendance records:", e);
        setAttendance([]);
      }

      try {
        const corrections = await base44.entities.AttendanceException.filter({ employee_id: emp.id }, '-created_date', 10);
        setCorrectionRequests(corrections || []);
      } catch (e) {
        console.log("No correction requests:", e);
        setCorrectionRequests([]);
      }
      
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectionSubmit = async (correctionData) => {
    try {
      await base44.entities.AttendanceException.create({
        employee_id: employee.id,
        employee_name: employee.full_name,
        exception_date: correctionData.date,
        exception_type: correctionData.exception_type,
        requested_clock_in: correctionData.requested_clock_in,
        requested_clock_out: correctionData.requested_clock_out,
        reason: correctionData.reason,
        status: "Pending"
      });
      
      // Send email notification to manager if available
      if (employee.manager_name) {
        const managers = await base44.entities.Employee.filter({ full_name: employee.manager_name });
        if (managers.length > 0 && managers[0].work_email) {
          await base44.integrations.Core.SendEmail({
            to: managers[0].work_email,
            subject: `Attendance Correction Request - ${employee.full_name}`,
            body: `${employee.full_name} has submitted an attendance correction request.\n\n` +
                  `Date: ${correctionData.date}\n` +
                  `Type: ${correctionData.exception_type}\n` +
                  `Requested Clock In: ${correctionData.requested_clock_in || 'N/A'}\n` +
                  `Requested Clock Out: ${correctionData.requested_clock_out || 'N/A'}\n` +
                  `Reason: ${correctionData.reason}\n\n` +
                  `Please review and approve/reject this request in the system.`
          });
        }
      }
      
      setShowCorrectionForm(false);
      await loadData();
    } catch (err) {
      console.error("Error submitting correction:", err);
      alert(isRTL ? "حدث خطأ في تقديم الطلب" : "Error submitting correction request");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-600">{error}</p>
          <Button onClick={loadData} className="mt-4">
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showCorrectionForm) {
    return (
      <AttendanceCorrectionForm
        employee={employee}
        attendance={attendance}
        onSubmit={handleCorrectionSubmit}
        onCancel={() => setShowCorrectionForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Leave Balances */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'أرصدة الإجازات' : 'Leave Balances'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {leaveBalances.map((balance) => (
              <div key={balance.id} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-gray-600">{balance.leave_type_name}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {balance.current_balance || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isRTL ? 'أيام متاحة' : 'days available'}
                </p>
              </div>
            ))}
            {leaveBalances.length === 0 && (
              <p className="text-gray-500 col-span-3 text-center py-8">
                {isRTL ? 'لا توجد أرصدة إجازات' : 'No leave balances available'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Leave Requests */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle>{isRTL ? 'طلبات الإجازة الأخيرة' : 'Recent Leave Requests'}</CardTitle>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'طلب إجازة' : 'Request Leave'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {leaveRequests.map((request) => (
              <div key={request.id} className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-medium text-gray-900">{request.leave_type_name}</p>
                  <p className="text-sm text-gray-500">
                    {request.start_date && request.end_date && 
                      `${format(parseISO(request.start_date), 'MMM dd')} - ${format(parseISO(request.end_date), 'MMM dd, yyyy')}`
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {request.days_count} {isRTL ? 'أيام' : 'days'}
                  </p>
                </div>
                <Badge 
                  variant="secondary"
                  className={
                    request.status === "Approved" 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : request.status === "Rejected"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-orange-100 text-orange-800 border-orange-200"
                  }
                >
                  {request.status}
                </Badge>
              </div>
            ))}
            {leaveRequests.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                {isRTL ? 'لا توجد طلبات إجازة' : 'No leave requests'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="w-5 h-5 text-green-600" />
              <span>{isRTL ? 'الحضور الأخير' : 'Recent Attendance'}</span>
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowCorrectionForm(true)}
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <AlertCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'طلب تصحيح' : 'Request Correction'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {attendance.map((record) => (
              <div key={record.id} className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-medium text-gray-900">
                    {record.date && format(parseISO(record.date), 'EEEE, MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {record.clock_in || '-'} → {record.clock_out || '-'}
                  </p>
                </div>
                <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                  <p className="text-sm font-medium text-gray-900">
                    {record.total_hours ? `${record.total_hours}h` : '-'}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
            {attendance.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                {isRTL ? 'لا توجد سجلات حضور' : 'No attendance records'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Correction Requests */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>{isRTL ? 'طلبات التصحيح' : 'Correction Requests'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {correctionRequests.map((request) => (
              <div key={request.id} className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">
                      {request.exception_date && format(parseISO(request.exception_date), 'MMM dd, yyyy')}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {request.exception_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {isRTL ? 'المطلوب: ' : 'Requested: '}
                    {request.requested_clock_in || '-'} → {request.requested_clock_out || '-'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isRTL ? 'السبب: ' : 'Reason: '}{request.reason}
                  </p>
                </div>
                <Badge 
                  className={
                    request.status === "Approved" 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : request.status === "Rejected"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-orange-100 text-orange-800 border-orange-200"
                  }
                >
                  {request.status}
                </Badge>
              </div>
            ))}
            {correctionRequests.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                {isRTL ? 'لا توجد طلبات تصحيح' : 'No correction requests'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}