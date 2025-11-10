import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function LeaveRequestForm({ request, employees, leaveTypes, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    leave_type_id: "",
    leave_type_name: "",
    leave_category: "",
    start_date: "",
    end_date: "",
    days_count: 0,
    half_day: false,
    reason: "",
    contact_during_leave: "",
    status: "Pending"
  });

  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceWarning, setBalanceWarning] = useState(null);
  const [saving, setSaving] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (request) {
      setFormData(request);
      // Load balance for existing request
      if (request.employee_id && request.leave_type_id) {
        fetchLeaveBalance(request.employee_id, request.leave_type_id);
      }
    } else {
      resetForm();
    }
  }, [request]);

  // Fetch leave balance when employee and leave type are selected
  useEffect(() => {
    if (formData.employee_id && formData.leave_type_id) {
      fetchLeaveBalance(formData.employee_id, formData.leave_type_id);
    }
  }, [formData.employee_id, formData.leave_type_id]);

  // Calculate projected balance when dates change
  useEffect(() => {
    if (leaveBalance && formData.days_count > 0) {
      calculateBalanceWarning();
    } else {
      setBalanceWarning(null);
    }
  }, [leaveBalance, formData.days_count]);

  const resetForm = () => {
    setFormData({
      employee_id: "",
      employee_name: "",
      leave_type_id: "",
      leave_type_name: "",
      leave_category: "",
      start_date: "",
      end_date: "",
      days_count: 0,
      half_day: false,
      reason: "",
      contact_during_leave: "",
      status: "Pending"
    });
    setLeaveBalance(null);
    setBalanceWarning(null);
  };

  const fetchLeaveBalance = async (employeeId, leaveTypeId) => {
    setLoadingBalance(true);
    try {
      const currentYear = new Date().getFullYear();
      const balances = await base44.entities.LeaveBalance.filter({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year: currentYear
      });

      if (balances.length > 0) {
        setLeaveBalance(balances[0]);
      } else {
        // Create initial balance if doesn't exist
        const leaveType = leaveTypes.find(lt => lt.id === leaveTypeId);
        setLeaveBalance({
          current_balance: leaveType?.max_days_per_year || 0,
          used: 0,
          pending: 0
        });
      }
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      setLeaveBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  const calculateBalanceWarning = () => {
    if (!leaveBalance) return;

    const availableBalance = leaveBalance.current_balance || 0;
    const requestedDays = formData.days_count;
    const projectedBalance = availableBalance - requestedDays;

    if (requestedDays > availableBalance) {
      setBalanceWarning({
        type: "error",
        message: isRTL 
          ? `طلبك يتجاوز الرصيد المتاح بـ ${requestedDays - availableBalance} يوم`
          : `Your request exceeds available balance by ${requestedDays - availableBalance} day(s)`,
        canSubmit: false
      });
    } else if (projectedBalance < 2 && projectedBalance >= 0) {
      setBalanceWarning({
        type: "warning",
        message: isRTL 
          ? `تنبيه: سيتبقى لك ${projectedBalance} يوم فقط بعد هذا الطلب`
          : `Warning: You will have only ${projectedBalance} day(s) remaining after this request`,
        canSubmit: true
      });
    } else if (projectedBalance >= 2) {
      setBalanceWarning({
        type: "success",
        message: isRTL 
          ? `سيتبقى لك ${projectedBalance} يوم بعد هذا الطلب`
          : `You will have ${projectedBalance} day(s) remaining after this request`,
        canSubmit: true
      });
    } else {
      setBalanceWarning(null);
    }
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setFormData({
        ...formData,
        employee_id: employeeId,
        employee_name: employee.full_name
      });
    }
  };

  const handleLeaveTypeChange = (leaveTypeId) => {
    const leaveType = leaveTypes.find(lt => lt.id === leaveTypeId);
    if (leaveType) {
      setFormData({
        ...formData,
        leave_type_id: leaveTypeId,
        leave_type_name: leaveType.leave_type_name,
        leave_category: leaveType.leave_category
      });
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;
    return differenceInDays(endDate, startDate) + 1;
  };

  const handleStartDateChange = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const days = formData.end_date ? calculateDays(dateStr, formData.end_date) : 0;
    setFormData({
      ...formData,
      start_date: dateStr,
      days_count: days
    });
  };

  const handleEndDateChange = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const days = formData.start_date ? calculateDays(formData.start_date, dateStr) : 0;
    setFormData({
      ...formData,
      end_date: dateStr,
      days_count: days
    });
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.leave_type_id || !formData.start_date || !formData.end_date) {
      alert(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }

    if (balanceWarning && !balanceWarning.canSubmit) {
      alert(isRTL 
        ? "لا يمكن تقديم الطلب: الرصيد غير كافٍ"
        : "Cannot submit: Insufficient leave balance");
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      resetForm();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle>
            {request 
              ? (isRTL ? 'تعديل طلب إجازة' : 'Edit Leave Request')
              : (isRTL ? 'طلب إجازة جديد' : 'New Leave Request')
            }
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Employee Selection */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'الموظف' : 'Employee'} *
            </Label>
            <Select value={formData.employee_id} onValueChange={handleEmployeeChange}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? "اختر الموظف" : "Select Employee"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.employee_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leave Type Selection */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'نوع الإجازة' : 'Leave Type'} *
            </Label>
            <Select value={formData.leave_type_id} onValueChange={handleLeaveTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? "اختر نوع الإجازة" : "Select Leave Type"} />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((lt) => (
                  <SelectItem key={lt.id} value={lt.id}>
                    {isRTL ? lt.leave_type_name_arabic || lt.leave_type_name : lt.leave_type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leave Balance Display */}
          {formData.employee_id && formData.leave_type_id && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-600 mb-1">
                    {isRTL ? 'الرصيد الحالي' : 'Current Balance'}
                  </p>
                  {loadingBalance ? (
                    <div className="animate-pulse h-8 w-20 bg-blue-200 rounded"></div>
                  ) : leaveBalance ? (
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-blue-600">
                        {leaveBalance.current_balance || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'يوم متاح' : 'days available'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {isRTL ? 'لا توجد بيانات رصيد' : 'No balance data'}
                    </p>
                  )}
                </div>
                
                {leaveBalance && (
                  <div className={`text-sm space-y-1 ${isRTL ? 'text-left' : 'text-right'}`}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        {isRTL ? 'مستخدم: ' : 'Used: '}{leaveBalance.used || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        {isRTL ? 'معلق: ' : 'Pending: '}{leaveBalance.pending || 0}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'من تاريخ' : 'Start Date'} *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {formData.start_date ? format(parseISO(formData.start_date), 'PPP') : (isRTL ? 'اختر التاريخ' : 'Pick a date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? parseISO(formData.start_date) : undefined}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'إلى تاريخ' : 'End Date'} *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {formData.end_date ? format(parseISO(formData.end_date), 'PPP') : (isRTL ? 'اختر التاريخ' : 'Pick a date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date ? parseISO(formData.end_date) : undefined}
                    onSelect={handleEndDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Days Count Display */}
          {formData.days_count > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-gray-600">
                  {isRTL ? 'إجمالي الأيام المطلوبة' : 'Total Days Requested'}
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formData.days_count} {isRTL ? 'يوم' : 'day(s)'}
                </span>
              </div>
            </div>
          )}

          {/* Balance Warning/Info */}
          {balanceWarning && (
            <Alert className={
              balanceWarning.type === 'error' 
                ? 'border-red-500 bg-red-50' 
                : balanceWarning.type === 'warning'
                ? 'border-orange-500 bg-orange-50'
                : 'border-green-500 bg-green-50'
            }>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {balanceWarning.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                {balanceWarning.type === 'warning' && <Info className="h-5 w-5 text-orange-600" />}
                {balanceWarning.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                <AlertDescription className={
                  balanceWarning.type === 'error' 
                    ? 'text-red-800 font-medium' 
                    : balanceWarning.type === 'warning'
                    ? 'text-orange-800'
                    : 'text-green-800'
                }>
                  {balanceWarning.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Reason */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'السبب' : 'Reason'}
            </Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows={3}
              className={isRTL ? 'text-right' : ''}
              placeholder={isRTL ? "اذكر سبب الإجازة..." : "Enter reason for leave..."}
            />
          </div>

          {/* Contact Info */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'معلومات الاتصال أثناء الإجازة' : 'Contact During Leave'}
            </Label>
            <Input
              value={formData.contact_during_leave}
              onChange={(e) => setFormData({...formData, contact_during_leave: e.target.value})}
              placeholder={isRTL ? "رقم الهاتف أو البريد الإلكتروني" : "Phone or email"}
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Actions */}
          <div className={`flex gap-3 justify-end ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" onClick={onCancel}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={saving || (balanceWarning && !balanceWarning.canSubmit)}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}