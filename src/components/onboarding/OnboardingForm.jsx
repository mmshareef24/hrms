import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function OnboardingForm({ onboarding, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employee_name: '',
    job_title: '',
    department: '',
    start_date: '',
    expected_completion_date: '',
    hiring_manager_id: '',
    hiring_manager_name: '',
    buddy_id: '',
    buddy_name: '',
    onboarding_type: 'Standard',
    status: 'Pre-Boarding',
    ...onboarding
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const empList = await base44.entities.Employee.list();
      setEmployees(empList || []);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving:", error);
      alert(isRTL ? 'حدث خطأ في الحفظ' : 'Error saving onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleManagerSelect = (managerId) => {
    const manager = employees.find(e => e.id === managerId);
    setFormData({
      ...formData,
      hiring_manager_id: managerId,
      hiring_manager_name: manager?.full_name || ''
    });
  };

  const handleBuddySelect = (buddyId) => {
    const buddy = employees.find(e => e.id === buddyId);
    setFormData({
      ...formData,
      buddy_id: buddyId,
      buddy_name: buddy?.full_name || ''
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {onboarding?.id 
            ? (isRTL ? 'تعديل الإعداد' : 'Edit Onboarding')
            : (isRTL ? 'إعداد موظف جديد' : 'New Employee Onboarding')
          }
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'اسم الموظف *' : 'Employee Name *'}
              </Label>
              <Input
                value={formData.employee_name}
                onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                required
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'المسمى الوظيفي *' : 'Job Title *'}
              </Label>
              <Input
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                required
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'القسم *' : 'Department *'}
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر القسم" : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">{isRTL ? 'الموارد البشرية' : 'HR'}</SelectItem>
                  <SelectItem value="Finance">{isRTL ? 'المالية' : 'Finance'}</SelectItem>
                  <SelectItem value="Operations">{isRTL ? 'العمليات' : 'Operations'}</SelectItem>
                  <SelectItem value="IT">{isRTL ? 'تقنية المعلومات' : 'IT'}</SelectItem>
                  <SelectItem value="Sales">{isRTL ? 'المبيعات' : 'Sales'}</SelectItem>
                  <SelectItem value="Marketing">{isRTL ? 'التسويق' : 'Marketing'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'نوع الإعداد' : 'Onboarding Type'}
              </Label>
              <Select
                value={formData.onboarding_type}
                onValueChange={(value) => setFormData({ ...formData, onboarding_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">{isRTL ? 'قياسي' : 'Standard'}</SelectItem>
                  <SelectItem value="Remote">{isRTL ? 'عن بعد' : 'Remote'}</SelectItem>
                  <SelectItem value="Executive">{isRTL ? 'تنفيذي' : 'Executive'}</SelectItem>
                  <SelectItem value="Intern">{isRTL ? 'متدرب' : 'Intern'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'تاريخ البدء *' : 'Start Date *'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {formData.start_date 
                      ? format(new Date(formData.start_date), 'PPP')
                      : (isRTL ? 'اختر التاريخ' : 'Pick a date')
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? new Date(formData.start_date) : undefined}
                    onSelect={(date) => setFormData({ ...formData, start_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'تاريخ الانتهاء المتوقع' : 'Expected Completion Date'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {formData.expected_completion_date 
                      ? format(new Date(formData.expected_completion_date), 'PPP')
                      : (isRTL ? 'اختر التاريخ' : 'Pick a date')
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expected_completion_date ? new Date(formData.expected_completion_date) : undefined}
                    onSelect={(date) => setFormData({ ...formData, expected_completion_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'المدير المسؤول' : 'Hiring Manager'}
              </Label>
              <Select
                value={formData.hiring_manager_id}
                onValueChange={handleManagerSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر المدير" : "Select manager"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name} - {emp.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'زميل الإعداد' : 'Onboarding Buddy'}
              </Label>
              <Select
                value={formData.buddy_id}
                onValueChange={handleBuddySelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "اختر الزميل" : "Select buddy"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name} - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Actions */}
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}