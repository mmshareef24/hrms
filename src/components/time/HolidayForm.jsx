import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function HolidayForm({ holiday, defaultCountry, onSave, onCancel }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  const [formData, setFormData] = useState({
    holiday_name: "",
    holiday_name_arabic: "",
    holiday_date: "",
    country: defaultCountry || "Saudi Arabia",
    holiday_type: "Other",
    is_paid: true,
    applies_to_all: true,
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (holiday) {
      setFormData({
        holiday_name: holiday.holiday_name || "",
        holiday_name_arabic: holiday.holiday_name_arabic || "",
        holiday_date: holiday.holiday_date || "",
        country: holiday.country || defaultCountry || "Saudi Arabia",
        holiday_type: holiday.holiday_type || "Other",
        is_paid: holiday.is_paid !== false,
        applies_to_all: holiday.applies_to_all !== false,
        notes: holiday.notes || ""
      });
    }
  }, [holiday, defaultCountry]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.holiday_name) {
      newErrors.holiday_name = isRTL ? "الاسم مطلوب" : "Name is required";
    }
    if (!formData.holiday_date) {
      newErrors.holiday_date = isRTL ? "التاريخ مطلوب" : "Date is required";
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
      <Card className="shadow-lg max-w-3xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {holiday 
              ? (isRTL ? 'تعديل العطلة' : 'Edit Holiday')
              : (isRTL ? 'عطلة جديدة' : 'New Holiday')
            }
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={errors.holiday_name ? 'text-red-600' : ''}>
                {isRTL ? 'اسم العطلة *' : 'Holiday Name *'}
              </Label>
              <Input
                value={formData.holiday_name}
                onChange={(e) => setFormData({...formData, holiday_name: e.target.value})}
                placeholder={isRTL ? "اليوم الوطني" : "National Day"}
                className={errors.holiday_name ? 'border-red-500' : ''}
              />
              {errors.holiday_name && (
                <p className="text-red-600 text-sm mt-1">{errors.holiday_name}</p>
              )}
            </div>

            <div>
              <Label>{isRTL ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
              <Input
                value={formData.holiday_name_arabic}
                onChange={(e) => setFormData({...formData, holiday_name_arabic: e.target.value})}
                placeholder={isRTL ? "اليوم الوطني" : "اليوم الوطني"}
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div>
              <Label className={errors.holiday_date ? 'text-red-600' : ''}>
                {isRTL ? 'التاريخ *' : 'Date *'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${isRTL ? 'flex-row-reverse' : ''} ${errors.holiday_date ? 'border-red-500' : ''}`}
                  >
                    <CalendarIcon className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {formData.holiday_date ? (
                      format(new Date(formData.holiday_date), 'PPP')
                    ) : (
                      <span>{isRTL ? 'اختر التاريخ' : 'Pick a date'}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.holiday_date ? new Date(formData.holiday_date) : undefined}
                    onSelect={(date) => setFormData({...formData, holiday_date: date ? format(date, 'yyyy-MM-dd') : ""})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.holiday_date && (
                <p className="text-red-600 text-sm mt-1">{errors.holiday_date}</p>
              )}
            </div>

            <div>
              <Label>{isRTL ? 'الدولة' : 'Country'}</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({...formData, country: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Saudi Arabia">{isRTL ? 'السعودية' : 'Saudi Arabia'}</SelectItem>
                  <SelectItem value="UAE">{isRTL ? 'الإمارات' : 'UAE'}</SelectItem>
                  <SelectItem value="Kuwait">{isRTL ? 'الكويت' : 'Kuwait'}</SelectItem>
                  <SelectItem value="Bahrain">{isRTL ? 'البحرين' : 'Bahrain'}</SelectItem>
                  <SelectItem value="Qatar">{isRTL ? 'قطر' : 'Qatar'}</SelectItem>
                  <SelectItem value="Oman">{isRTL ? 'عمان' : 'Oman'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{isRTL ? 'نوع العطلة' : 'Holiday Type'}</Label>
              <Select
                value={formData.holiday_type}
                onValueChange={(value) => setFormData({...formData, holiday_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="National Day">{isRTL ? 'اليوم الوطني' : 'National Day'}</SelectItem>
                  <SelectItem value="Eid Al-Fitr">{isRTL ? 'عيد الفطر' : 'Eid Al-Fitr'}</SelectItem>
                  <SelectItem value="Eid Al-Adha">{isRTL ? 'عيد الأضحى' : 'Eid Al-Adha'}</SelectItem>
                  <SelectItem value="Founding Day">{isRTL ? 'يوم التأسيس' : 'Founding Day'}</SelectItem>
                  <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_paid}
                onCheckedChange={(checked) => setFormData({...formData, is_paid: checked})}
              />
              <Label>{isRTL ? 'عطلة مدفوعة' : 'Paid Holiday'}</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.applies_to_all}
                onCheckedChange={(checked) => setFormData({...formData, applies_to_all: checked})}
              />
              <Label>{isRTL ? 'تنطبق على الجميع' : 'Applies to All'}</Label>
            </div>

            <div className="md:col-span-2">
              <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder={isRTL ? "ملاحظات إضافية..." : "Additional notes..."}
                rows={3}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
          </div>
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