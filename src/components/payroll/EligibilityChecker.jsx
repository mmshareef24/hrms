import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function EligibilityChecker({ eligibility }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <Card className={eligibility.eligible ? "bg-gradient-to-br from-green-50 to-green-100" : "bg-gradient-to-br from-red-50 to-red-100"}>
      <CardHeader className={`border-b ${eligibility.eligible ? 'border-green-200' : 'border-red-200'}`}>
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {eligibility.eligible ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span>{isRTL ? 'فحص الأهلية' : 'Eligibility Check'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Overall Status */}
        <Alert className={eligibility.eligible ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300"}>
          {eligibility.eligible ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription className={`font-medium ${isRTL ? 'text-right' : ''}`}>
            {eligibility.eligible 
              ? (isRTL ? 'أنت مؤهل لهذا القرض!' : 'You are eligible for this loan!')
              : (isRTL ? 'لا تستوفي شروط الأهلية' : 'You do not meet eligibility requirements')
            }
          </AlertDescription>
        </Alert>

        {/* DTI Summary */}
        <div className="p-4 bg-white rounded-lg">
          <h4 className={`font-bold mb-3 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'نسبة الدين للدخل (DTI)' : 'Debt-to-Income Ratio (DTI)'}
          </h4>
          <div className="space-y-2">
            <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-gray-600">{isRTL ? 'صافي الراتب' : 'Net Salary'}</span>
              <span className="font-bold">{eligibility.netSalary} SAR</span>
            </div>
            <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-gray-600">{isRTL ? 'الخصومات الحالية' : 'Existing Deductions'}</span>
              <span className="font-bold">{eligibility.existingDeductions} SAR</span>
            </div>
            <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-gray-600">{isRTL ? 'القسط المقترح' : 'Proposed EMI'}</span>
              <span className="font-bold text-orange-600">{eligibility.proposedEMI} SAR</span>
            </div>
            <div className={`flex justify-between border-t pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm font-bold">{isRTL ? 'إجمالي الخصومات' : 'Total Deductions'}</span>
              <span className="font-bold">{eligibility.totalDeductions} SAR</span>
            </div>
            <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm font-bold">{isRTL ? 'نسبة DTI' : 'DTI Ratio'}</span>
              <span className={`font-bold text-lg ${
                parseFloat(eligibility.dtiPercent) <= eligibility.dtiCap ? 'text-green-600' : 'text-red-600'
              }`}>
                {eligibility.dtiPercent}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  parseFloat(eligibility.dtiPercent) <= eligibility.dtiCap ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(parseFloat(eligibility.dtiPercent), 100)}%` }}
              ></div>
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? `الحد الأقصى المسموح: ${eligibility.dtiCap}%` : `Maximum allowed: ${eligibility.dtiCap}%`}
            </p>
          </div>
        </div>

        {/* Eligibility Checks */}
        <div className="space-y-2">
          {Object.entries(eligibility.checks).map(([key, check]) => (
            <div key={key} className={`flex items-center gap-2 p-2 rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
              {check.passed ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span className={`text-sm ${check.passed ? 'text-green-700' : 'text-red-700'}`}>
                {check.message}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}