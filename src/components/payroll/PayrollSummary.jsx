
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingUp, Clock } from "lucide-react";

export default function PayrollSummary({ payrolls }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const years = [...new Set(payrolls.map(p => p.year))].sort((a, b) => b - a);

  const filteredPayrolls = payrolls.filter(p => 
    p.month === selectedMonth && p.year === selectedYear
  );

  const stats = {
    totalEmployees: filteredPayrolls.length,
    totalGross: filteredPayrolls.reduce((sum, p) => sum + p.total_gross, 0),
    totalDeductions: filteredPayrolls.reduce((sum, p) => sum + p.total_deductions, 0),
    totalNet: filteredPayrolls.reduce((sum, p) => sum + p.net_salary, 0),
    totalOvertime: filteredPayrolls.reduce((sum, p) => sum + p.overtime_pay, 0),
    totalOvertimeHours: filteredPayrolls.reduce((sum, p) => sum + p.overtime_hours, 0),
    totalGOSI: filteredPayrolls.reduce((sum, p) => sum + p.gosi_employee + p.gosi_employer, 0),
    paid: filteredPayrolls.filter(p => p.status === "Paid").length,
    approved: filteredPayrolls.filter(p => p.status === "Approved").length,
    draft: filteredPayrolls.filter(p => p.status === "Draft").length,
  };

  // Group by company
  const byCompany = {};
  filteredPayrolls.forEach(p => {
    if (!byCompany[p.company_name]) {
      byCompany[p.company_name] = {
        employees: 0,
        totalNet: 0
      };
    }
    byCompany[p.company_name].employees++;
    byCompany[p.company_name].totalNet += p.net_salary;
  });

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 ${color} bg-opacity-20 rounded-xl`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          subtitle={`${stats.paid} paid • ${stats.approved} approved`}
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Payroll Cost"
          value={`${stats.totalNet.toLocaleString('en-US')} SAR`}
          subtitle="Net salary disbursed"
          icon={DollarSign}
          color="bg-green-600"
        />
        <StatCard
          title="Total Overtime"
          value={`${stats.totalOvertime.toLocaleString('en-US')} SAR`}
          subtitle={`${stats.totalOvertimeHours.toFixed(1)} hours`}
          icon={Clock}
          color="bg-purple-600"
        />
        <StatCard
          title="GOSI Contributions"
          value={`${stats.totalGOSI.toLocaleString('en-US')} SAR`}
          subtitle="Employee + Employer"
          icon={TrendingUp}
          color="bg-orange-600"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Breakdown by Company</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(byCompany).map(([company, data]) => (
                <div key={company} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{company}</p>
                    <p className="text-sm text-gray-500">{data.employees} employees</p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {data.totalNet.toLocaleString('en-US')} <span className="text-sm">SAR</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                  <span className="text-gray-700">{stats.paid} employees</span>
                </div>
                <p className="font-semibold text-green-600">
                  {stats.totalEmployees > 0 ? ((stats.paid / stats.totalEmployees) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>
                  <span className="text-gray-700">{stats.approved} employees</span>
                </div>
                <p className="font-semibold text-blue-600">
                  {stats.totalEmployees > 0 ? ((stats.approved / stats.totalEmployees) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">Draft</Badge>
                  <span className="text-gray-700">{stats.draft} employees</span>
                </div>
                <p className="font-semibold text-orange-600">
                  {stats.totalEmployees > 0 ? ((stats.draft / stats.totalEmployees) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
