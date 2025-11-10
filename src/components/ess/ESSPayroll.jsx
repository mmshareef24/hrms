
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Download, Eye, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/utils";

export default function ESSPayroll({ user }) {
  const [payrolls, setPayrolls] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (user && user.email) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user || !user.email) {
      setLoading(false);
      setError("User not loaded or email not available."); // More descriptive error
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const employees = await base44.entities.Employee.filter({ work_email: user.email });
      
      if (employees.length > 0) {
        const emp = employees[0];
        setEmployee(emp);
        
        try {
          const payrollData = await base44.entities.Payroll.filter(
            { employee_id: emp.id },
            '-year,-month',
            12
          );
          setPayrolls(payrollData || []);
        } catch (payrollError) {
          console.log("No payroll data yet:", payrollError);
          setPayrolls([]);
        }
      } else {
        setEmployee(null); // Ensure employee is null if not found
        setPayrolls([]); // Clear payrolls if employee not found
        setError("Employee record not found for the given user email.");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    const months = isRTL 
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const downloadPayslip = async (payroll) => {
    alert(isRTL 
      ? `تحميل قسيمة الراتب لـ ${getMonthName(payroll.month)} ${payroll.year}`
      : `Download payslip for ${getMonthName(payroll.month)} ${payroll.year}`
    );
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
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-600">{error}</p>
          <Button onClick={loadData} className="mt-4">
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'لم يتم العثور على سجل الموظف' : 'Employee record not found'}</p>
          <p className="text-sm mt-2">{isRTL ? 'يرجى التواصل مع قسم الموارد البشرية' : 'Please contact HR'}</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedPayroll) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle>{getMonthName(selectedPayroll.month)} {selectedPayroll.year}</CardTitle>
            <Button variant="outline" onClick={() => setSelectedPayroll(null)}>
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Earnings */}
            <div>
              <h3 className={`text-lg font-semibold text-green-700 mb-4 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'الدخل' : 'Earnings'}
              </h3>
              <div className="space-y-2">
                <div className={`flex justify-between p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'الراتب الأساسي' : 'Basic Salary'}</span>
                  <span className="font-bold">{formatCurrency(selectedPayroll.basic_salary || 0, { isRTL, decimals: 2 })}</span>
                </div>
                <div className={`flex justify-between p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'بدل السكن' : 'Housing Allowance'}</span>
                  <span className="font-bold">{formatCurrency(selectedPayroll.housing_allowance || 0, { isRTL, decimals: 2 })}</span>
                </div>
                <div className={`flex justify-between p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'بدل النقل' : 'Transportation'}</span>
                  <span className="font-bold">{formatCurrency(selectedPayroll.transportation_allowance || 0, { isRTL, decimals: 2 })}</span>
                </div>
                {selectedPayroll.overtime_pay > 0 && (
                  <div className={`flex justify-between p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">{isRTL ? 'العمل الإضافي' : 'Overtime'}</span>
                    <span className="font-bold text-green-600">{formatCurrency(selectedPayroll.overtime_pay || 0, { isRTL, decimals: 2 })}</span>
                  </div>
                )}
              </div>
              <div className={`flex justify-between p-3 bg-green-50 rounded-lg mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-bold">{isRTL ? 'إجمالي الدخل' : 'Total Earnings'}</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(selectedPayroll.total_gross || 0, { isRTL, decimals: 2 })}</span>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className={`text-lg font-semibold text-red-700 mb-4 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'الاستقطاعات' : 'Deductions'}
              </h3>
              <div className="space-y-2">
                <div className={`flex justify-between p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'التأمينات الاجتماعية' : 'GOSI'}</span>
                  <span className="font-bold text-red-600">{formatCurrency(selectedPayroll.gosi_employee || 0, { isRTL, decimals: 2 })}</span>
                </div>
                {selectedPayroll.absence_deduction > 0 && (
                  <div className={`flex justify-between p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">{isRTL ? 'خصم الغياب' : 'Absence'}</span>
                    <span className="font-bold text-red-600">{formatCurrency(selectedPayroll.absence_deduction || 0, { isRTL, decimals: 2 })}</span>
                  </div>
                )}
                {selectedPayroll.other_deductions > 0 && (
                  <div className={`flex justify-between p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">{isRTL ? 'خصومات أخرى' : 'Other Deductions'}</span>
                    <span className="font-bold text-red-600">{formatCurrency(selectedPayroll.other_deductions || 0, { isRTL, decimals: 2 })}</span>
                  </div>
                )}
              </div>
              <div className={`flex justify-between p-3 bg-red-50 rounded-lg mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-bold">{isRTL ? 'إجمالي الاستقطاعات' : 'Total Deductions'}</span>
                <span className="font-bold text-red-600 text-lg">{formatCurrency(selectedPayroll.total_deductions || 0, { isRTL, decimals: 2 })}</span>
              </div>
            </div>

            {/* Net Pay */}
            <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm opacity-90">{isRTL ? 'صافي الراتب' : 'Net Salary'}</p>
                  <p className="text-4xl font-bold mt-2">{formatCurrency(selectedPayroll.net_salary || 0, { isRTL, decimals: 2 })}</p>
                </div>
                <DollarSign className="w-16 h-16 opacity-50" />
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => downloadPayslip(selectedPayroll)}
                className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تحميل قسيمة الراتب' : 'Download Payslip'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Month Summary */}
      {payrolls.length > 0 && payrolls[0].status === "Paid" && (
        <Card className="shadow-lg bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm opacity-90">{isRTL ? 'آخر راتب مدفوع' : 'Last Paid Salary'}</p>
                <p className="text-lg font-medium mt-1">
                  {getMonthName(payrolls[0].month)} {payrolls[0].year}
                </p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(payrolls[0].net_salary || 0, { isRTL, decimals: 2 })}</p>
              </div>
              <DollarSign className="w-20 h-20 opacity-30" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll History */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FileText className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'سجل الرواتب' : 'Payroll History'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {payrolls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{isRTL ? 'لا توجد سجلات رواتب' : 'No payroll records yet'}</p>
              <p className="text-sm mt-2">{isRTL ? 'سيتم عرض السجلات بعد معالجة الرواتب' : 'Records will appear after payroll processing'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الفترة' : 'Period'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'إجمالي الدخل' : 'Gross'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاستقطاعات' : 'Deductions'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'صافي الراتب' : 'Net Salary'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">
                        {getMonthName(payroll.month)} {payroll.year}
                      </TableCell>
                      <TableCell>{formatCurrency(payroll.total_gross || 0, { isRTL, showCode: false, showSymbol: true })}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(payroll.total_deductions || 0, { isRTL, showCode: false, showSymbol: true })}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(payroll.net_salary || 0, { isRTL, showCode: false, showSymbol: true })}</TableCell>
                      <TableCell>
                        <Badge className={
                          payroll.status === "Paid" ? "bg-green-100 text-green-800" :
                          payroll.status === "Approved" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {payroll.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedPayroll(payroll)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {payroll.status === "Paid" && (
                            <Button 
                              size="sm"
                              onClick={() => downloadPayslip(payroll)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
