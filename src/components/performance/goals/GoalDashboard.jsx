import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, AlertTriangle, CheckCircle, Edit } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function GoalDashboard({ goals, stats, onEdit }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const statusData = [
    { name: isRTL ? 'على المسار' : 'On Track', value: stats.onTrack, color: '#10b981' },
    { name: isRTL ? 'معرض للخطر' : 'At Risk', value: stats.atRisk, color: '#f59e0b' },
    { name: isRTL ? 'مكتمل' : 'Completed', value: stats.completed, color: '#3b82f6' }
  ];

  const typeData = [
    { name: isRTL ? 'الشركة' : 'Company', value: stats.company, color: '#3b82f6' },
    { name: isRTL ? 'القسم' : 'Department', value: stats.department, color: '#8b5cf6' },
    { name: isRTL ? 'الفريق' : 'Team', value: stats.team, color: '#f97316' },
    { name: isRTL ? 'فردي' : 'Individual', value: stats.individual, color: '#10b981' }
  ];

  const topGoals = goals
    .filter(g => g.status !== "Completed" && g.status !== "Cancelled")
    .sort((a, b) => {
      if (a.priority === "Critical" && b.priority !== "Critical") return -1;
      if (a.priority !== "Critical" && b.priority === "Critical") return 1;
      if (a.priority === "High" && b.priority !== "High") return -1;
      if (a.priority !== "High" && b.priority === "High") return 1;
      return b.achievement_percent - a.achievement_percent;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'حالة الأهداف' : 'Goal Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'الأهداف حسب النوع' : 'Goals by Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Priority Goals */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Target className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'الأهداف ذات الأولوية العالية' : 'Top Priority Goals'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topGoals.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              {isRTL ? 'لا توجد أهداف نشطة' : 'No active goals'}
            </p>
          ) : (
            <div className="space-y-4">
              {topGoals.map((goal) => (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <Badge variant="outline" className="text-xs">
                          {goal.goal_type}
                        </Badge>
                        <Badge className={
                          goal.priority === "Critical" ? "bg-red-100 text-red-800" :
                          goal.priority === "High" ? "bg-orange-100 text-orange-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {goal.priority}
                        </Badge>
                        <Badge className={
                          goal.status === "On Track" ? "bg-green-100 text-green-800" :
                          goal.status === "At Risk" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {goal.status}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-gray-900">{goal.goal_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{goal.owner_name}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onEdit(goal)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-600">{isRTL ? 'التقدم' : 'Progress'}</span>
                      <span className="font-bold text-green-600">{goal.achievement_percent}%</span>
                    </div>
                    <Progress value={goal.achievement_percent} className="h-2" />
                    <div className={`flex items-center justify-between text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{isRTL ? 'الحالي:' : 'Current:'} {goal.current_value}</span>
                      <span>{isRTL ? 'الهدف:' : 'Target:'} {goal.target_value}</span>
                    </div>
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