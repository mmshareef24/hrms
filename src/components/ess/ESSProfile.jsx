import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Save, Upload, User, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ESSProfile({ user }) {
  const [employee, setEmployee] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    const employees = await base44.entities.Employee.filter({
      work_email: user.email
    });
    if (employees.length > 0) {
      setEmployee(employees[0]);
      setFormData({
        mobile: employees[0].mobile || '',
        personal_email: employees[0].personal_email || '',
        emergency_contact_name: employees[0].emergency_contact_name || '',
        emergency_contact_phone: employees[0].emergency_contact_phone || '',
        home_address: employees[0].home_address || ''
      });
    }
  };

  const handleSave = async () => {
    if (employee) {
      await base44.entities.Employee.update(employee.id, formData);
      await loadEmployeeData();
      setEditing(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Employee.update(employee.id, { photo_url: file_url });
    await loadEmployeeData();
    setUploading(false);
  };

  if (!employee) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'الملف الشخصي' : 'Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {employee.photo_url ? (
                <img
                  src={employee.photo_url}
                  alt={employee.full_name}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-green-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto">
                  <User className="w-16 h-16 text-green-600" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{employee.full_name}</h3>
            {employee.full_name_arabic && (
              <p className="text-gray-600 mt-1" dir="rtl">{employee.full_name_arabic}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">{employee.job_title}</p>
            <p className="text-sm text-gray-500">{employee.department}</p>
            <div className="flex gap-2 justify-center mt-4">
              <Badge variant="outline">{employee.employee_id}</Badge>
              <Badge className={employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="shadow-lg lg:col-span-2">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle>{isRTL ? 'معلومات الاتصال' : 'Contact Information'}</CardTitle>
            {!editing ? (
              <Button
                size="sm"
                onClick={() => setEditing(true)}
                className={`bg-green-600 hover:bg-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Pencil className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تعديل' : 'Edit'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'حفظ' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="w-4 h-4 text-gray-500" />
                {isRTL ? 'الجوال' : 'Mobile'}
              </Label>
              {editing ? (
                <Input
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                />
              ) : (
                <p className="text-gray-900">{employee.mobile || '-'}</p>
              )}
            </div>

            <div>
              <Label className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className="w-4 h-4 text-gray-500" />
                {isRTL ? 'البريد الشخصي' : 'Personal Email'}
              </Label>
              {editing ? (
                <Input
                  type="email"
                  value={formData.personal_email}
                  onChange={(e) => setFormData({...formData, personal_email: e.target.value})}
                />
              ) : (
                <p className="text-gray-900">{employee.personal_email || '-'}</p>
              )}
            </div>

            <div>
              <Label className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className="w-4 h-4 text-gray-500" />
                {isRTL ? 'البريد الإلكتروني للعمل' : 'Work Email'}
              </Label>
              <p className="text-gray-900">{employee.work_email}</p>
            </div>

            <div>
              <Label className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {isRTL ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}
              </Label>
              {editing ? (
                <Input
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                />
              ) : (
                <p className="text-gray-900">{employee.emergency_contact_name || '-'}</p>
              )}
            </div>

            <div>
              <Label className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="w-4 h-4 text-gray-500" />
                {isRTL ? 'هاتف الطوارئ' : 'Emergency Phone'}
              </Label>
              {editing ? (
                <Input
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                />
              ) : (
                <p className="text-gray-900">{employee.emergency_contact_phone || '-'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-4 h-4 text-gray-500" />
                {isRTL ? 'عنوان المنزل' : 'Home Address'}
              </Label>
              {editing ? (
                <Input
                  value={formData.home_address}
                  onChange={(e) => setFormData({...formData, home_address: e.target.value})}
                />
              ) : (
                <p className="text-gray-900">{employee.home_address || '-'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card className="shadow-lg lg:col-span-3">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'تفاصيل التوظيف' : 'Employment Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label className="text-gray-500 text-sm">{isRTL ? 'الشركة' : 'Company'}</Label>
              <p className="text-gray-900 font-medium mt-1">{employee.company_name || '-'}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">{isRTL ? 'القسم' : 'Department'}</Label>
              <p className="text-gray-900 font-medium mt-1">{employee.department}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">{isRTL ? 'المدير المباشر' : 'Manager'}</Label>
              <p className="text-gray-900 font-medium mt-1">{employee.manager_name || '-'}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">{isRTL ? 'تاريخ الالتحاق' : 'Join Date'}</Label>
              <p className="text-gray-900 font-medium mt-1">{employee.join_date || '-'}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">{isRTL ? 'نوع التوظيف' : 'Employment Type'}</Label>
              <p className="text-gray-900 font-medium mt-1">{employee.employment_type}</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">{isRTL ? 'الوردية' : 'Shift'}</Label>
              <p className="text-gray-900 font-medium mt-1">{employee.shift_name || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}