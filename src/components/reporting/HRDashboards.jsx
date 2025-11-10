import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  TrendingDown, 
  Clock, 
  DollarSign,
  UserCheck,
  UsersRound
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subMonths, parseISO } from "date-fns";

export default function HRDashboards() {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [empData, payrollData, attendanceData] = await Promise.all([
      base44.entities.Employee.list(),
      base44.entities.Payroll.list('-created_date', 500),
      base44.entities.TimeLog.list('-date', 1000)
    ]);
    setEmployees(empData);
    setPayrolls(payrollData);
    setAttendance(attendanceData);
    setLoading(false);
  };

  // Calculate KPIs
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const saudiEmployees = employees.filter(e => e.nationality === "Saudi").length;
  const saudizationRate = totalEmployees > 0 ? ((saudiEmployees / totalEmployees) * 100).toFixed(1) : 0;

  const maleEmployees = employees.filter(e => e.gender === "Male").length;
  const femaleEmployees = employees.filter(e => e.gender === "Female").length;
  const genderDiversityRate = totalEmployees > 0 ? ((femaleEmployees / totalEmployees) * 100).toFixed(1) : 0;

  // Calculate monthly payroll cost
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthPayrolls = payrolls.filter(p => p.month === currentMonth && p.year === currentYear);
  const totalPayrollCost = currentMonthPayrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0);

  // Calculate overtime
  const currentMonthAttendance = attendance.filter(a => {
    if (!a.date) return false;
    const date = parseISO(a.date);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });
  const totalOvertimeHours = currentMonthAttendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);

  // Calculate absence rate
  const absentRecords = currentMonthAttendance.filter(a => a.status === "Absent").length;
  const absenceRate = currentMonthAttendance.length > 0 
    ? ((absentRecords / currentMonthAttendance.length) * 100).toFixed(1) 
    : 0;

  // Attrition (last 12 months)
  const oneYearAgo = subMonths(new Date(), 12);
  const terminatedEmployees = employees.filter(e => 
    e.termination_date && parseISO(e.termination_date) >= oneYearAgo
  ).length;
  const avgHeadcount = (totalEmployees + terminatedEmployees) / 2;
  const attritionRate = avgHeadcount > 0 ? ((terminatedEmployees / avgHeadcount) * 100).toFixed(1) : 0;

  // Department distribution
  const departmentData = ["HR", "Finance", "Operations", "IT", "Sales", "Marketing", "Administration"].map(dept => ({
    name: dept,
    count: employees.filter(e => e.department === dept).length
  })).filter(d => d.count > 0);

  // Headcount trend (last 6 months)
  const headcountTrend = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const month = format(date, 'MMM yyyy');
    // Simplified: just show current count for all months
    return { month, count: totalEmployees };
  });

  // Payroll cost trend (last 6 months)
  const payrollTrend = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthName = format(date, 'MMM yyyy');
    const monthPayrolls = payrolls.filter(p => p.month === month && p.year === year);
    const cost = monthPayrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0);
    return { month: monthName, cost: Math.round(cost) };
  });

  // Nationality distribution
  const nationalityData = [
    { name: isRTL ? 'سعودي' : 'Saudi', value: saudiEmployees, color: '#22c55e' },
    { name: isRTL ? 'غير سعودي' : 'Non-Saudi', value: totalEmployees - saudiEmployees, color: '#3b82f6' }
  ];

  // Gender distribution
  const genderData = [
    { name: isRTL ? 'ذكر' : 'Male', value: maleEmployees, color: '#3b82f6' },
    { name: isRTL ? 'أنثى' : 'Female', value: femaleEmployees, color: '#ec4899' }
  ];

  const KPICard = ({ title, titleAr, value, subtitle, subtitleAr, icon: Icon, color, trend }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-sm text-gray-500 font-medium">{isRTL ? titleAr : title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{isRTL ? subtitleAr : subtitle}</p>}
          </div>
          <div className={`p-3 ${color} bg-opacity-20 rounded-xl`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Headcount"
          titleAr="إجمالي الموظفين"
          value={totalEmployees}
          subtitle={`${activeEmployees} Active`}
          subtitleAr={`${activeEmployees} نشط`}
          icon={Users}
          color="bg-blue-600"
        />
        <KPICard
          title="Attrition Rate"
          titleAr="معدل دوران العمالة"
          value={`${attritionRate}%`}
          subtitle="Last 12 months"
          subtitleAr="آخر 12 شهر"
          icon={TrendingDown}
          color="bg-red-600"
        />
        <KPICard
          title="Absence Rate"
          titleAr="معدل الغياب"
          value={`${absenceRate}%`}
          subtitle="This month"
          subtitleAr="هذا الشهر"
          icon={Clock}
          color="bg-orange-600"
        />
        <KPICard
          title="Overtime Hours"
          titleAr="ساعات العمل الإضافي"
          value={Math.round(totalOvertimeHours)}
          subtitle="This month"
          subtitleAr="هذا الشهر"
          icon={Clock}
          color="bg-purple-600"
        />
        <KPICard
          title="Payroll Cost"
          titleAr="تكلفة الرواتب"
          value={`${(totalPayrollCost / 1000).toFixed(0)}K SAR`}
          subtitle="This month"
          subtitleAr="هذا الشهر"
          icon={DollarSign}
          color="bg-green-600"
        />
        <KPICard
          title="Saudization"
          titleAr="نسبة السعودة"
          value={`${saudizationRate}%`}
          subtitle={`${saudiEmployees} Saudis`}
          subtitleAr={`${saudiEmployees} سعودي`}
          icon={UserCheck}
          color="bg-green-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Trend */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'اتجاه عدد الموظفين' : 'Headcount Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={headcountTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} name={isRTL ? "الموظفين" : "Employees"} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'توزيع الأقسام' : 'Department Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name={isRTL ? "الموظفين" : "Employees"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Cost Trend */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'اتجاه تكلفة الرواتب' : 'Payroll Cost Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#22c55e" strokeWidth={2} name={isRTL ? "التكلفة (ر.س)" : "Cost (SAR)"} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Diversity Metrics */}
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'التنوع والشمول' : 'Diversity & Inclusion'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className={`text-sm font-medium text-gray-700 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الجنسية' : 'Nationality'}
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={nationalityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {nationalityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className={`text-sm font-medium text-gray-700 mb-4 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الجنس' : 'Gender'}
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={`mt-6 grid grid-cols-2 gap-4 ${isRTL ? 'text-right' : ''}`}>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">{isRTL ? 'نسبة السعودة' : 'Saudization Rate'}</p>
                <p className="text-2xl font-bold text-green-600">{saudizationRate}%</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">{isRTL ? 'تنوع الجنسين' : 'Gender Diversity'}</p>
                <p className="text-2xl font-bold text-pink-600">{genderDiversityRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}