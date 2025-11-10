import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";

export default function ESSPerformance({ user }) {
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const employees = await base44.entities.Employee.filter({ work_email: user.email });
    if (employees.length > 0) {
      const emp = employees[0];
      setEmployee(emp);
      
      const [goalsData, reviewsData] = await Promise.all([
        base44.entities.Goal.filter({ owner_id: emp.id }),
        base44.entities.PerformanceReview.filter({ employee_id: emp.id })
      ]);
      setGoals(goalsData);
      setReviews(reviewsData);
    }
    setLoading(false);
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
      {/* Goals */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Target className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'أهدافي' : 'My Goals'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{isRTL ? 'لا توجد أهداف محددة' : 'No goals set yet'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                      <h4 className="font-medium text-gray-900">{goal.goal_name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                    </div>
                    <Badge className={
                      goal.status === "On Track" ? "bg-green-100 text-green-800" :
                      goal.status === "At Risk" ? "bg-yellow-100 text-yellow-800" :
                      goal.status === "Completed" ? "bg-blue-100 text-blue-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-600">{isRTL ? 'التقدم' : 'Progress'}</span>
                      <span className="font-medium">{goal.achievement_percent || 0}%</span>
                    </div>
                    <Progress value={goal.achievement_percent || 0} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'تقييماتي' : 'My Reviews'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{isRTL ? 'لا توجد تقييمات' : 'No reviews yet'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <h4 className="font-medium">{review.review_type} Review</h4>
                      <p className="text-sm text-gray-500">Period: {review.review_period_start} - {review.review_period_end}</p>
                    </div>
                    {review.overall_rating && (
                      <Badge className="bg-green-100 text-green-800">
                        {review.overall_rating}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}