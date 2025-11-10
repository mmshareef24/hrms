import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, AlertTriangle, Info } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AttendanceCorrectionForm({ employee, attendance, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    date: "",
    exception_type: "Missed Punch",
    requested_clock_in: "",
    requested_clock_out: "",
    reason: ""
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  // When date is selected, find the corresponding attendance record
  useEffect(() => {
    if (formData.date && attendance.length > 0) {
      const record = attendance.find(a => a.date === formData.date);
      if (record) {
        setSelectedRecord(record);
        setFormData({
          ...formData,
          requested_clock_in: record.clock_in || "",
          requested_clock_out: record.clock_out || ""
        });
      } else {
        setSelectedRecord(null);
      }
    }
  }, [formData.date, attendance]);

  const handleSubmit = async () => {
    if (!formData.date || !formData.exception_type || !formData.reason.trim()) {
      alert(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }

    if (!formData.requested_clock_in && !formData.requested_clock_out) {
      alert(isRTL 
        ? "يرجى تحديد وقت الدخول أو الخروج المطلوب على الأقل"
        : "Please specify at least a requested clock-in or clock-out time");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setSaving(false);
    }
  };

  const exceptionTypes = [
    { value: "Missed Punch", label: isRTL ? "نسيان البصمة" : "Missed Punch" },
    { value: "Early Leave", label: isRTL ? "مغادرة مبكرة" : "Early Leave" },
    { value: "Late Arrival", label: isRTL ? "تأخير في الحضور" : "Late Arrival" },
    { value: "Manual Correction", label: isRTL ? "تصحيح يدوي" : "Manual Correction" },
    { value: "Other", label: isRTL ? "أخرى" : "Other" }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>{isRTL ? 'طلب تصحيح الحضور' : 'Attendance Correction Request'}</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {isRTL 
                ? 'استخدم هذا النموذج لطلب تصحيح سجلات الحضور. سيتم إرسال طلبك إلى المشرف المباشر أو الموارد البشرية للموافقة.'
                : 'Use this form to request corrections to your attendance records. Your request will be sent to your supervisor or HR for approval.'
              }
            </AlertDescription>
          </Alert>

          {/* Employee Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                  {isRTL ? 'اسم الموظف' : 'Employee Name'}
                </Label>
                <p className="font-medium">{employee?.full_name}</p>
              </div>
              <div>
                <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                  {isRTL ? 'رقم الموظف' : 'Employee ID'}
                </Label>
                <p className="font-medium">{employee?.employee_id}</p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'التاريخ' : 'Date'} *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`w-full justify-start text-left font-normal ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CalendarIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {formData.date ? format(parseISO(formData.date), 'PPP') : (isRTL ? 'اختر التاريخ' : 'Select date')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date ? parseISO(formData.date) : undefined}
                  onSelect={(date) => setFormData({...formData, date: format(date, 'yyyy-MM-dd')})}
                  disabled={(date) => date > new Date() || date < new Date(new Date().setDate(new Date().getDate() - 30))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? 'يمكنك طلب تصحيحات للأيام الـ 30 الماضية فقط'
                : 'You can only request corrections for the last 30 days'
              }
            </p>
          </div>

          {/* Current Record Display */}
          {selectedRecord && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                {isRTL ? 'السجل الحالي' : 'Current Record'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">{isRTL ? 'وقت الدخول:' : 'Clock In:'}</span>
                  <span className="ml-2 font-medium">{selectedRecord.clock_in || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-600">{isRTL ? 'وقت الخروج:' : 'Clock Out:'}</span>
                  <span className="ml-2 font-medium">{selectedRecord.clock_out || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Exception Type */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'نوع الاستثناء' : 'Exception Type'} *
            </Label>
            <Select value={formData.exception_type} onValueChange={(v) => setFormData({...formData, exception_type: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exceptionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Requested Times */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'وقت الدخول المطلوب' : 'Requested Clock In'}
              </Label>
              <Input
                type="time"
                value={formData.requested_clock_in}
                onChange={(e) => setFormData({...formData, requested_clock_in: e.target.value})}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'وقت الخروج المطلوب' : 'Requested Clock Out'}
              </Label>
              <Input
                type="time"
                value={formData.requested_clock_out}
                onChange={(e) => setFormData({...formData, requested_clock_out: e.target.value})}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
          </div>

          {/* Reason (Mandatory) */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'سبب التصحيح' : 'Reason for Correction'} *
            </Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows={4}
              className={isRTL ? 'text-right' : ''}
              placeholder={isRTL 
                ? "يرجى توضيح سبب طلب التصحيح بالتفصيل..."
                : "Please explain in detail why you need this correction..."
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? 'هذا الحقل إلزامي. يرجى تقديم سبب واضح لطلبك.'
                : 'This field is mandatory. Please provide a clear reason for your request.'
              }
            </p>
          </div>

          {/* Warning */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-sm">
              {isRTL 
                ? 'تنبيه: تقديم طلبات تصحيح غير صحيحة قد يؤدي إلى إجراءات تأديبية. يرجى التأكد من دقة المعلومات.'
                : 'Warning: Submitting false correction requests may result in disciplinary action. Please ensure all information is accurate.'
              }
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className={`flex gap-3 justify-end ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
            >
              {saving 
                ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') 
                : (isRTL ? 'إرسال الطلب' : 'Submit Request')
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}