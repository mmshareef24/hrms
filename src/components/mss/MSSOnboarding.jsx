import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserPlus, Eye, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function MSSOnboarding({ employee, teamMembers }) {
  const [onboardingList, setOnboardingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (teamMembers && teamMembers.length > 0) {
      loadOnboarding();
    } else {
      setLoading(false);
    }
  }, [teamMembers]);

  const loadOnboarding = async () => {
    setLoading(true);
    try {
      const teamIds = teamMembers.map(m => m.id);
      const allOnboarding = await base44.entities.OnboardingChecklist.list('-start_date', 50);
      
      const teamOnboarding = allOnboarding.filter(o => 
        teamIds.includes(o.employee_id) && o.status !== 'Completed'
      );

      // Load detailed data for each
      const withDetails = await Promise.all(
        teamOnboarding.map(async (ob) => {
          try {
            const [tasks, docs, trainings, access] = await Promise.all([
              base44.entities.OnboardingTask.filter({ onboarding_id: ob.id }),
              base44.entities.OnboardingDocument.filter({ onboarding_id: ob.id }),
              base44.entities.OnboardingTraining.filter({ onboarding_id: ob.id }),
              base44.entities.SystemAccess.filter({ onboarding_id: ob.id })
            ]);

            const totalItems = tasks.length + docs.length + trainings.length + access.length;
            const completedItems = 
              tasks.filter(t => t.status === 'Completed').length +
              docs.filter(d => d.status === 'Approved').length +
              trainings.filter(t => t.status === 'Completed').length +
              access.filter(a => a.status === 'Completed').length;

            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

            return {
              ...ob,
              calculated_progress: progress,
              pending_tasks: tasks.filter(t => t.status !== 'Completed').length,
              pending_docs: docs.filter(d => d.status === 'Pending').length
            };
          } catch (error) {
            return { ...ob, calculated_progress: 0, pending_tasks: 0, pending_docs: 0 };
          }
        })
      );

      setOnboardingList(withDetails);
    } catch (error) {
      console.error("Error loading onboarding:", error);
      setOnboardingList([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pre-Boarding':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Day 1':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Week 1':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'First Month':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center text-gray-500">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'لا يوجد أعضاء في الفريق' : 'No team members found'}</p>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    active: onboardingList.filter(o => o.status !== 'Completed').length,
    atRisk: onboardingList.filter(o => {
      const progress = o.calculated_progress || 0;
      const daysSinceStart = o.start_date ? differenceInDays(new Date(), parseISO(o.start_date)) : 0;
      return daysSinceStart > 7 && progress < 50;
    }).length,
    onTrack: onboardingList.filter(o => {
      const progress = o.calculated_progress || 0;
      return progress >= 50 && o.status !== 'Completed';
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'الإعداد النشط' : 'Active Onboarding'}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.active}</p>
              </div>
              <UserPlus className="w-12 h-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'على المسار الصحيح' : 'On Track'}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.onTrack}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'في خطر' : 'At Risk'}</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.atRisk}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'موظفوك الجدد' : 'Your New Hires'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {onboardingList.map(ob => {
              const progress = ob.calculated_progress || 0;
              const daysSinceStart = ob.start_date 
                ? differenceInDays(new Date(), parseISO(ob.start_date))
                : 0;
              const isAtRisk = daysSinceStart > 7 && progress < 50;

              return (
                <Card key={ob.id} className={`hover:shadow-md transition-shadow ${isAtRisk ? 'border-2 border-red-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          <h4 className="font-semibold text-lg">{ob.employee_name}</h4>
                          <Badge className={getStatusColor(ob.status)}>
                            {ob.status}
                          </Badge>
                          {isAtRisk && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {isRTL ? 'يحتاج اهتمام' : 'Needs Attention'}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {ob.job_title} • {ob.department}
                          </p>
                          <p className="text-xs text-gray-500">
                            {isRTL ? 'البدء: ' : 'Started: '}
                            {ob.start_date && format(parseISO(ob.start_date), 'MMM dd, yyyy')}
                            {daysSinceStart > 0 && ` (${isRTL ? 'اليوم' : 'Day'} ${daysSinceStart})`}
                          </p>
                          
                          <div className="space-y-1 mt-3">
                            <div className={`flex justify-between text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span>{isRTL ? 'التقدم' : 'Progress'}</span>
                              <span className="font-bold">{progress}%</span>
                            </div>
                            <Progress value={progress} className={`h-2 ${isAtRisk ? '[&>div]:bg-red-600' : ''}`} />
                          </div>

                          {(ob.pending_tasks > 0 || ob.pending_docs > 0) && (
                            <div className={`flex gap-3 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {ob.pending_tasks > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {ob.pending_tasks} {isRTL ? 'مهمة معلقة' : 'pending tasks'}
                                </Badge>
                              )}
                              {ob.pending_docs > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {ob.pending_docs} {isRTL ? 'مستند معلق' : 'pending docs'}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedOnboarding(ob)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {onboardingList.length === 0 && (
              <p className="text-center py-12 text-gray-500">
                {isRTL ? 'لا توجد عمليات إعداد نشطة' : 'No active onboarding'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}