import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function BenefitPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const data = await base44.entities.BenefitPlan.list("plan_code");
    setPlans(data);
    setLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span>{isRTL ? 'خطط المزايا' : 'Benefit Plans'}</span>
          <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700">
            <Plus className={`w-4 h-4 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة خطة' : 'Add Plan'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الرمز' : 'Code'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Category'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المزود' : 'Provider'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التغطية' : 'Coverage'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'CCHI' : 'CCHI'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} className="hover:bg-gray-50">
                  <TableCell className={isRTL ? 'text-right' : ''}>
                    <span className="font-mono font-medium">{plan.plan_code}</span>
                  </TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>
                    <div>
                      <p className="font-medium">{plan.plan_name}</p>
                      {plan.plan_name_arabic && (
                        <p className="text-sm text-gray-500">{plan.plan_name_arabic}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {plan.benefit_category}
                    </Badge>
                  </TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>{plan.provider_name || '-'}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>
                    {plan.coverage_type}
                  </TableCell>
                  <TableCell>
                    {plan.benefit_category === "Medical Insurance" && (
                      <Badge variant="outline" className={plan.is_cchi_compliant ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {plan.is_cchi_compliant ? (isRTL ? 'متوافق' : 'Compliant') : (isRTL ? 'غير متوافق' : 'Non-compliant')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={plan.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {plan.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}