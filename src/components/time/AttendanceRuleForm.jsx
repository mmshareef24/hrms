import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { XCircle, Save } from "lucide-react";

export default function AttendanceRuleForm({ rule, onSave, onCancel }) {
  const [formData, setFormData] = useState(rule || {
    rule_name: "",
    rule_name_arabic: "",
    company_id: "",
    grace_period_minutes: 15,
    early_departure_threshold: 15,
    rounding_method: "15min",
    auto_clock_out_hours: 12,
    overtime_threshold_daily: 8,
    overtime_rate_weekday: 1.5,
    overtime_rate_weekend: 2.0,
    overtime_rate_holiday: 2.0,
    night_shift_start: "20:00",
    night_shift_end: "06:00",
    night_shift_allowance: 0,
    allow_early_checkin_minutes: 30,
    require_location: false,
    geofence_radius_meters: 100,
    prayer_time_adjustment: false,
    is_active: true
  });

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {rule ? (isRTL ? 'تعديل القاعدة' : 'Edit Rule') : (isRTL ? 'إضافة قاعدة جديدة' : 'Add New Rule')}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'اسم القاعدة *' : 'Rule Name *'}</Label>
              <Input
                value={formData.rule_name}
                onChange={(e) => handleChange("rule_name", e.target.value)}
                required
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الاسم بالعربية' : 'Name (Arabic)'}</Label>
              <Input
                value={formData.rule_name_arabic}
                onChange={(e) => handleChange("rule_name_arabic", e.target.value)}
                dir="rtl"
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'فترة السماح (دقائق)' : 'Grace Period (minutes)'}</Label>
              <Input
                type="number"
                value={formData.grace_period_minutes}
                onChange={(e) => handleChange("grace_period_minutes", parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'حد الخروج المبكر (دقائق)' : 'Early Departure Threshold (min)'}</Label>
              <Input
                type="number"
                value={formData.early_departure_threshold}
                onChange={(e) => handleChange("early_departure_threshold", parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'طريقة التقريب' : 'Rounding Method'}</Label>
              <Select value={formData.rounding_method} onValueChange={(v) => handleChange("rounding_method", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">{isRTL ? 'بدون' : 'None'}</SelectItem>
                  <SelectItem value="15min">{isRTL ? '15 دقيقة' : '15 minutes'}</SelectItem>
                  <SelectItem value="30min">{isRTL ? '30 دقيقة' : '30 minutes'}</SelectItem>
                  <SelectItem value="1hour">{isRTL ? 'ساعة' : '1 hour'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الخروج التلقائي بعد (ساعات)' : 'Auto Clock-out After (hours)'}</Label>
              <Input
                type="number"
                value={formData.auto_clock_out_hours}
                onChange={(e) => handleChange("auto_clock_out_hours", parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'حد العمل الإضافي اليومي (ساعات)' : 'Daily OT Threshold (hours)'}</Label>
              <Input
                type="number"
                value={formData.overtime_threshold_daily}
                onChange={(e) => handleChange("overtime_threshold_daily", parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'معدل OT أيام الأسبوع' : 'Weekday OT Rate'}</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.overtime_rate_weekday}
                onChange={(e) => handleChange("overtime_rate_weekday", parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'معدل OT عطلة نهاية الأسبوع' : 'Weekend OT Rate'}</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.overtime_rate_weekend}
                onChange={(e) => handleChange("overtime_rate_weekend", parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'معدل OT العطلات الرسمية' : 'Holiday OT Rate'}</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.overtime_rate_holiday}
                onChange={(e) => handleChange("overtime_rate_holiday", parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'بداية الوردية الليلية' : 'Night Shift Start'}</Label>
              <Input
                type="time"
                value={formData.night_shift_start}
                onChange={(e) => handleChange("night_shift_start", e.target.value)}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نهاية الوردية الليلية' : 'Night Shift End'}</Label>
              <Input
                type="time"
                value={formData.night_shift_end}
                onChange={(e) => handleChange("night_shift_end", e.target.value)}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'بدل الوردية الليلية' : 'Night Shift Allowance'}</Label>
              <Input
                type="number"
                value={formData.night_shift_allowance}
                onChange={(e) => handleChange("night_shift_allowance", parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'السماح بالدخول المبكر (دقائق)' : 'Allow Early Check-in (min)'}</Label>
              <Input
                type="number"
                value={formData.allow_early_checkin_minutes}
                onChange={(e) => handleChange("allow_early_checkin_minutes", parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نطاق الموقع (متر)' : 'Geofence Radius (meters)'}</Label>
              <Input
                type="number"
                value={formData.geofence_radius_meters}
                onChange={(e) => handleChange("geofence_radius_meters", parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="require_location"
                checked={formData.require_location}
                onCheckedChange={(checked) => handleChange("require_location", checked)}
              />
              <label htmlFor="require_location" className="text-sm font-medium">
                {isRTL ? 'يتطلب الموقع' : 'Require Location'}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="prayer_time_adjustment"
                checked={formData.prayer_time_adjustment}
                onCheckedChange={(checked) => handleChange("prayer_time_adjustment", checked)}
              />
              <label htmlFor="prayer_time_adjustment" className="text-sm font-medium">
                {isRTL ? 'تعديل وقت الصلاة' : 'Prayer Time Adjustment'}
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                {isRTL ? 'قاعدة نشطة' : 'Active Rule'}
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className={`flex gap-3 border-t bg-gray-50 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel}>
            <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700">
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'حفظ' : 'Save Rule'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}