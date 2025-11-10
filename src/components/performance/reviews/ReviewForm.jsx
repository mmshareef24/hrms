import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Save, Sparkles, Loader2 } from "lucide-react";

export default function ReviewForm({ review, employees, goals, competencies, onSave, onCancel }) {
  const [formData, setFormData] = useState(review || {});
  const [employeeGoals, setEmployeeGoals] = useState([]);
  const [generatingComments, setGeneratingComments] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (review?.employee_id) {
      const empGoals = goals.filter(g => g.owner_id === review.employee_id);
      setEmployeeGoals(empGoals);
      
      if (empGoals.length > 0) {
        const avgAchievement = empGoals.reduce((sum, g) => sum + (g.achievement_percent || 0), 0) / empGoals.length;
        setFormData(prev => ({ ...prev, goal_achievement_score: Math.round(avgAchievement) }));
      }
    }
  }, [review, goals]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const generateAIComments = async () => {
    if (!formData.employee_id) {
      alert(isRTL ? 'يرجى اختيار موظف أولاً' : 'Please select an employee first');
      return;
    }

    setGeneratingComments(true);
    try {
      const empGoals = goals.filter(g => g.owner_id === formData.employee_id);
      
      const goalsContext = empGoals.map(g => 
        `- ${g.goal_name}: ${g.achievement_percent}% achieved (Target: ${g.target_value}, Current: ${g.current_value})`
      ).join('\n');

      const prompt = `Generate professional performance review comments for an employee with the following details:

Employee: ${formData.employee_name || ''}
Job Title: ${formData.employee_job_title || ''}
Department: ${formData.employee_department || ''}
Review Period: ${formData.review_period_start || ''} to ${formData.review_period_end || ''}

Goal Achievement:
${goalsContext || 'No goals data available'}

Overall Performance Rating: ${formData.overall_rating || 'Not yet rated'}
${formData.goal_achievement_score ? `Goal Achievement Score: ${formData.goal_achievement_score}%` : ''}
${formData.competency_score ? `Competency Score: ${formData.competency_score}/5` : ''}

Please provide:
1. A summary of strengths (2-3 specific points)
2. Areas for improvement (2-3 constructive points)
3. Key achievements during the review period
4. Development priorities for next period

Keep comments professional, balanced, specific, and actionable. Use both English and Arabic.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            strengths: { type: "string" },
            areas_for_improvement: { type: "string" },
            achievements: { type: "string" },
            development_priorities: { type: "string" },
            reviewer_comments: { type: "string" }
          }
        }
      });

      if (response) {
        setFormData(prev => ({
          ...prev,
          strengths: response.strengths || prev.strengths,
          areas_for_improvement: response.areas_for_improvement || prev.areas_for_improvement,
          achievements: response.achievements || prev.achievements,
          development_priorities: response.development_priorities || prev.development_priorities,
          reviewer_comments: response.reviewer_comments || prev.reviewer_comments
        }));

        alert(isRTL 
          ? 'تم إنشاء التعليقات بنجاح. يرجى المراجعة والتعديل حسب الحاجة.'
          : 'AI comments generated successfully. Please review and adjust as needed.'
        );
      }
    } catch (error) {
      console.error("Error generating AI comments:", error);
      alert(isRTL ? 'حدث خطأ في إنشاء التعليقات' : 'Error generating comments');
    } finally {
      setGeneratingComments(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-5xl mx-auto">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
              {review 
                ? (isRTL ? 'تعديل التقييم' : 'Edit Review')
                : (isRTL ? 'تقييم جديد' : 'New Review')
              }
            </CardTitle>
            {formData.employee_id && (
              <Button
                type="button"
                onClick={generateAIComments}
                disabled={generatingComments}
                variant="outline"
                className={`border-purple-300 text-purple-700 hover:bg-purple-50 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {generatingComments ? (
                  <>
                    <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'جاري الإنشاء...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'إنشاء تعليقات ذكية' : 'Generate AI Comments'}
                  </>
                )}
              </Button>
            )}
          </div>
          {review && (
            <div className={`text-sm text-gray-600 mt-2 ${isRTL ? 'text-right' : ''}`}>
              {review.employee_name} • {review.employee_job_title}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {employeeGoals.length > 0 && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className={`font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'إنجاز الأهداف' : 'Goal Achievement'}
              </h3>
              {employeeGoals.map(goal => (
                <div key={goal.id} className="p-3 bg-white rounded">
                  <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="font-medium text-sm">{goal.goal_name}</span>
                    <Badge className={
                      goal.achievement_percent >= 100 ? "bg-green-100 text-green-800" :
                      goal.achievement_percent >= 70 ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }>
                      {goal.achievement_percent}%
                    </Badge>
                  </div>
                  <Progress value={goal.achievement_percent} className="h-2" />
                </div>
              ))}
              <div className={`flex items-center justify-between mt-3 p-3 bg-green-50 rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-bold">{isRTL ? 'متوسط الإنجاز:' : 'Average Achievement:'}</span>
                <span className="text-2xl font-bold text-green-600">{formData.goal_achievement_score || 0}%</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'نقاط القوة' : 'Strengths'}</Label>
              <Textarea
                value={formData.strengths || ''}
                onChange={(e) => handleChange('strengths', e.target.value)}
                className={`h-24 ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? "ما هي نقاط القوة الرئيسية؟" : "What are the key strengths?"}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'مجالات التحسين' : 'Areas for Improvement'}</Label>
              <Textarea
                value={formData.areas_for_improvement || ''}
                onChange={(e) => handleChange('areas_for_improvement', e.target.value)}
                className={`h-24 ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? "ما المجالات التي تحتاج إلى تطوير؟" : "What areas need development?"}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الإنجازات' : 'Key Achievements'}</Label>
              <Textarea
                value={formData.achievements || ''}
                onChange={(e) => handleChange('achievements', e.target.value)}
                className={`h-24 ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? "أبرز الإنجازات خلال الفترة" : "Highlight key accomplishments during the period"}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'تعليقات المراجع' : 'Reviewer Comments'}</Label>
              <Textarea
                value={formData.reviewer_comments || ''}
                onChange={(e) => handleChange('reviewer_comments', e.target.value)}
                className={`h-32 ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? "تعليقات وملاحظات المدير" : "Manager's comments and observations"}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'أولويات التطوير' : 'Development Priorities'}</Label>
              <Textarea
                value={formData.development_priorities || ''}
                onChange={(e) => handleChange('development_priorities', e.target.value)}
                className={`h-24 ${isRTL ? 'text-right' : ''}`}
                placeholder={isRTL ? "خطة التطوير للفترة القادمة" : "Development plan for next period"}
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-green-50 rounded-lg">
            <h3 className={`font-semibold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'التقييم الإجمالي' : 'Overall Rating'}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'التقييم *' : 'Rating *'}</Label>
                <Select value={formData.overall_rating} onValueChange={(value) => handleChange('overall_rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر التقييم" : "Select rating"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outstanding">{isRTL ? 'ممتاز' : 'Outstanding'}</SelectItem>
                    <SelectItem value="Exceeds Expectations">{isRTL ? 'يتجاوز التوقعات' : 'Exceeds Expectations'}</SelectItem>
                    <SelectItem value="Meets Expectations">{isRTL ? 'يلبي التوقعات' : 'Meets Expectations'}</SelectItem>
                    <SelectItem value="Needs Improvement">{isRTL ? 'يحتاج تحسين' : 'Needs Improvement'}</SelectItem>
                    <SelectItem value="Unsatisfactory">{isRTL ? 'غير مرضي' : 'Unsatisfactory'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الدرجة (1-5)' : 'Score (1-5)'}</Label>
                <Select 
                  value={formData.overall_score?.toString()} 
                  onValueChange={(value) => handleChange('overall_score', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر الدرجة" : "Select score"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - {isRTL ? 'ممتاز' : 'Outstanding'}</SelectItem>
                    <SelectItem value="4">4 - {isRTL ? 'جيد جداً' : 'Very Good'}</SelectItem>
                    <SelectItem value="3">3 - {isRTL ? 'جيد' : 'Good'}</SelectItem>
                    <SelectItem value="2">2 - {isRTL ? 'مقبول' : 'Fair'}</SelectItem>
                    <SelectItem value="1">1 - {isRTL ? 'ضعيف' : 'Poor'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>

        <div className={`flex gap-3 p-6 border-t border-gray-100 bg-gray-50 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'حفظ المراجعة' : 'Save Review'}
          </Button>
        </div>
      </Card>
    </form>
  );
}