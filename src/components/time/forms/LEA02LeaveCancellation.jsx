
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function LEA02LeaveCancellation({ employee, user }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [formData, setFormData] = useState({
    leave_reference: "",
    original_start_date: "",
    original_end_date: "",
    reason_for_cancellation: "",
    revised_start_date: "",
    revised_end_date: "",
    partial_cancellation: false
  });
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadLeaveRequests();
  }, [employee]);

  const loadLeaveRequests = async () => {
    if (!employee) return;
    const requests = await base44.entities.LeaveRequest.filter({ employee_id: employee.id });
    setLeaveRequests(requests.filter(r => r.status === "Approved") || []);
  };

  const handleLeaveSelect = (leaveId) => {
    const leave = leaveRequests.find(l => l.id === leaveId);
    if (leave) {
      setFormData({
        ...formData,
        leave_reference: leave.id,
        original_start_date: leave.start_date,
        original_end_date: leave.end_date
      });
    }
  };

  return (
    <Card className="shadow-lg print:shadow-none print:border-2 print:border-black print:block print:scale-95">
      <CardHeader className="border-b-2 border-gray-200 print:border-black bg-gradient-to-r from-[#B11116] to-[#991014] text-white print:bg-white print:text-black print:block print:p-4">
        <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <CardTitle className="text-2xl">{isRTL ? 'نموذج إلغاء إجازة' : 'Leave Cancellation Form'}</CardTitle>
            <p className="text-sm mt-1 opacity-90 print:text-black">{isRTL ? 'نموذج رقم: LEA-02' : 'Form No: LEA-02'}</p>
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

        {/* Original Leave Information */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'معلومات الإجازة الأصلية' : 'Original Leave Information'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'رقم مرجع الإجازة *' : 'Leave Reference Number *'}</Label>
              <Select value={formData.leave_reference} onValueChange={handleLeaveSelect}>
                <SelectTrigger className="border-2 print:border-black">
                  <SelectValue placeholder={isRTL ? "اختر الإجازة" : "Select leave"} />
                </SelectTrigger>
                <SelectContent>
                  {leaveRequests.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.leave_type_name} ({format(new Date(req.start_date), 'dd/MM/yyyy')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1"></div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ البداية الأصلي' : 'Original Start Date'}</Label>
              <Input value={formData.original_start_date} readOnly className="border-2 print:border-black" />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ النهاية الأصلي' : 'Original End Date'}</Label>
              <Input value={formData.original_end_date} readOnly className="border-2 print:border-black" />
            </div>
          </div>
        </div>

        {/* Cancellation Details */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'تفاصيل الإلغاء' : 'Cancellation Details'}
          </h3>
          
          <div className="mb-4">
            <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'سبب الإلغاء *' : 'Reason for Cancellation *'}</Label>
            <Textarea 
              value={formData.reason_for_cancellation}
              onChange={(e) => setFormData({...formData, reason_for_cancellation: e.target.value})}
              rows={4}
              className="border-2 print:border-black"
              placeholder={isRTL ? "اشرح سبب إلغاء الإجازة..." : "Explain the reason for cancelling the leave..."}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ بداية جديد (إن وجد)' : 'Revised Start Date (if any)'}</Label>
              <Input 
                type="date"
                value={formData.revised_start_date}
                onChange={(e) => setFormData({...formData, revised_start_date: e.target.value})}
                className="border-2 print:border-black"
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ نهاية جديد (إن وجد)' : 'Revised End Date (if any)'}</Label>
              <Input 
                type="date"
                value={formData.revised_end_date}
                onChange={(e) => setFormData({...formData, revised_end_date: e.target.value})}
                className="border-2 print:border-black"
              />
            </div>
          </div>
        </div>

        {/* Approval Chain */}
        <div className="mb-8 print:mb-3">
          <h3 className={`text-lg font-bold mb-4 pb-2 border-b-2 border-[#B11116] ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'الموافقات' : 'Approvals'}
          </h3>
          <div className="space-y-4">
            {/* Direct Manager */}
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

            {/* HR Department */}
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
              ? 'أقر بأن طلب الإلغاء هذا صحيح وأفهم أن إلغاء الإجازة يخضع لموافقة الإدارة.'
              : 'I declare that this cancellation request is genuine and understand that leave cancellation is subject to management approval.'
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
        <div className={`mt-8 pt-4 border-t-2 border-gray-200 text-xs text-gray-500 ${isRTL ? 'text-right' : 'text-center'} print:mt-3`}>
          <p>{isRTL ? 'للاستخدام الرسمي فقط - نموذج LEA-02' : 'For Official Use Only - Form LEA-02'}</p>
          <p className="mt-1">{isRTL ? 'مجموعة جاسكو - نظام إدارة الموارد البشرية' : 'JASCO GROUP - HR Management System'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
