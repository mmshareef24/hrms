import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Save, FileText, AlertCircle } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

export default function EOSBCalculator({ onSave }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    company_id: "",
    company_name: "",
    resignation_date: "",
    last_working_day: "",
    termination_type: "Resignation",
    notice_period_days: 60,
    notice_period_served: true,
    service_years: 0,
    service_months: 0,
    service_days: 0,
    total_service_days: 0,
    last_basic_salary: 0,
    last_housing_allowance: 0,
    gosi_salary: 0,
    earned_salary: 0,
    unused_leave_days: 0,
    leave_encashment: 0,
    eosb_calculation_method: "",
    eosb_first_5_years: 0,
    eosb_after_5_years: 0,
    eosb_amount: 0,
    eosb_percentage: 100,
    final_eosb_amount: 0,
    pending_loans: 0,
    pending_advances: 0,
    other_deductions: 0,
    other_payments: 0,
    overtime_due: 0,
    bonus_due: 0,
    total_gross: 0,
    total_deductions: 0,
    total_payable: 0,
    currency: "SAR",
    status: "Draft",
    notes: "",
    calculation_breakdown: ""
  });

  const [calculationBreakdown, setCalculationBreakdown] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeData(selectedEmployee.id);
    }
  }, [selectedEmployee]);

  const loadEmployees = async () => {
    const emps = await base44.entities.Employee.list("full_name");
    setEmployees(emps);
  };

  const loadEmployeeData = async (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    // Get pending loans
    const loans = await base44.entities.LoanAccount.filter({
      employee_id: employeeId,
      status: "Active"
    });
    const totalLoans = loans.reduce((sum, loan) => sum + (parseFloat(loan.total_outstanding) || 0), 0);

    // Get pending advances
    const advances = await base44.entities.SalaryAdvance.filter({
      employee_id: employeeId,
      status: "Recovering"
    });
    const totalAdvances = advances.reduce((sum, adv) => sum + (parseFloat(adv.balance) || 0), 0);

    // Get leave balance
    const leaveBalances = await base44.entities.LeaveBalance.filter({
      employee_id: employeeId,
      year: new Date().getFullYear()
    });
    const annualLeaveBalance = leaveBalances.find(lb => lb.leave_type_name === "Annual Leave");

    setFormData(prev => ({
      ...prev,
      employee_id: emp.id,
      employee_name: emp.full_name,
      company_id: emp.company_id,
      company_name: emp.company_name,
      last_basic_salary: emp.basic_salary || 0,
      last_housing_allowance: emp.housing_allowance || 0,
      gosi_salary: (emp.basic_salary || 0) + (emp.housing_allowance || 0),
      unused_leave_days: annualLeaveBalance?.current_balance || 0,
      pending_loans: totalLoans,
      pending_advances: totalAdvances
    }));
  };

  const handleEmployeeSelect = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    setSelectedEmployee(emp);
  };

  const calculateEOSB = async () => {
    if (!selectedEmployee || !formData.resignation_date || !formData.last_working_day) {
      alert(isRTL ? "يرجى اختيار الموظف وتواريخ الاستقالة" : "Please select employee and dates");
      return;
    }

    setCalculating(true);
    const breakdown = [];

    try {
      // Calculate service period
      const joinDate = parseISO(selectedEmployee.join_date);
      const lastDay = parseISO(formData.last_working_day);
      const totalDays = differenceInDays(lastDay, joinDate);
      
      const years = Math.floor(totalDays / 365);
      const remainingDays = totalDays % 365;
      const months = Math.floor(remainingDays / 30);
      const days = remainingDays % 30;

      breakdown.push({
        step: isRTL ? "فترة الخدمة" : "Service Period",
        details: `${years} ${isRTL ? 'سنوات' : 'years'}, ${months} ${isRTL ? 'أشهر' : 'months'}, ${days} ${isRTL ? 'أيام' : 'days'}`,
        value: totalDays
      });

      // Calculate GOSI Salary (Basic + Housing)
      const gosiSalary = formData.gosi_salary;
      breakdown.push({
        step: isRTL ? "الراتب الخاضع للمكافأة (أساسي + سكن)" : "EOSB Base (Basic + Housing)",
        details: `${formData.last_basic_salary} + ${formData.last_housing_allowance}`,
        value: gosiSalary
      });

      // Determine calculation method and percentage
      let method = "";
      let percentage = 100;
      
      if (formData.termination_type === "Resignation") {
        if (years < 2) {
          percentage = 0;
          method = isRTL ? "استقالة - أقل من سنتين (لا مكافأة)" : "Resignation - Less than 2 years (No EOSB)";
        } else if (years < 5) {
          percentage = 33.33;
          method = isRTL ? "استقالة - من 2 إلى 5 سنوات (ثلث المكافأة)" : "Resignation - 2 to 5 years (1/3 EOSB)";
        } else if (years < 10) {
          percentage = 66.67;
          method = isRTL ? "استقالة - من 5 إلى 10 سنوات (ثلثي المكافأة)" : "Resignation - 5 to 10 years (2/3 EOSB)";
        } else {
          percentage = 100;
          method = isRTL ? "استقالة - أكثر من 10 سنوات (مكافأة كاملة)" : "Resignation - Over 10 years (Full EOSB)";
        }
      } else if (formData.termination_type === "Termination by Employer") {
        percentage = 100;
        method = isRTL ? "إنهاء خدمة من قبل صاحب العمل (مكافأة كاملة)" : "Termination by Employer (Full EOSB)";
      } else if (formData.termination_type === "Contract Expiry") {
        percentage = 100;
        method = isRTL ? "انتهاء العقد (مكافأة كاملة)" : "Contract Expiry (Full EOSB)";
      } else if (formData.termination_type === "Death" || formData.termination_type === "Disability") {
        percentage = 100;
        method = isRTL ? "وفاة/عجز (مكافأة كاملة)" : "Death/Disability (Full EOSB)";
      }

      breakdown.push({
        step: isRTL ? "طريقة الحساب" : "Calculation Method",
        details: method,
        value: percentage
      });

      // Calculate EOSB
      // First 5 years: Half month per year
      const first5Years = Math.min(years, 5);
      const eosbFirst5 = (gosiSalary / 2) * first5Years;
      
      breakdown.push({
        step: isRTL ? "أول 5 سنوات (نصف شهر/سنة)" : "First 5 years (Half month/year)",
        details: `${gosiSalary} / 2 × ${first5Years}`,
        value: eosbFirst5
      });

      // After 5 years: Full month per year
      let eosbAfter5 = 0;
      if (years > 5) {
        const yearsAfter5 = years - 5;
        eosbAfter5 = gosiSalary * yearsAfter5;
        
        breakdown.push({
          step: isRTL ? "بعد 5 سنوات (شهر كامل/سنة)" : "After 5 years (Full month/year)",
          details: `${gosiSalary} × ${yearsAfter5}`,
          value: eosbAfter5
        });
      }

      // Pro-rata for partial year
      let proRata = 0;
      if (months > 0 || days > 0) {
        const dailyRate = years >= 5 ? gosiSalary / 30 : (gosiSalary / 2) / 30;
        const partialDays = (months * 30) + days;
        proRata = dailyRate * partialDays;
        
        breakdown.push({
          step: isRTL ? "نسبة تناسبية للسنة الجزئية" : "Pro-rata for Partial Year",
          details: `${dailyRate.toFixed(2)} × ${partialDays} ${isRTL ? 'يوم' : 'days'}`,
          value: proRata
        });
      }

      const totalEOSB = eosbFirst5 + eosbAfter5 + proRata;
      breakdown.push({
        step: isRTL ? "إجمالي المكافأة" : "Total EOSB",
        details: "",
        value: totalEOSB
      });

      // Apply percentage based on termination type
      const finalEOSB = (totalEOSB * percentage) / 100;
      if (percentage < 100) {
        breakdown.push({
          step: isRTL ? "المكافأة بعد تطبيق النسبة" : "EOSB After Percentage",
          details: `${totalEOSB.toFixed(2)} × ${percentage}%`,
          value: finalEOSB
        });
      }

      // Calculate leave encashment
      const dailyRate = gosiSalary / 30;
      const leaveEncashment = dailyRate * formData.unused_leave_days;
      breakdown.push({
        step: isRTL ? "تسييل الإجازات" : "Leave Encashment",
        details: `${dailyRate.toFixed(2)} × ${formData.unused_leave_days} ${isRTL ? 'يوم' : 'days'}`,
        value: leaveEncashment
      });

      // Calculate earned salary for final month
      const daysInMonth = 30;
      const lastDayOfMonth = new Date(lastDay.getFullYear(), lastDay.getMonth() + 1, 0).getDate();
      const workedDays = lastDay.getDate();
      const earnedSalary = (gosiSalary * workedDays) / daysInMonth;
      
      breakdown.push({
        step: isRTL ? "راتب الشهر الأخير" : "Final Month Salary",
        details: `${gosiSalary} × ${workedDays} / ${daysInMonth}`,
        value: earnedSalary
      });

      // Calculate totals
      const totalGross = finalEOSB + leaveEncashment + earnedSalary + formData.overtime_due + formData.bonus_due + formData.other_payments;
      const totalDeductions = formData.pending_loans + formData.pending_advances + formData.other_deductions;
      const totalPayable = totalGross - totalDeductions;

      breakdown.push({
        step: isRTL ? "إجمالي المستحقات" : "Total Gross",
        details: isRTL 
          ? `مكافأة + إجازات + راتب + أخرى`
          : `EOSB + Leave + Salary + Others`,
        value: totalGross
      });

      breakdown.push({
        step: isRTL ? "إجمالي الخصومات" : "Total Deductions",
        details: isRTL
          ? `قروض + سلف + أخرى`
          : `Loans + Advances + Others`,
        value: totalDeductions
      });

      breakdown.push({
        step: isRTL ? "صافي المستحق" : "Net Payable",
        details: "",
        value: totalPayable,
        isFinal: true
      });

      setFormData(prev => ({
        ...prev,
        service_years: years,
        service_months: months,
        service_days: days,
        total_service_days: totalDays,
        eosb_calculation_method: method,
        eosb_first_5_years: eosbFirst5,
        eosb_after_5_years: eosbAfter5,
        eosb_amount: totalEOSB,
        eosb_percentage: percentage,
        final_eosb_amount: finalEOSB,
        leave_encashment: leaveEncashment,
        earned_salary: earnedSalary,
        total_gross: totalGross,
        total_deductions: totalDeductions,
        total_payable: totalPayable,
        calculation_breakdown: JSON.stringify(breakdown)
      }));

      setCalculationBreakdown(breakdown);
    } catch (error) {
      console.error("Error calculating EOSB:", error);
      alert(isRTL ? "خطأ في الحساب" : "Calculation error");
    } finally {
      setCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.employee_id) {
      alert(isRTL ? "يرجى اختيار الموظف" : "Please select employee");
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.EOSB.create({
        ...formData,
        calculated_by: user.email,
        calculated_date: new Date().toISOString().split('T')[0],
        status: "Calculated"
      });
      
      alert(isRTL ? "تم حفظ الحساب بنجاح" : "EOSB calculation saved successfully");
      if (onSave) onSave();
      
      // Reset form
      setSelectedEmployee(null);
      setFormData({
        employee_id: "",
        employee_name: "",
        resignation_date: "",
        last_working_day: "",
        termination_type: "Resignation",
        // ... reset other fields
      });
      setCalculationBreakdown([]);
    } catch (error) {
      console.error("Error saving EOSB:", error);
      alert(isRTL ? "فشل الحفظ" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calculator className="w-5 h-5 text-[#B11116]" />
            <span>{isRTL ? 'حاسبة مكافأة نهاية الخدمة' : 'End of Service Benefit Calculator'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'الموظف *' : 'Employee *'}
                </Label>
                <Select value={formData.employee_id} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر الموظف" : "Select employee"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.employee_id} - {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'نوع الإنهاء *' : 'Termination Type *'}
                </Label>
                <Select 
                  value={formData.termination_type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, termination_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Resignation">{isRTL ? 'استقالة' : 'Resignation'}</SelectItem>
                    <SelectItem value="Termination by Employer">{isRTL ? 'إنهاء من قبل صاحب العمل' : 'Termination by Employer'}</SelectItem>
                    <SelectItem value="Contract Expiry">{isRTL ? 'انتهاء العقد' : 'Contract Expiry'}</SelectItem>
                    <SelectItem value="Mutual Agreement">{isRTL ? 'اتفاق متبادل' : 'Mutual Agreement'}</SelectItem>
                    <SelectItem value="Death">{isRTL ? 'وفاة' : 'Death'}</SelectItem>
                    <SelectItem value="Disability">{isRTL ? 'عجز' : 'Disability'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'تاريخ الاستقالة *' : 'Resignation Date *'}
                </Label>
                <Input
                  type="date"
                  value={formData.resignation_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, resignation_date: e.target.value }))}
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'آخر يوم عمل *' : 'Last Working Day *'}
                </Label>
                <Input
                  type="date"
                  value={formData.last_working_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_working_day: e.target.value }))}
                />
              </div>
            </div>

            {selectedEmployee && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">{isRTL ? 'تاريخ الالتحاق' : 'Join Date'}</p>
                    <p className="font-bold">{format(parseISO(selectedEmployee.join_date), 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{isRTL ? 'الراتب الأساسي' : 'Basic Salary'}</p>
                    <p className="font-bold">{formData.last_basic_salary.toLocaleString()} SAR</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{isRTL ? 'بدل السكن' : 'Housing Allowance'}</p>
                    <p className="font-bold">{formData.last_housing_allowance.toLocaleString()} SAR</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{isRTL ? 'رصيد الإجازات' : 'Leave Balance'}</p>
                    <p className="font-bold">{formData.unused_leave_days} {isRTL ? 'يوم' : 'days'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Payments & Deductions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`font-semibold text-gray-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'مدفوعات إضافية' : 'Additional Payments'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'عمل إضافي مستحق' : 'Overtime Due'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.overtime_due}
                      onChange={(e) => setFormData(prev => ({ ...prev, overtime_due: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'مكافآت مستحقة' : 'Bonus Due'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.bonus_due}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonus_due: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'مدفوعات أخرى' : 'Other Payments'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.other_payments}
                      onChange={(e) => setFormData(prev => ({ ...prev, other_payments: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`font-semibold text-gray-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الخصومات' : 'Deductions'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'قروض معلقة' : 'Pending Loans'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.pending_loans}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'سلف معلقة' : 'Pending Advances'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.pending_advances}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'خصومات أخرى' : 'Other Deductions'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.other_deductions}
                      onChange={(e) => setFormData(prev => ({ ...prev, other_deductions: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center">
              <Button
                onClick={calculateEOSB}
                disabled={calculating || !formData.employee_id || !formData.resignation_date}
                className={`w-full md:w-auto bg-gradient-to-r from-[#B11116] to-[#991014] hover:from-[#991014] hover:to-[#7f0d11] ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Calculator className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {calculating ? (isRTL ? 'جاري الحساب...' : 'Calculating...') : (isRTL ? 'حساب المكافأة' : 'Calculate EOSB')}
              </Button>
            </div>

            {/* Calculation Breakdown */}
            {calculationBreakdown.length > 0 && (
              <Card className="mt-6 border-2 border-[#B11116]">
                <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                  <CardTitle className={`text-lg ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'تفاصيل الحساب' : 'Calculation Breakdown'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {calculationBreakdown.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-start p-3 rounded-lg ${
                          item.isFinal ? 'bg-[#B11116] text-white font-bold' : 'bg-gray-50'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                          <p className={`font-medium ${item.isFinal ? 'text-white' : 'text-gray-900'}`}>
                            {item.step}
                          </p>
                          {item.details && (
                            <p className={`text-sm mt-1 ${item.isFinal ? 'text-red-100' : 'text-gray-600'}`}>
                              {item.details}
                            </p>
                          )}
                        </div>
                        <p className={`font-bold text-lg ${item.isFinal ? 'text-2xl' : ''}`}>
                          {item.value.toLocaleString()} {item.value > 0 && !item.isFinal ? 'SAR' : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Summary Boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <p className="text-sm text-gray-600">{isRTL ? 'إجمالي المستحقات' : 'Total Gross'}</p>
                      <p className="text-2xl font-bold text-green-700">{formData.total_gross.toLocaleString()} SAR</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                      <p className="text-sm text-gray-600">{isRTL ? 'إجمالي الخصومات' : 'Total Deductions'}</p>
                      <p className="text-2xl font-bold text-red-700">{formData.total_deductions.toLocaleString()} SAR</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <p className="text-sm text-gray-600">{isRTL ? 'صافي المستحق' : 'Net Payable'}</p>
                      <p className="text-2xl font-bold text-blue-700">{formData.total_payable.toLocaleString()} SAR</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-6">
                    <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder={isRTL ? "أضف أي ملاحظات..." : "Add any notes..."}
                      className={isRTL ? 'text-right' : ''}
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className={`bg-gradient-to-r from-[#B11116] to-[#991014] hover:from-[#991014] hover:to-[#7f0d11] ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الحساب' : 'Save Calculation')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}