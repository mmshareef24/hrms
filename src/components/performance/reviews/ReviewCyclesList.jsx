import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, Play, Calendar, Users } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ReviewCyclesList({ cycles, onEdit, onDelete, onInitiate }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const getStatusColor = (status) => {
    const colors = {
      "Planning": "bg-gray-100 text-gray-800",
      "Self Review": "bg-blue-100 text-blue-800",
      "Manager Review": "bg-purple-100 text-purple-800",
      "Calibration": "bg-yellow-100 text-yellow-800",
      "Completed": "bg-green-100 text-green-800",
      "Closed": "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getCycleTypeColor = (type) => {
    const colors = {
      "Annual": "bg-blue-100 text-blue-800",
      "Semi-Annual": "bg-purple-100 text-purple-800",
      "Quarterly": "bg-orange-100 text-orange-800",
      "Probation": "bg-yellow-100 text-yellow-800",
      "Project End": "bg-green-100 text-green-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      {cycles.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'لا توجد دورات تقييم' : 'No review cycles found'}</p>
          <p className="text-sm mt-2">
            {isRTL ? 'ابدأ بإنشاء دورة تقييم سنوية أو ربع سنوية' : 'Start by creating an annual or quarterly review cycle'}
          </p>
        </Card>
      ) : (
        cycles.map((cycle) => {
          const completionRate = cycle.total_employees > 0 
            ? Math.round((cycle.completed_reviews / cycle.total_employees) * 100) 
            : 0;

          return (
            <Card key={cycle.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <Badge className={getCycleTypeColor(cycle.cycle_type)}>
                        {cycle.cycle_type}
                      </Badge>
                      <Badge className={getStatusColor(cycle.status)}>
                        {cycle.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{cycle.cycle_name}</h3>
                    {cycle.cycle_name_arabic && (
                      <p className="text-sm text-gray-600 mt-1 font-arabic">{cycle.cycle_name_arabic}</p>
                    )}
                  </div>

                  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {cycle.status === "Planning" && (
                      <Button 
                        size="sm" 
                        onClick={() => onInitiate(cycle)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'بدء' : 'Start'}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEdit(cycle)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onDelete(cycle.id)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-gray-500">{isRTL ? 'فترة التقييم' : 'Review Period'}</p>
                    <p className="font-medium">
                      {format(parseISO(cycle.period_start), 'MMM dd, yyyy')} - {format(parseISO(cycle.period_end), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-gray-500">{isRTL ? 'الموعد النهائي' : 'Completion Deadline'}</p>
                    <p className="font-medium">
                      {cycle.completion_deadline && format(parseISO(cycle.completion_deadline), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {cycle.total_employees > 0 && (
                  <div>
                    <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm text-gray-600">
                        {isRTL ? 'التقدم' : 'Progress'}
                      </span>
                      <span className="text-sm font-medium">
                        {cycle.completed_reviews} / {cycle.total_employees} {isRTL ? 'مراجعة' : 'reviews'}
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                )}

                <div className={`flex gap-4 mt-4 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {cycle.include_goals && (
                    <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Badge variant="outline" className="text-xs">{isRTL ? 'الأهداف' : 'Goals'}</Badge>
                    </span>
                  )}
                  {cycle.include_competencies && (
                    <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Badge variant="outline" className="text-xs">{isRTL ? 'الكفاءات' : 'Competencies'}</Badge>
                    </span>
                  )}
                  {cycle.include_360_feedback && (
                    <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Badge variant="outline" className="text-xs">360°</Badge>
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}