
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Added Button import
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function LEA05HolidayWorkApproval({ employee, user }) {
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState({
    holiday_date: "",
    holiday_name: "",
    work_hours: "",
    project_task: "",
    justification: "",
    compensation_type: "pay",
    comp_leave_date: ""
  });
  const [saving, setSaving] = useState(false); // Added saving state
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const holidayData = await base44.entities.PublicHoliday.list();
      setHolidays(holidayData || []);
    } catch (error) {
      console.error("Error loading holidays:", error);
      // Optionally, show an error message to the user
    }
  };

  const handleHolidaySelect = (holidayId) => {
    const holiday = holidays.find(h => h.id === holidayId);
    if (holiday) {
      setFormData({
        ...formData,
        holiday_date: holiday.holiday_date,
        holiday_name: holiday.holiday_name
      });
    }
  };

  // Added handleSubmit function
  const handleSubmit = async () => {
    if (!formData.holiday_date || !formData.work_hours || !formData.justification) {
      alert(isRTL ? "يرجى ملء جميع الحقول المطلوبة (*)" : "Please fill in all required fields (*)");
      return;
    }

    if (!employee) {
      alert(isRTL ? "يرجى تحديد الموظف أولاً" : "Please select an employee first");
      return;
    }

    if (formData.compensation_type === 'comp_leave' && !formData.comp_leave_date) {
      alert(isRTL ? "يرجى تحديد تاريخ الإجازة التعويضية" : "Please select a Compensatory Leave Date");
      return;
    }


    setSaving(true);
    try {
      // Create a timesheet entry for holiday work
      await base44.entities.Timesheet.create({
        employee_id: employee.id,
        employee_name: employee.full_name,
        date: formData.holiday_date,
        project_code: formData.project_task || "HOLIDAY_WORK",
        project_name: formData.project_task || "Holiday Work",
        task_name: `Work on ${formData.holiday_name || 'Public Holiday'}`,
        hours: parseFloat(formData.work_hours) || 0,
        is_billable: false,
        description: `${formData.justification}\nCompensation: ${formData.compensation_type === 'pay' ? 'Additional Pay (200%)' : 'Compensatory Leave on ' + (formData.comp_leave_date || 'TBD')}`,
        status: "Submitted"
      });

      // If compensatory leave is selected, create a leave request
      if (formData.compensation_type === 'comp_leave' && formData.comp_leave_date) {
        const compOffLeaveType = await base44.entities.LeaveType.filter({ leave_category: "Comp-off" });
        
        await base44.entities.LeaveRequest.create({
          employee_id: employee.id,
          employee_name: employee.full_name,
          leave_type_id: compOffLeaveType[0]?.id || "",
          leave_type_name: "Compensatory Leave",
          leave_category: "Comp-off",
          start_date: formData.comp_leave_date,
          end_date: formData.comp_leave_date,
          days_count: 1, // Assuming 1 day for comp leave for now
          reason: `Compensatory leave for working on ${formData.holiday_name || 'Public Holiday'} (${formData.holiday_date})`,
          status: "Pending"
        });
      }

      alert(isRTL ? "تم تقديم طلب العمل في العطلة بنجاح!" : "Holiday work request submitted successfully!");
      
      // Reset form
      setFormData({
        holiday_date: "",
        holiday_name: "",
        work_hours: "",
        project_task: "",
        justification: "",
        compensation_type: "pay",
        comp_leave_date: ""
      });
    } catch (error) {
      console.error("Error submitting holiday work request:", error);
      alert(isRTL ? "حدث خطأ في تقديم الطلب" : `Error submitting request: ${error.message || "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-lg print:shadow-none print:border-2 print:border-black print:block print:scale-95">
      <CardHeader className="border-b-2 border-gray-200 print:border-black bg-gradient-to-r from-[#B11116] to-[#991014] text-white print:bg-white print:text-black print:block print:p-4">
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <CardTitle className="text-2xl">{isRTL ? 'نموذج موافقة العمل في عطلة رسمية' : 'Public Holiday Work Approval'}</CardTitle>
            <p className="text-sm mt-1 opacity-90 print:text-black">{isRTL ? 'نموذج رقم: LEA-05' : 'Form No: LEA-05'}</p>
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

        {/* Holiday Details */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'تفاصيل العطلة' : 'Holiday Details'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'العطلة الرسمية *' : 'Public Holiday *'}</Label>
              <Select onValueChange={handleHolidaySelect} value={holidays.find(h => h.holiday_date === formData.holiday_date)?.id || ""}>
                <SelectTrigger className="border-2 print:border-black">
                  <SelectValue placeholder={isRTL ? "اختر العطلة" : "Select holiday"} />
                </SelectTrigger>
                <SelectContent>
                  {holidays.map((holiday) => (
                    <SelectItem key={holiday.id} value={holiday.id}>
                      {holiday.holiday_name} - {holiday.holiday_date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'التاريخ' : 'Date'}</Label>
              <Input value={formData.holiday_date} readOnly className="border-2 print:border-black bg-gray-50" />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'ساعات العمل المتوقعة *' : 'Expected Work Hours *'}</Label>
              <Input 
                type="number"
                value={formData.work_hours}
                onChange={(e) => setFormData({...formData, work_hours: e.target.value})}
                className="border-2 print:border-black"
                placeholder="8"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'المشروع/المهمة' : 'Project/Task'}</Label>
              <Input 
                value={formData.project_task}
                onChange={(e) => setFormData({...formData, project_task: e.target.value})}
                className="border-2 print:border-black"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'مبرر العمل في العطلة *' : 'Justification for Working on Holiday *'}</Label>
            <Textarea 
              value={formData.justification}
              onChange={(e) => setFormData({...formData, justification: e.target.value})}
              rows={4}
              className="border-2 print:border-black"
              placeholder={isRTL ? "اشرح لماذا من الضروري العمل في هذه العطلة..." : "Explain why it's necessary to work on this holiday..."}
            />
          </div>
        </div>

        {/* Compensation Options */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'خيارات التعويض' : 'Compensation Options'}
          </h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block mb-2' : 'mb-2'}>{isRTL ? 'نوع التعويض *' : 'Compensation Type *'}</Label>
                <Select value={formData.compensation_type} onValueChange={(v) => setFormData({...formData, compensation_type: v})}>
                  <SelectTrigger className="border-2 print:border-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pay">{isRTL ? 'أجر إضافي (200%)' : 'Additional Pay (200%)'}</SelectItem>
                    <SelectItem value="comp_leave">{isRTL ? 'إجازة تعويضية' : 'Compensatory Leave'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.compensation_type === 'comp_leave' && (
                <div>
                  <Label className={isRTL ? 'text-right block mb-2' : 'mb-2'}>{isRTL ? 'تاريخ الإجازة التعويضية *' : 'Compensatory Leave Date *'}</Label>
                  <Input 
                    type="date"
                    value={formData.comp_leave_date}
                    onChange={(e) => setFormData({...formData, comp_leave_date: e.target.value})}
                    className="border-2 print:border-black"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Approval Chain */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'سلسلة الموافقات' : 'Approval Chain'}
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-gray-300 print:border-black p-4 rounded">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className={`text-sm font-bold ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'المدير المباشر' : 'Direct Manager'}
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
            </div>

            <div className="border-2 border-gray-300 print:border-black p-4 rounded">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className={`text-sm font-bold ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'قسم الموارد البشرية' : 'HR Department'}
                  </Label>
                  <Input className="border print:border-black" />
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
            </div>
          </div>
        </div>

        {/* Employee Declaration */}
        <div className="border-2 border-[#B11116] p-4 rounded bg-red-50">
          <p className={`text-sm ${isRTL ? 'text-right' : ''}`}>
            {isRTL 
              ? 'أقر بأن العمل في العطلة الرسمية ضروري وأفهم شروط التعويض المطلوبة.'
              : 'I declare that working on this public holiday is necessary and understand the compensation terms required.'
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
            disabled={saving || !employee}
            className="bg-gradient-to-r from-[#B11116] to-[#991014] text-white px-8 py-2"
          >
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'تقديم الطلب' : 'Submit Request')}
          </Button>
        </div>

        {/* Footer */}
        <div className={`mt-8 pt-4 border-t-2 border-gray-200 text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-center'}`}>
          <p>{isRTL ? 'للاستخدام الرسمي فقط - نموذج LEA-05' : 'For Official Use Only - Form LEA-05'}</p>
          <p className="mt-1">{isRTL ? 'مجموعة جاسكو - نظام إدارة الموارد البشرية' : 'JASCO GROUP - HR Management System'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
