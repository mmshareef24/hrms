import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, Users, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PayrollProcessing() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const data = await base44.entities.Company.list("company_name");
    setCompanies(data.filter(c => c.is_active));
    if (data.length > 0) {
      setSelectedCompany(data[0].id);
    }
  };

  const calculatePayroll = async () => {
    if (!selectedCompany) return;
    
    setProcessing(true);
    try {
      // Get all active employees for the company
      const employees = await base44.entities.Employee.filter({
        company_id: selectedCompany,
        status: "Active"
      });

      // Get time logs for the month
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`;
      
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const emp of employees) {
        // Calculate basic components
        const basicSalary = emp.basic_salary || 0;
        const housingAllowance = emp.housing_allowance || 0;
        const transportationAllowance = emp.transportation_allowance || 0;
        const foodAllowance = emp.food_allowance || 0;
        const telecomAllowance = emp.telecom_allowance || 0;
        const fuelAllowance = emp.fuel_allowance || 0;
        const variablePay = emp.variable_pay || 0;
        const shiftAllowance = emp.shift_allowance || 0;

        // Get overtime from time logs
        const timeLogs = await base44.entities.TimeLog.list();
        const empTimeLogs = timeLogs.filter(tl => 
          tl.employee_id === emp.id &&
          tl.date >= startDate &&
          tl.date <= endDate
        );

        const totalOvertimeHours = empTimeLogs.reduce((sum, tl) => sum + (tl.overtime_hours || 0), 0);
        const hourlyRate = basicSalary / 30 / 8; // Monthly to hourly
        const overtimePay = totalOvertimeHours * hourlyRate * 1.5;

        // Calculate gross
        const grossSalary = basicSalary + housingAllowance + transportationAllowance + 
                           foodAllowance + telecomAllowance + fuelAllowance + 
                           variablePay + shiftAllowance + overtimePay;

        // Calculate GOSI (9.75% for Saudis, 2% for non-Saudis)
        const gosiRate = emp.nationality === "Saudi" ? 0.0975 : 0.02;
        const gosiEmployee = (basicSalary + housingAllowance) * gosiRate;

        // Get absence deductions
        const daysAbsent = empTimeLogs.filter(tl => tl.status === "Absent").length;
        const absenceDeduction = (basicSalary / 30) * daysAbsent;

        // Total deductions
        const deductions = gosiEmployee + absenceDeduction;
        
        // Net salary
        const netSalary = grossSalary - deductions;

        // Check if payroll already exists
        const existingPayroll = await base44.entities.Payroll.list();
        const existing = existingPayroll.find(p => 
          p.employee_id === emp.id &&
          p.month === selectedMonth &&
          p.year === selectedYear
        );

        const payrollData = {
          employee_id: emp.id,
          employee_name: emp.full_name,
          company_id: emp.company_id,
          company_name: emp.company_name,
          month: selectedMonth,
          year: selectedYear,
          basic_salary: basicSalary,
          housing_allowance: housingAllowance,
          transportation_allowance: transportationAllowance,
          overtime_hours: totalOvertimeHours,
          overtime_pay: overtimePay,
          total_gross: grossSalary,
          gosi_employee: gosiEmployee,
          gosi_employer: (basicSalary + housingAllowance) * (emp.nationality === "Saudi" ? 0.12 : 0.02),
          absence_deduction: absenceDeduction,
          other_deductions: 0,
          total_deductions: deductions,
          net_salary: netSalary,
          days_worked: empTimeLogs.filter(tl => tl.status !== "Absent").length,
          days_absent: daysAbsent,
          status: "Draft"
        };

        if (existing) {
          await base44.entities.Payroll.update(existing.id, payrollData);
        } else {
          await base44.entities.Payroll.create(payrollData);
        }

        totalGross += grossSalary;
        totalDeductions += deductions;
        totalNet += netSalary;
      }

      setSummary({
        employeeCount: employees.length,
        totalGross: totalGross.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        totalNet: totalNet.toFixed(2)
      });

    } finally {
      setProcessing(false);
    }
  };

  const months = [
    { value: 1, label: 'January', labelAr: 'يناير' },
    { value: 2, label: 'February', labelAr: 'فبراير' },
    { value: 3, label: 'March', labelAr: 'مارس' },
    { value: 4, label: 'April', labelAr: 'أبريل' },
    { value: 5, label: 'May', labelAr: 'مايو' },
    { value: 6, label: 'June', labelAr: 'يونيو' },
    { value: 7, label: 'July', labelAr: 'يوليو' },
    { value: 8, label: 'August', labelAr: 'أغسطس' },
    { value: 9, label: 'September', labelAr: 'سبتمبر' },
    { value: 10, label: 'October', labelAr: 'أكتوبر' },
    { value: 11, label: 'November', labelAr: 'نوفمبر' },
    { value: 12, label: 'December', labelAr: 'ديسمبر' }
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calculator className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'معالجة الرواتب' : 'Payroll Processing'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الشركة' : 'Company'}
                </label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الشهر' : 'Month'}
                </label>
                <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={String(month.value)}>
                        {isRTL ? month.labelAr : month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'السنة' : 'Year'}
                </label>
                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map(year => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm font-medium text-blue-900">
                  {isRTL ? 'حساب الرواتب' : 'Payroll Calculation'}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {isRTL 
                    ? 'سيتم حساب الرواتب بناءً على: الراتب الأساسي + البدلات + بدل الوردية + ساعات العمل الإضافية - التأمينات الاجتماعية - خصم الغياب'
                    : 'Payroll will be calculated based on: Basic Salary + Allowances + Shift Allowance + Overtime - GOSI - Absence Deductions'
                  }
                </p>
              </div>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={calculatePayroll}
              disabled={processing || !selectedCompany}
              className={`w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Calculator className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {processing 
                ? (isRTL ? 'جاري الحساب...' : 'Calculating...')
                : (isRTL ? 'حساب الرواتب' : 'Calculate Payroll')
              }
            </Button>

            {/* Summary */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">{isRTL ? 'الموظفين' : 'Employees'}</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.employeeCount}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">{isRTL ? 'الإجمالي' : 'Gross'}</p>
                  <p className="text-xl font-bold text-green-600">{summary.totalGross}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-red-600 mb-2" />
                  <p className="text-sm text-gray-600">{isRTL ? 'الخصومات' : 'Deductions'}</p>
                  <p className="text-xl font-bold text-red-600">{summary.totalDeductions}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">{isRTL ? 'الصافي' : 'Net'}</p>
                  <p className="text-xl font-bold text-purple-600">{summary.totalNet}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}