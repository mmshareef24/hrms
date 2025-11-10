import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function RolesPermissions() {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={isRTL ? 'text-right' : ''}>
          {isRTL ? 'الأدوار والصلاحيات' : 'Roles & Permissions'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="mb-2">
            {isRTL 
              ? 'قريباً - التحكم في الصلاحيات على مستوى الصفوف والحقول'
              : 'Coming Soon - Row-Level & Field-Level Access Control'
            }
          </p>
          <ul className={`text-sm mt-4 space-y-2 ${isRTL ? 'text-right' : 'text-left'} max-w-md mx-auto`}>
            <li>• {isRTL ? 'أدوار مخصصة' : 'Custom Roles'}</li>
            <li>• {isRTL ? 'الوصول حسب الشركة/القسم/الفرع' : 'Company/Department/Branch Access'}</li>
            <li>• {isRTL ? 'قيود مستوى الحقل' : 'Field-Level Restrictions'}</li>
            <li>• {isRTL ? 'الصلاحيات القائمة على الشروط' : 'Conditional Permissions'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}