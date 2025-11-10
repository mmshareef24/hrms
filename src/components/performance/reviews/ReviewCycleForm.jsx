import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, XCircle } from "lucide-react";

export default function ReviewCycleForm({ cycle, onSave, onCancel }) {
  const [formData, setFormData] = useState(cycle || {
    cycle_name: "",
    cycle_name_arabic: "",
    cycle_type: "Annual",
    period_start: "",
    period_end: "",
    self_review_deadline: "",
    manager_review_deadline: "",
    calibration_date: "",
    completion_deadline: "",
    include_360_feedback: false,
    include_goals: true,
    include_competencies: true,
    rating_scale: "1-5",
    force_distribution: false,
    distribution_rules: "",
    status: "Planning",
    notes: ""
  });

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-4xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {cycle 
              ? (isRTL ? 'تعديل دورة التقييم' : 'Edit Review Cycle')
              : (isRTL ? 'دورة تقييم جديدة' : 'New Review Cycle')
            }
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'اسم الدورة (إنجليزي) *' : 'Cycle Name (English) *'}</Label>
                <Input
                  value={formData.cycle_name}
                  onChange={(e) => handleChange('cycle_name', e.target.value)}
                  placeholder="e.g., 2025 Annual Performance Review"
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'اسم الدورة (عربي)' : 'Cycle Name (Arabic)'}</Label>
                <Input
                  value={formData.cycle_name_arabic}
                  onChange={(e) => handleChange('cycle_name_arabic', e.target.value)}
                  placeholder="مثال: مراجعة الأداء السنوية 2025"
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نوع الدورة *' : 'Cycle Type *'}</Label>
                <Select value={formData.cycle_type} onValueChange={(value) => handleChange('cycle_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual">{isRTL ? 'سنوية' : 'Annual'}</SelectItem>
                    <SelectItem value="Semi-Annual">{isRTL ? 'نصف سنوية' : 'Semi-Annual'}</SelectItem>
                    <SelectItem value="Quarterly">{isRTL ? 'ربع سنوية' : 'Quarterly'}</SelectItem>
                    <SelectItem value="Probation">{isRTL ? 'فترة تجربة' : 'Probation'}</SelectItem>
                    <SelectItem value="Project End">{isRTL ? 'نهاية مشروع' : 'Project End'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'مقياس التقييم *' : 'Rating Scale *'}</Label>
                <Select value={formData.rating_scale} onValueChange={(value) => handleChange('rating_scale', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 {isRTL ? 'نقاط' : 'Scale'}</SelectItem>
                    <SelectItem value="1-10">1-10 {isRTL ? 'نقاط' : 'Scale'}</SelectItem>
                    <SelectItem value="Descriptive Only">{isRTL ? 'وصفي فقط' : 'Descriptive Only'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'الجدول الزمني' : 'Timeline'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'بداية الفترة *' : 'Period Start *'}</Label>
                <Input
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => handleChange('period_start', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نهاية الفترة *' : 'Period End *'}</Label>
                <Input
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => handleChange('period_end', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'موعد التقييم الذاتي' : 'Self Review Deadline'}</Label>
                <Input
                  type="date"
                  value={formData.self_review_deadline}
                  onChange={(e) => handleChange('self_review_deadline', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'موعد مراجعة المدير' : 'Manager Review Deadline'}</Label>
                <Input
                  type="date"
                  value={formData.manager_review_deadline}
                  onChange={(e) => handleChange('manager_review_deadline', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ المعايرة' : 'Calibration Date'}</Label>
                <Input
                  type="date"
                  value={formData.calibration_date}
                  onChange={(e) => handleChange('calibration_date', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الموعد النهائي للإكمال' : 'Completion Deadline'}</Label>
                <Input
                  type="date"
                  value={formData.completion_deadline}
                  onChange={(e) => handleChange('completion_deadline', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'الإعدادات' : 'Configuration'}
            </h3>

            <div className="space-y-3">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <Checkbox
                  id="include_goals"
                  checked={formData.include_goals}
                  onCheckedChange={(checked) => handleChange('include_goals', checked)}
                />
                <Label htmlFor="include_goals" className={`font-normal cursor-pointer ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'تضمين الأهداف' : 'Include Goals'}
                </Label>
              </div>

              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <Checkbox
                  id="include_competencies"
                  checked={formData.include_competencies}
                  onCheckedChange={(checked) => handleChange('include_competencies', checked)}
                />
                <Label htmlFor="include_competencies" className={`font-normal cursor-pointer ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'تضمين الكفاءات' : 'Include Competencies'}
                </Label>
              </div>

              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <Checkbox
                  id="include_360"
                  checked={formData.include_360_feedback}
                  onCheckedChange={(checked) => handleChange('include_360_feedback', checked)}
                />
                <Label htmlFor="include_360" className={`font-normal cursor-pointer ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'تضمين التغذية الراجعة 360 درجة' : 'Include 360° Feedback'}
                </Label>
              </div>

              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <Checkbox
                  id="force_dist"
                  checked={formData.force_distribution}
                  onCheckedChange={(checked) => handleChange('force_distribution', checked)}
                />
                <Label htmlFor="force_dist" className={`font-normal cursor-pointer ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'فرض توزيع التقييمات' : 'Force Rating Distribution'}
                </Label>
              </div>
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={`h-20 ${isRTL ? 'text-right' : ''}`}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className={`flex gap-3 border-t border-gray-100 bg-gray-50 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel} className={isRTL ? 'flex-row-reverse' : ''}>
            <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'حفظ' : 'Save Cycle'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}