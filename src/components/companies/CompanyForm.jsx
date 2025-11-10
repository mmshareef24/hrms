import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { XCircle, Save } from "lucide-react";

export default function CompanyForm({ company, onSave, onCancel }) {
  const [formData, setFormData] = useState(company || {
    company_code: "",
    company_name: "",
    is_active: true,
    address: "",
    contact_email: "",
    contact_phone: ""
  });
  
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-3xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {company 
              ? (isRTL ? 'تعديل الشركة' : 'Edit Company')
              : (isRTL ? 'إضافة شركة جديدة' : 'Add New Company')
            }
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_code" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'رمز الشركة *' : 'Company Code *'}
                </Label>
                <Input
                  id="company_code"
                  value={formData.company_code}
                  onChange={(e) => handleChange("company_code", e.target.value)}
                  placeholder={isRTL ? "مثال: 2000" : "e.g., 2000"}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label htmlFor="company_name" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'اسم الشركة *' : 'Company Name *'}
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  placeholder={isRTL ? "مثال: جاسكو للحديد" : "e.g., JASCO STEELS"}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact_email" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'البريد الإلكتروني' : 'Contact Email'}
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange("contact_email", e.target.value)}
                  placeholder="contact@company.com"
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <Label htmlFor="contact_phone" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'رقم الهاتف' : 'Contact Phone'}
                </Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange("contact_phone", e.target.value)}
                  placeholder="+966 XXX XXX XXX"
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address" className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'العنوان' : 'Address'}
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder={isRTL ? "عنوان الشركة..." : "Company address..."}
                className={`h-24 ${isRTL ? 'text-right' : ''}`}
              />
            </div>

            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {isRTL ? 'شركة نشطة' : 'Active Company'}
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className={`flex gap-3 border-t border-gray-100 bg-gray-50 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel} className={isRTL ? 'flex-row-reverse' : ''}>
            <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'حفظ الشركة' : 'Save Company'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}