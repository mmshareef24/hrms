
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  Clock, 
  Upload, 
  FileText,
  GraduationCap,
  Monitor,
  CheckSquare,
  AlertCircle,
  User,
  Calendar
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { sendNotification } from "@/utils";

export default function ESSOnboarding({ user }) {
  const [onboarding, setOnboarding] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [systemAccess, setSystemAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (user && user.email) {
      loadOnboarding();
    }
  }, [user]);

  const loadOnboarding = async () => {
    setLoading(true);
    try {
      // Find employee
      const employees = await base44.entities.Employee.filter({ work_email: user.email });
      if (employees.length === 0) {
        setLoading(false);
        return;
      }

      const employee = employees[0];

      // Find onboarding record
      const onboardingList = await base44.entities.OnboardingChecklist.filter({ 
        employee_id: employee.id 
      });

      if (onboardingList.length > 0) {
        const ob = onboardingList[0];
        setOnboarding(ob);

        // Load all onboarding items
        const [taskData, docData, trainingData, accessData] = await Promise.all([
          base44.entities.OnboardingTask.filter({ onboarding_id: ob.id }, 'sequence'),
          base44.entities.OnboardingDocument.filter({ onboarding_id: ob.id }),
          base44.entities.OnboardingTraining.filter({ onboarding_id: ob.id }),
          base44.entities.SystemAccess.filter({ onboarding_id: ob.id })
        ]);

        setTasks(taskData || []);
        setDocuments(docData || []);
        setTrainings(trainingData || []);
        setSystemAccess(accessData || []);
      }
    } catch (error) {
      console.error("Error loading onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentId, file) => {
    setUploadingDoc(documentId);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.OnboardingDocument.update(documentId, {
        file_url: file_url,
        status: 'Submitted',
        submitted_date: new Date().toISOString().split('T')[0]
      });

      // Notify HR
      await sendNotification({
        employeeId: 'hr@company.com',
        employeeName: 'HR Team',
        type: 'System Alert',
        title: 'Document Submitted',
        titleAr: 'تم تقديم مستند',
        message: `${onboarding.employee_name} has submitted ${documents.find(d => d.id === documentId)?.document_name}`,
        messageAr: `قدم ${onboarding.employee_name} ${documents.find(d => d.id === documentId)?.document_name}`,
        priority: 'Medium'
      });

      await loadOnboarding();
    } catch (error) {
      console.error("Error uploading document:", error);
      alert(isRTL ? 'حدث خطأ في رفع المستند' : 'Error uploading document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      await base44.entities.OnboardingTask.update(taskId, {
        status: 'Completed',
        completed_date: new Date().toISOString().split('T')[0],
        completed_by: user.full_name
      });

      await loadOnboarding();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">
            {isRTL ? 'لا توجد عملية إعداد نشطة' : 'No active onboarding found'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {isRTL ? 'يرجى التواصل مع قسم الموارد البشرية' : 'Please contact HR'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalProgress = onboarding.overall_progress_percent || 0; // Ensure a default value for progress
  const daysSinceStart = onboarding.start_date 
    ? differenceInDays(new Date(), parseISO(onboarding.start_date))
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <h2 className="text-2xl font-bold text-gray-900">
                {isRTL ? 'مرحباً بك!' : 'Welcome!'} {onboarding.employee_name}
              </h2>
              <p className="text-gray-600">{onboarding.job_title} • {onboarding.department}</p>
              <div className={`flex items-center gap-4 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Badge className="bg-blue-100 text-blue-800">
                  {isRTL ? `اليوم ${daysSinceStart}` : `Day ${daysSinceStart}`}
                </Badge>
                <Badge className={
                  onboarding.status === 'Completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }>
                  {onboarding.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="font-medium">{isRTL ? 'التقدم الإجمالي' : 'Overall Progress'}</span>
              <span className="font-bold text-blue-600">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-3" />
            
            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className={`text-center p-2 bg-white rounded-lg ${isRTL ? 'text-right' : ''}`}>
                <p className="text-xs text-gray-500">{isRTL ? 'المهام' : 'Tasks'}</p>
                <p className="text-sm font-bold">
                  {tasks.filter(t => t.status === 'Completed').length}/{tasks.length}
                </p>
              </div>
              <div className={`text-center p-2 bg-white rounded-lg ${isRTL ? 'text-right' : ''}`}>
                <p className="text-xs text-gray-500">{isRTL ? 'المستندات' : 'Documents'}</p>
                <p className="text-sm font-bold">
                  {documents.filter(d => d.status === 'Approved' || d.status === 'Submitted').length}/{documents.length}
                </p>
              </div>
              <div className={`text-center p-2 bg-white rounded-lg ${isRTL ? 'text-right' : ''}`}>
                <p className="text-xs text-gray-500">{isRTL ? 'التدريب' : 'Training'}</p>
                <p className="text-sm font-bold">
                  {trainings.filter(t => t.status === 'Completed').length}/{trainings.length}
                </p>
              </div>
              <div className={`text-center p-2 bg-white rounded-lg ${isRTL ? 'text-right' : ''}`}>
                <p className="text-xs text-gray-500">{isRTL ? 'الأنظمة' : 'Systems'}</p>
                <p className="text-sm font-bold">
                  {systemAccess.filter(a => a.status === 'Completed').length}/{systemAccess.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Documents */}
      {documents.filter(d => d.status === 'Pending' && d.is_mandatory).length > 0 && (
        <Card className="shadow-lg border-orange-200">
          <CardHeader className="bg-orange-50 border-b">
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span>{isRTL ? 'مستندات مطلوبة' : 'Required Documents'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {documents.filter(d => d.status === 'Pending' && d.is_mandatory).map(doc => (
                <div key={doc.id} className="p-4 bg-white border rounded-lg">
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <FileText className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold">{isRTL ? doc.document_name_arabic || doc.document_name : doc.document_name}</h4>
                        {doc.is_mandatory && (
                          <Badge className="bg-red-100 text-red-800">
                            {isRTL ? 'إلزامي' : 'Required'}
                          </Badge>
                        )}
                      </div>
                      {doc.due_date && (
                        <p className="text-xs text-gray-500 mb-2">
                          {isRTL ? 'المطلوب بحلول: ' : 'Due by: '}
                          {format(parseISO(doc.due_date), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className={isRTL ? 'ml-4' : 'mr-4'}>
                      <Input
                        type="file"
                        id={`doc-${doc.id}`}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleDocumentUpload(doc.id, e.target.files[0]);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => document.getElementById(`doc-${doc.id}`).click()}
                        disabled={uploadingDoc === doc.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {uploadingDoc === doc.id 
                          ? (isRTL ? 'جاري الرفع...' : 'Uploading...') 
                          : (isRTL ? 'رفع' : 'Upload')
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CheckSquare className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'مهامك' : 'Your Tasks'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {tasks.filter(t => t.assigned_to_role === 'Employee').map(task => {
              const isCompleted = task.status === 'Completed';
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

              return (
                <div 
                  key={task.id}
                  className={`p-4 border rounded-lg ${
                    isCompleted ? 'bg-green-50 border-green-200' : 
                    isOverdue ? 'bg-red-50 border-red-200' : 'bg-white'
                  }`}
                >
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => !isCompleted && handleTaskComplete(task.id)}
                      className="mt-1"
                    />
                    <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                      <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {isRTL ? task.task_name_arabic || task.task_name : task.task_name}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className={`flex items-center gap-4 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {task.due_date && (
                          <Badge variant="outline" className={isOverdue ? 'border-red-300 text-red-700' : ''}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(parseISO(task.due_date), 'MMM dd')}
                          </Badge>
                        )}
                        <Badge className={
                          task.priority === 'High' ? 'bg-red-100 text-red-800' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>
              );
            })}
            {tasks.filter(t => t.assigned_to_role === 'Employee').length === 0 && (
              <p className="text-center py-8 text-gray-500">
                {isRTL ? 'لا توجد مهام معينة لك' : 'No tasks assigned to you'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training & System Access Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span>{isRTL ? 'التدريب' : 'Training'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {trainings.map(training => (
                <div key={training.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="font-medium text-sm">{training.training_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {training.duration_hours}h • {training.delivery_method}
                      </p>
                    </div>
                    <Badge className={
                      training.status === 'Completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {training.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {trainings.length === 0 && (
                <p className="text-center py-4 text-gray-500 text-sm">
                  {isRTL ? 'لا يوجد تدريب مطلوب' : 'No training required'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 border-b">
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Monitor className="w-5 h-5 text-teal-600" />
              <span>{isRTL ? 'الوصول للأنظمة' : 'System Access'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {systemAccess.map(access => (
                <div key={access.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="font-medium text-sm">{access.system_name}</p>
                      {access.username && (
                        <p className="text-xs text-gray-500 mt-1">
                          {isRTL ? 'اسم المستخدم: ' : 'Username: '}{access.username}
                        </p>
                      )}
                    </div>
                    <Badge className={
                      access.status === 'Completed' 
                        ? 'bg-green-100 text-green-800'
                        : access.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {access.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {systemAccess.length === 0 && (
                <p className="text-center py-4 text-gray-500 text-sm">
                  {isRTL ? 'لا يوجد وصول للأنظمة مطلوب' : 'No system access required'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-6">
          <h3 className={`font-semibold mb-4 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'معلومات الاتصال' : 'Contact Information'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {onboarding.hiring_manager_name && (
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User className="w-5 h-5 text-gray-400" />
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-gray-500">{isRTL ? 'المدير' : 'Manager'}</p>
                  <p className="font-medium">{onboarding.hiring_manager_name}</p>
                </div>
              </div>
            )}
            {onboarding.buddy_name && (
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User className="w-5 h-5 text-gray-400" />
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-xs text-gray-500">{isRTL ? 'الزميل المرشد' : 'Buddy'}</p>
                  <p className="font-medium">{onboarding.buddy_name}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
