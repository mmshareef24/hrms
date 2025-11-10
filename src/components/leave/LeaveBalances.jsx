import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function LeaveBalances({ employees, leaveTypes }) {
  const [balances, setBalances] = useState([]);
  const [filteredBalances, setFilteredBalances] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadBalances();
  }, []);

  useEffect(() => {
    filterBalances();
  }, [balances, searchTerm, selectedEmployee]);

  const loadBalances = async () => {
    setLoading(true);
    const year = new Date().getFullYear();
    const data = await base44.entities.LeaveBalance.filter({ year: year });
    setBalances(data);
    setLoading(false);
  };

  const filterBalances = () => {
    let filtered = balances;

    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEmployee !== "all") {
      filtered = filtered.filter(b => b.employee_id === selectedEmployee);
    }

    setFilteredBalances(filtered);
  };

  const getUsagePercentage = (balance) => {
    const total = balance.opening_balance + balance.accrued + balance.carried_forward;
    if (total === 0) return 0;
    return ((balance.used / total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'أرصدة الإجازات' : 'Leave Balances'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <Input
                placeholder={isRTL ? "البحث..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10 text-right' : 'pl-10'}
              />
            </div>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder={isRTL ? "جميع الموظفين" : "All Employees"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'جميع الموظفين' : 'All Employees'}</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'نوع الإجازة' : 'Leave Type'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المستحق' : 'Accrued'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المستخدم' : 'Used'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المعلق' : 'Pending'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المتبقي' : 'Balance'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاستخدام' : 'Usage'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.map((balance) => {
                  const usagePercent = getUsagePercentage(balance);
                  return (
                    <TableRow key={balance.id} className="hover:bg-gray-50">
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <span className="font-medium">{balance.employee_name}</span>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {balance.leave_type_name}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {balance.accrued}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {balance.used}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {balance.pending > 0 ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            {balance.pending}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <Badge variant="outline" className="bg-green-50 text-green-700 font-semibold">
                          {balance.current_balance}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={parseFloat(usagePercent)} className="h-2" />
                          <span className="text-xs text-gray-500 mt-1">{usagePercent}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}