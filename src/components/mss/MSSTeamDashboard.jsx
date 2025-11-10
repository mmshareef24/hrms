
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, AlertCircle, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, differenceInDays } from "date-fns";

export default function MSSTeamDashboard({ employee, teamMembers }) {
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [lateAbsent, setLateAbsent] = useState([]);
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (teamMembers && teamMembers.length > 0) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [teamMembers]);

  const loadDashboardData = async () => {
    if (!teamMembers || teamMembers.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const teamIds = teamMembers.map(m => m.id);

    try {
      // Get today's leaves
      const leaves = await base44.entities.LeaveRequest.list('-created_date', 100);
      const todayLeavesFiltered = leaves.filter(l => 
        teamIds.includes(l.employee_id) &&
        l.status === "Approved" &&
        l.start_date <= today &&
        l.end_date >= today
      );
      setTodayLeaves(todayLeavesFiltered || []);

      // Get today's attendance issues
      const attendance = await base44.entities.TimeLog.filter({ date: today });
      const issues = attendance.filter(a => 
        teamIds.includes(a.employee_id) &&
        (a.status === "Late" || a.status === "Absent")
      );
      setLateAbsent(issues || []);

      // Get expiring documents
      const docs = await base44.entities.Document.list();
      const expiring = docs.filter(d => {
        if (!d.expiry_date || !teamIds.includes(d.employee_id)) return false;
        const daysUntilExpiry = differenceInDays(parseISO(d.expiry_date), new Date());
        return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
      });
      setExpiringDocs(expiring || []);

      // Count pending approvals
      const pendingLeaves = leaves.filter(l => 
        teamIds.includes(l.employee_id) &&
        l.status === "Pending"
      ).length;
      setPendingApprovals(pendingLeaves);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, titleAr, value, subtitle, subtitleAr, icon: Icon, color }) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-32 h-32 ${color} opacity-10 rounded-full transform ${isRTL ? '-translate-x-12' : 'translate-x-12'} -translate-y-12`} />
      <CardHeader className="pb-3">
        <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <p className="text-sm text-gray-500 font-medium">{isRTL ? titleAr : title}</p>
            <CardTitle className="text-3xl font-bold mt-2 text-gray-900">{value}</CardTitle>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{isRTL ? subtitleAr : subtitle}</p>}
          </div>
          <div className={`p-3 ${color} bg-opacity-20 rounded-xl`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {isRTL ? 'لا يوجد أعضاء في الفريق' : 'No team members found'}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {isRTL ? 'تأكد من أن الموظفين لديهم مدير معين' : 'Make sure employees have a manager assigned'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Team Size"
          titleAr="حجم الفريق"
          value={teamMembers.length}
          subtitle={`${teamMembers.filter(m => m.status === "Active").length} Active`}
          subtitleAr={`${teamMembers.filter(m => m.status === "Active").length} نشط`}
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="On Leave Today"
          titleAr="في إجازة اليوم"
          value={todayLeaves.length}
          subtitle="Team members"
          subtitleAr="أعضاء الفريق"
          icon={Calendar}
          color="bg-orange-600"
        />
        <StatCard
          title="Late / Absent"
          titleAr="متأخر / غائب"
          value={lateAbsent.length}
          subtitle="Attendance issues"
          subtitleAr="مشاكل الحضور"
          icon={Clock}
          color="bg-red-600"
        />
        <StatCard
          title="Pending Approvals"
          titleAr="الموافقات المعلقة"
          value={pendingApprovals}
          subtitle="Require action"
          subtitleAr="تتطلب إجراء"
          icon={AlertCircle}
          color="bg-purple-600"
        />
      </div>

      {/* Today's Leaves */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-5 h-5 text-orange-600" />
            <span>{isRTL ? 'في إجازة اليوم' : 'On Leave Today'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {todayLeaves.map((leave) => (
              <div key={leave.id} className={`flex items-center justify-between p-4 bg-orange-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-medium text-gray-900">{leave.employee_name}</p>
                  <p className="text-sm text-gray-600">{leave.leave_type_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(parseISO(leave.start_date), 'MMM dd')} - {format(parseISO(leave.end_date), 'MMM dd')}
                  </p>
                </div>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {leave.days_count} {isRTL ? 'أيام' : 'days'}
                </Badge>
              </div>
            ))}
            {todayLeaves.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                {isRTL ? 'لا يوجد أحد في إجازة اليوم' : 'No one on leave today'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Issues */}
      {lateAbsent.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="w-5 h-5 text-red-600" />
              <span>{isRTL ? 'مشاكل الحضور اليوم' : 'Today\'s Attendance Issues'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {lateAbsent.map((record) => (
                <div key={record.id} className={`flex items-center justify-between p-4 bg-red-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="font-medium text-gray-900">{record.employee_name}</p>
                    <p className="text-sm text-gray-600">
                      {record.clock_in ? `Clocked in at ${record.clock_in}` : 'No clock-in'}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={record.status === "Late" ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"}
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Documents */}
      {expiringDocs.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <FileWarning className="w-5 h-5 text-amber-600" />
              <span>{isRTL ? 'المستندات التي ستنتهي قريباً' : 'Expiring Documents'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {expiringDocs.slice(0, 5).map((doc) => {
                const daysLeft = differenceInDays(parseISO(doc.expiry_date), new Date());
                return (
                  <div key={doc.id} className={`flex items-center justify-between p-4 bg-amber-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="font-medium text-gray-900">{doc.employee_name}</p>
                      <p className="text-sm text-gray-600">{doc.document_type}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {isRTL ? 'تنتهي في: ' : 'Expires: '}{format(parseISO(doc.expiry_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={daysLeft <= 30 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}
                    >
                      {daysLeft} {isRTL ? 'يوم' : 'days'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
