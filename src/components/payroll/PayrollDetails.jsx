import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PayrollDetails({ payroll, onBack, onUpdate }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download Payslip
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{payroll.employee_name}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="bg-white text-green-700 border-green-200">
                  {payroll.company_name}
                </Badge>
                <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                  {months[payroll.month - 1]} {payroll.year}
                </Badge>
                <Badge 
                  variant="outline"
                  className={
                    payroll.status === "Paid" 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : payroll.status === "Approved"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-orange-100 text-orange-800 border-orange-200"
                  }
                >
                  {payroll.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Net Salary</p>
              <p className="text-3xl font-bold text-green-600">
                {payroll.net_salary.toLocaleString('en-US')} <span className="text-lg">SAR</span>
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Earnings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">+</span>
                </div>
                Earnings
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Basic Salary</span>
                  <span className="font-semibold">{payroll.basic_salary.toLocaleString('en-US')} SAR</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Housing Allowance</span>
                  <span className="font-semibold">{payroll.housing_allowance.toLocaleString('en-US')} SAR</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Transportation Allowance</span>
                  <span className="font-semibold">{payroll.transportation_allowance.toLocaleString('en-US')} SAR</span>
                </div>
                {payroll.overtime_pay > 0 && (
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div>
                      <span className="text-purple-700 font-medium">Overtime Pay</span>
                      <p className="text-xs text-purple-600">{payroll.overtime_hours} hours</p>
                    </div>
                    <span className="font-semibold text-purple-700">{payroll.overtime_pay.toLocaleString('en-US')} SAR</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200 mt-4">
                  <span className="font-bold text-gray-900">Total Gross</span>
                  <span className="font-bold text-green-600 text-lg">{payroll.total_gross.toLocaleString('en-US')} SAR</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">-</span>
                </div>
                Deductions
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-gray-700">GOSI (Employee)</span>
                    <p className="text-xs text-gray-500">Social Insurance</p>
                  </div>
                  <span className="font-semibold text-red-600">{payroll.gosi_employee.toLocaleString('en-US')} SAR</span>
                </div>
                {payroll.absence_deduction > 0 && (
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <span className="text-orange-700 font-medium">Absence Deduction</span>
                      <p className="text-xs text-orange-600">{payroll.days_absent} days</p>
                    </div>
                    <span className="font-semibold text-orange-700">{payroll.absence_deduction.toLocaleString('en-US')} SAR</span>
                  </div>
                )}
                {payroll.other_deductions > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Other Deductions</span>
                    <span className="font-semibold text-red-600">{payroll.other_deductions.toLocaleString('en-US')} SAR</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border-2 border-red-200 mt-4">
                  <span className="font-bold text-gray-900">Total Deductions</span>
                  <span className="font-bold text-red-600 text-lg">{payroll.total_deductions.toLocaleString('en-US')} SAR</span>
                </div>
              </div>

              {/* Employer Contribution */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-blue-900">GOSI (Employer)</span>
                    <p className="text-xs text-blue-700">Company contribution</p>
                  </div>
                  <span className="font-semibold text-blue-700">{payroll.gosi_employer.toLocaleString('en-US')} SAR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">Days Worked</p>
                <p className="text-2xl font-bold text-gray-900">{payroll.days_worked}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Net Salary</p>
                <p className="text-3xl font-bold text-green-600">
                  {payroll.net_salary.toLocaleString('en-US')} <span className="text-xl">SAR</span>
                </p>
              </div>
            </div>
            {payroll.payment_date && (
              <div className="pt-4 border-t border-green-200">
                <p className="text-sm text-gray-600">
                  Paid on: {format(parseISO(payroll.payment_date), "MMMM dd, yyyy")}
                </p>
              </div>
            )}
          </div>

          {payroll.notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Notes:</p>
              <p className="text-sm text-gray-600">{payroll.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}