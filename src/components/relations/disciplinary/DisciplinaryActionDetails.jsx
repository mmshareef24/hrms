import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Calendar, User, FileText, Edit, X, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function DisciplinaryActionDetails({ actionData, employees, onClose, onEdit, onAcknowledge }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const employee = employees.find(e => e.id === actionData.employee_id);

  const getActionColor = (type) => {
    switch (type) {
      case "Verbal Warning": return "bg-yellow-100 text-yellow-800";
      case "Written Warning": return "bg-orange-100 text-orange-800";
      case "Final Warning": return "bg-red-100 text-red-800";
      default: return "bg-purple-100 text-purple-800";
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle>{actionData.action_number}</CardTitle>
            <Badge className={getActionColor(actionData.action_type)}>
              {actionData.action_type}
            </Badge>
            {actionData.status && (
              <Badge variant="outline">
                {actionData.status}
              </Badge>
            )}
          </div>
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Employee Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={isRTL ? 'text-right' : ''}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {isRTL ? 'الموظف' : 'Employee'}
            </h3>
            <p className="text-base text-gray-900 font-semibold">{employee?.full_name || actionData.employee_name}</p>
            {employee && (
              <p className="text-sm text-gray-500">{employee.department} - {employee.job_title}</p>
            )}
          </div>

          <div className={isRTL ? 'text-right' : ''}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {isRTL ? 'نوع المخالفة' : 'Violation Type'}
            </h3>
            <p className="text-base text-gray-900">{actionData.violation_type}</p>
          </div>

          <div className={isRTL ? 'text-right' : ''}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {isRTL ? 'تاريخ الإجراء' : 'Action Date'}
            </h3>
            <p className="text-base text-gray-900">
              {actionData.action_date ? format(parseISO(actionData.action_date), 'MMMM dd, yyyy') : 'N/A'}
            </p>
          </div>

          {actionData.expiry_date && (
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </h3>
              <p className="text-base text-gray-900">
                {format(parseISO(actionData.expiry_date), 'MMMM dd, yyyy')}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Violation Description */}
        <div className={isRTL ? 'text-right' : ''}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {isRTL ? 'وصف المخالفة' : 'Violation Description'}
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-900 whitespace-pre-wrap">{actionData.violation_description}</p>
          </div>
        </div>

        {/* Improvement Plan */}
        {actionData.improvement_plan && (
          <>
            <Separator />
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {isRTL ? 'خطة التحسين' : 'Improvement Plan'}
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{actionData.improvement_plan}</p>
              </div>
            </div>
          </>
        )}

        {/* Suspension Details */}
        {(actionData.action_type?.includes("Suspension") && actionData.suspension_days > 0) && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? 'مدة الإيقاف' : 'Suspension Duration'}
                </h3>
                <p className="text-base text-gray-900">{actionData.suspension_days} {isRTL ? 'يوم' : 'days'}</p>
              </div>
              {actionData.suspension_start && (
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {isRTL ? 'تاريخ البداية' : 'Start Date'}
                  </h3>
                  <p className="text-base text-gray-900">{format(parseISO(actionData.suspension_start), 'MMM dd, yyyy')}</p>
                </div>
              )}
              {actionData.suspension_end && (
                <div className={isRTL ? 'text-right' : ''}>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {isRTL ? 'تاريخ النهاية' : 'End Date'}
                  </h3>
                  <p className="text-base text-gray-900">{format(parseISO(actionData.suspension_end), 'MMM dd, yyyy')}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Acknowledgment */}
        <Separator />
        <div className={`p-4 rounded-lg ${actionData.acknowledged_by_employee ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {actionData.acknowledged_by_employee ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              )}
              <span className={`font-medium ${actionData.acknowledged_by_employee ? 'text-green-900' : 'text-yellow-900'}`}>
                {actionData.acknowledged_by_employee 
                  ? (isRTL ? 'تم الإقرار بالاستلام' : 'Acknowledged by Employee')
                  : (isRTL ? 'في انتظار إقرار الموظف' : 'Pending Employee Acknowledgment')
                }
              </span>
            </div>
            {!actionData.acknowledged_by_employee && (
              <Button 
                size="sm"
                onClick={() => onAcknowledge(actionData.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRTL ? 'إقرار الاستلام' : 'Acknowledge'}
              </Button>
            )}
          </div>
          {actionData.acknowledged_by_employee && actionData.acknowledgment_date && (
            <p className={`text-sm text-gray-600 mt-2 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'التاريخ: ' : 'Date: '}{format(parseISO(actionData.acknowledgment_date), 'MMM dd, yyyy')}
            </p>
          )}
        </div>

        {/* Review Date */}
        {actionData.review_date && (
          <div className={`p-4 bg-blue-50 rounded-lg ${isRTL ? 'text-right' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {isRTL ? 'تاريخ المراجعة: ' : 'Review Date: '}
                {format(parseISO(actionData.review_date), 'MMMM dd, yyyy')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}