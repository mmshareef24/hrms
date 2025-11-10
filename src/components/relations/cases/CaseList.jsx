import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function CaseList({ cases, employees, onViewCase, onUpdateStatus }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Under Investigation": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved": return "bg-green-100 text-green-800 border-green-200";
      case "Closed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Escalated": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      "Harassment": isRTL ? "تحرش" : "Harassment",
      "Discrimination": isRTL ? "تمييز" : "Discrimination",
      "Policy Violation": isRTL ? "مخالفة سياسة" : "Policy Violation",
      "Theft": isRTL ? "سرقة" : "Theft",
      "Misconduct": isRTL ? "سوء سلوك" : "Misconduct",
      "Attendance": isRTL ? "حضور" : "Attendance",
      "Performance": isRTL ? "أداء" : "Performance",
      "Workplace Safety": isRTL ? "السلامة المهنية" : "Workplace Safety",
      "Other": isRTL ? "أخرى" : "Other"
    };
    return labels[category] || category;
  };

  if (cases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>{isRTL ? 'لا توجد قضايا' : 'No cases found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cases.map((caseItem) => {
        const employee = employees.find(e => e.id === caseItem.employee_id);
        const daysOpen = caseItem.reported_date 
          ? Math.floor((new Date() - parseISO(caseItem.reported_date)) / (1000 * 60 * 60 * 24))
          : 0;

        return (
          <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 space-y-3 ${isRTL ? 'text-right' : ''}`}>
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {caseItem.case_number}
                        </h3>
                        <Badge variant="outline" className={getSeverityColor(caseItem.severity)}>
                          {caseItem.severity}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(caseItem.status)}>
                          {caseItem.status}
                        </Badge>
                      </div>

                      <div className={`flex items-center gap-4 text-sm text-gray-600 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className={`font-medium ${isRTL ? 'ml-1' : 'mr-1'}`}>
                          {isRTL ? 'الموظف:' : 'Employee:'}
                        </span>
                        <span>{employee?.full_name || caseItem.employee_name || 'N/A'}</span>
                        <span className="text-gray-400">|</span>
                        <span>{getCategoryLabel(caseItem.category)}</span>
                      </div>

                      <p className="text-gray-700 line-clamp-2">
                        {caseItem.description}
                      </p>

                      <div className={`flex items-center gap-4 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Clock className="w-4 h-4" />
                          {isRTL ? 'مفتوحة منذ' : 'Open for'} {daysOpen} {isRTL ? 'يوم' : 'days'}
                        </span>
                        {caseItem.reported_date && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span>
                              {isRTL ? 'تاريخ الإبلاغ:' : 'Reported:'} {format(parseISO(caseItem.reported_date), 'MMM dd, yyyy')}
                            </span>
                          </>
                        )}
                        {caseItem.assigned_to_name && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span>{isRTL ? 'المحقق:' : 'Assigned to:'} {caseItem.assigned_to_name}</span>
                          </>
                        )}
                      </div>

                      {caseItem.is_confidential && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          {isRTL ? 'سري' : 'Confidential'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewCase(caseItem)}
                    className={isRTL ? 'flex-row-reverse' : ''}
                  >
                    <Eye className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'عرض' : 'View'}
                  </Button>

                  {caseItem.status === "Open" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(caseItem.id, "Under Investigation", {
                        investigation_notes: "Investigation started"
                      })}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {isRTL ? 'بدء التحقيق' : 'Start Investigation'}
                    </Button>
                  )}

                  {caseItem.status === "Under Investigation" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(caseItem.id, "Resolved", {
                        resolution_date: new Date().toISOString().split('T')[0]
                      })}
                      className="text-green-600 hover:text-green-700"
                    >
                      {isRTL ? 'تم الحل' : 'Mark Resolved'}
                    </Button>
                  )}

                  {caseItem.status === "Resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(caseItem.id, "Closed", {
                        resolution_date: new Date().toISOString().split('T')[0]
                      })}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      {isRTL ? 'إغلاق' : 'Close Case'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}