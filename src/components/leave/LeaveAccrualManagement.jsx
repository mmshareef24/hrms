import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function LeaveAccrualManagement() {
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [accruals, setAccruals] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, typeData, accrualData] = await Promise.all([
        base44.entities.Employee.filter({ status: "Active" }),
        base44.entities.LeaveType.filter({ is_active: true }),
        base44.entities.LeaveAccrual.list("-accrual_date", 100)
      ]);
      
      setEmployees(empData || []);
      setLeaveTypes(typeData || []);
      setAccruals(accrualData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAccrual = (employee, leaveType) => {
    // Calculate accrual based on method
    if (leaveType.accrual_method === "Monthly" && leaveType.accrual_rate) {
      return leaveType.accrual_rate;
    } else if (leaveType.accrual_method === "Yearly") {
      return leaveType.max_days_per_year / 12; // Monthly accrual for yearly method
    } else if (leaveType.accrual_method === "Prorated") {
      // Check tenure
      const joinDate = new Date(employee.join_date);
      const now = new Date(selectedYear, selectedMonth - 1);
      const monthsOfService = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
      
      if (monthsOfService >= leaveType.min_service_months) {
        return leaveType.max_days_per_year / 12;
      }
      return 0;
    }
    return 0;
  };

  const processMonthlyAccruals = async () => {
    if (!confirm(isRTL 
      ? `هل أنت متأكد من معالجة الاستحقاقات لشهر ${selectedMonth}/${selectedYear}؟`
      : `Are you sure you want to process accruals for ${selectedMonth}/${selectedYear}?`
    )) {
      return;
    }

    setProcessing(true);
    const accrualDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    
    try {
      const accrualsToCreate = [];
      
      for (const employee of employees) {
        for (const leaveType of leaveTypes) {
          // Skip if not eligible by tenure
          if (leaveType.min_service_months > 0) {
            const joinDate = new Date(employee.join_date);
            const now = new Date(selectedYear, selectedMonth - 1);
            const monthsOfService = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
            
            if (monthsOfService < leaveType.min_service_months) {
              continue;
            }
          }
          
          // Skip if accrual method is None
          if (leaveType.accrual_method === "None") {
            continue;
          }
          
          // Calculate accrual amount
          const daysAccrued = calculateAccrual(employee, leaveType);
          
          if (daysAccrued > 0) {
            accrualsToCreate.push({
              employee_id: employee.id,
              employee_name: employee.full_name,
              leave_type_id: leaveType.id,
              leave_type_name: leaveType.leave_type_name,
              accrual_date: accrualDate,
              days_accrued: daysAccrued,
              description: `${leaveType.accrual_method} accrual for ${selectedMonth}/${selectedYear}`,
              is_prorated: leaveType.accrual_method === "Prorated",
              posted_to_balance: false
            });
          }
        }
      }
      
      // Bulk create accruals
      if (accrualsToCreate.length > 0) {
        await base44.entities.LeaveAccrual.bulkCreate(accrualsToCreate);
        
        // Update balances
        for (const accrual of accrualsToCreate) {
          const balances = await base44.entities.LeaveBalance.filter({
            employee_id: accrual.employee_id,
            leave_type_id: accrual.leave_type_id,
            year: selectedYear
          });
          
          if (balances.length > 0) {
            const balance = balances[0];
            await base44.entities.LeaveBalance.update(balance.id, {
              accrued: (balance.accrued || 0) + accrual.days_accrued,
              current_balance: (balance.current_balance || 0) + accrual.days_accrued,
              last_accrual_date: accrualDate
            });
          } else {
            // Create new balance
            await base44.entities.LeaveBalance.create({
              employee_id: accrual.employee_id,
              employee_name: accrual.employee_name,
              leave_type_id: accrual.leave_type_id,
              leave_type_name: accrual.leave_type_name,
              year: selectedYear,
              opening_balance: 0,
              accrued: accrual.days_accrued,
              carried_forward: 0,
              used: 0,
              pending: 0,
              encashed: 0,
              lapsed: 0,
              current_balance: accrual.days_accrued,
              last_accrual_date: accrualDate
            });
          }
        }
        
        alert(isRTL 
          ? `تم معالجة ${accrualsToCreate.length} استحقاق بنجاح`
          : `Successfully processed ${accrualsToCreate.length} accruals`
        );
        
        await loadData();
      } else {
        alert(isRTL ? 'لا توجد استحقاقات للمعالجة' : 'No accruals to process');
      }
    } catch (error) {
      console.error("Error processing accruals:", error);
      alert(isRTL ? 'حدث خطأ في معالجة الاستحقاقات' : 'Error processing accruals');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className="w-5 h-5 text-green-600" />
              <span>{isRTL ? 'معالجة الاستحقاقات الشهرية' : 'Monthly Accrual Processing'}</span>
            </CardTitle>
            <Button
              onClick={processMonthlyAccruals}
              disabled={processing}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Play className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'معالجة الاستحقاقات' : 'Process Accruals'}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className={`flex gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <Select
                value={String(selectedMonth)}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <SelectItem key={m} value={String(m)}>
                      {new Date(2025, m - 1).toLocaleString('en', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={String(selectedYear)}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className={`text-sm text-blue-800 ${isRTL ? 'text-right' : ''}`}>
              {isRTL 
                ? `سيتم معالجة الاستحقاقات لـ ${employees.length} موظف نشط عبر ${leaveTypes.length} نوع إجازة`
                : `Will process accruals for ${employees.length} active employees across ${leaveTypes.length} leave types`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'سجل الاستحقاقات الأخيرة' : 'Recent Accrual History'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'نوع الإجازة' : 'Leave Type'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الأيام المستحقة' : 'Days Accrued'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الوصف' : 'Description'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : accruals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {isRTL ? 'لا توجد استحقاقات' : 'No accruals found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  accruals.map((accrual) => (
                    <TableRow key={accrual.id} className="hover:bg-gray-50">
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {accrual.accrual_date && format(new Date(accrual.accrual_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {accrual.employee_name}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {accrual.leave_type_name}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <Badge variant="outline" className="bg-green-50 text-green-700 font-semibold">
                          {accrual.days_accrued} {isRTL ? 'يوم' : 'days'}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <span className="text-sm">{accrual.description}</span>
                        {accrual.is_prorated && (
                          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">
                            {isRTL ? 'متناسب' : 'Prorated'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {accrual.posted_to_balance ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {isRTL ? 'تم الترحيل' : 'Posted'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            {isRTL ? 'معلق' : 'Pending'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}