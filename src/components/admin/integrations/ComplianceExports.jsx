import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ComplianceExports() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const exportFormats = [
    {
      name: "GOSI Report",
      nameAr: "تقرير التأمينات الاجتماعية",
      description: "Monthly GOSI contribution report",
      descriptionAr: "تقرير الاشتراكات الشهرية للتأمينات",
      format: "CSV",
      icon: FileSpreadsheet
    },
    {
      name: "WPS/Mudad File",
      nameAr: "ملف حماية الأجور",
      description: "Wage Protection System file for banks",
      descriptionAr: "ملف نظام حماية الأجور للبنوك",
      format: "SIF",
      icon: FileSpreadsheet
    },
    {
      name: "MOL/MHRSD Export",
      nameAr: "تصدير وزارة العمل",
      description: "Ministry of Labor compliance export",
      descriptionAr: "تصدير الامتثال لوزارة العمل",
      format: "XML",
      icon: FileSpreadsheet
    }
  ];

  const exportGOSI = async () => {
    setExporting(true);
    try {
      const employees = await base44.entities.Employee.filter({ status: "Active" });
      const payrolls = await base44.entities.Payroll.filter({
        month: selectedMonth,
        year: selectedYear
      });

      // Generate GOSI CSV
      let csv = "Employee ID,Name,Nationality,Basic Salary,Housing Allowance,GOSI Base,Employee Contribution,Employer Contribution,Total\n";
      
      payrolls.forEach(payroll => {
        const employee = employees.find(e => e.id === payroll.employee_id);
        if (!employee) return;

        const gosiBase = payroll.basic_salary + payroll.housing_allowance;
        csv += `${employee.employee_id},${payroll.employee_name},${employee.nationality},${payroll.basic_salary},${payroll.housing_allowance},${gosiBase},${payroll.gosi_employee},${payroll.gosi_employer},${payroll.gosi_employee + payroll.gosi_employer}\n`;
      });

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GOSI_Report_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const exportWPS = async () => {
    setExporting(true);
    try {
      const payrolls = await base44.entities.Payroll.filter({
        month: selectedMonth,
        year: selectedYear,
        status: "Approved"
      });

      const employees = await base44.entities.Employee.list();

      // Generate WPS SIF format
      let sif = "";
      
      payrolls.forEach((payroll, index) => {
        const employee = employees.find(e => e.id === payroll.employee_id);
        if (!employee) return;

        // SIF Record format (simplified)
        sif += `${index + 1}|`;
        sif += `${employee.employee_id}|`;
        sif += `${employee.iqama_number || ''}|`;
        sif += `${employee.full_name}|`;
        sif += `${payroll.net_salary.toFixed(2)}|`;
        sif += `${employee.iban || ''}|`;
        sif += `${employee.bank_name || ''}|`;
        sif += `SAR|`;
        sif += `${selectedYear}${String(selectedMonth).padStart(2, '0')}|\n`;
      });

      // Download
      const blob = new Blob([sif], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WPS_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.sif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const exportMOL = async () => {
    setExporting(true);
    try {
      const employees = await base44.entities.Employee.filter({ status: "Active" });

      // Generate MOL XML (simplified)
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<EmployeeData>\n';
      
      employees.forEach(employee => {
        xml += '  <Employee>\n';
        xml += `    <EmployeeID>${employee.employee_id}</EmployeeID>\n`;
        xml += `    <Name>${employee.full_name}</Name>\n`;
        xml += `    <Nationality>${employee.nationality}</Nationality>\n`;
        xml += `    <IqamaNumber>${employee.iqama_number || ''}</IqamaNumber>\n`;
        xml += `    <PassportNumber>${employee.passport_number || ''}</PassportNumber>\n`;
        xml += `    <JobTitle>${employee.job_title}</JobTitle>\n`;
        xml += `    <JoinDate>${employee.join_date}</JoinDate>\n`;
        xml += `    <BasicSalary>${employee.basic_salary}</BasicSalary>\n`;
        xml += '  </Employee>\n';
      });
      
      xml += '</EmployeeData>';

      // Download
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MOL_Export_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleExport = (exportType) => {
    switch(exportType) {
      case "GOSI Report":
        return exportGOSI();
      case "WPS/Mudad File":
        return exportWPS();
      case "MOL/MHRSD Export":
        return exportMOL();
    }
  };

  const months = [
    { value: 1, label: 'January', labelAr: 'يناير' },
    { value: 2, label: 'February', labelAr: 'فبراير' },
    { value: 3, label: 'March', labelAr: 'مارس' },
    { value: 4, label: 'April', labelAr: 'أبريل' },
    { value: 5, label: 'May', labelAr: 'مايو' },
    { value: 6, label: 'June', labelAr: 'يونيو' },
    { value: 7, label: 'July', labelAr: 'يوليو' },
    { value: 8, label: 'August', labelAr: 'أغسطس' },
    { value: 9, label: 'September', labelAr: 'سبتمبر' },
    { value: 10, label: 'October', labelAr: 'أكتوبر' },
    { value: 11, label: 'November', labelAr: 'نوفمبر' },
    { value: 12, label: 'December', labelAr: 'ديسمبر' }
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>{isRTL ? 'اختر الفترة' : 'Select Period'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'الشهر' : 'Month'}
              </label>
              <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {isRTL ? month.labelAr : month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'السنة' : 'Year'}
              </label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {exportFormats.map((format) => {
          const Icon = format.icon;
          return (
            <Card key={format.name} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-gray-100">
                <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                      <CardTitle className="text-xl">{isRTL ? format.nameAr : format.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {isRTL ? format.descriptionAr : format.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                    {format.format}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                  <Button 
                    onClick={() => handleExport(format.name)}
                    disabled={exporting}
                    className={`bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {exporting ? (isRTL ? 'جاري التصدير...' : 'Exporting...') : (isRTL ? 'تصدير' : 'Export')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}