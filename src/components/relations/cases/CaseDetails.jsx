import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  User, 
  Calendar, 
  FileText, 
  Edit, 
  X,
  CheckCircle,
  Clock
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function CaseDetails({ caseData, employees, onUpdate, onClose, onEdit }) {
  const [investigation, setInvestigation] = useState(caseData.investigation_notes || "");
  const [findings, setFindings] = useState(caseData.findings || "");
  const [action, setAction] = useState(caseData.action_taken || "");
  
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const employee = employees.find(e => e.id === caseData.employee_id);
  const reporter = employees.find(e => e.id === caseData.reported_by_id);
  const investigator = employees.find(e => e.id === caseData.assigned_to_id);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleSaveInvestigation = () => {
    onUpdate(caseData.id, caseData.status, {
      investigation_notes: investigation,
      findings: findings,
      action_taken: action
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle>{caseData.case_number}</CardTitle>
              <Badge variant="outline" className={getSeverityColor(caseData.severity)}>
                {caseData.severity}
              </Badge>
              <Badge variant="outline" className={
                caseData.status === "Closed" ? "bg-gray-100 text-gray-800" :
                caseData.status === "Resolved" ? "bg-green-100 text-green-800" :
                caseData.status === "Under Investigation" ? "bg-blue-100 text-blue-800" :
                "bg-orange-100 text-orange-800"
              }>
                {caseData.status}
              </Badge>
              {caseData.is_confidential && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  {isRTL ? 'سري' : 'Confidential'}
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
          {/* Case Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? 'نوع القضية' : 'Case Type'}
                </h3>
                <p className="text-base text-gray-900">{caseData.case_type}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? 'الفئة' : 'Category'}
                </h3>
                <p className="text-base text-gray-900">{caseData.category}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? 'الموظف المعني' : 'Subject Employee'}
                </h3>
                <p className="text-base text-gray-900">{employee?.full_name || caseData.employee_name}</p>
                {employee && (
                  <p className="text-sm text-gray-500">{employee.department} - {employee.job_title}</p>
                )}
              </div>
            </div>

            <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? 'تاريخ الحادثة' : 'Incident Date'}
                </h3>
                <p className="text-base text-gray-900">
                  {caseData.incident_date ? format(parseISO(caseData.incident_date), 'MMMM dd, yyyy') : 'N/A'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? 'تاريخ الإبلاغ' : 'Reported Date'}
                </h3>
                <p className="text-base text-gray-900">
                  {caseData.reported_date ? format(parseISO(caseData.reported_date), 'MMMM dd, yyyy') : 'N/A'}
                </p>
              </div>

              {investigator && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {isRTL ? 'المحقق المسؤول' : 'Assigned Investigator'}
                  </h3>
                  <p className="text-base text-gray-900">{investigator.full_name}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className={isRTL ? 'text-right' : ''}>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              {isRTL ? 'الوصف التفصيلي' : 'Detailed Description'}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{caseData.description}</p>
            </div>
          </div>

          {/* Investigation Section */}
          {(caseData.status === "Under Investigation" || caseData.status === "Resolved" || caseData.status === "Closed") && (
            <>
              <Separator />
              <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isRTL ? 'ملاحظات التحقيق' : 'Investigation Notes'}
                </h3>
                <Textarea
                  value={investigation}
                  onChange={(e) => setInvestigation(e.target.value)}
                  placeholder={isRTL ? "أضف ملاحظات التحقيق..." : "Add investigation notes..."}
                  rows={4}
                  className={isRTL ? 'text-right' : ''}
                />

                <h3 className="text-lg font-semibold text-gray-900 mt-4">
                  {isRTL ? 'النتائج' : 'Findings'}
                </h3>
                <Textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder={isRTL ? "أضف نتائج التحقيق..." : "Add investigation findings..."}
                  rows={4}
                  className={isRTL ? 'text-right' : ''}
                />

                <h3 className="text-lg font-semibold text-gray-900 mt-4">
                  {isRTL ? 'الإجراء المتخذ' : 'Action Taken'}
                </h3>
                <Textarea
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder={isRTL ? "صف الإجراء المتخذ..." : "Describe the action taken..."}
                  rows={3}
                  className={isRTL ? 'text-right' : ''}
                />

                <Button onClick={handleSaveInvestigation} className="bg-gradient-to-r from-green-600 to-green-700">
                  {isRTL ? 'حفظ التحديثات' : 'Save Updates'}
                </Button>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator />
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {caseData.status === "Open" && (
              <Button 
                onClick={() => onUpdate(caseData.id, "Under Investigation")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRTL ? 'بدء التحقيق' : 'Start Investigation'}
              </Button>
            )}

            {caseData.status === "Under Investigation" && (
              <Button 
                onClick={() => onUpdate(caseData.id, "Resolved", {
                  resolution_date: new Date().toISOString().split('T')[0]
                })}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRTL ? 'تم الحل' : 'Mark as Resolved'}
              </Button>
            )}

            {caseData.status === "Resolved" && (
              <Button 
                onClick={() => onUpdate(caseData.id, "Closed", {
                  resolution_date: new Date().toISOString().split('T')[0]
                })}
                className="bg-gray-600 hover:bg-gray-700"
              >
                {isRTL ? 'إغلاق القضية' : 'Close Case'}
              </Button>
            )}

            {caseData.status !== "Closed" && (
              <Button 
                variant="outline"
                onClick={() => onUpdate(caseData.id, "Escalated")}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                {isRTL ? 'تصعيد' : 'Escalate'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}