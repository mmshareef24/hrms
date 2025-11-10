
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function LEA04OvertimeRequest({ employee, user }) {
  const [formData, setFormData] = useState({
    overtime_date: "",
    start_time: "",
    end_time: "",
    total_hours: "",
    project_task: "",
    reason: "",
    is_urgent: false
  });
  const [saving, setSaving] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const calculateHours = () => {
    if (formData.start_time && formData.end_time) {
      const [startH, startM] = formData.start_time.split(':').map(Number);
      const [endH, endM] = formData.end_time.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;

      // Handle cases where end time is on the next day (e.g., ends past midnight)
      // This simple calculation assumes overtime doesn't span more than 24 hours
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60; // Add 24 hours in minutes
      }
      
      const diffMinutes = endMinutes - startMinutes;
      const hours = (diffMinutes / 60).toFixed(2);
      setFormData(prevData => ({...prevData, total_hours: hours}));
    } else if (formData.total_hours !== "") {
      // If either start/end time is cleared, clear total hours
      setFormData(prevData => ({...prevData, total_hours: ""}));
    }
  };

  const handleTimeChange = (e, field) => {
    setFormData(prevData => ({...prevData, [field]: e.target.value}));
    // Use a timeout to ensure state is updated before calculation, or use useEffect for more complex dependencies
    setTimeout(calculateHours, 0); 
  };

  const handleSubmit = async () => {
    if (!formData.overtime_date || !formData.start_time || !formData.end_time || !formData.project_task || !formData.reason) {
      alert(isRTL ? "يرجى ملء جميع الحقول المطلوبة (*)" : "Please fill in all required fields (*)");
      return;
    }
    
    const totalHoursNum = parseFloat(formData.total_hours);
    if (isNaN(totalHoursNum) || totalHoursNum <= 0) {
      alert(isRTL ? "الرجاء تحديد وقت بدء وانتهاء صالح لحساب الساعات الإجمالية." : "Please provide valid start and end times to calculate total hours.");
      return;
    }


    // Ensure employee object is valid and has an ID
    const actualEmployee = employee || user;
    if (!actualEmployee || !actualEmployee.id) {
      alert(isRTL ? "لا يمكن تحديد الموظف. الرجاء التأكد من تسجيل الدخول أو تحديد موظف صالح." : "Employee cannot be identified. Please ensure you are logged in or a valid employee is selected.");
      return;
    }

    setSaving(true);
    try {
      // Create a timesheet entry for overtime
      await base44.entities.Timesheet.create({
        employee_id: actualEmployee.id,
        employee_name: actualEmployee.full_name,
        date: formData.overtime_date,
        project_code: formData.project_task, // Using project_task as project_code
        project_name: formData.project_task, // Using project_task as project_name
        task_name: `Overtime Work (${formData.start_time} - ${formData.end_time})`,
        hours: totalHoursNum,
        is_billable: false, // Overtime is typically not billable to client directly
        description: `${formData.reason} ${formData.is_urgent ? '(URGENT)' : ''}`,
        status: "Submitted" // Initial status as Submitted
      });

      alert(isRTL ? "تم تقديم طلب العمل الإضافي بنجاح!" : "Overtime request submitted successfully!");
      
      // Reset form
      setFormData({
        overtime_date: "",
        start_time: "",
        end_time: "",
        total_hours: "",
        project_task: "",
        reason: "",
        is_urgent: false
      });
    } catch (error) {
      console.error("Error submitting overtime request:", error);
      alert(isRTL ? "حدث خطأ في تقديم الطلب: " + (error.message || error.toString()) : "Error submitting request: " + (error.message || error.toString()));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-lg print:shadow-none print:border-2 print:border-black print:block print:scale-95">
      <CardHeader className="border-b-2 border-gray-200 print:border-black bg-gradient-to-r from-[#B11116] to-[#991014] text-white print:bg-white print:text-black print:block print:p-4">
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <CardTitle className="text-2xl">{isRTL ? 'نموذج طلب عمل إضافي' : 'Overtime Request Form'}</CardTitle>
            <p className="text-sm mt-1 opacity-90 print:text-black">{isRTL ? 'نموذج رقم: LEA-04' : 'Form No: LEA-04'}</p>
          </div>
          <div className={`text-sm ${isRTL ? 'text-left' : 'text-right'}`}>
            <p>{isRTL ? 'التاريخ:' : 'Date:'} {format(new Date(), 'dd/MM/yyyy')}</p>
            <p>{isRTL ? 'الوقت:' : 'Time:'} {format(new Date(), 'HH:mm')}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 print:p-4 print:block">
        {/* Employee Information */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'معلومات الموظف' : 'Employee Information'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'اسم الموظف' : 'Employee Name'}</Label>
              <Input value={employee?.full_name || user?.full_name || ''} readOnly className="border-2 print:border-black" />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'رقم الموظف' : 'Employee ID'}</Label>
              <Input value={employee?.employee_id || ''} readOnly className="border-2 print:border-black" />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'القسم' : 'Department'}</Label>
              <Input value={employee?.department || ''} readOnly className="border-2 print:border-black" />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'المسمى الوظيفي' : 'Job Title'}</Label>
              <Input value={employee?.job_title || ''} readOnly className="border-2 print:border-black" />
            </div>
          </div>
        </div>

        {/* Overtime Details */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'تفاصيل العمل الإضافي' : 'Overtime Details'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'التاريخ *' : 'Date *'}</Label>
              <Input 
                type="date"
                value={formData.overtime_date}
                onChange={(e) => setFormData({...formData, overtime_date: e.target.value})}
                className="border-2 print:border-black"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'إجمالي الساعات' : 'Total Hours'}</Label>
              <Input 
                type="number"
                value={formData.total_hours}
                readOnly
                className="border-2 print:border-black bg-gray-50"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'وقت البداية *' : 'Start Time *'}</Label>
              <Input 
                type="time"
                value={formData.start_time}
                onChange={(e) => handleTimeChange(e, 'start_time')}
                className="border-2 print:border-black"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'وقت النهاية *' : 'End Time *'}</Label>
              <Input 
                type="time"
                value={formData.end_time}
                onChange={(e) => handleTimeChange(e, 'end_time')}
                className="border-2 print:border-black"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'المشروع/المهمة *' : 'Project/Task *'}</Label>
            <Input 
              value={formData.project_task}
              onChange={(e) => setFormData({...formData, project_task: e.target.value})}
              className="border-2 print:border-black"
              placeholder={isRTL ? "اسم المشروع أو المهمة" : "Project or task name"}
            />
          </div>

          <div className="mt-4">
            <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'سبب العمل الإضافي *' : 'Reason for Overtime *'}</Label>
            <Textarea 
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows={4}
              className="border-2 print:border-black"
              placeholder={isRTL ? "اشرح السبب وراء الحاجة إلى العمل الإضافي..." : "Explain the reason for overtime..."}
            />
          </div>

          <div className="mt-4">
            <label className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <input 
                type="checkbox"
                checked={formData.is_urgent}
                onChange={(e) => setFormData({...formData, is_urgent: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm">{isRTL ? 'عمل إضافي عاجل' : 'Urgent Overtime'}</span>
            </label>
          </div>
        </div>

        {/* Manager Approval */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'موافقة المدير' : 'Manager Approval'}
          </h3>
          <div className="border-2 border-gray-300 print:border-black p-4 rounded">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                  {isRTL ? 'اسم المدير' : 'Manager Name'}
                </Label>
                <Input value={employee?.manager_name || ''} readOnly className="border print:border-black" />
              </div>
              <div>
                <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                  {isRTL ? 'التاريخ' : 'Date'}
                </Label>
                <Input className="border print:border-black" />
              </div>
            </div>
            <div className="mt-4">
              <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                {isRTL ? 'التوقيع' : 'Signature'}
              </Label>
              <div className="h-16 border-2 border-gray-300 print:border-black rounded bg-white"></div>
            </div>
            <div className="mt-4">
              <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                {isRTL ? 'ملاحظات المدير' : 'Manager Comments'}
              </Label>
              <Textarea rows={2} className="border print:border-black" />
            </div>
          </div>
        </div>

        {/* Employee Declaration */}
        <div className="border-2 border-[#B11116] p-4 rounded bg-red-50 print:mb-3">
          <p className={`text-sm ${isRTL ? 'text-right' : ''}`}>
            {isRTL 
              ? 'أقر بأن هذا الطلب ضروري لإنجاز العمل وأفهم أن العمل الإضافي يخضع لموافقة الإدارة.'
              : 'I declare that this overtime is necessary for work completion and understand it is subject to management approval.'
            }
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                {isRTL ? 'توقيع الموظف' : 'Employee Signature'}
              </Label>
              <div className="h-16 border-2 border-gray-400 rounded bg-white"></div>
            </div>
            <div>
              <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                {isRTL ? 'التاريخ' : 'Date'}
              </Label>
              <Input value={format(new Date(), 'dd/MM/yyyy')} readOnly className="border-2" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className={`mt-6 flex gap-3 justify-end print:hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            onClick={handleSubmit}
            disabled={saving || (!employee && !user)}
            className="bg-gradient-to-r from-[#B11116] to-[#991014] text-white px-8 py-2"
          >
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'تقديم الطلب' : 'Submit Request')}
          </Button>
        </div>

        {/* Footer */}
        <div className={`mt-8 pt-4 border-t-2 border-gray-200 text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-center'} print:mt-4 print:pt-2`}>
          <p>{isRTL ? 'للاستخدام الرسمي فقط - نموذج LEA-04' : 'For Official Use Only - Form LEA-04'}</p>
          <p className="mt-1">{isRTL ? 'مجموعة جاسكو - نظام إدارة الموارد البشرية' : 'JASCO GROUP - HR Management System'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
