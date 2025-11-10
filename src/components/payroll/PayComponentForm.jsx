import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { XCircle, Save } from "lucide-react";

export default function PayComponentForm({ component, onSave, onCancel }) {
  const [formData, setFormData] = useState(component || {
    component_code: "",
    component_name: "",
    component_name_arabic: "",
    component_type: "Earning",
    calculation_type: "Fixed Amount",
    frequency: "Recurring",
    tax_treatment: "Pre-Tax",
    affects_gosi: false,
    affects_eosb: false,
    is_wps_reportable: true,
    gl_account_code: "",
    is_active: true
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
            {component 
              ? (isRTL ? 'تعديل المكون' : 'Edit Component')
              : (isRTL ? 'إضافة مكون جديد' : 'Add New Component')
            }
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="component_code" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'رمز المكون *' : 'Component Code *'}
                </Label>
                <Input
                  id="component_code"
                  value={formData.component_code}
                  onChange={(e) => handleChange("component_code", e.target.value)}
                  placeholder={isRTL ? "مثال: BASIC" : "e.g., BASIC"}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div>
                <Label htmlFor="component_name" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'اسم المكون *' : 'Component Name *'}
                </Label>
                <Input
                  id="component_name"
                  value={formData.component_name}
                  onChange={(e) => handleChange("component_name", e.target.value)}
                  placeholder={isRTL ? "مثال: الراتب الأساسي" : "e.g., Basic Salary"}
                  className={isRTL ? 'text-right' : ''}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="component_name_arabic" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'الاسم بالعربية' : 'Arabic Name'}
                </Label>
                <Input
                  id="component_name_arabic"
                  value={formData.component_name_arabic}
                  onChange={(e) => handleChange("component_name_arabic", e.target.value)}
                  placeholder="الراتب الأساسي"
                  dir="rtl"
                />
              </div>

              <div>
                <Label htmlFor="component_type" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'النوع *' : 'Type *'}
                </Label>
                <Select value={formData.component_type} onValueChange={(v) => handleChange("component_type", v)}>
                  <SelectTrigger className={isRTL ? 'text-right' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Earning">{isRTL ? 'استحقاق' : 'Earning'}</SelectItem>
                    <SelectItem value="Deduction">{isRTL ? 'خصم' : 'Deduction'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="calculation_type" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'طريقة الحساب *' : 'Calculation Type *'}
                </Label>
                <Select value={formData.calculation_type} onValueChange={(v) => handleChange("calculation_type", v)}>
                  <SelectTrigger className={isRTL ? 'text-right' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed Amount">{isRTL ? 'مبلغ ثابت' : 'Fixed Amount'}</SelectItem>
                    <SelectItem value="Percentage of Basic">{isRTL ? 'نسبة من الأساسي' : 'Percentage of Basic'}</SelectItem>
                    <SelectItem value="Formula">{isRTL ? 'معادلة' : 'Formula'}</SelectItem>
                    <SelectItem value="Manual">{isRTL ? 'يدوي' : 'Manual'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frequency" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'التكرار' : 'Frequency'}
                </Label>
                <Select value={formData.frequency} onValueChange={(v) => handleChange("frequency", v)}>
                  <SelectTrigger className={isRTL ? 'text-right' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recurring">{isRTL ? 'متكرر' : 'Recurring'}</SelectItem>
                    <SelectItem value="One-Time">{isRTL ? 'لمرة واحدة' : 'One-Time'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tax_treatment" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'المعاملة الضريبية' : 'Tax Treatment'}
                </Label>
                <Select value={formData.tax_treatment} onValueChange={(v) => handleChange("tax_treatment", v)}>
                  <SelectTrigger className={isRTL ? 'text-right' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Tax">{isRTL ? 'قبل الضريبة' : 'Pre-Tax'}</SelectItem>
                    <SelectItem value="Post-Tax">{isRTL ? 'بعد الضريبة' : 'Post-Tax'}</SelectItem>
                    <SelectItem value="Not Applicable">{isRTL ? 'غير قابل للتطبيق' : 'Not Applicable'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="gl_account_code" className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'رمز الحساب' : 'GL Account Code'}
                </Label>
                <Input
                  id="gl_account_code"
                  value={formData.gl_account_code}
                  onChange={(e) => handleChange("gl_account_code", e.target.value)}
                  placeholder="5100-01"
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Checkbox
                  id="affects_gosi"
                  checked={formData.affects_gosi}
                  onCheckedChange={(checked) => handleChange("affects_gosi", checked)}
                />
                <label htmlFor="affects_gosi" className="text-sm font-medium">
                  {isRTL ? 'يؤثر على حساب التأمينات (GOSI)' : 'Affects GOSI Calculation'}
                </label>
              </div>

              <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Checkbox
                  id="affects_eosb"
                  checked={formData.affects_eosb}
                  onCheckedChange={(checked) => handleChange("affects_eosb", checked)}
                />
                <label htmlFor="affects_eosb" className="text-sm font-medium">
                  {isRTL ? 'يؤثر على حساب نهاية الخدمة (EOSB)' : 'Affects End of Service Benefit'}
                </label>
              </div>

              <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Checkbox
                  id="is_wps_reportable"
                  checked={formData.is_wps_reportable}
                  onCheckedChange={(checked) => handleChange("is_wps_reportable", checked)}
                />
                <label htmlFor="is_wps_reportable" className="text-sm font-medium">
                  {isRTL ? 'يظهر في تقارير WPS/Mudad' : 'Include in WPS/Mudad Reports'}
                </label>
              </div>

              <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange("is_active", checked)}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  {isRTL ? 'مكون نشط' : 'Active Component'}
                </label>
              </div>
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
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}