import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function CaseForm({ caseData, employees, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    case_type: "Grievance",
    employee_id: "",
    employee_name: "",
    reported_by_id: "",
    reported_by_name: "",
    incident_date: "",
    category: "Other",
    severity: "Medium",
    description: "",
    witnesses: "[]",
    evidence_urls: "[]",
    assigned_to_id: "",
    assigned_to_name: "",
    is_confidential: true,
    ...caseData
  });

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setFormData({
      ...formData,
      employee_id: employeeId,
      employee_name: employee ? employee.full_name : ""
    });
  };

  const handleAssignChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setFormData({
      ...formData,
      assigned_to_id: employeeId,
      assigned_to_name: employee ? employee.full_name : ""
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {caseData ? (isRTL ? 'تعديل القضية' : 'Edit Case') : (isRTL ? 'قضية جديدة' : 'New Case')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Case Type */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'نوع القضية' : 'Case Type'} *
              </Label>
              <Select
                value={formData.case_type}
                onValueChange={(value) => setFormData({ ...formData, case_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grievance">{isRTL ? 'شكوى' : 'Grievance'}</SelectItem>
                  <SelectItem value="Disciplinary">{isRTL ? 'تأديبية' : 'Disciplinary'}</SelectItem>
                  <SelectItem value="Investigation">{isRTL ? 'تحقيق' : 'Investigation'}</SelectItem>
                  <SelectItem value="Complaint">{isRTL ? 'مظلمة' : 'Complaint'}</SelectItem>
                  <SelectItem value="Conflict">{isRTL ? 'نزاع' : 'Conflict'}</SelectItem>
                  <SelectItem value="Performance Issue">{isRTL ? 'مشكلة أداء' : 'Performance Issue'}</SelectItem>
                  <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Employee */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الموظف المعني' : 'Subject Employee'} *
              </Label>
              <Select
                value={formData.employee_id}
                onValueChange={handleEmployeeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر موظف" : "Select employee"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name} - {emp.employee_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الفئة' : 'Category'} *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Harassment">{isRTL ? 'تحرش' : 'Harassment'}</SelectItem>
                  <SelectItem value="Discrimination">{isRTL ? 'تمييز' : 'Discrimination'}</SelectItem>
                  <SelectItem value="Policy Violation">{isRTL ? 'مخالفة سياسة' : 'Policy Violation'}</SelectItem>
                  <SelectItem value="Theft">{isRTL ? 'سرقة' : 'Theft'}</SelectItem>
                  <SelectItem value="Misconduct">{isRTL ? 'سوء سلوك' : 'Misconduct'}</SelectItem>
                  <SelectItem value="Attendance">{isRTL ? 'حضور' : 'Attendance'}</SelectItem>
                  <SelectItem value="Performance">{isRTL ? 'أداء' : 'Performance'}</SelectItem>
                  <SelectItem value="Workplace Safety">{isRTL ? 'السلامة المهنية' : 'Workplace Safety'}</SelectItem>
                  <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الأولوية' : 'Severity'} *
              </Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">{isRTL ? 'منخفضة' : 'Low'}</SelectItem>
                  <SelectItem value="Medium">{isRTL ? 'متوسطة' : 'Medium'}</SelectItem>
                  <SelectItem value="High">{isRTL ? 'عالية' : 'High'}</SelectItem>
                  <SelectItem value="Critical">{isRTL ? 'حرجة' : 'Critical'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Incident Date */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'تاريخ الحادثة' : 'Incident Date'} *
              </Label>
              <Input
                type="date"
                value={formData.incident_date}
                onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                required
              />
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'المحقق المسؤول' : 'Assigned To'}
              </Label>
              <Select
                value={formData.assigned_to_id}
                onValueChange={handleAssignChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر محقق" : "Select investigator"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.department === "HR").map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'الوصف التفصيلي' : 'Detailed Description'} *
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isRTL ? "صف الحادثة أو الشكوى بالتفصيل..." : "Describe the incident or complaint in detail..."}
              rows={6}
              required
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Confidential */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Checkbox
              id="confidential"
              checked={formData.is_confidential}
              onCheckedChange={(checked) => setFormData({ ...formData, is_confidential: checked })}
            />
            <Label htmlFor="confidential" className={`cursor-pointer ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'قضية سرية' : 'Confidential Case'}
            </Label>
          </div>

          {/* Actions */}
          <div className={`flex gap-4 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700">
              {caseData ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}