import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function EmployeeFilters({ filters, onFilterChange }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <div className={`flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {isRTL ? 'التصفية:' : 'Filters:'}
        </span>
      </div>
      
      <Select 
        value={filters.department} 
        onValueChange={(v) => onFilterChange({ ...filters, department: v })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={isRTL ? "القسم" : "Department"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isRTL ? 'جميع الأقسام' : 'All Departments'}</SelectItem>
          <SelectItem value="HR">{isRTL ? 'الموارد البشرية' : 'HR'}</SelectItem>
          <SelectItem value="Finance">{isRTL ? 'المالية' : 'Finance'}</SelectItem>
          <SelectItem value="Operations">{isRTL ? 'العمليات' : 'Operations'}</SelectItem>
          <SelectItem value="IT">{isRTL ? 'تقنية المعلومات' : 'IT'}</SelectItem>
          <SelectItem value="Sales">{isRTL ? 'المبيعات' : 'Sales'}</SelectItem>
          <SelectItem value="Marketing">{isRTL ? 'التسويق' : 'Marketing'}</SelectItem>
          <SelectItem value="Administration">{isRTL ? 'الإدارة' : 'Administration'}</SelectItem>
          <SelectItem value="Legal">{isRTL ? 'القانونية' : 'Legal'}</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={filters.status} 
        onValueChange={(v) => onFilterChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</SelectItem>
          <SelectItem value="Active">{isRTL ? 'نشط' : 'Active'}</SelectItem>
          <SelectItem value="On Leave">{isRTL ? 'في إجازة' : 'On Leave'}</SelectItem>
          <SelectItem value="Terminated">{isRTL ? 'منتهي الخدمة' : 'Terminated'}</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={filters.nationality} 
        onValueChange={(v) => onFilterChange({ ...filters, nationality: v })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={isRTL ? "الجنسية" : "Nationality"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isRTL ? 'جميع الجنسيات' : 'All Nationalities'}</SelectItem>
          <SelectItem value="Saudi">{isRTL ? 'سعودي' : 'Saudi'}</SelectItem>
          <SelectItem value="Non-Saudi">{isRTL ? 'غير سعودي' : 'Non-Saudi'}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}