import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, FileText, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function EOSBList({ records, loading, onRefresh }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B11116] mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <FileText className="w-5 h-5 text-[#B11116]" />
          <span>{isRTL ? 'سجلات المكافآت' : 'EOSB Records'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>{isRTL ? 'لا توجد سجلات' : 'No EOSB records found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ الاستقالة' : 'Resignation Date'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'فترة الخدمة' : 'Service Period'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المكافأة' : 'EOSB Amount'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'صافي المستحق' : 'Net Payable'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{record.employee_name}</p>
                        <p className="text-xs text-gray-500">{record.company_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{format(parseISO(record.resignation_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {record.service_years}y {record.service_months}m {record.service_days}d
                    </TableCell>
                    <TableCell className="font-bold text-[#B11116]">
                      {parseFloat(record.final_eosb_amount || 0).toLocaleString()} SAR
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {parseFloat(record.total_payable || 0).toLocaleString()} SAR
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        record.status === "Paid" ? "bg-green-100 text-green-800" :
                        record.status === "Approved" ? "bg-blue-100 text-blue-800" :
                        record.status === "Calculated" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}