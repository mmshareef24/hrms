
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function LEA03AttendanceCorrection({ employee, user }) {
  const [formData, setFormData] = useState({
    correction_date: "",
    exception_type: "",
    actual_clock_in: "",
    actual_clock_out: "",
    reason: "",
    supporting_document: ""
  });
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <Card className="shadow-lg print:shadow-none print:border-2 print:border-black print:block print:scale-95">
      <CardHeader className="border-b-2 border-gray-200 print:border-black bg-gradient-to-r from-[#B11116] to-[#991014] text-white print:bg-white print:text-black print:block print:p-4">
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <CardTitle className="text-2xl">{isRTL ? 'نموذج طلب تصحيح حضور' : 'Attendance Correction Request'}</CardTitle>
            <p className="text-sm mt-1 opacity-90 print:text-black">{isRTL ? 'نموذج رقم: LEA-03' : 'Form No: LEA-03'}</p>
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
          </div>
        </div>

        {/* Correction Details */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'تفاصيل التصحيح' : 'Correction Details'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ الحضور *' : 'Attendance Date *'}</Label>
              <Input 
                type="date"
                value={formData.correction_date}
                onChange={(e) => setFormData({...formData, correction_date: e.target.value})}
                className="border-2 print:border-black"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نوع الاستثناء *' : 'Exception Type *'}</Label>
              <Select value={formData.exception_type} onValueChange={(v) => setFormData({...formData, exception_type: v})}>
                <SelectTrigger className="border-2 print:border-black">
                  <SelectValue placeholder={isRTL ? "اختر النوع" : "Select type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Missed Clock In">{isRTL ? 'نسيت تسجيل الدخول' : 'Missed Clock In'}</SelectItem>
                  <SelectItem value="Missed Clock Out">{isRTL ? 'نسيت تسجيل الخروج' : 'Missed Clock Out'}</SelectItem>
                  <SelectItem value="Early Leave">{isRTL ? 'مغادرة مبكرة' : 'Early Leave'}</SelectItem>
                  <SelectItem value="Late Arrival">{isRTL ? 'وصول متأخر' : 'Late Arrival'}</SelectItem>
                  <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'وقت الدخول الفعلي' : 'Actual Clock In Time'}</Label>
              <Input 
                type="time"
                value={formData.actual_clock_in}
                onChange={(e) => setFormData({...formData, actual_clock_in: e.target.value})}
                className="border-2 print:border-black"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'وقت الخروج الفعلي' : 'Actual Clock Out Time'}</Label>
              <Input 
                type="time"
                value={formData.actual_clock_out}
                onChange={(e) => setFormData({...formData, actual_clock_out: e.target.value})}
                className="border-2 print:border-black"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'سبب التصحيح *' : 'Reason for Correction *'}</Label>
            <Textarea 
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows={4}
              className="border-2 print:border-black"
              placeholder={isRTL ? "اشرح سبب الحاجة إلى التصحيح بالتفصيل..." : "Explain in detail why this correction is needed..."}
            />
          </div>

          <div className="mt-4">
            <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'المستندات الداعمة' : 'Supporting Documents'}</Label>
            <Input 
              value={formData.supporting_document}
              onChange={(e) => setFormData({...formData, supporting_document: e.target.value})}
              className="border-2 print:border-black"
              placeholder={isRTL ? "رابط المستند أو المرجع" : "Document URL or reference"}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? 'أرفق أي دليل (صور، تأكيدات، إلخ)' 
                : 'Attach any evidence (photos, confirmations, etc.)'}
            </p>
          </div>
        </div>

        {/* Approval Chain */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'الموافقات' : 'Approvals'}
          </h3>
          <div className="space-y-4">
            <div className="border-2 border-gray-300 print:border-black p-4 rounded">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className={`text-sm font-bold ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'المدير المباشر' : 'Direct Manager'}
                  </Label>
                  <Input className="border print:border-black" />
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
                  <Input className="border print:border-black" />
                </div>
              </div>
            </div>

            <div className="border-2 border-gray-300 print:border-black p-4 rounded">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className={`text-sm font-bold ${isRTL ? 'text-right block' : ''}`}>
                    {isRTL ? 'قسم الموارد البشرية' : 'HR Department'}
                  </Label>
                  <Input className="border print:border-black" />
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
                  <Input className="border print:border-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Declaration */}
        <div className="border-2 border-[#B11116] p-4 rounded bg-red-50">
          <p className={`text-sm ${isRTL ? 'text-right' : ''}`}>
            {isRTL 
              ? 'أقر بأن المعلومات المقدمة صحيحة وأفهم أن تقديم معلومات خاطئة قد يؤدي إلى إجراءات تأديبية.'
              : 'I declare that the information provided is accurate and understand that providing false information may result in disciplinary action.'
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

        {/* Footer */}
        <div className={`mt-8 pt-4 border-t-2 border-gray-200 text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-center'}`}>
          <p>{isRTL ? 'للاستخدام الرسمي فقط - نموذج LEA-03' : 'For Official Use Only - Form LEA-03'}</p>
          <p className="mt-1">{isRTL ? 'مجموعة جاسكو - نظام إدارة الموارد البشرية' : 'JASCO GROUP - HR Management System'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
