import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

export default function CaseFilters({ filters, onFilterChange }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <div className={`flex flex-wrap gap-4 items-end ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {isRTL ? 'تصفية حسب:' : 'Filter by:'}
        </span>
      </div>

      <div className="space-y-1">
        <Label className={`text-xs text-gray-500 ${isRTL ? 'text-right block' : ''}`}>
          {isRTL ? 'النوع' : 'Type'}
        </Label>
        <Select
          value={filters.type}
          onValueChange={(value) => onFilterChange({ ...filters, type: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All Types'}</SelectItem>
            <SelectItem value="Grievance">{isRTL ? 'شكوى' : 'Grievance'}</SelectItem>
            <SelectItem value="Disciplinary">{isRTL ? 'تأديبية' : 'Disciplinary'}</SelectItem>
            <SelectItem value="Investigation">{isRTL ? 'تحقيق' : 'Investigation'}</SelectItem>
            <SelectItem value="Complaint">{isRTL ? 'مظلمة' : 'Complaint'}</SelectItem>
            <SelectItem value="Conflict">{isRTL ? 'نزاع' : 'Conflict'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className={`text-xs text-gray-500 ${isRTL ? 'text-right block' : ''}`}>
          {isRTL ? 'الأولوية' : 'Severity'}
        </Label>
        <Select
          value={filters.severity}
          onValueChange={(value) => onFilterChange({ ...filters, severity: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'الكل' : 'All Severities'}</SelectItem>
            <SelectItem value="Critical">{isRTL ? 'حرجة' : 'Critical'}</SelectItem>
            <SelectItem value="High">{isRTL ? 'عالية' : 'High'}</SelectItem>
            <SelectItem value="Medium">{isRTL ? 'متوسطة' : 'Medium'}</SelectItem>
            <SelectItem value="Low">{isRTL ? 'منخفضة' : 'Low'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}