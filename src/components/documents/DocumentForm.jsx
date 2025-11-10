import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, Save, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DocumentForm({ document, employees, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    employee_name: "",
    document_type: "Iqama",
    document_number: "",
    issue_date: "",
    expiry_date: "",
    file_url: "",
    notes: ""
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const isRTL = typeof window !== 'undefined' && document?.documentElement?.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (document) {
      setFormData({
        employee_id: document.employee_id || "",
        employee_name: document.employee_name || "",
        document_type: document.document_type || "Iqama",
        document_number: document.document_number || "",
        issue_date: document.issue_date || "",
        expiry_date: document.expiry_date || "",
        file_url: document.file_url || "",
        notes: document.notes || ""
      });
    }
  }, [document]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employee_id) {
      newErrors.employee_id = isRTL ? "يرجى اختيار الموظف" : "Please select employee";
    }
    if (!formData.document_type) {
      newErrors.document_type = isRTL ? "يرجى اختيار نوع المستند" : "Please select document type";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const dataToSave = {
        employee_id: formData.employee_id || "",
        employee_name: formData.employee_name || "",
        document_type: formData.document_type || "",
        document_number: formData.document_number || "",
        issue_date: formData.issue_date || "",
        expiry_date: formData.expiry_date || "",
        file_url: formData.file_url || "",
        notes: formData.notes || ""
      };

      await onSave(dataToSave);
    } catch (error) {
      console.error("Error saving document:", error);
      alert(isRTL ? "حدث خطأ في حفظ المستند" : "Error saving document");
    }
  };

  const handleChange = (field, value) => {
    let updatedData = { ...formData, [field]: value };

    if (field === "employee_id") {
      const employee = employees?.find(e => e && e.id === value);
      if (employee) {
        updatedData.employee_name = employee.full_name || "";
      }
    }

    setFormData(updatedData);
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, file_url: file_url || "" }));
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(isRTL ? "فشل رفع الملف" : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-3xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {document 
              ? (isRTL ? 'تعديل المستند' : 'Edit Document')
              : (isRTL ? 'إضافة مستند جديد' : 'Add New Document')
            }
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_id" className={`${isRTL ? 'text-right block' : ''} ${errors.employee_id ? 'text-red-600' : ''}`}>
                  {isRTL ? 'الموظف *' : 'Employee *'}
                </Label>
                <Select 
                  value={formData.employee_id} 
                  onValueChange={(v) => handleChange("employee_id", v)}
                >
                  <SelectTrigger className={`${isRTL ? 'text-right' : ''} ${errors.employee_id ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={isRTL ? "اختر موظف" : "Select employee"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees && employees.length > 0 ? (
                      employees.map((emp) => emp && emp.id && (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name || 'Unknown'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        {isRTL ? 'لا يوجد موظفين' : 'No employees'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.employee_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.employee_id}</p>
                )}
              </div>

              <div>
                <Label htmlFor="document_type" className={`${isRTL ? 'text-right block' : ''} ${errors.document_type ? 'text-red-600' : ''}`}>
                  {isRTL ? 'نوع المستند *' : 'Document Type *'}
                </Label>
                <Select 
                  value={formData.document_type} 
                  onValueChange={(v) => handleChange("document_type", v)}
                >
                  <SelectTrigger className={`${isRTL ? 'text-right' : ''} ${errors.document_type ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Iqama">{isRTL ? 'الإقامة' : 'Iqama'}</SelectItem>
                    <SelectItem value="Passport">{isRTL ? 'جواز السفر' : 'Passport'}</SelectItem>
                    <SelectItem value="Contract">{isRTL ? 'العقد' : 'Contract'}</SelectItem>
                    <SelectItem value="Work Permit">{isRTL ? 'رخصة العمل' : 'Work Permit'}</SelectItem>
                    <SelectItem value="Medical Insurance">{isRTL ? 'التأمين الطبي' : 'Medical Insurance'}</SelectItem>
                    <SelectItem value="Gosi Certificate">{isRTL ? 'شهادة التأمينات' : 'Gosi Certificate'}</SelectItem>
                    <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.document_type && (
                  <p className="text-red-600 text-sm mt-1">{errors.document_type}</p>
                )}
              </div>

              <div>
                <Label htmlFor="document_number" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'رقم المستند' : 'Document Number'}
                </Label>
                <Input
                  id="document_number"
                  value={formData.document_number}
                  onChange={(e) => handleChange("document_number", e.target.value)}
                  placeholder={isRTL ? "أدخل رقم المستند" : "Enter document number"}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <Label htmlFor="issue_date" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}
                </Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => handleChange("issue_date", e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <Label htmlFor="expiry_date" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                </Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleChange("expiry_date", e.target.value)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <Label htmlFor="file_upload" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'رفع الملف' : 'Upload File'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="file_upload"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {uploading && (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    </div>
                  )}
                </div>
                {formData.file_url && (
                  <a 
                    href={formData.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline mt-1 inline-block"
                  >
                    {isRTL ? 'عرض الملف' : 'View File'}
                  </a>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'ملاحظات' : 'Notes'}
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                placeholder={isRTL ? "أدخل أي ملاحظات..." : "Enter any notes..."}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className={`flex gap-3 border-t p-6 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel}>
            <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700" disabled={uploading}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}