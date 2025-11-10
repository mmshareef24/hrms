import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Users, Clock, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format, parseISO, differenceInDays } from "date-fns";

export default function StandardReports() {
  const [generating, setGenerating] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const reports = [
    {
      id: "employee-directory",
      name: "Employee Directory",
      nameAr: "دليل الموظفين",
      description: "Complete list of all employees with contact details",
      descriptionAr: "قائمة كاملة بجميع الموظفين مع تفاصيل الاتصال",
      icon: Users,
      color: "from-blue-100 to-blue-200",
      iconColor: "text-blue-600"
    },
    {
      id: "visa-iqama-expiry",
      name: "Visa/Iqama Expiry",
      nameAr: "انتهاء التأشيرات/الإقامات",
      description: "Upcoming visa and iqama expiry dates",
      descriptionAr: "تواريخ انتهاء التأشيرات والإقامات القادمة",
      icon: Calendar,
      color: "from-red-100 to-red-200",
      iconColor: "text-red-600"
    },
    {
      id: "leave-balances",
      name: "Leave Balances",
      nameAr: "أرصدة الإجازات",
      description: "Current leave balances for all employees",
      descriptionAr: "أرصدة الإجازات الحالية لجميع الموظفين",
      icon: Calendar,
      color: "from-green-100 to-green-200",
      iconColor: "text-green-600"
    },
    {
      id: "overtime-summary",
      name: "Overtime Summary",
      nameAr: "ملخص العمل الإضافي",
      description: "Monthly overtime hours by employee",
      descriptionAr: "ساعات العمل الإضافي الشهرية حسب الموظف",
      icon: Clock,
      color: "from-purple-100 to-purple-200",
      iconColor: "text-purple-600"
    },
    {
      id: "payroll-reconciliation",
      name: "Payroll Reconciliation",
      nameAr: "تسوية الرواتب",
      description: "Detailed payroll breakdown and reconciliation",
      descriptionAr: "تفصيل وتسوية الرواتب",
      icon: DollarSign,
      color: "from-green-100 to-green-200",
      iconColor: "text-green-600"
    },
    {
      id: "loan-ledgers",
      name: "Loan Ledgers",
      nameAr: "دفاتر القروض",
      description: "Outstanding loans and payment schedules",
      descriptionAr: "القروض القائمة وجداول السداد",
      icon: DollarSign,
      color: "from-orange-100 to-orange-200",
      iconColor: "text-orange-600"
    },
    {
      id: "eosb-provisions",
      name: "EOSB Provisions",
      nameAr: "مخصصات نهاية الخدمة",
      description: "End of service benefit calculations",
      descriptionAr: "حسابات مكافأة نهاية الخدمة",
      icon: FileText,
      color: "from-indigo-100 to-indigo-200",
      iconColor: "text-indigo-600"
    }
  ];

  const generateReport = async (reportId) => {
    setGenerating(reportId);
    try {
      switch(reportId) {
        case "employee-directory":
          await generateEmployeeDirectory();
          break;
        case "visa-iqama-expiry":
          await generateVisaIqamaExpiry();
          break;
        case "leave-balances":
          await generateLeaveBalances();
          break;
        case "overtime-summary":
          await generateOvertimeSummary();
          break;
        case "payroll-reconciliation":
          await generatePayrollReconciliation();
          break;
        case "loan-ledgers":
          await generateLoanLedgers();
          break;
        case "eosb-provisions":
          await generateEOSBProvisions();
          break;
      }
    } finally {
      setGenerating(null);
    }
  };

  const generateEmployeeDirectory = async () => {
    const employees = await base44.entities.Employee.list("full_name");
    
    let csv = "Employee ID,Name,Department,Position,Email,Mobile,Status,Join Date,Nationality\n";
    employees.forEach(emp => {
      csv += `${emp.employee_id || ''},${emp.full_name},${emp.department},${emp.job_title},${emp.work_email || ''},${emp.mobile || ''},${emp.status},${emp.join_date || ''},${emp.nationality}\n`;
    });

    downloadCSV(csv, "Employee_Directory.csv");
  };

  const generateVisaIqamaExpiry = async () => {
    const employees = await base44.entities.Employee.list();
    const today = new Date();
    
    let csv = "Employee ID,Name,Document Type,Document Number,Expiry Date,Days Until Expiry,Status\n";
    
    employees.forEach(emp => {
      if (emp.iqama_expiry) {
        const daysLeft = differenceInDays(parseISO(emp.iqama_expiry), today);
        const status = daysLeft < 0 ? "Expired" : daysLeft <= 30 ? "Critical" : daysLeft <= 90 ? "Warning" : "OK";
        csv += `${emp.employee_id},${emp.full_name},Iqama,${emp.iqama_number || ''},${emp.iqama_expiry},${daysLeft},${status}\n`;
      }
      if (emp.passport_expiry) {
        const daysLeft = differenceInDays(parseISO(emp.passport_expiry), today);
        const status = daysLeft < 0 ? "Expired" : daysLeft <= 30 ? "Critical" : daysLeft <= 90 ? "Warning" : "OK";
        csv += `${emp.employee_id},${emp.full_name},Passport,${emp.passport_number || ''},${emp.passport_expiry},${daysLeft},${status}\n`;
      }
    });

    downloadCSV(csv, "Visa_Iqama_Expiry_Report.csv");
  };

  const generateLeaveBalances = async () => {
    const balances = await base44.entities.LeaveBalance.list();
    
    let csv = "Employee Name,Leave Type,Opening Balance,Accrued,Used,Pending,Encashed,Current Balance\n";
    balances.forEach(balance => {
      csv += `${balance.employee_name},${balance.leave_type_name},${balance.opening_balance || 0},${balance.accrued || 0},${balance.used || 0},${balance.pending || 0},${balance.encashed || 0},${balance.current_balance || 0}\n`;
    });

    downloadCSV(csv, "Leave_Balances_Report.csv");
  };

  const generateOvertimeSummary = async () => {
    const timeLogs = await base44.entities.TimeLog.list();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Group by employee
    const overtimeByEmployee = {};
    timeLogs.forEach(log => {
      if (!log.date) return;
      const date = parseISO(log.date);
      if (date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear) {
        if (!overtimeByEmployee[log.employee_id]) {
          overtimeByEmployee[log.employee_id] = {
            name: log.employee_name,
            hours: 0
          };
        }
        overtimeByEmployee[log.employee_id].hours += (log.overtime_hours || 0);
      }
    });

    let csv = "Employee Name,Total Overtime Hours\n";
    Object.values(overtimeByEmployee).forEach(emp => {
      csv += `${emp.name},${emp.hours.toFixed(2)}\n`;
    });

    downloadCSV(csv, "Overtime_Summary_Report.csv");
  };

  const generatePayrollReconciliation = async () => {
    const payrolls = await base44.entities.Payroll.list();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const currentPayrolls = payrolls.filter(p => p.month === currentMonth && p.year === currentYear);

    let csv = "Employee Name,Basic Salary,Housing,Transportation,Gross,GOSI Employee,Other Deductions,Net Salary\n";
    currentPayrolls.forEach(payroll => {
      csv += `${payroll.employee_name},${payroll.basic_salary || 0},${payroll.housing_allowance || 0},${payroll.transportation_allowance || 0},${payroll.total_gross || 0},${payroll.gosi_employee || 0},${payroll.other_deductions || 0},${payroll.net_salary || 0}\n`;
    });

    downloadCSV(csv, "Payroll_Reconciliation_Report.csv");
  };

  const generateLoanLedgers = async () => {
    const loans = await base44.entities.LoanAdvance.list();
    
    let csv = "Employee Name,Loan Type,Loan Amount,Installments,Installment Amount,Amount Paid,Balance,Status\n";
    loans.forEach(loan => {
      csv += `${loan.employee_name},${loan.loan_type},${loan.loan_amount},${loan.installments},${loan.installment_amount || 0},${loan.amount_paid || 0},${loan.balance || 0},${loan.status}\n`;
    });

    downloadCSV(csv, "Loan_Ledgers_Report.csv");
  };

  const generateEOSBProvisions = async () => {
    const employees = await base44.entities.Employee.filter({ status: "Active" });
    
    let csv = "Employee ID,Name,Join Date,Service Years,Basic Salary,Housing Allowance,EOSB Provision (Estimated)\n";
    
    const today = new Date();
    employees.forEach(emp => {
      if (!emp.join_date) return;
      
      const joinDate = parseISO(emp.join_date);
      const serviceYears = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      const serviceMonths = serviceYears * 12;
      
      // EOSB calculation: first 5 years = 0.5 month per year, thereafter 1 month per year
      let eosbMonths = 0;
      if (serviceYears <= 5) {
        eosbMonths = serviceYears * 0.5;
      } else {
        eosbMonths = 2.5 + ((serviceYears - 5) * 1);
      }
      
      const monthlyWage = (emp.basic_salary || 0) + (emp.housing_allowance || 0);
      const eosbProvision = monthlyWage * eosbMonths;
      
      csv += `${emp.employee_id},${emp.full_name},${emp.join_date},${serviceYears.toFixed(1)},${emp.basic_salary || 0},${emp.housing_allowance || 0},${eosbProvision.toFixed(2)}\n`;
    });

    downloadCSV(csv, "EOSB_Provisions_Report.csv");
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => {
        const Icon = report.icon;
        return (
          <Card key={report.id} className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="border-b border-gray-100">
              <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${report.iconColor}`} />
                </div>
                <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                  <CardTitle className="text-lg">{isRTL ? report.nameAr : report.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {isRTL ? report.descriptionAr : report.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Button 
                onClick={() => generateReport(report.id)}
                disabled={generating === report.id}
                className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {generating === report.id 
                  ? (isRTL ? 'جاري الإنشاء...' : 'Generating...') 
                  : (isRTL ? 'تصدير CSV' : 'Export CSV')
                }
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}