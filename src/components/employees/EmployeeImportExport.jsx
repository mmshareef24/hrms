import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Employee, Company, Shift } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function EmployeeImportExport({ onImportComplete }) {
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [file, setFile] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const downloadTemplate = () => {
    const template = `Employee ID,Full Name,Full Name Arabic,Nationality,Country of Origin,Iqama Number,Iqama Expiry (YYYY-MM-DD),Passport Number,Passport Expiry (YYYY-MM-DD),GOSI Number,Job Title,Department,Employment Type,Join Date (YYYY-MM-DD),Company Code,Basic Salary,Mobile,Email,Emergency Contact,Status
EMP001,John Doe,جون دو,Non-Saudi,USA,1234567890,2025-12-31,AB1234567,2026-12-31,GOS123,Software Engineer,IT,Full-time,2024-01-15,JASCO01,8000,+966501234567,john@example.com,+966509876543,Active
EMP002,Ahmed Ali,أحمد علي,Saudi,,2234567890,2026-06-30,,,GOS124,HR Manager,HR,Full-time,2023-05-20,JASCO01,10000,+966501234568,ahmed@example.com,+966509876544,Active`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportEmployees = async () => {
    const employees = await Employee.list();
    
    const csvHeader = 'Employee ID,Full Name,Full Name Arabic,Nationality,Country of Origin,Iqama Number,Iqama Expiry,Passport Number,Passport Expiry,GOSI Number,Job Title,Department,Employment Type,Join Date,Company Code,Company Name,Basic Salary,Housing Allowance,Transportation Allowance,Mobile,Email,Emergency Contact,Status,Shift Name\n';
    
    const csvRows = employees.map(emp => {
      return [
        emp.employee_id || '',
        emp.full_name || '',
        emp.full_name_arabic || '',
        emp.nationality || '',
        emp.country_of_origin || '',
        emp.iqama_number || '',
        emp.iqama_expiry || '',
        emp.passport_number || '',
        emp.passport_expiry || '',
        emp.gosi_number || '',
        emp.job_title || '',
        emp.department || '',
        emp.employment_type || '',
        emp.join_date || '',
        emp.company_id || '',
        emp.company_name || '',
        emp.basic_salary || '',
        emp.housing_allowance || '',
        emp.transportation_allowance || '',
        emp.mobile || '',
        emp.email || '',
        emp.emergency_contact || '',
        emp.status || '',
        emp.shift_name || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const processImport = async () => {
    if (!file) return;

    setUploading(true);
    setResults(null);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setUploading(false);
      setProcessing(true);

      // Get companies and shifts for mapping
      const [companies, shifts] = await Promise.all([
        Company.list(),
        Shift.list()
      ]);

      // Define the JSON schema for extraction
      const schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            employee_id: { type: "string" },
            full_name: { type: "string" },
            full_name_arabic: { type: "string" },
            nationality: { type: "string" },
            country_of_origin: { type: "string" },
            iqama_number: { type: "string" },
            iqama_expiry: { type: "string" },
            passport_number: { type: "string" },
            passport_expiry: { type: "string" },
            gosi_number: { type: "string" },
            job_title: { type: "string" },
            department: { type: "string" },
            employment_type: { type: "string" },
            join_date: { type: "string" },
            company_code: { type: "string" },
            basic_salary: { type: "number" },
            mobile: { type: "string" },
            email: { type: "string" },
            emergency_contact: { type: "string" },
            status: { type: "string" }
          }
        }
      };

      // Extract data
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });

      if (result.status === "error") {
        setResults({ success: 0, failed: 1, errors: [result.details] });
        setProcessing(false);
        return;
      }

      // Process and create employees
      const employeesToCreate = [];
      const errors = [];

      for (const row of result.output) {
        try {
          // Validate required fields
          if (!row.employee_id || !row.full_name) {
            errors.push(`Row missing employee_id or full_name`);
            continue;
          }

          if (!row.job_title) {
            errors.push(`Employee ${row.employee_id}: Job title is required`);
            continue;
          }

          if (!row.department) {
            errors.push(`Employee ${row.employee_id}: Department is required`);
            continue;
          }

          if (!row.join_date) {
            errors.push(`Employee ${row.employee_id}: Join date is required`);
            continue;
          }

          // Find company
          const company = companies.find(c => c.company_code === row.company_code);
          if (!company) {
            errors.push(`Employee ${row.employee_id}: Company code "${row.company_code}" not found`);
            continue;
          }

          // Validate department enum
          const validDepartments = ["HR", "Finance", "Operations", "IT", "Sales", "Marketing", "Administration", "Legal"];
          if (!validDepartments.includes(row.department)) {
            errors.push(`Employee ${row.employee_id}: Department "${row.department}" must be one of: ${validDepartments.join(', ')}`);
            continue;
          }

          // Calculate allowances
          const basicSalary = parseFloat(row.basic_salary) || 0;
          const housingAllowance = basicSalary * 0.25;
          const transportationAllowance = basicSalary * 0.10;

          const employeeData = {
            company_id: company.id,
            company_name: company.company_name,
            employee_id: row.employee_id,
            full_name: row.full_name,
            full_name_arabic: row.full_name_arabic || "",
            nationality: row.nationality || "Non-Saudi",
            country_of_origin: row.country_of_origin || "",
            iqama_number: row.iqama_number || "",
            iqama_expiry: row.iqama_expiry || "",
            passport_number: row.passport_number || "",
            passport_expiry: row.passport_expiry || "",
            gosi_number: row.gosi_number || "",
            job_title: row.job_title,
            department: row.department,
            employment_type: row.employment_type || "Full-time",
            join_date: row.join_date,
            basic_salary: basicSalary,
            housing_allowance: housingAllowance,
            transportation_allowance: transportationAllowance,
            mobile: row.mobile || "",
            email: row.email || "",
            work_email: row.email || "",
            emergency_contact: row.emergency_contact || "",
            emergency_contact_phone: row.emergency_contact || "",
            status: row.status || "Active",
            annual_leave_balance: 21,
            sick_leave_balance: 30
          };

          employeesToCreate.push(employeeData);
        } catch (err) {
          errors.push(`Employee ${row.employee_id}: ${err.message}`);
        }
      }

      // Bulk create employees
      if (employeesToCreate.length > 0) {
        try {
          await Employee.bulkCreate(employeesToCreate);
        } catch (bulkError) {
          errors.push(`Bulk create error: ${bulkError.message}`);
          setResults({
            success: 0,
            failed: employeesToCreate.length,
            errors: errors
          });
          setProcessing(false);
          return;
        }
      }

      setResults({
        success: employeesToCreate.length,
        failed: errors.length,
        errors: errors
      });

      if (employeesToCreate.length > 0) {
        onImportComplete();
      }

    } catch (error) {
      setResults({ success: 0, failed: 1, errors: [error.message] });
    } finally {
      setProcessing(false);
      setFile(null);
    }
  };

  return (
    <>
      <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button 
          variant="outline"
          onClick={downloadTemplate}
          className={`border-green-600 text-green-600 hover:bg-green-50 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <FileSpreadsheet className={`w-4 h-4 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
          {isRTL ? 'تحميل القالب' : 'Download Template'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={exportEmployees}
          className={`border-blue-600 text-blue-600 hover:bg-blue-50 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Download className={`w-4 h-4 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
          {isRTL ? 'تصدير الموظفين' : 'Export Employees'}
        </Button>
        
        <Button 
          onClick={() => setShowDialog(true)}
          className={`bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Upload className={`w-4 h-4 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
          {isRTL ? 'استيراد من Excel' : 'Import from Excel'}
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'استيراد بيانات الموظفين' : 'Import Employee Data'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Alert>
              <AlertDescription className={isRTL ? 'text-right' : ''}>
                {isRTL 
                  ? 'قم بتحميل قالب Excel، املأه ببيانات الموظفين، ثم قم برفعه هنا. الحقول المطلوبة: رقم الموظف، الاسم الكامل، المسمى الوظيفي، القسم، تاريخ الالتحاق، رمز الشركة.'
                  : 'Download the Excel template, fill it with employee data, then upload it here. Required fields: Employee ID, Full Name, Job Title, Department, Join Date, Company Code.'
                }
              </AlertDescription>
            </Alert>

            {!results && (
              <div>
                <Label htmlFor="file" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'اختر ملف Excel/CSV' : 'Select Excel/CSV File'}
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={uploading || processing}
                  className="mt-2"
                />
                {file && (
                  <p className={`text-sm text-gray-600 mt-2 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'الملف المحدد: ' : 'Selected: '}{file.name}
                  </p>
                )}
              </div>
            )}

            {(uploading || processing) && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {uploading 
                      ? (isRTL ? 'جاري رفع الملف...' : 'Uploading file...')
                      : (isRTL ? 'جاري معالجة البيانات...' : 'Processing data...')
                    }
                  </p>
                </div>
              </div>
            )}

            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {results.success > 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span>{isRTL ? 'نتائج الاستيراد' : 'Import Results'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-700 font-medium">
                        {isRTL ? 'تم الاستيراد بنجاح' : 'Successfully Imported'}
                      </span>
                      <span className="text-green-900 font-bold">{results.success}</span>
                    </div>
                    
                    {results.failed > 0 && (
                      <>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-red-700 font-medium">
                            {isRTL ? 'فشل' : 'Failed'}
                          </span>
                          <span className="text-red-900 font-bold">{results.failed}</span>
                        </div>
                        
                        {results.errors.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium text-gray-700 mb-2">
                              {isRTL ? 'الأخطاء:' : 'Errors:'}
                            </p>
                            <div className="max-h-40 overflow-y-auto space-y-1">
                              {results.errors.map((error, idx) => (
                                <p key={idx} className="text-sm text-red-600 p-2 bg-red-50 rounded">
                                  {error}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
              {!results ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDialog(false);
                      setFile(null);
                      setResults(null);
                    }}
                    disabled={uploading || processing}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={processImport}
                    disabled={!file || uploading || processing}
                    className="bg-gradient-to-r from-purple-600 to-purple-700"
                  >
                    {isRTL ? 'استيراد' : 'Import'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setShowDialog(false);
                    setFile(null);
                    setResults(null);
                  }}
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}