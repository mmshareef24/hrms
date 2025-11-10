import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Timesheets() {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadTimesheets();
  }, []);

  const loadTimesheets = async () => {
    setLoading(true);
    const data = await base44.entities.Timesheet.list("-date");
    setTimesheets(data);
    setLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span>{isRTL ? 'سجلات الوقت' : 'Timesheets'}</span>
          <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700">
            <Plus className={`w-4 h-4 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة سجل' : 'Add Entry'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المشروع' : 'Project'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المهمة' : 'Task'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الساعات' : 'Hours'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'قابل للفوترة' : 'Billable'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((ts) => (
                <TableRow key={ts.id} className="hover:bg-gray-50">
                  <TableCell className={isRTL ? 'text-right' : ''}>{ts.employee_name}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>
                    {format(parseISO(ts.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>{ts.project_name || '-'}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>{ts.task_name || '-'}</TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>{ts.hours}h</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ts.is_billable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {ts.is_billable ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      ts.status === "Approved" ? "bg-green-100 text-green-800" :
                      ts.status === "Rejected" ? "bg-red-100 text-red-800" :
                      ts.status === "Submitted" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {ts.status}
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