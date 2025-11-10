import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, XCircle, Calculator, AlertCircle } from "lucide-react";

export default function AdvanceSettlement({ advance, expenseReports, onSettle, onCancel }) {
  const [expenseAmount, setExpenseAmount] = useState("");
  const [selectedExpenseReport, setSelectedExpenseReport] = useState("");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const balance = advance.amount - (parseFloat(expenseAmount) || 0);
  const isOverspent = balance < 0;
  const isUnderSpent = balance > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!expenseAmount) {
      alert(isRTL ? "الرجاء إدخال مبلغ المصروفات" : "Please enter expense amount");
      return;
    }

    onSettle(advance.id, parseFloat(expenseAmount));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-3xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'تسوية السلفة' : 'Settle Advance'}
          </CardTitle>
          <div className={`text-sm text-gray-600 mt-2 ${isRTL ? 'text-right' : ''}`}>
            {advance.advance_number} • {advance.employee_name}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Advance Details */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className={`font-semibold text-gray-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'تفاصيل السلفة' : 'Advance Details'}
            </h3>
            <div className="space-y-2">
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-600">{isRTL ? 'مبلغ السلفة:' : 'Advance Amount:'}</span>
                <span className="font-bold text-green-600">
                  {advance.amount?.toLocaleString()} {advance.currency}
                </span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-600">{isRTL ? 'طريقة الصرف:' : 'Payout Method:'}</span>
                <Badge variant="outline">{advance.payout_method}</Badge>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-600">{isRTL ? 'تاريخ الصرف:' : 'Disbursement Date:'}</span>
                <span>{advance.disbursement_date}</span>
              </div>
            </div>
          </div>

          {/* Expense Report Selection */}
          {expenseReports.length > 0 && (
            <div>
              <Label className={`block mb-2 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'تقرير المصروفات' : 'Expense Report'}
              </Label>
              <Select 
                value={selectedExpenseReport} 
                onValueChange={(value) => {
                  setSelectedExpenseReport(value);
                  const report = expenseReports.find(r => r.id === value);
                  if (report) {
                    setExpenseAmount(report.total_expenses?.toString() || "");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر تقرير المصروفات" : "Select expense report"} />
                </SelectTrigger>
                <SelectContent>
                  {expenseReports.map(report => (
                    <SelectItem key={report.id} value={report.id}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span>{report.report_number}</span>
                        <span className="text-gray-500">•</span>
                        <span className="font-semibold">{report.total_expenses?.toLocaleString()} {report.currency}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Manual Expense Entry */}
          <div>
            <Label className={`block mb-2 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'إجمالي المصروفات *' : 'Total Expenses *'}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="0.00"
              className={isRTL ? 'text-right' : ''}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? 'أدخل إجمالي المصروفات الفعلية من تقرير المصروفات'
                : 'Enter total actual expenses from expense report'
              }
            </p>
          </div>

          {/* Calculation Result */}
          {expenseAmount && (
            <div className={`p-6 rounded-lg ${isOverspent ? 'bg-blue-50 border border-blue-200' : isUnderSpent ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className={`flex items-center justify-center gap-4 text-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{isRTL ? 'السلفة' : 'Advance'}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {advance.amount?.toLocaleString()}
                  </p>
                </div>

                <div className="text-2xl text-gray-400">−</div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">{isRTL ? 'المصروفات' : 'Expenses'}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {parseFloat(expenseAmount).toLocaleString()}
                  </p>
                </div>

                <div className="text-2xl text-gray-400">=</div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {balance > 0 
                      ? (isRTL ? 'للاسترداد' : 'To Recover')
                      : balance < 0 
                      ? (isRTL ? 'مستحق للموظف' : 'Owed to Employee')
                      : (isRTL ? 'متوازن' : 'Balanced')
                    }
                  </p>
                  <p className={`text-3xl font-bold ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                    {Math.abs(balance).toLocaleString()} {advance.currency}
                  </p>
                </div>
              </div>

              {/* Status Message */}
              <div className={`flex items-start gap-3 mt-4 p-3 rounded ${isOverspent ? 'bg-blue-100' : isUnderSpent ? 'bg-red-100' : 'bg-green-100'}`}>
                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isOverspent ? 'text-blue-600' : isUnderSpent ? 'text-red-600' : 'text-green-600'}`} />
                <div className={`text-sm ${isRTL ? 'text-right' : ''}`}>
                  {isOverspent ? (
                    <>
                      <p className={`font-medium ${isOverspent ? 'text-blue-900' : ''}`}>
                        {isRTL ? 'مصروفات زائدة' : 'Overspent'}
                      </p>
                      <p className={`mt-1 ${isOverspent ? 'text-blue-700' : ''}`}>
                        {isRTL 
                          ? `الموظف أنفق ${Math.abs(balance).toLocaleString()} ${advance.currency} أكثر من السلفة. سيتم تعويض الموظف عن المبلغ الزائد.`
                          : `Employee spent ${Math.abs(balance).toLocaleString()} ${advance.currency} more than advance. Employee will be reimbursed for the excess.`
                        }
                      </p>
                    </>
                  ) : isUnderSpent ? (
                    <>
                      <p className={`font-medium ${isUnderSpent ? 'text-red-900' : ''}`}>
                        {isRTL ? 'مصروفات أقل' : 'Underspent'}
                      </p>
                      <p className={`mt-1 ${isUnderSpent ? 'text-red-700' : ''}`}>
                        {isRTL 
                          ? `الموظف أنفق ${balance.toLocaleString()} ${advance.currency} أقل من السلفة. سيتم استرداد المبلغ الزائد من الراتب القادم.`
                          : `Employee spent ${balance.toLocaleString()} ${advance.currency} less than advance. Excess will be recovered from next payroll.`
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-green-900">
                        {isRTL ? 'متوازن تماماً' : 'Perfectly Balanced'}
                      </p>
                      <p className="text-green-700 mt-1">
                        {isRTL 
                          ? 'المصروفات تساوي السلفة بالضبط. لا حاجة لاسترداد أو تعويض.'
                          : 'Expenses exactly match the advance. No recovery or reimbursement needed.'
                        }
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className={`flex gap-3 border-t border-gray-100 bg-gray-50 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel} className={isRTL ? 'flex-row-reverse' : ''}>
            <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            type="submit" 
            className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
            disabled={!expenseAmount}
          >
            <Calculator className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'تأكيد التسوية' : 'Confirm Settlement'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}