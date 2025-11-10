import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DisciplinaryActionForm({ actionData, employees, cases, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    case_id: "",
    action_type: "Written Warning",
    violation_type: "Policy Violation",
    violation_description: "",
    suspension_days: 0,
    suspension_start: "",
    suspension_end: "",
    salary_deduction_amount: 0,
    improvement_plan: "",
    review_date: "",
    expiry_date: "",
    ...actionData
  });

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate expiry date based on action type (12 months from now)
    if (!formData.expiry_date && formData.action_type !== "Termination") {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 12);
      formData.expiry_date = expiryDate.toISOString().split('T')[0];
    }
    
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

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {actionData ? (isRTL ? 'تعديل الإجراء' : 'Edit Action') : (isRTL ? 'إجراء تأديبي جديد' : 'New Disciplinary Action')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الموظف' : 'Employee'} *
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

            {/* Action Type */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'نوع الإجراء' : 'Action Type'} *
              </Label>
              <Select
                value={formData.action_type}
                onValueChange={(value) => setFormData({ ...formData, action_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verbal Warning">{isRTL ? 'إنذار شفهي' : 'Verbal Warning'}</SelectItem>
                  <SelectItem value="Written Warning">{isRTL ? 'إنذار كتابي' : 'Written Warning'}</SelectItem>
                  <SelectItem value="Final Warning">{isRTL ? 'إنذار أخير' : 'Final Warning'}</SelectItem>
                  <SelectItem value="Suspension (Paid)">{isRTL ? 'إيقاف مدفوع' : 'Suspension (Paid)'}</SelectItem>
                  <SelectItem value="Suspension (Unpaid)">{isRTL ? 'إيقاف غير مدفوع' : 'Suspension (Unpaid)'}</SelectItem>
                  <SelectItem value="Demotion">{isRTL ? 'خفض الدرجة' : 'Demotion'}</SelectItem>
                  <SelectItem value="Salary Reduction">{isRTL ? 'خصم من الراتب' : 'Salary Reduction'}</SelectItem>
                  <SelectItem value="Termination">{isRTL ? 'فصل' : 'Termination'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Violation Type */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'نوع المخالفة' : 'Violation Type'} *
              </Label>
              <Select
                value={formData.violation_type}
                onValueChange={(value) => setFormData({ ...formData, violation_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attendance">{isRTL ? 'الحضور' : 'Attendance'}</SelectItem>
                  <SelectItem value="Performance">{isRTL ? 'الأداء' : 'Performance'}</SelectItem>
                  <SelectItem value="Misconduct">{isRTL ? 'سوء السلوك' : 'Misconduct'}</SelectItem>
                  <SelectItem value="Policy Violation">{isRTL ? 'مخالفة سياسة' : 'Policy Violation'}</SelectItem>
                  <SelectItem value="Insubordination">{isRTL ? 'العصيان' : 'Insubordination'}</SelectItem>
                  <SelectItem value="Theft">{isRTL ? 'السرقة' : 'Theft'}</SelectItem>
                  <SelectItem value="Harassment">{isRTL ? 'التحرش' : 'Harassment'}</SelectItem>
                  <SelectItem value="Safety Violation">{isRTL ? 'مخالفة السلامة' : 'Safety Violation'}</SelectItem>
                  <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Linked Case */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'القضية المرتبطة' : 'Linked Case'}
              </Label>
              <Select
                value={formData.case_id}
                onValueChange={(value) => setFormData({ ...formData, case_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر قضية" : "Select case"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>{isRTL ? 'لا يوجد' : 'None'}</SelectItem>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.case_number} - {c.case_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Suspension Days */}
            {(formData.action_type === "Suspension (Paid)" || formData.action_type === "Suspension (Unpaid)") && (
              <>
                <div className="space-y-2">
                  <Label className={isRTL ? 'text-right block' : ''}>
                    {isRTL ? 'عدد أيام الإيقاف' : 'Suspension Days'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.suspension_days}
                    onChange={(e) => setFormData({ ...formData, suspension_days: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isRTL ? 'text-right block' : ''}>
                    {isRTL ? 'تاريخ بدء الإيقاف' : 'Suspension Start'}
                  </Label>
                  <Input
                    type="date"
                    value={formData.suspension_start}
                    onChange={(e) => setFormData({ ...formData, suspension_start: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Salary Deduction */}
            {formData.action_type === "Salary Reduction" && (
              <div className="space-y-2">
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'مبلغ الخصم (ريال)' : 'Deduction Amount (SAR)'}
                </Label>
                <Input
                  type="number"
                  value={formData.salary_deduction_amount}
                  onChange={(e) => setFormData({ ...formData, salary_deduction_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}

            {/* Review Date */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'تاريخ المراجعة' : 'Review Date'}
              </Label>
              <Input
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
              />
            </div>
          </div>

          {/* Violation Description */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'وصف المخالفة' : 'Violation Description'} *
            </Label>
            <Textarea
              value={formData.violation_description}
              onChange={(e) => setFormData({ ...formData, violation_description: e.target.value })}
              placeholder={isRTL ? "صف المخالفة بالتفصيل..." : "Describe the violation in detail..."}
              rows={4}
              required
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Improvement Plan */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'خطة التحسين' : 'Improvement Plan'}
            </Label>
            <Textarea
              value={formData.improvement_plan}
              onChange={(e) => setFormData({ ...formData, improvement_plan: e.target.value })}
              placeholder={isRTL ? "ماذا يجب على الموظف تحسينه؟" : "What should the employee improve?"}
              rows={3}
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Actions */}
          <div className={`flex gap-4 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700">
              {actionData ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
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