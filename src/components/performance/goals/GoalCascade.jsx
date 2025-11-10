import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, Edit, Target } from "lucide-react";

export default function GoalCascade({ goals, employees, onEdit }) {
  const [expanded, setExpanded] = useState({});
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const toggleExpand = (goalId) => {
    setExpanded(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const getChildGoals = (parentId) => {
    return goals.filter(g => g.parent_goal_id === parentId);
  };

  const companyGoals = goals.filter(g => g.goal_type === "Company");

  const GoalNode = ({ goal, level = 0 }) => {
    const childGoals = getChildGoals(goal.id);
    const hasChildren = childGoals.length > 0;
    const isExpanded = expanded[goal.id];

    const getLevelColor = () => {
      const colors = {
        0: "bg-blue-50 border-blue-200",
        1: "bg-purple-50 border-purple-200",
        2: "bg-orange-50 border-orange-200",
        3: "bg-green-50 border-green-200"
      };
      return colors[level] || "bg-gray-50 border-gray-200";
    };

    return (
      <div className={`${level > 0 ? (isRTL ? 'mr-8' : 'ml-8') : ''}`}>
        <Card className={`mb-3 border-2 ${getLevelColor()} hover:shadow-md transition-shadow`}>
          <div className="p-4">
            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {hasChildren && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleExpand(goal.id)}
                  className="p-0 h-6 w-6"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              )}
              
              <div className="flex-1">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <Badge variant="outline" className="font-mono text-xs">
                    {goal.goal_type}
                  </Badge>
                  <Badge className={
                    goal.status === "On Track" ? "bg-green-100 text-green-800" :
                    goal.status === "At Risk" ? "bg-yellow-100 text-yellow-800" :
                    goal.status === "Completed" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }>
                    {goal.status}
                  </Badge>
                  {hasChildren && (
                    <Badge variant="outline">
                      {childGoals.length} {isRTL ? 'هدف فرعي' : 'child goals'}
                    </Badge>
                  )}
                </div>

                <h4 className={`font-bold text-gray-900 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {goal.goal_name}
                </h4>
                {goal.goal_name_arabic && (
                  <p className="text-sm text-gray-600 mb-2 text-right font-arabic">
                    {goal.goal_name_arabic}
                  </p>
                )}
                
                <p className={`text-sm text-gray-600 mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {goal.description}
                </p>

                <div className="space-y-2">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm text-gray-600">
                      {isRTL ? 'التقدم' : 'Progress'}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {goal.achievement_percent}%
                    </span>
                  </div>
                  <Progress value={goal.achievement_percent} className="h-2" />
                </div>

                <div className={`flex items-center gap-4 mt-3 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{goal.owner_name}</span>
                  <span>|</span>
                  <span>{goal.category}</span>
                  <span>|</span>
                  <span>{isRTL ? 'الوزن:' : 'Weight:'} {goal.weight}</span>
                </div>
              </div>

              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onEdit(goal)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {isExpanded && hasChildren && (
          <div>
            {childGoals.map(child => (
              <GoalNode key={child.id} goal={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {companyGoals.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'لا توجد أهداف للشركة' : 'No company goals found'}</p>
          <p className="text-sm mt-2">
            {isRTL ? 'ابدأ بإضافة أهداف على مستوى الشركة' : 'Start by adding company-level goals'}
          </p>
        </Card>
      ) : (
        <div>
          <div className={`mb-6 ${isRTL ? 'text-right' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isRTL ? 'الترتيب الهرمي للأهداف' : 'Goal Hierarchy'}
            </h3>
            <p className="text-sm text-gray-600">
              {isRTL 
                ? 'الأهداف المتتالية من مستوى الشركة إلى الأقسام والفرق والأفراد'
                : 'Cascading goals from Company → Department → Team → Individual'
              }
            </p>
          </div>

          {companyGoals.map(goal => (
            <GoalNode key={goal.id} goal={goal} level={0} />
          ))}
        </div>
      )}
    </div>
  );
}