
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button"; // Added Button import

export default function LEA01LeaveApplication({ employee, user, selectedRequest }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    days_count: "",
    reason: "",
    backup_contact: "",
    backup_phone: "",
    emergency_contact: "",
    emergency_phone: ""
  });
  const [saving, setSaving] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      setFormData({
        leave_type: selectedRequest.leave_type_name || "",
        start_date: selectedRequest.start_date || "",
        end_date: selectedRequest.end_date || "",
        days_count: selectedRequest.days_count || "",
        reason: selectedRequest.reason || "",
        backup_contact: "", // Assuming these are not pre-filled for viewing past requests
        backup_phone: "", // Assuming these are not pre-filled for viewing past requests
        emergency_contact: "", // Assuming these are not pre-filled for viewing past requests
        emergency_phone: "" // Assuming these are not pre-filled for viewing past requests
      });
    }
  }, [selectedRequest]);

  const loadLeaveTypes = async () => {
    try {
      const types = await base44.entities.LeaveType.list();
      setLeaveTypes(types || []);
    } catch (error) {
      console.error("Error loading leave types:", error);
    }
  };

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      setFormData({ ...formData, days_count: days });
    }
  };

  const handleSubmit = async () => {
    if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) {
      alert(isRTL ? "يرجى ملء جميع الحقول المطلوبة (*)" : "Please fill in all required fields (*)");
      return;
    }

    if (!employee) {
      alert(isRTL ? "يرجى تحديد الموظف أولاً" : "Please select an employee first");
      return;
    }

    setSaving(true);
    try {
      const leaveType = leaveTypes.find(lt => lt.leave_type_name === formData.leave_type);
      
      await base44.entities.LeaveRequest.create({
        employee_id: employee.id,
        employee_name: employee.full_name,
        leave_type_id: leaveType?.id || "",
        leave_type_name: formData.leave_type,
        leave_category: leaveType?.leave_category || "",
        start_date: formData.start_date,
        end_date: formData.end_date,
        days_count: formData.days_count,
        reason: formData.reason,
        contact_during_leave: `Backup: ${formData.backup_contact || 'N/A'} (${formData.backup_phone || 'N/A'}), Emergency: ${formData.emergency_contact || 'N/A'} (${formData.emergency_phone || 'N/A'})`,
        status: "Pending"
      });

      alert(isRTL ? "تم تقديم طلب الإجازة بنجاح!" : "Leave request submitted successfully!");
      
      // Reset form
      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        days_count: "",
        reason: "",
        backup_contact: "",
        backup_phone: "",
        emergency_contact: "",
        emergency_phone: ""
      });
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert(isRTL ? "حدث خطأ في تقديم الطلب" : "Error submitting request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-lg print:shadow-none print:border-2 print:border-black print:block print:scale-95">
      <CardHeader className="border-b-2 border-gray-200 print:border-black bg-gradient-to-r from-[#B11116] to-[#991014] text-white print:bg-white print:text-black print:block print:p-4">
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <CardTitle className="text-2xl">{isRTL ? 'نموذج طلب إجازة' : 'Leave Application Form'}</CardTitle>
            <p className="text-sm mt-1 opacity-90 print:text-black">{isRTL ? 'نموذج رقم: LEA-01' : 'Form No: LEA-01'}</p>
          </div>
          <div className={`text-sm ${isRTL ? 'text-left' : 'text-right'}`}>
            <p>{isRTL ? 'التاريخ:' : 'Date:'} {format(new Date(), 'dd/MM/yyyy')}</p>
            <p>{isRTL ? 'الوقت:' : 'Time:'} {format(new Date(), 'HH:mm')}</p>
            {selectedRequest && (
              <Badge className="mt-2 bg-green-600">
                {isRTL ? `الحالة: ${selectedRequest.status}` : `Status: ${selectedRequest.status}`}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 print:p-4 print:block">
        {/* Employee Information */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 print:mb-2 print:text-sm pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'معلومات الموظف' : 'Employee Information'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 print:gap-2">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'اسم الموظف' : 'Employee Name'}</Label>
              <Input 
                value={employee?.full_name || user?.full_name || ''} 
                readOnly 
                className="border-2 print:border-black bg-gray-50"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'رقم الموظف' : 'Employee ID'}</Label>
              <Input 
                value={employee?.employee_id || ''} 
                readOnly 
                className="border-2 print:border-black bg-gray-50"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'القسم' : 'Department'}</Label>
              <Input 
                value={employee?.department || ''} 
                readOnly 
                className="border-2 print:border-black bg-gray-50"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'المسمى الوظيفي' : 'Job Title'}</Label>
              <Input 
                value={employee?.job_title || ''} 
                readOnly 
                className="border-2 print:border-black bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Leave Details */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 print:mb-2 print:text-sm pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'تفاصيل الإجازة' : 'Leave Details'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 print:gap-2">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نوع الإجازة *' : 'Leave Type *'}</Label>
              <Select 
                value={formData.leave_type} 
                onValueChange={(v) => setFormData({...formData, leave_type: v})}
                disabled={!!selectedRequest} // Disable if viewing an existing request
              >
                <SelectTrigger className="border-2 print:border-black">
                  <SelectValue placeholder={isRTL ? "اختر نوع الإجازة" : "Select leave type"} />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.leave_type_name}>
                      {type.leave_type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'عدد الأيام' : 'Number of Days'}</Label>
              <Input 
                type="number"
                value={formData.days_count} 
                onChange={(e) => setFormData({...formData, days_count: e.target.value})}
                className="border-2 print:border-black"
                readOnly={!!selectedRequest}
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ البداية *' : 'Start Date *'}</Label>
              <Input 
                type="date"
                value={formData.start_date} 
                onChange={(e) => {
                  setFormData({...formData, start_date: e.target.value});
                  setTimeout(calculateDays, 100);
                }}
                className="border-2 print:border-black"
                readOnly={!!selectedRequest}
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ النهاية *' : 'End Date *'}</Label>
              <Input 
                type="date"
                value={formData.end_date} 
                onChange={(e) => {
                  setFormData({...formData, end_date: e.target.value});
                  setTimeout(calculateDays, 100);
                }}
                className="border-2 print:border-black"
                readOnly={!!selectedRequest}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'سبب الإجازة *' : 'Reason for Leave *'}</Label>
            <Textarea 
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows={3}
              className="border-2 print:border-black"
              placeholder={isRTL ? "اشرح سبب طلب الإجازة..." : "Explain the reason for your leave request..."}
              readOnly={!!selectedRequest}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 print:mb-2 print:text-sm pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 print:gap-2">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الشخص البديل' : 'Backup Contact'}</Label>
              <Input 
                value={formData.backup_contact}
                onChange={(e) => setFormData({...formData, backup_contact: e.target.value})}
                className="border-2 print:border-black"
                placeholder={isRTL ? "اسم الشخص البديل" : "Name of backup person"}
                readOnly={!!selectedRequest}
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'هاتف الشخص البديل' : 'Backup Phone'}</Label>
              <Input 
                value={formData.backup_phone}
                onChange={(e) => setFormData({...formData, backup_phone: e.target.value})}
                className="border-2 print:border-black"
                placeholder="+966 XXX XXX XXX"
                readOnly={!!selectedRequest}
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}</Label>
              <Input 
                value={formData.emergency_contact}
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                className="border-2 print:border-black"
                placeholder={isRTL ? "اسم جهة الاتصال في حالات الطوارئ" : "Emergency contact name"}
                readOnly={!!selectedRequest}
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'هاتف الطوارئ' : 'Emergency Phone'}</Label>
              <Input 
                value={formData.emergency_phone}
                onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                className="border-2 print:border-black"
                placeholder="+966 XXX XXX XXX"
                readOnly={!!selectedRequest}
              />
            </div>
          </div>
        </div>

        {/* Approval Chain */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 print:mb-2 print:text-sm pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'سلسلة الموافقات' : 'Approval Chain'}
          </h3>
          <div className="space-y-6 print:space-y-2">
            {/* Direct Manager */}
            <div className="border-2 border-gray-300 print:border-black p-4 rounded">
              <div className="grid md:grid-cols-3 gap-4 print:gap-2">
                <div>
                  <Label className={`text-sm font-bold ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'المدير المباشر' : 'Direct Manager'}
                  </Label>
                  <Input 
                    value={employee?.manager_name || ''} 
                    readOnly 
                    className="border print:border-black bg-gray-50"
                  />
                </div>
                <div>
                  <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'التوقيع' : 'Signature'}
                  </Label>
                  <div className="h-10 border-2 border-gray-300 print:border-black rounded"></div>
                </div>
                <div>
                  <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'التاريخ' : 'Date'}
                  </Label>
                  <Input 
                    value={selectedRequest?.approved_date || ''} 
                    className="border print:border-black bg-gray-50" 
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Department Head */}
            <div className="border-2 border-gray-300 print:border-black p-4 rounded">
              <div className="grid md:grid-cols-3 gap-4 print:gap-2">
                <div>
                  <Label className={`text-sm font-bold ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'رئيس القسم' : 'Department Head'}
                  </Label>
                  <Input className="border print:border-black" readOnly={true} /> {/* Should be readOnly for approval chain */}
                </div>
                <div>
                  <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'التوقيع' : 'Signature'}
                  </Label>
                  <div className="h-10 border-2 border-gray-300 print:border-black rounded"></div>
                </div>
                <div>
                  <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'التاريخ' : 'Date'}
                  </Label>
                  <Input className="border print:border-black" readOnly={true} /> {/* Should be readOnly for approval chain */}
                </div>
              </div>
            </div>

            {/* HR Department */}
            <div className="border-2 border-gray-300 print:border-black p-4 rounded">
              <div className="grid md:grid-cols-3 gap-4 print:gap-2">
                <div>
                  <Label className={`text-sm font-bold ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'قسم الموارد البشرية' : 'HR Department'}
                  </Label>
                  <Input className="border print:border-black" readOnly={true} /> {/* Should be readOnly for approval chain */}
                </div>
                <div>
                  <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'التوقيع' : 'Signature'}
                  </Label>
                  <div className="h-10 border-2 border-gray-300 print:border-black rounded"></div>
                </div>
                <div>
                  <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'التاريخ' : 'Date'}
                  </Label>
                  <Input className="border print:border-black" readOnly={true} /> {/* Should be readOnly for approval chain */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Declaration */}
        <div className="border-2 border-[#B11116] p-4 print:p-2 rounded bg-red-50 print:my-2">
          <p className={`text-sm ${isRTL ? 'text-right' : ''}`}>
            {isRTL 
              ? 'أقر بأن المعلومات المذكورة أعلاه صحيحة وكاملة. وأتعهد بالالتزام بسياسات وإجراءات الشركة المتعلقة بالإجازات.'
              : 'I declare that the information provided above is true and complete. I commit to comply with the company\'s leave policies and procedures.'
            }
          </p>
          <div className="grid md:grid-cols-2 gap-4 print:gap-2 mt-4">
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
        {!selectedRequest && ( // Only show submit button if not viewing an existing request
          <div className={`mt-6 flex gap-3 justify-end print:hidden ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              onClick={handleSubmit}
              disabled={saving || !employee}
              className="bg-gradient-to-r from-[#B11116] to-[#991014] text-white px-8 py-2 hover:from-[#991014] hover:to-[#B11116]"
            >
              {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'تقديم الطلب' : 'Submit Request')}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className={`mt-8 print:mt-2 pt-4 print:pt-2 border-t-2 border-gray-200 text-xs print:text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-center'}`}>
          <p>{isRTL ? 'للاستخدام الرسمي فقط - نموذج LEA-01' : 'For Official Use Only - Form LEA-01'}</p>
          <p className="mt-1">{isRTL ? 'مجموعة جاسكو - نظام إدارة الموارد البشرية' : 'JASCO GROUP - HR Management System'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
