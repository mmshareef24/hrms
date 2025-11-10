import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function EMISimulator({ emiDetails, product }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const chartData = [
    { name: isRTL ? 'الأصل' : 'Principal', value: parseFloat(emiDetails.principal) },
    { name: isRTL ? 'الفائدة' : 'Interest', value: parseFloat(emiDetails.totalInterest) },
    { name: isRTL ? 'رسوم إدارية' : 'Admin Fee', value: emiDetails.adminFee }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
      <CardHeader className="border-b border-purple-200">
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Calculator className="w-5 h-5 text-purple-600" />
          <span>{isRTL ? 'محاكي القسط الشهري (EMI)' : 'EMI Calculator'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Numbers */}
          <div className="space-y-4">
            <div className={`p-4 bg-white rounded-lg ${isRTL ? 'text-right' : ''}`}>
              <p className="text-sm text-gray-600">{isRTL ? 'القسط الشهري' : 'Monthly EMI'}</p>
              <p className="text-3xl font-bold text-purple-600">{emiDetails.monthlyEMI} <span className="text-lg">SAR</span></p>
            </div>

            <div className={`p-3 bg-white rounded-lg ${isRTL ? 'text-right' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{isRTL ? 'مبلغ القرض' : 'Loan Amount'}</span>
                <span className="font-bold">{parseFloat(emiDetails.principal).toLocaleString()} SAR</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{isRTL ? 'إجمالي الفائدة' : 'Total Interest'}</span>
                <span className="font-bold text-orange-600">{emiDetails.totalInterest} SAR</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{isRTL ? 'رسوم إدارية' : 'Admin Fee'}</span>
                <span className="font-bold text-red-600">{emiDetails.adminFee} SAR</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-bold">{isRTL ? 'إجمالي المبلغ المستحق' : 'Total Payable'}</span>
                <span className="text-lg font-bold text-purple-600">{emiDetails.totalPayable} SAR</span>
              </div>
            </div>

            <div className={`p-3 bg-white rounded-lg ${isRTL ? 'text-right' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">{isRTL ? 'تفاصيل الحساب' : 'Calculation Method'}</span>
              </div>
              <p className="text-xs text-gray-600">
                {product.calculation_method === "Reducing Balance" 
                  ? (isRTL ? 'رصيد متناقص' : 'Reducing Balance')
                  : product.calculation_method === "Flat Rate"
                  ? (isRTL ? 'معدل ثابت' : 'Flat Rate')
                  : (isRTL ? 'بدون فائدة' : 'Interest Free')
                }
              </p>
              {product.annual_rate > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {isRTL ? 'المعدل السنوي' : 'Annual Rate'}: {product.annual_rate}%
                </p>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${parseFloat(value).toLocaleString()} SAR`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}