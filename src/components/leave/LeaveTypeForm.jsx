import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X } from "lucide-react";

export default function LeaveTypeForm({ leaveType, onSave, onCancel }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  const [formData, setFormData] = useState({
    leave_type_code: "",
    leave_type_name: "",
    leave_type_name_arabic: "",
    leave_category: "Annual",
    is_paid: true,
    is_statutory: false,
    max_days_per_year: 21,
    min_service_months: 0,
    accrual_method: "Yearly",
    accrual_rate: 0,
    carry_forward_allowed: true,
    carry_forward_max_days: 10,
    encashment_allowed: false,
    encashment_max_days: 0,
    require_proof: false,
    require_approval: true,
    auto_approve_under_days: 0,
    min_notice_days: 0,
    blackout_dates: "",
    applies_to_gender: "All",
    applies_to_nationality: "All",
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (leaveType) {
      setFormData({
        leave_type_code: leaveType.leave_type_code || "",
        leave_type_name: leaveType.leave_type_name || "",
        leave_type_name_arabic: leaveType.leave_type_name_arabic || "",
        leave_category: leaveType.leave_category || "Annual",
        is_paid: leaveType.is_paid !== false,
        is_statutory: leaveType.is_statutory || false,
        max_days_per_year: leaveType.max_days_per_year || 21,
        min_service_months: leaveType.min_service_months || 0,
        accrual_method: leaveType.accrual_method || "Yearly",
        accrual_rate: leaveType.accrual_rate || 0,
        carry_forward_allowed: leaveType.carry_forward_allowed !== false,
        carry_forward_max_days: leaveType.carry_forward_max_days || 10,
        encashment_allowed: leaveType.encashment_allowed || false,
        encashment_max_days: leaveType.encashment_max_days || 0,
        require_proof: leaveType.require_proof || false,
        require_approval: leaveType.require_approval !== false,
        auto_approve_under_days: leaveType.auto_approve_under_days || 0,
        min_notice_days: leaveType.min_notice_days || 0,
        blackout_dates: leaveType.blackout_dates || "",
        applies_to_gender: leaveType.applies_to_gender || "All",
        applies_to_nationality: leaveType.applies_to_nationality || "All",
        is_active: leaveType.is_active !== false
      });
    }
  }, [leaveType]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.leave_type_code) {
      newErrors.leave_type_code = isRTL ? "الرمز مطلوب" : "Code is required";
    }
    if (!formData.leave_type_name) {
      newErrors.leave_type_name = isRTL ? "الاسم مطلوب" : "Name is required";
    }
    if (formData.max_days_per_year < 0) {
      newErrors.max_days_per_year = isRTL ? "يجب أن يكون موجباً" : "Must be positive";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(isRTL ? "حدث خطأ في حفظ البيانات" : "Error saving data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-5xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {leaveType 
              ? (isRTL ? 'تعديل نوع الإجازة' : 'Edit Leave Type')
              : (isRTL ? 'نوع إجازة جديد' : 'New Leave Type')
            }
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
              <TabsTrigger value="basic">{isRTL ? 'أساسي' : 'Basic'}</TabsTrigger>
              <TabsTrigger value="accrual">{isRTL ? 'الاستحقاق' : 'Accrual'}</TabsTrigger>
              <TabsTrigger value="policies">{isRTL ? 'السياسات' : 'Policies'}</TabsTrigger>
              <TabsTrigger value="eligibility">{isRTL ? 'الأهلية' : 'Eligibility'}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className={errors.leave_type_code ? 'text-red-600' : ''}>
                    {isRTL ? 'رمز نوع الإجازة *' : 'Leave Type Code *'}
                  </Label>
                  <Input
                    value={formData.leave_type_code}
                    onChange={(e) => setFormData({...formData, leave_type_code: e.target.value})}
                    placeholder={isRTL ? "مثال: ANN" : "e.g., ANN"}
                    className={errors.leave_type_code ? 'border-red-500' : ''}
                  />
                  {errors.leave_type_code && (
                    <p className="text-red-600 text-sm mt-1">{errors.leave_type_code}</p>
                  )}
                </div>

                <div>
                  <Label className={errors.leave_type_name ? 'text-red-600' : ''}>
                    {isRTL ? 'اسم نوع الإجازة *' : 'Leave Type Name *'}
                  </Label>
                  <Input
                    value={formData.leave_type_name}
                    onChange={(e) => setFormData({...formData, leave_type_name: e.target.value})}
                    placeholder={isRTL ? "إجازة سنوية" : "Annual Leave"}
                    className={errors.leave_type_name ? 'border-red-500' : ''}
                  />
                  {errors.leave_type_name && (
                    <p className="text-red-600 text-sm mt-1">{errors.leave_type_name}</p>
                  )}
                </div>

                <div>
                  <Label>{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
                  <Input
                    value={formData.leave_type_name_arabic}
                    onChange={(e) => setFormData({...formData, leave_type_name_arabic: e.target.value})}
                    placeholder={isRTL ? "إجازة سنوية" : "إجازة سنوية"}
                    className={isRTL ? 'text-right' : ''}
                  />
                </div>

                <div>
                  <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
                  <Select
                    value={formData.leave_category}
                    onValueChange={(value) => setFormData({...formData, leave_category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Sick">Sick</SelectItem>
                      <SelectItem value="Maternity">Maternity</SelectItem>
                      <SelectItem value="Paternity">Paternity</SelectItem>
                      <SelectItem value="Hajj">Hajj</SelectItem>
                      <SelectItem value="Marriage">Marriage</SelectItem>
                      <SelectItem value="Bereavement">Bereavement</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Comp-off">Comp-off</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{isRTL ? 'الحد الأقصى للأيام في السنة' : 'Max Days Per Year'}</Label>
                  <Input
                    type="number"
                    value={formData.max_days_per_year}
                    onChange={(e) => setFormData({...formData, max_days_per_year: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>

                <div>
                  <Label>{isRTL ? 'الحد الأدنى للخدمة (أشهر)' : 'Min Service (Months)'}</Label>
                  <Input
                    type="number"
                    value={formData.min_service_months}
                    onChange={(e) => setFormData({...formData, min_service_months: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_paid}
                    onCheckedChange={(checked) => setFormData({...formData, is_paid: checked})}
                  />
                  <Label>{isRTL ? 'إجازة مدفوعة' : 'Paid Leave'}</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_statutory}
                    onCheckedChange={(checked) => setFormData({...formData, is_statutory: checked})}
                  />
                  <Label>{isRTL ? 'إلزامية قانونياً' : 'Statutory'}</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accrual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? 'طريقة الاستحقاق' : 'Accrual Method'}</Label>
                  <Select
                    value={formData.accrual_method}
                    onValueChange={(value) => setFormData({...formData, accrual_method: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yearly">{isRTL ? 'سنوي' : 'Yearly'}</SelectItem>
                      <SelectItem value="Monthly">{isRTL ? 'شهري' : 'Monthly'}</SelectItem>
                      <SelectItem value="Prorated">{isRTL ? 'متناسب' : 'Prorated'}</SelectItem>
                      <SelectItem value="None">{isRTL ? 'لا يوجد' : 'None'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.accrual_method === 'Monthly' && (
                  <div>
                    <Label>{isRTL ? 'معدل الاستحقاق (أيام/شهر)' : 'Accrual Rate (days/month)'}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.accrual_rate}
                      onChange={(e) => setFormData({...formData, accrual_rate: parseFloat(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.carry_forward_allowed}
                    onCheckedChange={(checked) => setFormData({...formData, carry_forward_allowed: checked})}
                  />
                  <Label>{isRTL ? 'السماح بالترحيل' : 'Allow Carry Forward'}</Label>
                </div>

                {formData.carry_forward_allowed && (
                  <div>
                    <Label>{isRTL ? 'الحد الأقصى للترحيل (أيام)' : 'Max Carry Forward (days)'}</Label>
                    <Input
                      type="number"
                      value={formData.carry_forward_max_days}
                      onChange={(e) => setFormData({...formData, carry_forward_max_days: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.encashment_allowed}
                    onCheckedChange={(checked) => setFormData({...formData, encashment_allowed: checked})}
                  />
                  <Label>{isRTL ? 'السماح بالصرف النقدي' : 'Allow Encashment'}</Label>
                </div>

                {formData.encashment_allowed && (
                  <div>
                    <Label>{isRTL ? 'الحد الأقصى للصرف (أيام)' : 'Max Encashment (days)'}</Label>
                    <Input
                      type="number"
                      value={formData.encashment_max_days}
                      onChange={(e) => setFormData({...formData, encashment_max_days: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.require_proof}
                    onCheckedChange={(checked) => setFormData({...formData, require_proof: checked})}
                  />
                  <Label>{isRTL ? 'يتطلب إثبات (شهادة طبية)' : 'Require Proof (Medical Cert)'}</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.require_approval}
                    onCheckedChange={(checked) => setFormData({...formData, require_approval: checked})}
                  />
                  <Label>{isRTL ? 'يتطلب موافقة' : 'Require Approval'}</Label>
                </div>

                <div>
                  <Label>{isRTL ? 'موافقة تلقائية تحت (أيام)' : 'Auto Approve Under (days)'}</Label>
                  <Input
                    type="number"
                    value={formData.auto_approve_under_days}
                    onChange={(e) => setFormData({...formData, auto_approve_under_days: parseInt(e.target.value) || 0})}
                    min="0"
                    placeholder={isRTL ? "0 = معطل" : "0 = disabled"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL 
                      ? 'إذا كان الطلب أقل من أو يساوي هذا العدد، سيتم الموافقة تلقائياً' 
                      : 'If request is <= this many days, auto-approve'}
                  </p>
                </div>

                <div>
                  <Label>{isRTL ? 'الحد الأدنى للإشعار (أيام)' : 'Min Notice (days)'}</Label>
                  <Input
                    type="number"
                    value={formData.min_notice_days}
                    onChange={(e) => setFormData({...formData, min_notice_days: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL 
                      ? 'عدد الأيام مقدماً المطلوبة للطلب' 
                      : 'Days in advance required for request'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <Label>{isRTL ? 'فترات الحظر (JSON)' : 'Blackout Dates (JSON)'}</Label>
                  <Textarea
                    value={formData.blackout_dates}
                    onChange={(e) => setFormData({...formData, blackout_dates: e.target.value})}
                    placeholder='[{"start": "2025-12-15", "end": "2025-12-31"}]'
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL 
                      ? 'فترات لا يمكن طلب الإجازة فيها (تنسيق JSON)' 
                      : 'Date ranges where leave cannot be requested (JSON format)'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="eligibility" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{isRTL ? 'ينطبق على الجنس' : 'Applies to Gender'}</Label>
                  <Select
                    value={formData.applies_to_gender}
                    onValueChange={(value) => setFormData({...formData, applies_to_gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">{isRTL ? 'الجميع' : 'All'}</SelectItem>
                      <SelectItem value="Male">{isRTL ? 'ذكور' : 'Male'}</SelectItem>
                      <SelectItem value="Female">{isRTL ? 'إناث' : 'Female'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{isRTL ? 'ينطبق على الجنسية' : 'Applies to Nationality'}</Label>
                  <Select
                    value={formData.applies_to_nationality}
                    onValueChange={(value) => setFormData({...formData, applies_to_nationality: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">{isRTL ? 'الجميع' : 'All'}</SelectItem>
                      <SelectItem value="Saudi">{isRTL ? 'سعودي' : 'Saudi'}</SelectItem>
                      <SelectItem value="Non-Saudi">{isRTL ? 'غير سعودي' : 'Non-Saudi'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label>{isRTL ? 'نشط' : 'Active'}</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <div className={`flex gap-3 p-6 border-t ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-green-600 to-green-700"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white ${isRTL ? 'ml-2' : 'mr-2'}`}></div>
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'حفظ' : 'Save'}
              </>
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}