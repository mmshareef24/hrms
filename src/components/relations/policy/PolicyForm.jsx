import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function PolicyForm({ policyData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    policy_name: "",
    policy_name_arabic: "",
    category: "HR",
    version: "1.0",
    effective_date: new Date().toISOString().split('T')[0],
    review_date: "",
    summary: "",
    content: "",
    applies_to: "All Employees",
    requires_acknowledgment: true,
    acknowledgment_deadline: "",
    is_active: false,
    ...policyData
  });

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {policyData ? (isRTL ? 'تعديل السياسة' : 'Edit Policy') : (isRTL ? 'سياسة جديدة' : 'New Policy')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Policy Name */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'اسم السياسة' : 'Policy Name'} *
              </Label>
              <Input
                value={formData.policy_name}
                onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                placeholder={isRTL ? "مثال: سياسة الإجازات" : "e.g., Leave Policy"}
                required
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            {/* Policy Name Arabic */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الاسم بالعربية' : 'Policy Name (Arabic)'}
              </Label>
              <Input
                value={formData.policy_name_arabic}
                onChange={(e) => setFormData({ ...formData, policy_name_arabic: e.target.value })}
                placeholder="سياسة الإجازات"
                className="text-right"
                dir="rtl"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الفئة' : 'Category'} *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">{isRTL ? 'الموارد البشرية' : 'HR'}</SelectItem>
                  <SelectItem value="IT">{isRTL ? 'تقنية المعلومات' : 'IT'}</SelectItem>
                  <SelectItem value="Safety">{isRTL ? 'السلامة' : 'Safety'}</SelectItem>
                  <SelectItem value="Ethics">{isRTL ? 'الأخلاقيات' : 'Ethics'}</SelectItem>
                  <SelectItem value="Finance">{isRTL ? 'المالية' : 'Finance'}</SelectItem>
                  <SelectItem value="Operations">{isRTL ? 'العمليات' : 'Operations'}</SelectItem>
                  <SelectItem value="General">{isRTL ? 'عامة' : 'General'}</SelectItem>
                  <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Version */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الإصدار' : 'Version'} *
              </Label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0"
                required
              />
            </div>

            {/* Effective Date */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'تاريخ السريان' : 'Effective Date'} *
              </Label>
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                required
              />
            </div>

            {/* Review Date */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'تاريخ المراجعة' : 'Review Date'}
              </Label>
              <Input
                type="date"
                value={formData.review_date}
                onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
              />
            </div>

            {/* Applies To */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'ينطبق على' : 'Applies To'}
              </Label>
              <Select
                value={formData.applies_to}
                onValueChange={(value) => setFormData({ ...formData, applies_to: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Employees">{isRTL ? 'جميع الموظفين' : 'All Employees'}</SelectItem>
                  <SelectItem value="Full-time Only">{isRTL ? 'دوام كامل فقط' : 'Full-time Only'}</SelectItem>
                  <SelectItem value="Management Only">{isRTL ? 'الإدارة فقط' : 'Management Only'}</SelectItem>
                  <SelectItem value="Department Specific">{isRTL ? 'قسم محدد' : 'Department Specific'}</SelectItem>
                  <SelectItem value="Custom">{isRTL ? 'مخصص' : 'Custom'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Acknowledgment Deadline */}
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الموعد النهائي للإقرار' : 'Acknowledgment Deadline'}
              </Label>
              <Input
                type="date"
                value={formData.acknowledgment_deadline}
                onChange={(e) => setFormData({ ...formData, acknowledgment_deadline: e.target.value })}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'ملخص السياسة' : 'Policy Summary'}
            </Label>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder={isRTL ? "نظرة عامة مختصرة على السياسة..." : "Brief overview of the policy..."}
              rows={3}
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'محتوى السياسة' : 'Policy Content'} *
            </Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={isRTL ? "النص الكامل للسياسة..." : "Full policy text..."}
              rows={10}
              required
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Checkbox
                id="requires_acknowledgment"
                checked={formData.requires_acknowledgment}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_acknowledgment: checked })}
              />
              <Label htmlFor="requires_acknowledgment" className="cursor-pointer">
                {isRTL ? 'يتطلب إقرار من الموظفين' : 'Requires Employee Acknowledgment'}
              </Label>
            </div>

            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                {isRTL ? 'تفعيل السياسة' : 'Activate Policy'}
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-4 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700">
              {policyData ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'إنشاء' : 'Create')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}