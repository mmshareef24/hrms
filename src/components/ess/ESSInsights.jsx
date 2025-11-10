import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  BookOpen,
  Target,
  Award,
  Clock,
  FileText,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { format, parseISO, differenceInDays, addDays } from "date-fns";

export default function ESSInsights({ user }) {
  const [employee, setEmployee] = useState(null);
  const [insights, setInsights] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (user && user.email) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const employees = await base44.entities.Employee.filter({ work_email: user.email });
      if (employees.length === 0) {
        setLoading(false);
        return;
      }
      
      const emp = employees[0];
      setEmployee(emp);

      // Load related data
      const [leaveBalances, goals, reviews, courses, documents] = await Promise.all([
        base44.entities.LeaveBalance.filter({ employee_id: emp.id }).catch(() => []),
        base44.entities.Goal.filter({ owner_id: emp.id }).catch(() => []),
        base44.entities.PerformanceReview.filter({ employee_id: emp.id }).catch(() => []),
        base44.entities.CourseEnrollment.filter({ employee_id: emp.id }).catch(() => []),
        base44.entities.Document.filter({ employee_id: emp.id }).catch(() => [])
      ]);

      // Generate proactive alerts
      const generatedAlerts = generateAlerts(emp, leaveBalances, documents);
      setAlerts(generatedAlerts);

      // Auto-generate insights if not already loaded
      if (!insights) {
        await generateInsights(emp, leaveBalances, goals, reviews, courses);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (emp, leaveBalances, documents) => {
    const alerts = [];
    const today = new Date();

    // Leave expiry alerts
    leaveBalances.forEach(balance => {
      if (balance.current_balance > 0) {
        const yearEnd = new Date(balance.year, 11, 31);
        const daysUntilExpiry = differenceInDays(yearEnd, today);
        
        if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
          alerts.push({
            type: 'leave_expiry',
            severity: daysUntilExpiry <= 30 ? 'high' : 'medium',
            icon: Calendar,
            title: isRTL ? 'إجازة ستنتهي قريباً' : 'Leave Expiring Soon',
            message: isRTL 
              ? `لديك ${balance.current_balance} أيام من ${balance.leave_type_name} ستنتهي في ${daysUntilExpiry} يوم`
              : `You have ${balance.current_balance} days of ${balance.leave_type_name} expiring in ${daysUntilExpiry} days`,
            action: isRTL ? 'احجز إجازة' : 'Book Leave',
            data: balance
          });
        }
      }
    });

    // Document expiry alerts
    documents.forEach(doc => {
      if (doc.expiry_date) {
        const expiryDate = parseISO(doc.expiry_date);
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        
        if (daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
          alerts.push({
            type: 'document_expiry',
            severity: daysUntilExpiry <= 30 ? 'high' : 'medium',
            icon: FileText,
            title: isRTL ? 'وثيقة ستنتهي صلاحيتها' : 'Document Expiring',
            message: isRTL
              ? `${doc.document_type} ستنتهي صلاحيتها في ${daysUntilExpiry} يوم`
              : `Your ${doc.document_type} expires in ${daysUntilExpiry} days`,
            action: isRTL ? 'تجديد' : 'Renew',
            data: doc
          });
        }
      }
    });

    return alerts;
  };

  const generateInsights = async (emp, leaveBalances, goals, reviews, courses) => {
    setGenerating(true);
    try {
      const goalsContext = goals.map(g => 
        `${g.goal_name}: ${g.achievement_percent}% (Status: ${g.status})`
      ).join('\n');

      const latestReview = reviews.length > 0 ? reviews[reviews.length - 1] : null;
      const reviewContext = latestReview 
        ? `Latest Review: ${latestReview.overall_rating} (${latestReview.review_period_start} - ${latestReview.review_period_end})`
        : 'No performance reviews yet';

      const coursesContext = courses.map(c => 
        `${c.course_name}: ${c.status} (${c.progress_percent}%)`
      ).join('\n');

      const prompt = `Analyze the following employee profile and provide personalized insights:

Employee: ${emp.full_name}
Job Title: ${emp.job_title}
Department: ${emp.department}
Tenure: ${emp.join_date ? differenceInDays(new Date(), parseISO(emp.join_date)) : 0} days
Employment Type: ${emp.employment_type}

Current Goals:
${goalsContext || 'No active goals'}

Performance:
${reviewContext}

Learning Progress:
${coursesContext || 'No enrolled courses'}

Leave Balances:
${leaveBalances.map(lb => `${lb.leave_type_name}: ${lb.current_balance} days`).join('\n') || 'No leave balances'}

Please provide:
1. Top 3 personalized training recommendations based on role, performance gaps, and career growth (with specific course names)
2. Career development path suggestions - what are the next logical roles and what skills/experience needed
3. Actionable tips to improve performance and achieve goals
4. Work-life balance recommendations based on leave usage patterns

Format response in both English and Arabic.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            training_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_name: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" },
                  duration_estimate: { type: "string" }
                }
              }
            },
            career_paths: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  timeline: { type: "string" },
                  skills_needed: { type: "array", items: { type: "string" } },
                  experience_needed: { type: "string" }
                }
              }
            },
            performance_tips: {
              type: "array",
              items: { type: "string" }
            },
            wellbeing_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setGenerating(false);
    }
  };

  const refreshInsights = async () => {
    if (employee) {
      const [leaveBalances, goals, reviews, courses] = await Promise.all([
        base44.entities.LeaveBalance.filter({ employee_id: employee.id }).catch(() => []),
        base44.entities.Goal.filter({ owner_id: employee.id }).catch(() => []),
        base44.entities.PerformanceReview.filter({ employee_id: employee.id }).catch(() => []),
        base44.entities.CourseEnrollment.filter({ employee_id: employee.id }).catch(() => [])
      ]);
      await generateInsights(employee, leaveBalances, goals, reviews, courses);
    }
  };

  const getSeverityColor = (severity) => {
    return {
      'high': 'bg-red-50 border-red-200 text-red-900',
      'medium': 'bg-orange-50 border-orange-200 text-orange-900',
      'low': 'bg-blue-50 border-blue-200 text-blue-900'
    }[severity] || 'bg-gray-50 border-gray-200';
  };

  const getSeverityIcon = (severity) => {
    return {
      'high': 'text-red-600',
      'medium': 'text-orange-600',
      'low': 'text-blue-600'
    }[severity] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'لم يتم العثور على بيانات الموظف' : 'Employee data not found'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
        <CardContent className="p-6">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <h2 className="text-2xl font-bold">
                  {isRTL ? 'رؤى ذكية مخصصة لك' : 'Your Personalized AI Insights'}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  {isRTL 
                    ? 'اكتشف فرص النمو والتحسينات المخصصة لك'
                    : 'Discover growth opportunities and personalized recommendations'}
                </p>
              </div>
            </div>
            <Button
              onClick={refreshInsights}
              disabled={generating}
              variant="outline"
              className={`bg-white bg-opacity-20 border-white border-opacity-40 text-white hover:bg-white hover:bg-opacity-30 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {generating ? (
                <RefreshCw className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
              ) : (
                <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              )}
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Proactive Alerts */}
      {alerts.length > 0 && (
        <Card className="shadow-lg border-orange-200">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-orange-100">
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>{isRTL ? 'تنبيهات استباقية' : 'Proactive Alerts'}</span>
              <Badge variant="outline" className="bg-orange-100 text-orange-700">
                {alerts.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {alerts.map((alert, index) => {
                const AlertIcon = alert.icon;
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-2 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <AlertIcon className={`w-6 h-6 flex-shrink-0 ${getSeverityIcon(alert.severity)}`} />
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <h4 className="font-semibold mb-1">{alert.title}</h4>
                        <p className="text-sm mb-3">{alert.message}</p>
                        <Button size="sm" variant="outline" className="bg-white">
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {generating ? (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">
              {isRTL 
                ? 'جاري تحليل بياناتك وإنشاء رؤى مخصصة...'
                : 'Analyzing your data and generating personalized insights...'}
            </p>
          </CardContent>
        </Card>
      ) : insights ? (
        <>
          {/* Training Recommendations */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>{isRTL ? 'توصيات التدريب المخصصة' : 'Personalized Training Recommendations'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {insights.training_recommendations?.map((training, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <h4 className="font-semibold text-gray-900">{training.course_name}</h4>
                          <Badge variant="outline" className={
                            training.priority === 'High' ? 'bg-red-100 text-red-700' :
                            training.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {training.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{training.reason}</p>
                        {training.duration_estimate && (
                          <p className="text-xs text-gray-500 mt-2">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {training.duration_estimate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Career Development Paths */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'مسارات التطوير الوظيفي' : 'Career Development Paths'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {insights.career_paths?.map((path, index) => (
                  <div key={index} className="relative">
                    {index > 0 && (
                      <div className={`absolute top-0 w-1 h-6 bg-gradient-to-b from-green-200 to-green-400 ${isRTL ? 'right-[23px]' : 'left-[23px]'}`} style={{top: '-24px'}}></div>
                    )}
                    <div className="p-5 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                      <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white flex-shrink-0">
                          <Target className="w-6 h-6" />
                        </div>
                        <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{path.role}</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {isRTL ? 'الإطار الزمني: ' : 'Timeline: '}{path.timeline}
                          </p>
                          
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              {isRTL ? 'المهارات المطلوبة:' : 'Skills Needed:'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {path.skills_needed?.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="bg-white text-green-700 border-green-300">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600">
                            <strong>{isRTL ? 'الخبرة: ' : 'Experience: '}</strong>
                            {path.experience_needed}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Tips */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Target className="w-5 h-5 text-amber-600" />
                  <span>{isRTL ? 'نصائح لتحسين الأداء' : 'Performance Improvement Tips'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {insights.performance_tips?.map((tip, index) => (
                    <div key={index} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className={`text-sm text-gray-700 ${isRTL ? 'text-right' : ''}`}>{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-teal-100">
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Lightbulb className="w-5 h-5 text-teal-600" />
                  <span>{isRTL ? 'نصائح للتوازن بين العمل والحياة' : 'Work-Life Balance Tips'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {insights.wellbeing_tips?.map((tip, index) => (
                    <div key={index} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className={`text-sm text-gray-700 ${isRTL ? 'text-right' : ''}`}>{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Disclosure */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className={`flex gap-3 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <p className={`text-purple-800 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL 
                    ? 'هذه الرؤى تم إنشاؤها بواسطة الذكاء الاصطناعي استناداً إلى بياناتك وأداءك. استخدمها كدليل لتطويرك المهني. للحصول على مشورة محددة، يرجى التشاور مع مديرك أو قسم الموارد البشرية.'
                    : 'These insights are AI-generated based on your data and performance. Use them as a guide for your professional development. For specific advice, please consult with your manager or HR.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {isRTL ? 'احصل على رؤى ذكية مخصصة' : 'Get Your Personalized Insights'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isRTL 
                ? 'اكتشف توصيات التدريب، مسارات التطوير الوظيفي، ونصائح مخصصة لك'
                : 'Discover training recommendations, career paths, and personalized tips'}
            </p>
            <Button 
              onClick={refreshInsights}
              disabled={generating}
              className={`bg-gradient-to-r from-purple-600 to-purple-700 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {generating ? (
                <>
                  <RefreshCw className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'جاري الإنشاء...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'إنشاء الرؤى' : 'Generate Insights'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}