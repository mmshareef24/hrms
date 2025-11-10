import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, TrendingUp, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function GoalsList({ goals, selectedLevel, onLevelChange, onEdit, onDelete }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const getStatusColor = (status) => {
    const colors = {
      "Draft": "bg-gray-100 text-gray-800",
      "Active": "bg-blue-100 text-blue-800",
      "On Track": "bg-green-100 text-green-800",
      "At Risk": "bg-yellow-100 text-yellow-800",
      "Off Track": "bg-red-100 text-red-800",
      "Completed": "bg-green-100 text-green-800",
      "Cancelled": "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Low": "bg-blue-100 text-blue-800",
      "Medium": "bg-yellow-100 text-yellow-800",
      "High": "bg-orange-100 text-orange-800",
      "Critical": "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <label className="text-sm font-medium text-gray-700">
          {isRTL ? 'تصفية حسب المستوى:' : 'Filter by Level:'}
        </label>
        <Select value={selectedLevel} onValueChange={onLevelChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'جميع الأهداف' : 'All Goals'}</SelectItem>
            <SelectItem value="Company">{isRTL ? 'أهداف الشركة' : 'Company Goals'}</SelectItem>
            <SelectItem value="Department">{isRTL ? 'أهداف الأقسام' : 'Department Goals'}</SelectItem>
            <SelectItem value="Team">{isRTL ? 'أهداف الفرق' : 'Team Goals'}</SelectItem>
            <SelectItem value="Individual">{isRTL ? 'أهداف فردية' : 'Individual Goals'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'لا توجد أهداف' : 'No goals found'}</p>
          <p className="text-sm mt-2">
            {isRTL ? 'ابدأ بإضافة هدف جديد' : 'Start by adding a new goal'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <Badge variant="outline" className="font-mono text-xs">
                        {goal.goal_type}
                      </Badge>
                      <Badge className={getPriorityColor(goal.priority)}>
                        {goal.priority}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{goal.goal_name}</h3>
                    {goal.goal_name_arabic && (
                      <p className="text-sm text-gray-600 mt-1 font-arabic">{goal.goal_name_arabic}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">{goal.description}</p>
                    <div className={`flex items-center gap-4 mt-3 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Calendar className="w-4 h-4" />
                        {goal.due_date && format(parseISO(goal.due_date), 'MMM dd, yyyy')}
                      </span>
                      <span>|</span>
                      <span>{goal.owner_name}</span>
                    </div>
                  </div>

                  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEdit(goal)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDelete(goal.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {isRTL ? 'التقدم:' : 'Progress:'}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {goal.achievement_percent}%
                    </span>
                  </div>
                  
                  <Progress value={goal.achievement_percent} className="h-3" />

                  <div className={`flex items-center justify-between text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{isRTL ? 'الحالي:' : 'Current:'} {goal.current_value}</span>
                    <span>{isRTL ? 'الهدف:' : 'Target:'} {goal.target_value}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}