import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { XCircle, Save, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Company } from "@/api/entities";
import { Shift } from "@/api/entities";
import { base44 } from "@/api/base44Client";

export default function EmployeeForm({ employee, onSave, onCancel }) {
  const [companies, setCompanies] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [managers, setManagers] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState(employee || {
    company_id: "",
    company_name: "",
    employee_id: "",
    full_name: "",
    full_name_arabic: "",
    date_of_birth: "",
    gender: "Male",
    nationality: "Non-Saudi",
    country_of_origin: "",
    marital_status: "Single",
    number_of_dependents: 0,
    photo_url: "",
    
    mobile: "",
    personal_email: "",
    work_email: "",
    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",
    
    iqama_number: "",
    iqama_issue_date: "",
    iqama_expiry: "",
    iqama_issuing_authority: "",
    iqama_document_url: "",
    
    passport_number: "",
    passport_issue_date: "",
    passport_expiry: "",
    passport_issuing_authority: "",
    passport_document_url: "",
    
    visa_number: "",
    visa_issue_date: "",
    visa_expiry: "",
    visa_type: "",
    visa_document_url: "",
    
    work_permit_number: "",
    work_permit_expiry: "",
    work_permit_document_url: "",
    
    driving_license_number: "",
    driving_license_expiry: "",
    driving_license_document_url: "",
    
    gosi_number: "",
    
    business_unit: "",
    branch: "",
    department: "",
    cost_center: "",
    job_family: "",
    job_grade: "",
    job_title: "",
    manager_id: "",
    manager_name: "",
    
    employment_type: "Permanent",
    join_date: "",
    probation_start: "",
    probation_end: "",
    confirmation_date: "",
    contract_start_date: "",
    contract_end_date: "",
    
    shift_id: "",
    shift_name: "",
    
    basic_salary: 0,
    housing_allowance: 0,
    transportation_allowance: 0,
    food_allowance: 0,
    telecom_allowance: 0,
    fuel_allowance: 0,
    housing_in_kind: false,
    housing_in_kind_value: 0,
    variable_pay: 0,
    shift_allowance: 0,
    
    bank_name: "",
    iban: "",
    account_number: "",
    wps_mudad_employee_id: "",
    
    home_address: "",
    home_city: "",
    home_postal_code: "",
    
    work_address: "",
    work_city: "",
    
    mailing_address: "",
    
    assigned_laptop: "",
    assigned_phone: "",
    assigned_sim: "",
    assigned_vehicle: "",
    assigned_tools: "",
    
    medical_policy_number: "",
    medical_provider: "",
    medical_class: "",
    medical_expiry: "",
    cchi_compliant: true,
    
    notes: "",
    
    status: "Active",
    annual_leave_balance: 21,
    sick_leave_balance: 30
  });

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.basic_salary !== undefined && formData.basic_salary !== null) {
      const basicSalary = parseFloat(formData.basic_salary) || 0;
      const housingAllowance = basicSalary * 0.25;
      const transportationAllowance = basicSalary * 0.10;
      
      setFormData(prev => ({
        ...prev,
        housing_allowance: housingAllowance,
        transportation_allowance: transportationAllowance
      }));
    }
  }, [formData.basic_salary]);

  const loadData = async () => {
    const [compData, shiftData, empData] = await Promise.all([
      Company.list("company_code"),
      Shift.list("shift_name"),
      base44.entities.Employee.list("full_name")
    ]);
    setCompanies(compData.filter(c => c.is_active));
    setShifts(shiftData.filter(s => s.is_active));
    setManagers(empData.filter(e => e.status === "Active"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    let updatedData = { ...formData, [field]: value };

    if (field === "company_id") {
      const company = companies.find(c => c.id === value);
      if (company) {
        updatedData.company_name = company.company_name;
      }
    }

    if (field === "shift_id") {
      const shift = shifts.find(s => s.id === value);
      if (shift) {
        updatedData.shift_name = shift.shift_name;
      } else {
        updatedData.shift_name = "";
      }
    }

    if (field === "manager_id") {
      const manager = managers.find(m => m.id === value);
      if (manager) {
        updatedData.manager_name = manager.full_name;
      } else {
        updatedData.manager_name = "";
      }
    }

    setFormData(updatedData);
  };

  const handleFileUpload = async (field, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, [field]: file_url }));
    setUploading(false);
  };

  const totalSalary = (parseFloat(formData.basic_salary) || 0) + 
                     (parseFloat(formData.housing_allowance) || 0) + 
                     (parseFloat(formData.transportation_allowance) || 0) +
                     (parseFloat(formData.food_allowance) || 0) +
                     (parseFloat(formData.telecom_allowance) || 0) +
                     (parseFloat(formData.fuel_allowance) || 0) +
                     (parseFloat(formData.variable_pay) || 0) +
                     (parseFloat(formData.shift_allowance) || 0);

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {employee 
              ? (isRTL ? 'تعديل بيانات الموظف' : 'Edit Employee')
              : (isRTL ? 'إضافة موظف جديد' : 'Add New Employee')
            }
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="personal">{isRTL ? 'شخصي' : 'Personal'}</TabsTrigger>
              <TabsTrigger value="ids">{isRTL ? 'الهويات' : 'IDs'}</TabsTrigger>
              <TabsTrigger value="employment">{isRTL ? 'التوظيف' : 'Employment'}</TabsTrigger>
              <TabsTrigger value="compensation">{isRTL ? 'التعويض' : 'Compensation'}</TabsTrigger>
              <TabsTrigger value="bank">{isRTL ? 'بنك' : 'Bank'}</TabsTrigger>
              <TabsTrigger value="address">{isRTL ? 'عنوان' : 'Address'}</TabsTrigger>
              <TabsTrigger value="assets">{isRTL ? 'أصول' : 'Assets'}</TabsTrigger>
              <TabsTrigger value="medical">{isRTL ? 'طبي' : 'Medical'}</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رقم الموظف *' : 'Employee ID *'}
                    </Label>
                    <Input
                      value={formData.employee_id}
                      onChange={(e) => handleChange("employee_id", e.target.value)}
                      className={isRTL ? 'text-right' : ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الاسم الكامل *' : 'Full Name *'}
                    </Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الاسم بالعربية' : 'Full Name (Arabic)'}
                    </Label>
                    <Input
                      value={formData.full_name_arabic}
                      onChange={(e) => handleChange("full_name_arabic", e.target.value)}
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange("date_of_birth", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الجنس' : 'Gender'}
                    </Label>
                    <Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{isRTL ? 'ذكر' : 'Male'}</SelectItem>
                        <SelectItem value="Female">{isRTL ? 'أنثى' : 'Female'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الجنسية *' : 'Nationality *'}
                    </Label>
                    <Select value={formData.nationality} onValueChange={(v) => handleChange("nationality", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Saudi">{isRTL ? 'سعودي' : 'Saudi'}</SelectItem>
                        <SelectItem value="Non-Saudi">{isRTL ? 'غير سعودي' : 'Non-Saudi'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.nationality === "Non-Saudi" && (
                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'بلد المنشأ' : 'Country of Origin'}
                      </Label>
                      <Input
                        value={formData.country_of_origin}
                        onChange={(e) => handleChange("country_of_origin", e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الحالة الاجتماعية' : 'Marital Status'}
                    </Label>
                    <Select value={formData.marital_status} onValueChange={(v) => handleChange("marital_status", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">{isRTL ? 'أعزب' : 'Single'}</SelectItem>
                        <SelectItem value="Married">{isRTL ? 'متزوج' : 'Married'}</SelectItem>
                        <SelectItem value="Divorced">{isRTL ? 'مطلق' : 'Divorced'}</SelectItem>
                        <SelectItem value="Widowed">{isRTL ? 'أرمل' : 'Widowed'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'عدد المعالين' : 'Number of Dependents'}
                    </Label>
                    <Input
                      type="number"
                      value={formData.number_of_dependents}
                      onChange={(e) => handleChange("number_of_dependents", parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'صورة شخصية' : 'Photo'}
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload("photo_url", e)}
                        disabled={uploading}
                      />
                      {formData.photo_url && (
                        <img src={formData.photo_url} alt="Employee" className="w-16 h-16 rounded-full object-cover" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الجوال' : 'Mobile'}
                    </Label>
                    <Input
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'البريد الشخصي' : 'Personal Email'}
                    </Label>
                    <Input
                      type="email"
                      value={formData.personal_email}
                      onChange={(e) => handleChange("personal_email", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'البريد الإلكتروني للعمل' : 'Work Email'}
                    </Label>
                    <Input
                      type="email"
                      value={formData.work_email}
                      onChange={(e) => handleChange("work_email", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الاسم' : 'Name'}
                    </Label>
                    <Input
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'العلاقة' : 'Relationship'}
                    </Label>
                    <Input
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => handleChange("emergency_contact_relationship", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الهاتف' : 'Phone'}
                    </Label>
                    <Input
                      value={formData.emergency_contact_phone}
                      onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ids" className="space-y-6">
              {/* Iqama */}
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الإقامة / الهوية الوطنية' : 'Iqama / National ID'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رقم الإقامة' : 'Iqama Number'}
                    </Label>
                    <Input
                      value={formData.iqama_number}
                      onChange={(e) => handleChange("iqama_number", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.iqama_issue_date}
                      onChange={(e) => handleChange("iqama_issue_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.iqama_expiry}
                      onChange={(e) => handleChange("iqama_expiry", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'جهة الإصدار' : 'Issuing Authority'}
                    </Label>
                    <Input
                      value={formData.iqama_issuing_authority}
                      onChange={(e) => handleChange("iqama_issuing_authority", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رفع الوثيقة' : 'Upload Document'}
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload("iqama_document_url", e)}
                      disabled={uploading}
                    />
                    {formData.iqama_document_url && (
                      <a href={formData.iqama_document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {isRTL ? 'عرض الوثيقة' : 'View Document'}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Passport */}
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'جواز السفر' : 'Passport'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رقم جواز السفر' : 'Passport Number'}
                    </Label>
                    <Input
                      value={formData.passport_number}
                      onChange={(e) => handleChange("passport_number", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.passport_issue_date}
                      onChange={(e) => handleChange("passport_issue_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.passport_expiry}
                      onChange={(e) => handleChange("passport_expiry", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'جهة الإصدار' : 'Issuing Authority'}
                    </Label>
                    <Input
                      value={formData.passport_issuing_authority}
                      onChange={(e) => handleChange("passport_issuing_authority", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رفع الوثيقة' : 'Upload Document'}
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload("passport_document_url", e)}
                      disabled={uploading}
                    />
                    {formData.passport_document_url && (
                      <a href={formData.passport_document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {isRTL ? 'عرض الوثيقة' : 'View Document'}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Visa */}
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'التأشيرة' : 'Visa'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رقم التأشيرة' : 'Visa Number'}
                    </Label>
                    <Input
                      value={formData.visa_number}
                      onChange={(e) => handleChange("visa_number", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'نوع التأشيرة' : 'Visa Type'}
                    </Label>
                    <Input
                      value={formData.visa_type}
                      onChange={(e) => handleChange("visa_type", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.visa_issue_date}
                      onChange={(e) => handleChange("visa_issue_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.visa_expiry}
                      onChange={(e) => handleChange("visa_expiry", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رفع الوثيقة' : 'Upload Document'}
                    </Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload("visa_document_url", e)}
                      disabled={uploading}
                    />
                    {formData.visa_document_url && (
                      <a href={formData.visa_document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {isRTL ? 'عرض الوثيقة' : 'View Document'}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Other IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'رخصة العمل' : 'Work Permit'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'الرقم' : 'Number'}
                      </Label>
                      <Input
                        value={formData.work_permit_number}
                        onChange={(e) => handleChange("work_permit_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                      </Label>
                      <Input
                        type="date"
                        value={formData.work_permit_expiry}
                        onChange={(e) => handleChange("work_permit_expiry", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                    {isRTL ? 'رخصة القيادة' : 'Driving License'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'الرقم' : 'Number'}
                      </Label>
                      <Input
                        value={formData.driving_license_number}
                        onChange={(e) => handleChange("driving_license_number", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                      </Label>
                      <Input
                        type="date"
                        value={formData.driving_license_expiry}
                        onChange={(e) => handleChange("driving_license_expiry", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'رقم التأمينات الاجتماعية (GOSI)' : 'GOSI Number'}
                </Label>
                <Input
                  value={formData.gosi_number}
                  onChange={(e) => handleChange("gosi_number", e.target.value)}
                  className="max-w-md"
                />
              </div>
            </TabsContent>

            <TabsContent value="employment" className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'تفاصيل التوظيف' : 'Employment Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الشركة *' : 'Company *'}
                    </Label>
                    <Select value={formData.company_id} onValueChange={(v) => handleChange("company_id", v)} required>
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? "اختر الشركة" : "Select company"} />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.company_code} - {company.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'وحدة الأعمال' : 'Business Unit'}
                    </Label>
                    <Input
                      value={formData.business_unit}
                      onChange={(e) => handleChange("business_unit", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الفرع' : 'Branch'}
                    </Label>
                    <Input
                      value={formData.branch}
                      onChange={(e) => handleChange("branch", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'القسم *' : 'Department *'}
                    </Label>
                    <Select value={formData.department} onValueChange={(v) => handleChange("department", v)} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'مركز التكلفة' : 'Cost Center'}
                    </Label>
                    <Input
                      value={formData.cost_center}
                      onChange={(e) => handleChange("cost_center", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'عائلة الوظيفة' : 'Job Family'}
                    </Label>
                    <Input
                      value={formData.job_family}
                      onChange={(e) => handleChange("job_family", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الدرجة الوظيفية' : 'Job Grade'}
                    </Label>
                    <Input
                      value={formData.job_grade}
                      onChange={(e) => handleChange("job_grade", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'المسمى الوظيفي *' : 'Job Title *'}
                    </Label>
                    <Input
                      value={formData.job_title}
                      onChange={(e) => handleChange("job_title", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'المدير المباشر' : 'Manager'}
                    </Label>
                    <Select value={formData.manager_id} onValueChange={(v) => handleChange("manager_id", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? "اختر المدير" : "Select manager"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>{isRTL ? 'بدون مدير' : 'No Manager'}</SelectItem>
                        {managers.map((mgr) => (
                          <SelectItem key={mgr.id} value={mgr.id}>
                            {mgr.full_name} ({mgr.employee_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'نوع التوظيف' : 'Employment Type'}
                    </Label>
                    <Select value={formData.employment_type} onValueChange={(v) => handleChange("employment_type", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">{isRTL ? 'دائم' : 'Permanent'}</SelectItem>
                        <SelectItem value="Contract">{isRTL ? 'عقد' : 'Contract'}</SelectItem>
                        <SelectItem value="Temporary">{isRTL ? 'مؤقت' : 'Temporary'}</SelectItem>
                        <SelectItem value="Part-time">{isRTL ? 'دوام جزئي' : 'Part-time'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الالتحاق *' : 'Join Date *'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.join_date}
                      onChange={(e) => handleChange("join_date", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'بداية فترة التجربة' : 'Probation Start'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.probation_start}
                      onChange={(e) => handleChange("probation_start", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'نهاية فترة التجربة' : 'Probation End'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.probation_end}
                      onChange={(e) => handleChange("probation_end", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ التثبيت' : 'Confirmation Date'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.confirmation_date}
                      onChange={(e) => handleChange("confirmation_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'بداية العقد' : 'Contract Start'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.contract_start_date}
                      onChange={(e) => handleChange("contract_start_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'نهاية العقد' : 'Contract End'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.contract_end_date}
                      onChange={(e) => handleChange("contract_end_date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الوردية' : 'Shift'}
                    </Label>
                    <Select value={formData.shift_id} onValueChange={(v) => handleChange("shift_id", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={isRTL ? "اختر الوردية" : "Select shift"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>{isRTL ? 'بدون وردية' : 'No Shift'}</SelectItem>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.shift_name} ({shift.start_time} - {shift.end_time})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </Label>
                    <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">{isRTL ? 'نشط' : 'Active'}</SelectItem>
                        <SelectItem value="On Leave">{isRTL ? 'في إجازة' : 'On Leave'}</SelectItem>
                        <SelectItem value="On Probation">{isRTL ? 'تحت التجربة' : 'On Probation'}</SelectItem>
                        <SelectItem value="Suspended">{isRTL ? 'موقوف' : 'Suspended'}</SelectItem>
                        <SelectItem value="Terminated">{isRTL ? 'منتهي الخدمة' : 'Terminated'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compensation" className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الراتب والبدلات' : 'Salary & Allowances'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الراتب الأساسي (ر.س) *' : 'Basic Salary (SAR) *'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.basic_salary}
                      onChange={(e) => handleChange("basic_salary", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'بدل السكن (25% من الأساسي)' : 'Housing Allowance (25%)'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.housing_allowance.toFixed(2)}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'بدل النقل (10% من الأساسي)' : 'Transport Allowance (10%)'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.transportation_allowance.toFixed(2)}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'بدل الطعام' : 'Food Allowance'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.food_allowance}
                      onChange={(e) => handleChange("food_allowance", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'بدل الاتصالات' : 'Telecom Allowance'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.telecom_allowance}
                      onChange={(e) => handleChange("telecom_allowance", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'بدل الوقود' : 'Fuel Allowance'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.fuel_allowance}
                      onChange={(e) => handleChange("fuel_allowance", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الأجر المتغير' : 'Variable Pay'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.variable_pay}
                      onChange={(e) => handleChange("variable_pay", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'بدل الوردية' : 'Shift Allowance'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.shift_allowance}
                      onChange={(e) => handleChange("shift_allowance", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-2">
                    <Checkbox
                      id="housing_in_kind"
                      checked={formData.housing_in_kind}
                      onCheckedChange={(checked) => handleChange("housing_in_kind", checked)}
                    />
                    <label htmlFor="housing_in_kind" className="text-sm font-medium">
                      {isRTL ? 'السكن عيناً' : 'Housing In-Kind'}
                    </label>
                  </div>

                  {formData.housing_in_kind && (
                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'قيمة السكن العيني' : 'Housing In-Kind Value'}
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.housing_in_kind_value}
                        onChange={(e) => handleChange("housing_in_kind_value", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-gray-900">
                        {isRTL ? 'إجمالي الراتب:' : 'Total Salary:'}
                      </span>
                      <span className="text-2xl font-bold text-green-700">
                        {isRTL 
                          ? `${totalSalary.toLocaleString('ar-SA')} ر.س`
                          : `${totalSalary.toLocaleString('en-US')} SAR`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bank" className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'معلومات البنك' : 'Bank Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'اسم البنك' : 'Bank Name'}
                    </Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => handleChange("bank_name", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رقم الحساب' : 'Account Number'}
                    </Label>
                    <Input
                      value={formData.account_number}
                      onChange={(e) => handleChange("account_number", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الآيبان (IBAN)' : 'IBAN'}
                    </Label>
                    <Input
                      value={formData.iban}
                      onChange={(e) => handleChange("iban", e.target.value)}
                      placeholder="SA00 0000 0000 0000 0000 0000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'معرف WPS/Mudad' : 'WPS/Mudad Employee ID'}
                    </Label>
                    <Input
                      value={formData.wps_mudad_employee_id}
                      onChange={(e) => handleChange("wps_mudad_employee_id", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'عنوان المنزل' : 'Home Address'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'العنوان' : 'Address'}
                    </Label>
                    <Textarea
                      value={formData.home_address}
                      onChange={(e) => handleChange("home_address", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'المدينة' : 'City'}
                    </Label>
                    <Input
                      value={formData.home_city}
                      onChange={(e) => handleChange("home_city", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الرمز البريدي' : 'Postal Code'}
                    </Label>
                    <Input
                      value={formData.home_postal_code}
                      onChange={(e) => handleChange("home_postal_code", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'عنوان العمل' : 'Work Address'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'العنوان' : 'Address'}
                    </Label>
                    <Textarea
                      value={formData.work_address}
                      onChange={(e) => handleChange("work_address", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'المدينة' : 'City'}
                    </Label>
                    <Input
                      value={formData.work_city}
                      onChange={(e) => handleChange("work_city", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'عنوان المراسلة' : 'Mailing Address'}
                </h3>
                <Textarea
                  value={formData.mailing_address}
                  onChange={(e) => handleChange("mailing_address", e.target.value)}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الأصول المخصصة' : 'Assigned Assets'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'لابتوب' : 'Laptop'}
                    </Label>
                    <Input
                      value={formData.assigned_laptop}
                      onChange={(e) => handleChange("assigned_laptop", e.target.value)}
                      placeholder={isRTL ? "رقم الجهاز أو الموديل" : "Serial number or model"}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'هاتف' : 'Phone'}
                    </Label>
                    <Input
                      value={formData.assigned_phone}
                      onChange={(e) => handleChange("assigned_phone", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'شريحة SIM' : 'SIM Card'}
                    </Label>
                    <Input
                      value={formData.assigned_sim}
                      onChange={(e) => handleChange("assigned_sim", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'سيارة' : 'Vehicle'}
                    </Label>
                    <Input
                      value={formData.assigned_vehicle}
                      onChange={(e) => handleChange("assigned_vehicle", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'أدوات أخرى' : 'Other Tools'}
                    </Label>
                    <Textarea
                      value={formData.assigned_tools}
                      onChange={(e) => handleChange("assigned_tools", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'التأمين الطبي' : 'Medical Insurance'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'رقم البوليصة' : 'Policy Number'}
                    </Label>
                    <Input
                      value={formData.medical_policy_number}
                      onChange={(e) => handleChange("medical_policy_number", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'مزود الخدمة' : 'Provider'}
                    </Label>
                    <Input
                      value={formData.medical_provider}
                      onChange={(e) => handleChange("medical_provider", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'الفئة' : 'Class'}
                    </Label>
                    <Input
                      value={formData.medical_class}
                      onChange={(e) => handleChange("medical_class", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className={isRTL ? 'text-right block' : ''}>
                      {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                    </Label>
                    <Input
                      type="date"
                      value={formData.medical_expiry}
                      onChange={(e) => handleChange("medical_expiry", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-2">
                    <Checkbox
                      id="cchi_compliant"
                      checked={formData.cchi_compliant}
                      onCheckedChange={(checked) => handleChange("cchi_compliant", checked)}
                    />
                    <label htmlFor="cchi_compliant" className="text-sm font-medium">
                      {isRTL ? 'متوافق مع CCHI' : 'CCHI Compliant'}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
                </h3>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={5}
                  placeholder={isRTL ? "أضف أي ملاحظات إضافية..." : "Add any additional notes..."}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <div className={`flex gap-3 p-6 border-t border-gray-100 bg-gray-50 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel} className={isRTL ? 'flex-row-reverse' : ''}>
            <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={uploading} className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'حفظ الموظف' : 'Save Employee'}
          </Button>
        </div>
      </Card>
    </form>
  );
}