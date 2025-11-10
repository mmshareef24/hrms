
import React, { useState, useEffect } from "react";
import { Employee, TimeLog, Payroll } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PayrollGeneration({ onGenerated }) {
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const data = await Employee.filter({ status: "Active" });
    setEmployees(data);
  };

  const calculatePayroll = async () => {
    setGenerating(true);
    const payrollData = [];

    for (const employee of employees) {
      // Get time logs for the month
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`;
      
      const timeLogs = await TimeLog.filter({
        employee_id: employee.id,
      });

      // Filter logs for the selected month
      const monthLogs = timeLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getMonth() + 1 === selectedMonth && logDate.getFullYear() === selectedYear;
      });

      // Calculate totals
      const overtimeHours = monthLogs.reduce((sum, log) => sum + (log.overtime_hours || 0), 0);
      const daysAbsent = monthLogs.filter(log => log.status === "Absent").length;
      const daysWorked = monthLogs.filter(log => log.status !== "Absent").length;

      const basicSalary = employee.basic_salary || 0;
      const housingAllowance = employee.housing_allowance || 0;
      const transportAllowance = employee.transportation_allowance || 0;

      // Calculate overtime pay (1.5x hourly rate)
      const dailyRate = basicSalary / 30;
      const hourlyRate = dailyRate / 8;
      const overtimePay = overtimeHours * hourlyRate * 1.5;

      // Calculate absence deduction
      const absenceDeduction = daysAbsent * dailyRate;

      const totalGross = basicSalary + housingAllowance + transportAllowance + overtimePay;

      // GOSI calculations (Saudi: 9.75% employee, 12% employer; Non-Saudi: 2% both)
      const gosiRate = employee.nationality === "Saudi" ? 0.0975 : 0.02;
      const gosiEmployerRate = employee.nationality === "Saudi" ? 0.12 : 0.02;
      const gosiEmployee = basicSalary * gosiRate;
      const gosiEmployer = basicSalary * gosiEmployerRate;

      const totalDeductions = gosiEmployee + absenceDeduction;
      const netSalary = totalGross - totalDeductions;

      payrollData.push({
        employee_id: employee.id,
        employee_name: employee.full_name,
        company_id: employee.company_id,
        company_name: employee.company_name,
        month: selectedMonth,
        year: selectedYear,
        basic_salary: basicSalary,
        housing_allowance: housingAllowance,
        transportation_allowance: transportAllowance,
        overtime_hours: overtimeHours,
        overtime_pay: overtimePay,
        total_gross: totalGross,
        gosi_employee: gosiEmployee,
        gosi_employer: gosiEmployer,
        absence_deduction: absenceDeduction,
        other_deductions: 0,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        days_worked: daysWorked,
        days_absent: daysAbsent,
        status: "Draft"
      });
    }

    setPreview(payrollData);
    setGenerating(false);
  };

  const savePayroll = async () => {
    setGenerating(true);
    for (const payroll of preview) {
      await Payroll.create(payroll);
    }
    setGenerating(false);
    setPreview([]);
    onGenerated();
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="text-2xl">Generate Monthly Payroll</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="month">Select Month</Label>
              <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">Select Year</Label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={calculatePayroll}
                disabled={generating}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Payroll
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Calculation Details:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Basic Salary + Housing (25%) + Transportation (10%)</li>
              <li>• Overtime calculated at 1.5x hourly rate from time logs</li>
              <li>• GOSI: 9.75% for Saudis, 2% for Non-Saudis (employee share)</li>
              <li>• Absence deductions based on daily rate</li>
              <li>• Net Salary = Gross - Deductions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <div className="flex justify-between items-center">
              <CardTitle>Payroll Preview - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardTitle>
              <Button 
                onClick={savePayroll}
                disabled={generating}
                className="bg-gradient-to-r from-green-600 to-green-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Payroll"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Basic</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Allowances</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Overtime</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Gross</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Deductions</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Net Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preview.map((payroll, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{payroll.employee_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {payroll.company_name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {payroll.basic_salary.toLocaleString('en-US')} <span className="text-xs text-gray-500">SAR</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {(payroll.housing_allowance + payroll.transportation_allowance).toLocaleString('en-US')} <span className="text-xs text-gray-500">SAR</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div>
                          <p className="text-purple-600 font-medium">{payroll.overtime_pay.toLocaleString('en-US')} <span className="text-xs">SAR</span></p>
                          <p className="text-xs text-gray-500">{payroll.overtime_hours}h</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold">
                        {payroll.total_gross.toLocaleString('en-US')} <span className="text-xs text-gray-500">SAR</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-red-600">
                        -{payroll.total_deductions.toLocaleString('en-US')} <span className="text-xs">SAR</span>
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-green-600">
                        {payroll.net_salary.toLocaleString('en-US')} <span className="text-sm">SAR</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-right font-bold text-gray-900">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {preview.reduce((sum, p) => sum + p.total_gross, 0).toLocaleString('en-US')} <span className="text-sm text-gray-500">SAR</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      -{preview.reduce((sum, p) => sum + p.total_deductions, 0).toLocaleString('en-US')} <span className="text-sm">SAR</span>
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-green-600">
                      {preview.reduce((sum, p) => sum + p.net_salary, 0).toLocaleString('en-US')} <span className="text-sm">SAR</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
