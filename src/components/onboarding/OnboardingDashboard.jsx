import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function OnboardingDashboard({ onViewDetails }) {
  const [stats, setStats] = useState({
    total: 0,
    preboarding: 0,
    day1: 0,
    week1: 0,
    firstMonth: 0,
    completed: 0,
    atRisk: 0
  });
  const [recentOnboarding, setRecentOnboarding] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const onboardingList = await base44.entities.OnboardingChecklist.list('-start_date', 50);
      
      const statusCounts = {
        total: onboardingList.length,
        preboarding: onboardingList.filter(o => o.status === 'Pre-Boarding').length,
        day1: onboardingList.filter(o => o.status === 'Day 1').length,
        week1: onboardingList.filter(o => o.status === 'Week 1').length,
        firstMonth: onboardingList.filter(o => o.status === 'First Month').length,
        completed: onboardingList.filter(o => o.status === 'Completed').length,
        atRisk: onboardingList.filter(o => {
          const progress = o.overall_progress_percent || 0;
          const daysSinceStart = o.start_date ? differenceInDays(new Date(), parseISO(o.start_date)) : 0;
          return daysSinceStart > 7 && progress < 50;
        }).length
      };
      
      setStats(statusCounts);
      setRecentOnboarding(onboardingList.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setRecentOnboarding([]);
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

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-gray-600">{isRTL ? 'الإجمالي' : 'Total'}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <UserPlus className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-xs text-gray-600">{isRTL ? 'ما قبل التوظيف' : 'Pre-Boarding'}</p>
              <p className="text-2xl font-bold text-purple-600">{stats.preboarding}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
          <CardContent className="p-4">
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-xs text-gray-600">{isRTL ? 'اليوم الأول' : 'Day 1'}</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.day1}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-xs text-gray-600">{isRTL ? 'الأسبوع الأول' : 'Week 1'}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.week1}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-xs text-gray-600">{isRTL ? 'الشهر الأول' : 'First Month'}</p>
              <p className="text-2xl font-bold text-orange-600">{stats.firstMonth}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-xs text-gray-600">{isRTL ? 'مكتمل' : 'Completed'}</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-xs text-gray-600">{isRTL ? 'في خطر' : 'At Risk'}</p>
                <p className="text-2xl font-bold text-red-600">{stats.atRisk}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Onboarding */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'الموظفون الجدد الأخيرون' : 'Recent New Hires'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {recentOnboarding.map((onboarding) => {
              const progress = onboarding.overall_progress_percent || 0;
              const daysSinceStart = onboarding.start_date 
                ? differenceInDays(new Date(), parseISO(onboarding.start_date))
                : 0;
              const isAtRisk = daysSinceStart > 7 && progress < 50;

              return (
                <div 
                  key={onboarding.id}
                  className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                    isAtRisk ? 'border-2 border-red-200' : ''
                  }`}
                  onClick={() => onViewDetails && onViewDetails(onboarding)}
                >
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <h4 className="font-semibold text-gray-900">{onboarding.employee_name}</h4>
                        <Badge className={getStatusColor(onboarding.status)}>
                          {onboarding.status}
                        </Badge>
                        {isAtRisk && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {isRTL ? 'في خطر' : 'At Risk'}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          {onboarding.job_title} • {onboarding.department}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isRTL ? 'تاريخ البدء: ' : 'Start Date: '}
                          {onboarding.start_date && format(parseISO(onboarding.start_date), 'MMM dd, yyyy')}
                          {daysSinceStart > 0 && ` (${daysSinceStart} ${isRTL ? 'يوم' : 'days ago'})`}
                        </p>
                        <div className="mt-2">
                          <div className={`flex justify-between text-xs text-gray-600 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span>{isRTL ? 'التقدم الإجمالي' : 'Overall Progress'}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                isAtRisk ? 'bg-red-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails && onViewDetails(onboarding);
                      }}
                    >
                      {isRTL ? 'عرض' : 'View'}
                    </Button>
                  </div>
                </div>
              );
            })}
            {recentOnboarding.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                {isRTL ? 'لا توجد عمليات إعداد حديثة' : 'No recent onboarding'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}