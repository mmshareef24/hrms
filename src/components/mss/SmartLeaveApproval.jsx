import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Check, 
  X, 
  Users, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  Loader2,
  Bell,
  Target
} from "lucide-react";
import { format, parseISO, differenceInDays, eachDayOfInterval, isWeekend } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function SmartLeaveApproval({ request, employee, teamMembers, onApprove, onReject, onCancel }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [managerComments, setManagerComments] = useState("");
  const [notifyTeam, setNotifyTeam] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    performSmartAnalysis();
  }, [request]);

  const performSmartAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Get employee leave balance
      const balances = await base44.entities.LeaveBalance.filter({
        employee_id: request.employee_id,
        leave_type_id: request.leave_type_id
      });
      const balance = balances.length > 0 ? balances[0] : null;

      // Get overlapping leave requests from team
      const teamIds = teamMembers.map(m => m.id);
      const allLeaves = await base44.entities.LeaveRequest.list('-created_date', 100);
      
      const overlappingLeaves = allLeaves.filter(leave => {
        if (leave.id === request.id || leave.status === 'Rejected' || leave.status === 'Cancelled') return false;
        if (!teamIds.includes(leave.employee_id)) return false;
        
        const leaveStart = new Date(leave.start_date);
        const leaveEnd = new Date(leave.end_date);
        const reqStart = new Date(request.start_date);
        const reqEnd = new Date(request.end_date);
        
        return (leaveStart <= reqEnd && leaveEnd >= reqStart);
      });

      // Get employee's goals
      const goals = await base44.entities.Goal.filter({ owner_id: request.employee_id }).catch(() => []);
      const activeGoals = goals.filter(g => 
        g.status === 'Active' || g.status === 'On Track' || g.status === 'At Risk'
      );

      // Check for critical deadlines
      const urgentGoals = activeGoals.filter(g => {
        if (!g.due_date) return false;
        const daysUntilDue = differenceInDays(parseISO(g.due_date), new Date(request.end_date));
        return daysUntilDue <= 7; // Goal due within a week of return
      });

      // Get historical leave pattern
      const employeeLeaves = allLeaves.filter(l => 
        l.employee_id === request.employee_id && 
        l.status === 'Approved'
      );

      // Calculate team coverage
      const teamSize = teamMembers.length;
      const teamOnLeave = overlappingLeaves.length;
      const coveragePercent = teamSize > 0 ? ((teamSize - teamOnLeave) / teamSize) * 100 : 100;

      // Business days calculation
      const leaveDates = eachDayOfInterval({
        start: parseISO(request.start_date),
        end: parseISO(request.end_date)
      });
      const businessDays = leaveDates.filter(date => !isWeekend(date)).length;

      // Build AI analysis prompt
      const prompt = `Analyze this leave request and provide comprehensive approval recommendation:

EMPLOYEE DETAILS:
- Name: ${request.employee_name}
- Leave Type: ${request.leave_type_name}
- Dates: ${request.start_date} to ${request.end_date} (${request.days_count} days, ${businessDays} business days)
- Reason: ${request.reason || 'Not specified'}

LEAVE BALANCE:
- Current Balance: ${balance?.current_balance || 'Unknown'} days
- Already Used: ${balance?.used || 0} days this year
- Pending Requests: ${balance?.pending || 0} days

TEAM COVERAGE:
- Team Size: ${teamSize} members
- Currently on Leave: ${teamOnLeave} members during requested period
- Team Coverage: ${coveragePercent.toFixed(1)}%
- Overlapping Absences: ${overlappingLeaves.map(l => `${l.employee_name} (${l.start_date} to ${l.end_date})`).join(', ') || 'None'}

PROJECT COMMITMENTS:
- Active Goals/Projects: ${activeGoals.length}
- Critical Deadlines: ${urgentGoals.length > 0 ? urgentGoals.map(g => `${g.goal_name} due ${g.due_date}`).join(', ') : 'None'}

HISTORICAL PATTERN:
- Total approved leaves this year: ${employeeLeaves.filter(l => l.created_date?.startsWith(new Date().getFullYear())).length}
- Average leave duration: ${employeeLeaves.length > 0 ? (employeeLeaves.reduce((sum, l) => sum + (l.days_count || 0), 0) / employeeLeaves.length).toFixed(1) : 0} days

Consider:
1. Leave balance sufficiency
2. Team coverage and business continuity
3. Impact on critical deadlines
4. Historical leave patterns
5. Saudi labor law requirements
6. Business impact and timing

Provide:
1. Clear recommendation (Approve/Reject/Conditional Approval)
2. Confidence level (Low/Medium/High)
3. Key factors supporting the decision
4. Risks if approved
5. Suggested conditions or alternatives
6. Team coverage plan
7. Recommended actions (who to notify, coverage arrangements)

Be specific and actionable.`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: { 
              type: "string",
              enum: ["Approve", "Reject", "Conditional Approval", "Need More Info"]
            },
            confidence_level: { 
              type: "string",
              enum: ["Low", "Medium", "High"]
            },
            key_factors: { 
              type: "array",
              items: { type: "string" }
            },
            risks: { 
              type: "array",
              items: { type: "string" }
            },
            conditions: { 
              type: "array",
              items: { type: "string" }
            },
            coverage_plan: { type: "string" },
            recommended_actions: { 
              type: "array",
              items: { type: "string" }
            },
            reasoning: { type: "string" }
          }
        }
      });

      setAnalysis({
        ai: aiResponse,
        data: {
          balance: balance,
          teamCoverage: coveragePercent,
          overlappingLeaves: overlappingLeaves,
          urgentGoals: urgentGoals,
          businessDays: businessDays
        }
      });

    } catch (error) {
      console.error("Error performing analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      // Approve the request
      await onApprove(request.id);

      // Send notifications if enabled
      if (notifyTeam && analysis?.ai?.recommended_actions) {
        await sendStakeholderNotifications('approved');
      }

    } catch (error) {
      console.error("Error approving:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!managerComments.trim()) {
      alert(isRTL ? 'يرجى إدخال سبب الرفض' : 'Please enter rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await onReject(request.id, managerComments);

      // Notify employee
      await base44.entities.Notification.create({
        employee_id: request.employee_id,
        employee_name: request.employee_name,
        notification_type: "Leave Approval",
        title: isRTL ? "تم رفض طلب الإجازة" : "Leave Request Rejected",
        title_arabic: "تم رفض طلب الإجازة",
        message: `Your leave request for ${request.days_count} days (${format(parseISO(request.start_date), 'MMM dd')} - ${format(parseISO(request.end_date), 'MMM dd')}) has been rejected. Reason: ${managerComments}`,
        message_arabic: `تم رفض طلب إجازتك لمدة ${request.days_count} أيام. السبب: ${managerComments}`,
        priority: "High",
        channels: JSON.stringify(['in-app', 'email']),
        sent_date: new Date().toISOString(),
        read: false
      });

    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      setProcessing(false);
    }
  };

  const sendStakeholderNotifications = async (action) => {
    try {
      // Notify employee
      await base44.entities.Notification.create({
        employee_id: request.employee_id,
        employee_name: request.employee_name,
        notification_type: "Leave Approval",
        title: isRTL ? "تمت الموافقة على طلب الإجازة" : "Leave Request Approved",
        title_arabic: "تمت الموافقة على طلب الإجازة",
        message: `Your leave request for ${request.days_count} days (${format(parseISO(request.start_date), 'MMM dd')} - ${format(parseISO(request.end_date), 'MMM dd')}) has been approved. ${managerComments ? `Manager note: ${managerComments}` : ''}`,
        message_arabic: `تمت الموافقة على طلب إجازتك لمدة ${request.days_count} أيام. ${managerComments || ''}`,
        priority: "Medium",
        channels: JSON.stringify(['in-app', 'email']),
        sent_date: new Date().toISOString(),
        read: false,
        action_url: "/ess?tab=attendance",
        action_label: "View Details"
      });

      // Notify team members about coverage
      const affectedTeamMembers = teamMembers.filter(tm => 
        tm.id !== request.employee_id && tm.status === 'Active'
      );

      for (const teamMember of affectedTeamMembers) {
        await base44.entities.Notification.create({
          employee_id: teamMember.id,
          employee_name: teamMember.full_name,
          notification_type: "Company Announcement",
          title: isRTL ? "زميل في إجازة" : "Team Member On Leave",
          title_arabic: "زميل في إجازة",
          message: `${request.employee_name} will be on ${request.leave_type_name} from ${format(parseISO(request.start_date), 'MMM dd')} to ${format(parseISO(request.end_date), 'MMM dd')}. ${analysis?.ai?.coverage_plan || 'Please coordinate coverage as needed.'}`,
          message_arabic: `${request.employee_name} سيكون في إجازة من ${format(parseISO(request.start_date), 'MMM dd')} إلى ${format(parseISO(request.end_date), 'MMM dd')}.`,
          priority: "Low",
          channels: JSON.stringify(['in-app']),
          sent_date: new Date().toISOString(),
          read: false
        });
      }

      // If there are urgent goals, notify project stakeholders
      if (analysis?.data?.urgentGoals?.length > 0) {
        // This could notify project managers or stakeholders
        // For now, we'll create a high-priority notification for the manager
        await base44.entities.Notification.create({
          employee_id: employee.id,
          employee_name: employee.full_name,
          notification_type: "Goal Reminder",
          title: isRTL ? "تذكير: مواعيد نهائية قريبة" : "Reminder: Upcoming Deadlines",
          title_arabic: "تذكير: مواعيد نهائية قريبة",
          message: `${request.employee_name} has ${analysis.data.urgentGoals.length} critical goal(s) due soon. Coverage may be needed during their absence.`,
          message_arabic: `${request.employee_name} لديه ${analysis.data.urgentGoals.length} هدف حرج قريب من الموعد النهائي.`,
          priority: "High",
          channels: JSON.stringify(['in-app', 'email']),
          sent_date: new Date().toISOString(),
          read: false
        });
      }

    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  };

  const getRecommendationColor = (rec) => {
    return {
      'Approve': 'bg-green-100 text-green-800 border-green-300',
      'Reject': 'bg-red-100 text-red-800 border-red-300',
      'Conditional Approval': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Need More Info': 'bg-blue-100 text-blue-800 border-blue-300'
    }[rec] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (conf) => {
    return {
      'High': 'text-green-600',
      'Medium': 'text-yellow-600',
      'Low': 'text-red-600'
    }[conf] || 'text-gray-600';
  };

  if (analyzing) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">
            {isRTL 
              ? 'جاري تحليل الطلب بذكاء اصطناعي...'
              : 'Analyzing request with AI...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {isRTL 
              ? 'التحقق من التقويم، الأرصدة، المواعيد النهائية، وتغطية الفريق'
              : 'Checking calendar, balances, deadlines, and team coverage'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request Summary */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>{isRTL ? 'تفاصيل الطلب' : 'Leave Request Details'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="font-semibold text-lg text-gray-900 mb-4">{request.employee_name}</h3>
              <div className="space-y-3">
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'نوع الإجازة:' : 'Leave Type:'}</span>
                  <span className="font-medium">{request.leave_type_name}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'المدة:' : 'Duration:'}</span>
                  <span className="font-medium">{request.days_count} {isRTL ? 'أيام' : 'days'}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'من:' : 'From:'}</span>
                  <span className="font-medium">{format(parseISO(request.start_date), 'MMM dd, yyyy')}</span>
                </div>
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'إلى:' : 'To:'}</span>
                  <span className="font-medium">{format(parseISO(request.end_date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 bg-gray-50 rounded-lg ${isRTL ? 'text-right' : ''}`}>
              <p className="text-sm text-gray-600 mb-2">{isRTL ? 'السبب:' : 'Reason:'}</p>
              <p className="text-gray-900">{request.reason || (isRTL ? 'لم يتم تحديد سبب' : 'No reason specified')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {analysis && (
        <>
          {/* Recommendation */}
          <Card className="shadow-lg border-2 border-purple-200">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-purple-100">
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>{isRTL ? 'توصية الذكاء الاصطناعي' : 'AI Recommendation'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="outline" className={`text-lg px-4 py-2 ${getRecommendationColor(analysis.ai.recommendation)}`}>
                    {analysis.ai.recommendation}
                  </Badge>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-gray-600">{isRTL ? 'مستوى الثقة:' : 'Confidence:'}</span>
                    <span className={`font-semibold ${getConfidenceColor(analysis.ai.confidence_level)}`}>
                      {analysis.ai.confidence_level}
                    </span>
                  </div>
                </div>

                <div className={`p-4 bg-blue-50 rounded-lg ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm text-blue-900">{analysis.ai.reasoning}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Details */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Key Factors */}
            <Card>
              <CardHeader className="border-b bg-green-50">
                <CardTitle className={`flex items-center gap-2 text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{isRTL ? 'عوامل داعمة' : 'Supporting Factors'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                  {analysis.ai.key_factors?.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Risks */}
            <Card>
              <CardHeader className="border-b bg-red-50">
                <CardTitle className={`flex items-center gap-2 text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>{isRTL ? 'المخاطر' : 'Risks & Concerns'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                  {analysis.ai.risks?.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </li>
                  ))}
                  {(!analysis.ai.risks || analysis.ai.risks.length === 0) && (
                    <li className="text-sm text-gray-500">{isRTL ? 'لا توجد مخاطر محددة' : 'No specific risks identified'}</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Coverage Plan & Actions */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="border-b bg-blue-50">
                <CardTitle className={`flex items-center gap-2 text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{isRTL ? 'خطة التغطية' : 'Coverage Plan'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className={`text-sm text-gray-700 ${isRTL ? 'text-right' : ''}`}>
                  {analysis.ai.coverage_plan || (isRTL ? 'لا حاجة لخطة تغطية خاصة' : 'No specific coverage plan needed')}
                </p>
                
                <div className="mt-4">
                  <div className={`flex justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-medium">{isRTL ? 'تغطية الفريق' : 'Team Coverage'}</span>
                    <span className="text-sm text-gray-600">{analysis.data.teamCoverage.toFixed(0)}%</span>
                  </div>
                  <Progress value={analysis.data.teamCoverage} className="h-2" />
                </div>

                {analysis.data.overlappingLeaves.length > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-xs font-medium text-orange-900 mb-2">
                      {isRTL ? 'إجازات متداخلة:' : 'Overlapping Absences:'}
                    </p>
                    <ul className="space-y-1">
                      {analysis.data.overlappingLeaves.map((leave, idx) => (
                        <li key={idx} className="text-xs text-orange-800">
                          • {leave.employee_name} ({format(parseISO(leave.start_date), 'MMM dd')} - {format(parseISO(leave.end_date), 'MMM dd')})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b bg-amber-50">
                <CardTitle className={`flex items-center gap-2 text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>{isRTL ? 'الإجراءات الموصى بها' : 'Recommended Actions'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ul className={`space-y-2 ${isRTL ? 'text-right' : ''}`}>
                  {analysis.ai.recommended_actions?.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>

                {analysis.ai.conditions && analysis.ai.conditions.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs font-medium text-yellow-900 mb-2">
                      {isRTL ? 'شروط الموافقة:' : 'Approval Conditions:'}
                    </p>
                    <ul className="space-y-1">
                      {analysis.ai.conditions.map((condition, idx) => (
                        <li key={idx} className="text-xs text-yellow-800">
                          • {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-500">{isRTL ? 'الرصيد' : 'Balance'}</p>
                    <p className="text-lg font-bold text-blue-600">
                      {analysis.data.balance?.current_balance || 0} {isRTL ? 'يوم' : 'days'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Users className="w-5 h-5 text-green-600" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-500">{isRTL ? 'التغطية' : 'Coverage'}</p>
                    <p className="text-lg font-bold text-green-600">
                      {analysis.data.teamCoverage.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-500">{isRTL ? 'أيام العمل' : 'Business Days'}</p>
                    <p className="text-lg font-bold text-orange-600">
                      {analysis.data.businessDays}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Target className="w-5 h-5 text-red-600" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-xs text-gray-500">{isRTL ? 'مواعيد حرجة' : 'Critical Goals'}</p>
                    <p className="text-lg font-bold text-red-600">
                      {analysis.data.urgentGoals?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manager Decision */}
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className={isRTL ? 'text-right' : ''}>
                {isRTL ? 'قرار المدير' : 'Manager Decision'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <Bell className="w-4 h-4" />
                  <span>{isRTL ? 'إشعار الفريق بالغياب' : 'Notify Team About Absence'}</span>
                </Label>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <input
                    type="checkbox"
                    checked={notifyTeam}
                    onChange={(e) => setNotifyTeam(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">
                    {isRTL 
                      ? `إرسال إشعار لـ ${teamMembers.length - 1} من أعضاء الفريق حول الغياب وخطة التغطية`
                      : `Send notification to ${teamMembers.length - 1} team members about absence and coverage plan`
                    }
                  </span>
                </div>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'تعليقات المدير (اختياري)' : 'Manager Comments (Optional)'}
                </Label>
                <Textarea
                  value={managerComments}
                  onChange={(e) => setManagerComments(e.target.value)}
                  placeholder={isRTL ? "أضف تعليقات أو شروط..." : "Add comments or conditions..."}
                  rows={3}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={processing}
                  className={`text-red-600 hover:bg-red-50 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {processing ? (isRTL ? 'جاري الرفض...' : 'Rejecting...') : (isRTL ? 'رفض' : 'Reject')}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  {processing ? (
                    <>
                      <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'جاري الموافقة...' : 'Approving...'}
                    </>
                  ) : (
                    <>
                      <Check className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'موافقة' : 'Approve'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}