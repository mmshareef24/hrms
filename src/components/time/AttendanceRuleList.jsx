import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceRuleList({ rules, loading, onEdit, onDelete }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  if (loading) {
    return (
      <Card className="shadow-lg">
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'اسم القاعدة' : 'Rule Name'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'فترة السماح' : 'Grace Period'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التقريب' : 'Rounding'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'معدل العمل الإضافي' : 'OT Rate'}</TableHead>
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className={isRTL ? 'text-left' : 'text-right'}>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className="hover:bg-gray-50">
                <TableCell className={isRTL ? 'text-right' : ''}>
                  <div>
                    <p className="font-medium">{rule.rule_name}</p>
                    {rule.rule_name_arabic && (
                      <p className="text-sm text-gray-500">{rule.rule_name_arabic}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className={isRTL ? 'text-right' : ''}>
                  {rule.grace_period_minutes} {isRTL ? 'دقيقة' : 'min'}
                </TableCell>
                <TableCell className={isRTL ? 'text-right' : ''}>{rule.rounding_method}</TableCell>
                <TableCell className={isRTL ? 'text-right' : ''}>
                  {rule.overtime_rate_weekday}x
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={rule.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {rule.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                  </Badge>
                </TableCell>
                <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                  <div className={`flex gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(rule)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(rule.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}