
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Progress } from "@/components/ui/progress";
import OnboardingForm from "./OnboardingForm";
import OnboardingDetails from "./OnboardingDetails";

export default function OnboardingList() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    setLoading(true);
    const data = await base44.entities.OnboardingChecklist.list('-created_date');
    setChecklists(data || []);
    setLoading(false);
  };

  const handleSave = async (data) => {
    try {
      if (editingChecklist) {
        await base44.entities.OnboardingChecklist.update(editingChecklist.id, data);
      } else {
        await base44.entities.OnboardingChecklist.create(data);
      }
      setShowForm(false);
      setEditingChecklist(null);
      loadChecklists();
    } catch (error) {
      console.error("Error saving onboarding:", error);
      alert(isRTL ? "حدث خطأ في الحفظ" : "Error saving onboarding");
    }
  };

  const handleViewDetails = (checklist) => {
    setSelectedChecklist(checklist);
    setShowDetails(true);
  };

  const autoGenerateOnboardingPlan = async (checklistId) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    if (!confirm(isRTL 
      ? `هل تريد إنشاء خطة إعداد كاملة تلقائياً لـ ${checklist.employee_name}؟`
      : `Auto-generate a complete onboarding plan for ${checklist.employee_name}?`
    )) {
      return;
    }

    setLoading(true);
    try {
      // Generate tasks using AI
      const taskPrompt = `Generate comprehensive onboarding tasks for:
Role: ${checklist.job_title}
Department: ${checklist.department}
Type: ${checklist.onboarding_type}

Provide 15-20 tasks covering HR, IT, Facilities, Training, and Manager activities.`;

      const taskResponse = await base44.integrations.Core.InvokeLLM({
        prompt: taskPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task_name: { type: "string" },
                  task_category: { type: "string" },
                  description: { type: "string" },
                  assigned_to_role: { type: "string" },
                  priority: { type: "string" },
                  days_from_start: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Generate documents list
      const docPrompt = `List required documents for onboarding a ${checklist.job_title} in ${checklist.department}.`;
      
      const docResponse = await base44.integrations.Core.InvokeLLM({
        prompt: docPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            documents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  document_type: { type: "string" },
                  document_name: { type: "string" },
                  is_mandatory: { type: "boolean" },
                  days_due: { type: "number" }
                }
              }
            }
          }
        }
      });

      // Create tasks
      if (taskResponse?.tasks) {
        const startDate = new Date(checklist.start_date);
        for (const task of taskResponse.tasks) {
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + (task.days_from_start || 0));
          
          await base44.entities.OnboardingTask.create({
            onboarding_id: checklist.id,
            employee_id: checklist.employee_id || "",
            employee_name: checklist.employee_name,
            task_name: task.task_name,
            task_category: task.task_category,
            description: task.description,
            assigned_to_role: task.assigned_to_role,
            priority: task.priority,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'Not Started'
          });
        }
      }

      // Create documents
      if (docResponse?.documents) {
        const startDate = new Date(checklist.start_date);
        for (const doc of docResponse.documents) {
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + (doc.days_due || 7));
          
          await base44.entities.OnboardingDocument.create({
            onboarding_id: checklist.id,
            employee_id: checklist.employee_id || "",
            employee_name: checklist.employee_name,
            document_type: doc.document_type,
            document_name: doc.document_name,
            is_mandatory: doc.is_mandatory !== false,
            due_date: dueDate.toISOString().split('T')[0],
            status: 'Pending'
          });
        }
      }

      alert(isRTL 
        ? 'تم إنشاء خطة الإعداد الكاملة بنجاح!'
        : 'Complete onboarding plan generated successfully!'
      );
      
    } catch (error) {
      console.error("Error auto-generating plan:", error);
      alert(isRTL ? 'حدث خطأ في الإنشاء التلقائي' : 'Error auto-generating plan');
    } finally {
      setLoading(false);
      loadChecklists(); // Refresh the list to show new tasks/docs if necessary
    }
  };

  if (showForm) {
    return (
      <OnboardingForm
        checklist={editingChecklist}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingChecklist(null);
        }}
      />
    );
  }

  if (showDetails && selectedChecklist) {
    return (
      <OnboardingDetails
        checklist={selectedChecklist}
        onBack={() => {
          setShowDetails(false);
          setSelectedChecklist(null);
        }}
        onRefresh={loadChecklists}
      />
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'Pre-Boarding': 'bg-blue-100 text-blue-800',
      'Day 1': 'bg-green-100 text-green-800',
      'Week 1': 'bg-yellow-100 text-yellow-800',
      'First Month': 'bg-orange-100 text-orange-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'On Hold': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-red-50 to-red-100">
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'قائمة الموظفين الجدد' : 'New Employee Onboarding'}
          </CardTitle>
          <Button 
            onClick={() => {
              setEditingChecklist(null);
              setShowForm(true);
            }}
            className={`bg-gradient-to-r from-[#B11116] to-[#991014] ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة موظف جديد' : 'Add New Hire'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الوظيفة' : 'Position'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ البداية' : 'Start Date'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التقدم' : 'Progress'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B11116] mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : checklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {isRTL ? 'لا يوجد موظفين جدد' : 'No onboarding records'}
                  </TableCell>
                </TableRow>
              ) : (
                checklists.map((checklist) => (
                  <TableRow key={checklist.id} className="hover:bg-gray-50">
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      <p className="font-medium text-gray-900">{checklist.employee_name}</p>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      <p className="text-sm text-gray-900">{checklist.job_title}</p>
                      <p className="text-xs text-gray-500">{checklist.department}</p>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      {checklist.start_date && format(parseISO(checklist.start_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(checklist.status)}>
                        {checklist.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Progress value={checklist.overall_progress_percent || 0} className="h-2 flex-1" />
                          <span className="text-sm text-gray-600 w-12">{checklist.overall_progress_percent || 0}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(checklist)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {checklist.overall_progress_percent === 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => autoGenerateOnboardingPlan(checklist.id)}
                            className="text-purple-600"
                            title={isRTL ? "إنشاء خطة تلقائياً" : "Auto-generate plan"}
                          >
                            <Sparkles className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
