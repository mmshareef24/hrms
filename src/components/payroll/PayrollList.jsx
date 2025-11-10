
import React, { useState } from "react";
import { Payroll } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Eye, CheckCircle, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PayrollDetails from "./PayrollDetails";

export default function PayrollList({ payrolls, loading, onUpdate }) {
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleStatusChange = async (payrollId, newStatus) => {
    await Payroll.update(payrollId, { 
      status: newStatus,
      payment_date: newStatus === "Paid" ? new Date().toISOString().split('T')[0] : null
    });
    onUpdate();
  };

  const filteredPayrolls = payrolls.filter(p => {
    if (filterMonth !== "all" && p.month !== parseInt(filterMonth)) return false;
    if (filterYear !== "all" && p.year !== parseInt(filterYear)) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const years = [...new Set(payrolls.map(p => p.year))].sort((a, b) => b - a);

  if (selectedPayroll) {
    return (
      <PayrollDetails 
        payroll={selectedPayroll}
        onBack={() => setSelectedPayroll(null)}
        onUpdate={onUpdate}
      />
    );
  }

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Payroll Records</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map(m => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Employee</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Gross Salary</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrolls.map((payroll) => (
                <TableRow key={payroll.id} className="hover:bg-gray-50">
                  <TableCell>
                    <p className="font-medium text-gray-900">{payroll.employee_name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {payroll.company_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {months.find(m => m.value === payroll.month)?.label} {payroll.year}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {payroll.total_gross.toLocaleString('en-US')} <span className="text-xs text-gray-500">SAR</span>
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    -{payroll.total_deductions.toLocaleString('en-US')} <span className="text-xs">SAR</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600 text-lg">
                    {payroll.net_salary.toLocaleString('en-US')} <span className="text-sm">SAR</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        payroll.status === "Paid" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : payroll.status === "Approved"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-orange-100 text-orange-800 border-orange-200"
                      }
                    >
                      {payroll.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPayroll(payroll)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {payroll.status === "Draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(payroll.id, "Approved")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      {payroll.status === "Approved" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(payroll.id, "Paid")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
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
