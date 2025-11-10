import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calendar } from "lucide-react";

export default function ShiftAssignment() {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShift, setSelectedShift] = useState("all");
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, selectedShift]);

  const loadData = async () => {
    setLoading(true);
    const [empData, shiftData] = await Promise.all([
      base44.entities.Employee.list("full_name"),
      base44.entities.Shift.list("shift_name")
    ]);
    setEmployees(empData);
    setShifts(shiftData.filter(s => s.is_active));
    setLoading(false);
  };

  const filterEmployees = () => {
    let filtered = employees.filter(emp => emp.status === "Active");
    
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedShift !== "all") {
      if (selectedShift === "none") {
        filtered = filtered.filter(emp => !emp.shift_id);
      } else {
        filtered = filtered.filter(emp => emp.shift_id === selectedShift);
      }
    }

    setFilteredEmployees(filtered);
  };

  const handleAssignShift = async (employeeId, shiftId) => {
    const shift = shifts.find(s => s.id === shiftId);
    await base44.entities.Employee.update(employeeId, {
      shift_id: shiftId || null,
      shift_name: shift ? shift.shift_name : ""
    });
    loadData();
  };

  const getShiftBadgeColor = (shiftName) => {
    if (!shiftName) return "bg-gray-100 text-gray-800";
    if (shiftName.includes("Morning")) return "bg-blue-100 text-blue-800";
    if (shiftName.includes("Evening")) return "bg-orange-100 text-orange-800";
    if (shiftName.includes("Night")) return "bg-purple-100 text-purple-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'تعيين الورديات للموظفين' : 'Assign Shifts to Employees'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <Input
                placeholder={isRTL ? "البحث بالاسم أو رقم الموظف..." : "Search by name or employee ID..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
              />
            </div>
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder={isRTL ? "تصفية حسب الوردية" : "Filter by shift"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'جميع الموظفين' : 'All Employees'}</SelectItem>
                <SelectItem value="none">{isRTL ? 'بدون وردية' : 'No Shift Assigned'}</SelectItem>
                {shifts.map(shift => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.shift_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{isRTL ? 'إجمالي الموظفين' : 'Total Employees'}</p>
              <p className="text-2xl font-bold text-blue-600">{employees.filter(e => e.status === "Active").length}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{isRTL ? 'مع وردية' : 'With Shift'}</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter(e => e.status === "Active" && e.shift_id).length}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{isRTL ? 'بدون وردية' : 'No Shift'}</p>
              <p className="text-2xl font-bold text-orange-600">
                {employees.filter(e => e.status === "Active" && !e.shift_id).length}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{isRTL ? 'الورديات النشطة' : 'Active Shifts'}</p>
              <p className="text-2xl font-bold text-purple-600">{shifts.length}</p>
            </div>
          </div>

          {/* Employee List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رقم الموظف' : 'Employee ID'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'القسم' : 'Department'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الوردية الحالية' : 'Current Shift'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تعيين وردية' : 'Assign Shift'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map(employee => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className={`font-medium ${isRTL ? 'text-right' : ''}`}>
                        {employee.employee_id}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <div>
                          <p className="font-medium text-gray-900">{employee.full_name}</p>
                          <p className="text-sm text-gray-500">{employee.job_title}</p>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {employee.department}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {employee.shift_name ? (
                          <Badge variant="outline" className={getShiftBadgeColor(employee.shift_name)}>
                            {employee.shift_name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600">
                            {isRTL ? 'غير محدد' : 'Not Assigned'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={employee.shift_id || "none"}
                          onValueChange={(value) => handleAssignShift(employee.id, value === "none" ? null : value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{isRTL ? 'بدون وردية' : 'No Shift'}</SelectItem>
                            {shifts.map(shift => (
                              <SelectItem key={shift.id} value={shift.id}>
                                {shift.shift_name} ({shift.start_time} - {shift.end_time})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {isRTL ? 'لا توجد نتائج' : 'No results found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}