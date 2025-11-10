import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Save, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GoalForm({ goal, goals, employees, onSave, onCancel }) {
  const [formData, setFormData] = useState(goal || {
    goal_code: `GOAL-${Date.now()}`,
    goal_name: "",
    goal_name_arabic: "",
    goal_type: "Individual",
    goal_category: "Operational",
    parent_goal_id: "",
    owner_id: "",
    owner_name: "",
    company_id: "",
    department: "",
    description: "",
    success_criteria: "",
    measurement_type: "Percentage",
    target_value: 100,
    current_value: 0,
    achievement_percent: 0,
    weight: 1,
    start_date: new Date().toISOString().split('T')[0],
    due_date: "",
    status: "Draft",
    priority: "Medium",
    visibility: "Public",
    notes: ""
  });

  const [keyResults, setKeyResults] = useState([]);
  const [newKeyResult, setNewKeyResult] = useState({
    key_result_name: "",
    target_value: 100,
    measurement_unit: "%",
    weight: 1
  });

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (goal) {
      loadKeyResults();
    }
    calculateAchievement();
  }, [goal]);

  useEffect(() => {
    calculateAchievement();
  }, [formData.current_value, formData.target_value]);

  const loadKeyResults = async () => {
    if (goal) {
      try {
        const krs = await base44.entities.KeyResult.filter({ goal_id: goal.id });
        setKeyResults(krs || []);
      } catch (error) {
        console.log("No key results yet");
        setKeyResults([]);
      }
    }
  };

  const calculateAchievement = () => {
    if (formData.target_value > 0) {
      const percent = Math.min(100, Math.round((formData.current_value / formData.target_value) * 100));
      setFormData(prev => ({ ...prev, achievement_percent: percent }));
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddKeyResult = async () => {
    if (!newKeyResult.key_result_name || !newKeyResult.target_value) {
      alert(isRTL ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    if (goal) {
      try {
        const kr = await base44.entities.KeyResult.create({
          ...newKeyResult,
          goal_id: goal.id,
          baseline_value: 0,
          current_value: 0,
          achievement_percent: 0,
          status: "Not Started",
          due_date: formData.due_date
        });
        setKeyResults([...keyResults, kr]);
        setNewKeyResult({
          key_result_name: "",
          target_value: 100,
          measurement_unit: "%",
          weight: 1
        });
      } catch (error) {
        console.error("Error adding key result:", error);
      }
    } else {
      // Store temporarily for when goal is created
      setKeyResults([...keyResults, { ...newKeyResult, id: Date.now() }]);
      setNewKeyResult({
        key_result_name: "",
        target_value: 100,
        measurement_unit: "%",
        weight: 1
      });
    }
  };

  const handleRemoveKeyResult = async (kr) => {
    if (kr.id && goal) {
      try {
        await base44.entities.KeyResult.delete(kr.id);
        setKeyResults(keyResults.filter(k => k.id !== kr.id));
      } catch (error) {
        console.error("Error deleting key result:", error);
      }
    } else {
      setKeyResults(keyResults.filter(k => k !== kr));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Find owner name
    const owner = employees.find(emp => emp.id === formData.owner_id);
    if (owner) {
      formData.owner_name = owner.full_name;
    }

    await onSave(formData);

    // If new goal and we have pending key results, create them
    if (!goal && keyResults.length > 0) {
      // Key results will need to be created after goal creation
      // This would require returning the new goal ID from onSave
    }
  };

  const availableParentGoals = goals.filter(g => {
    if (formData.goal_type === "Company") return false;
    if (formData.goal_type === "Department") return g.goal_type === "Company";
    if (formData.goal_type === "Team") return g.goal_type === "Company" || g.goal_type === "Department";
    if (formData.goal_type === "Individual") return true;
    return false;
  });

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-4xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {goal 
              ? (isRTL ? 'تعديل الهدف' : 'Edit Goal')
              : (isRTL ? 'إضافة هدف جديد' : 'Add New Goal')
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
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'اسم الهدف (إنجليزي) *' : 'Goal Name (English) *'}</Label>
                <Input
                  value={formData.goal_name}
                  onChange={(e) => handleChange('goal_name', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'اسم الهدف (عربي)' : 'Goal Name (Arabic)'}</Label>
                <Input
                  value={formData.goal_name_arabic}
                  onChange={(e) => handleChange('goal_name_arabic', e.target.value)}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نوع الهدف *' : 'Goal Type *'}</Label>
                <Select value={formData.goal_type} onValueChange={(value) => handleChange('goal_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Company">{isRTL ? 'هدف الشركة' : 'Company Goal'}</SelectItem>
                    <SelectItem value="Department">{isRTL ? 'هدف القسم' : 'Department Goal'}</SelectItem>
                    <SelectItem value="Team">{isRTL ? 'هدف الفريق' : 'Team Goal'}</SelectItem>
                    <SelectItem value="Individual">{isRTL ? 'هدف فردي' : 'Individual Goal'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الفئة *' : 'Category *'}</Label>
                <Select value={formData.goal_category} onValueChange={(value) => handleChange('goal_category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strategic">{isRTL ? 'استراتيجي' : 'Strategic'}</SelectItem>
                    <SelectItem value="Operational">{isRTL ? 'تشغيلي' : 'Operational'}</SelectItem>
                    <SelectItem value="Financial">{isRTL ? 'مالي' : 'Financial'}</SelectItem>
                    <SelectItem value="Customer">{isRTL ? 'عملاء' : 'Customer'}</SelectItem>
                    <SelectItem value="Learning & Growth">{isRTL ? 'التعلم والنمو' : 'Learning & Growth'}</SelectItem>
                    <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {availableParentGoals.length > 0 && (
                <div>
                  <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الهدف الرئيسي' : 'Parent Goal'}</Label>
                  <Select value={formData.parent_goal_id} onValueChange={(value) => handleChange('parent_goal_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? "اختر الهدف الرئيسي" : "Select parent goal"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>{isRTL ? 'بدون' : 'None'}</SelectItem>
                      {availableParentGoals.map(g => (
                        <SelectItem key={g.id} value={g.id}>
                          [{g.goal_type}] {g.goal_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'المسؤول *' : 'Owner *'}</Label>
                <Select value={formData.owner_id} onValueChange={(value) => handleChange('owner_id', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر المسؤول" : "Select owner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(e => e.status === "Active").map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.job_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`h-24 ${isRTL ? 'text-right' : ''}`}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'معايير النجاح' : 'Success Criteria'}</Label>
              <Textarea
                value={formData.success_criteria}
                onChange={(e) => handleChange('success_criteria', e.target.value)}
                className={`h-20 ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? "كيف سنعرف أن الهدف تحقق؟" : "How will we know the goal is achieved?"}
              />
            </div>
          </div>

          {/* Measurement */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'القياس والتتبع' : 'Measurement & Tracking'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نوع القياس *' : 'Measurement Type *'}</Label>
                <Select value={formData.measurement_type} onValueChange={(value) => handleChange('measurement_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">{isRTL ? 'نسبة مئوية' : 'Percentage'}</SelectItem>
                    <SelectItem value="Amount">{isRTL ? 'مبلغ' : 'Amount'}</SelectItem>
                    <SelectItem value="Count">{isRTL ? 'عدد' : 'Count'}</SelectItem>
                    <SelectItem value="Binary (Yes/No)">{isRTL ? 'نعم/لا' : 'Binary (Yes/No)'}</SelectItem>
                    <SelectItem value="Rating Scale">{isRTL ? 'مقياس تقييم' : 'Rating Scale'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'القيمة المستهدفة *' : 'Target Value *'}</Label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => handleChange('target_value', parseFloat(e.target.value) || 0)}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'القيمة الحالية' : 'Current Value'}</Label>
                <Input
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => handleChange('current_value', parseFloat(e.target.value) || 0)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium text-gray-700">{isRTL ? 'نسبة الإنجاز' : 'Achievement'}</span>
                <span className="text-2xl font-bold text-green-600">{formData.achievement_percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, formData.achievement_percent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Results (OKR) */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'النتائج الرئيسية (KRs)' : 'Key Results (KRs)'}
            </h3>

            {keyResults.length > 0 && (
              <div className="space-y-2">
                {keyResults.map((kr, index) => (
                  <div key={kr.id || index} className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{kr.key_result_name}</p>
                      <p className="text-sm text-gray-500">
                        {isRTL ? 'الهدف:' : 'Target:'} {kr.target_value} {kr.measurement_unit}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {isRTL ? 'وزن' : 'Weight'}: {kr.weight}
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveKeyResult(kr)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <p className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'إضافة نتيجة رئيسية' : 'Add Key Result'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  placeholder={isRTL ? "اسم النتيجة الرئيسية" : "Key Result Name"}
                  value={newKeyResult.key_result_name}
                  onChange={(e) => setNewKeyResult({...newKeyResult, key_result_name: e.target.value})}
                  className={isRTL ? 'text-right col-span-2' : 'col-span-2'}
                />
                <Input
                  type="number"
                  placeholder={isRTL ? "القيمة المستهدفة" : "Target Value"}
                  value={newKeyResult.target_value}
                  onChange={(e) => setNewKeyResult({...newKeyResult, target_value: parseFloat(e.target.value) || 0})}
                  className={isRTL ? 'text-right' : ''}
                />
                <Input
                  placeholder={isRTL ? "الوحدة (%, SAR, etc.)" : "Unit (%, SAR, etc.)"}
                  value={newKeyResult.measurement_unit}
                  onChange={(e) => setNewKeyResult({...newKeyResult, measurement_unit: e.target.value})}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddKeyResult}
                variant="outline"
                size="sm"
                className={`w-full ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إضافة نتيجة رئيسية' : 'Add Key Result'}
              </Button>
            </div>
          </div>

          {/* Timeline & Status */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'الجدول الزمني والحالة' : 'Timeline & Status'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ البداية *' : 'Start Date *'}</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تاريخ الاستحقاق *' : 'Due Date *'}</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الحالة *' : 'Status *'}</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">{isRTL ? 'مسودة' : 'Draft'}</SelectItem>
                    <SelectItem value="Active">{isRTL ? 'نشط' : 'Active'}</SelectItem>
                    <SelectItem value="On Track">{isRTL ? 'على المسار الصحيح' : 'On Track'}</SelectItem>
                    <SelectItem value="At Risk">{isRTL ? 'معرض للخطر' : 'At Risk'}</SelectItem>
                    <SelectItem value="Off Track">{isRTL ? 'خارج المسار' : 'Off Track'}</SelectItem>
                    <SelectItem value="Completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
                    <SelectItem value="Cancelled">{isRTL ? 'ملغى' : 'Cancelled'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الأولوية *' : 'Priority *'}</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">{isRTL ? 'منخفضة' : 'Low'}</SelectItem>
                    <SelectItem value="Medium">{isRTL ? 'متوسطة' : 'Medium'}</SelectItem>
                    <SelectItem value="High">{isRTL ? 'عالية' : 'High'}</SelectItem>
                    <SelectItem value="Critical">{isRTL ? 'حرجة' : 'Critical'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الوزن (0-1)' : 'Weight (0-1)'}</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الرؤية' : 'Visibility'}</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleChange('visibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">{isRTL ? 'عام' : 'Public'}</SelectItem>
                    <SelectItem value="Department">{isRTL ? 'القسم' : 'Department'}</SelectItem>
                    <SelectItem value="Team">{isRTL ? 'الفريق' : 'Team'}</SelectItem>
                    <SelectItem value="Private">{isRTL ? 'خاص' : 'Private'}</SelectItem>
                  </SelectContent>
                </Select>
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
            {isRTL ? 'حفظ الهدف' : 'Save Goal'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}