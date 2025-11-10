import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Download, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CustomReportBuilder() {
  const [selectedEntity, setSelectedEntity] = useState("Employee");
  const [selectedFields, setSelectedFields] = useState([]);
  const [filters, setFilters] = useState([]);
  const [reportName, setReportName] = useState("");
  const [generating, setGenerating] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const entities = [
    { value: "Employee", label: "Employees", labelAr: "الموظفين" },
    { value: "Payroll", label: "Payroll", labelAr: "الرواتب" },
    { value: "LeaveRequest", label: "Leave Requests", labelAr: "طلبات الإجازة" },
    { value: "TimeLog", label: "Time Logs", labelAr: "سجلات الوقت" },
    { value: "Document", label: "Documents", labelAr: "المستندات" },
    { value: "LoanAdvance", label: "Loans", labelAr: "القروض" }
  ];

  const fieldsByEntity = {
    Employee: [
      { value: "employee_id", label: "Employee ID", labelAr: "رقم الموظف" },
      { value: "full_name", label: "Full Name", labelAr: "الاسم الكامل" },
      { value: "department", label: "Department", labelAr: "القسم" },
      { value: "job_title", label: "Job Title", labelAr: "المسمى الوظيفي" },
      { value: "nationality", label: "Nationality", labelAr: "الجنسية" },
      { value: "status", label: "Status", labelAr: "الحالة" },
      { value: "basic_salary", label: "Basic Salary", labelAr: "الراتب الأساسي" },
      { value: "join_date", label: "Join Date", labelAr: "تاريخ الالتحاق" },
      { value: "work_email", label: "Email", labelAr: "البريد الإلكتروني" },
      { value: "mobile", label: "Mobile", labelAr: "الجوال" }
    ],
    Payroll: [
      { value: "employee_name", label: "Employee Name", labelAr: "اسم الموظف" },
      { value: "month", label: "Month", labelAr: "الشهر" },
      { value: "year", label: "Year", labelAr: "السنة" },
      { value: "basic_salary", label: "Basic Salary", labelAr: "الراتب الأساسي" },
      { value: "total_gross", label: "Total Gross", labelAr: "الإجمالي" },
      { value: "total_deductions", label: "Deductions", labelAr: "الخصومات" },
      { value: "net_salary", label: "Net Salary", labelAr: "الصافي" },
      { value: "status", label: "Status", labelAr: "الحالة" }
    ],
    LeaveRequest: [
      { value: "employee_name", label: "Employee Name", labelAr: "اسم الموظف" },
      { value: "leave_type_name", label: "Leave Type", labelAr: "نوع الإجازة" },
      { value: "start_date", label: "Start Date", labelAr: "تاريخ البداية" },
      { value: "end_date", label: "End Date", labelAr: "تاريخ النهاية" },
      { value: "days_count", label: "Days", labelAr: "الأيام" },
      { value: "status", label: "Status", labelAr: "الحالة" }
    ],
    TimeLog: [
      { value: "employee_name", label: "Employee Name", labelAr: "اسم الموظف" },
      { value: "date", label: "Date", labelAr: "التاريخ" },
      { value: "clock_in", label: "Clock In", labelAr: "الحضور" },
      { value: "clock_out", label: "Clock Out", labelAr: "الانصراف" },
      { value: "total_hours", label: "Total Hours", labelAr: "مجموع الساعات" },
      { value: "overtime_hours", label: "Overtime", labelAr: "العمل الإضافي" },
      { value: "status", label: "Status", labelAr: "الحالة" }
    ],
    Document: [
      { value: "employee_name", label: "Employee Name", labelAr: "اسم الموظف" },
      { value: "document_type", label: "Document Type", labelAr: "نوع المستند" },
      { value: "document_number", label: "Document Number", labelAr: "رقم المستند" },
      { value: "issue_date", label: "Issue Date", labelAr: "تاريخ الإصدار" },
      { value: "expiry_date", label: "Expiry Date", labelAr: "تاريخ الانتهاء" }
    ],
    LoanAdvance: [
      { value: "employee_name", label: "Employee Name", labelAr: "اسم الموظف" },
      { value: "loan_type", label: "Loan Type", labelAr: "نوع القرض" },
      { value: "loan_amount", label: "Loan Amount", labelAr: "مبلغ القرض" },
      { value: "installments", label: "Installments", labelAr: "الأقساط" },
      { value: "balance", label: "Balance", labelAr: "الرصيد" },
      { value: "status", label: "Status", labelAr: "الحالة" }
    ]
  };

  const availableFields = fieldsByEntity[selectedEntity] || [];

  const toggleField = (field) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const addFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }]);
  };

  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
  };

  const generateReport = async () => {
    if (selectedFields.length === 0) {
      alert(isRTL ? "الرجاء اختيار حقل واحد على الأقل" : "Please select at least one field");
      return;
    }

    setGenerating(true);
    try {
      // Fetch data
      const data = await base44.entities[selectedEntity].list();

      // Apply filters
      let filteredData = data;
      filters.forEach(filter => {
        if (filter.field && filter.value) {
          filteredData = filteredData.filter(item => {
            const fieldValue = String(item[filter.field] || "").toLowerCase();
            const filterValue = String(filter.value).toLowerCase();
            
            switch(filter.operator) {
              case "equals":
                return fieldValue === filterValue;
              case "contains":
                return fieldValue.includes(filterValue);
              case "greater":
                return parseFloat(fieldValue) > parseFloat(filterValue);
              case "less":
                return parseFloat(fieldValue) < parseFloat(filterValue);
              default:
                return true;
            }
          });
        }
      });

      // Generate CSV
      const headers = selectedFields.map(field => {
        const fieldDef = availableFields.find(f => f.value === field);
        return isRTL ? fieldDef.labelAr : fieldDef.label;
      });

      let csv = headers.join(",") + "\n";
      
      filteredData.forEach(item => {
        const row = selectedFields.map(field => {
          const value = item[field];
          if (value === null || value === undefined) return "";
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        });
        csv += row.join(",") + "\n";
      });

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = reportName || `Custom_Report_${selectedEntity}_${Date.now()}`;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'بناء تقرير مخصص' : 'Build Custom Report'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Report Name */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'اسم التقرير' : 'Report Name'}
            </Label>
            <Input
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder={isRTL ? "أدخل اسم التقرير..." : "Enter report name..."}
              className={`mt-2 ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          {/* Entity Selection */}
          <div>
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'اختر البيانات' : 'Select Data Source'}
            </Label>
            <Select value={selectedEntity} onValueChange={(val) => {
              setSelectedEntity(val);
              setSelectedFields([]);
              setFilters([]);
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entities.map(entity => (
                  <SelectItem key={entity.value} value={entity.value}>
                    {isRTL ? entity.labelAr : entity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field Selection */}
          <div>
            <Label className={isRTL ? 'text-right block mb-3' : 'mb-3'}>
              {isRTL ? 'اختر الحقول' : 'Select Fields'}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFields.map(field => (
                <div key={field.value} className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Checkbox
                    id={field.value}
                    checked={selectedFields.includes(field.value)}
                    onCheckedChange={() => toggleField(field.value)}
                  />
                  <label
                    htmlFor={field.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {isRTL ? field.labelAr : field.label}
                  </label>
                </div>
              ))}
            </div>
            {selectedFields.length > 0 && (
              <div className={`flex flex-wrap gap-2 mt-3 ${isRTL ? 'justify-end' : ''}`}>
                {selectedFields.map(field => {
                  const fieldDef = availableFields.find(f => f.value === field);
                  return (
                    <Badge key={field} variant="secondary" className="bg-green-100 text-green-800">
                      {isRTL ? fieldDef.labelAr : fieldDef.label}
                      <X 
                        className={`w-3 h-3 ${isRTL ? 'mr-1' : 'ml-1'} cursor-pointer`} 
                        onClick={() => toggleField(field)}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filters */}
          <div>
            <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Label className={isRTL ? 'text-right' : ''}>
                {isRTL ? 'المرشحات' : 'Filters'}
              </Label>
              <Button onClick={addFilter} variant="outline" size="sm" className={isRTL ? 'flex-row-reverse' : ''}>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إضافة مرشح' : 'Add Filter'}
              </Button>
            </div>
            <div className="space-y-3">
              {filters.map((filter, index) => (
                <div key={index} className={`flex gap-2 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Select 
                    value={filter.field} 
                    onValueChange={(val) => updateFilter(index, 'field', val)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder={isRTL ? "الحقل" : "Field"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {isRTL ? field.labelAr : field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={filter.operator} 
                    onValueChange={(val) => updateFilter(index, 'operator', val)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">{isRTL ? 'يساوي' : 'Equals'}</SelectItem>
                      <SelectItem value="contains">{isRTL ? 'يحتوي' : 'Contains'}</SelectItem>
                      <SelectItem value="greater">{isRTL ? 'أكبر من' : 'Greater'}</SelectItem>
                      <SelectItem value="less">{isRTL ? 'أقل من' : 'Less'}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    placeholder={isRTL ? "القيمة" : "Value"}
                    className={`flex-1 ${isRTL ? 'text-right' : ''}`}
                  />

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFilter(index)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
            <Button 
              variant="outline" 
              className={isRTL ? 'flex-row-reverse' : ''}
            >
              <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'حفظ القالب' : 'Save Template'}
            </Button>
            <Button 
              onClick={generateReport}
              disabled={generating || selectedFields.length === 0}
              className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {generating ? (isRTL ? 'جاري الإنشاء...' : 'Generating...') : (isRTL ? 'إنشاء التقرير' : 'Generate Report')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}