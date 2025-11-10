import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  User, 
  FileText, 
  CheckSquare, 
  GraduationCap,
  Monitor,
  Calendar,
  Mail,
  Phone
} from "lucide-react";
import { format, parseISO } from "date-fns";

import DocumentTracking from "./DocumentTracking";
import TaskManagement from "./TaskManagement";
import TrainingAssignment from "./TrainingAssignment";
import SystemAccessManagement from "./SystemAccessManagement";

export default function OnboardingDetails({ onboarding, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [systemAccess, setSystemAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (onboarding) {
      loadOnboardingData();
    }
  }, [onboarding]);

  const loadOnboardingData = async () => {
    setLoading(true);
    try {
      const [taskData, docData, trainingData, accessData] = await Promise.all([
        base44.entities.OnboardingTask.filter({ onboarding_id: onboarding.id }),
        base44.entities.OnboardingDocument.filter({ onboarding_id: onboarding.id }),
        base44.entities.OnboardingTraining.filter({ onboarding_id: onboarding.id }),
        base44.entities.SystemAccess.filter({ onboarding_id: onboarding.id })
      ]);

      setTasks(taskData || []);
      setDocuments(docData || []);
      setTrainings(trainingData || []);
      setSystemAccess(accessData || []);
    } catch (error) {
      console.error("Error loading onboarding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const totalItems = tasks.length + documents.length + trainings.length + systemAccess.length;
    if (totalItems === 0) return 0;

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const completedDocs = documents.filter(d => d.status === 'Approved').length;
    const completedTrainings = trainings.filter(t => t.status === 'Completed').length;
    const completedAccess = systemAccess.filter(a => a.status === 'Completed').length;

    const total = completedTasks + completedDocs + completedTrainings + completedAccess;
    return Math.round((total / totalItems) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={onBack}
        className={`${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {isRTL ? 'رجوع' : 'Back'}
      </Button>

      {/* Header Card */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className={isRTL ? 'text-right' : ''}>
              <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{onboarding.employee_name}</h2>
                  <p className="text-gray-600">{onboarding.job_title}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <strong>{isRTL ? 'القسم:' : 'Department:'}</strong> {onboarding.department}
                </p>
                <p className="text-gray-600">
                  <strong>{isRTL ? 'تاريخ البدء:' : 'Start Date:'}</strong>{' '}
                  {onboarding.start_date && format(parseISO(onboarding.start_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-600">
                  <strong>{isRTL ? 'المدير:' : 'Manager:'}</strong> {onboarding.hiring_manager_name || '-'}
                </p>
                <p className="text-gray-600">
                  <strong>{isRTL ? 'الزميل:' : 'Buddy:'}</strong> {onboarding.buddy_name || '-'}
                </p>
              </div>
            </div>

            <div className={isRTL ? 'text-right' : ''}>
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <Badge className={
                  onboarding.status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }>
                  {onboarding.status}
                </Badge>
                <Badge variant="outline">
                  {onboarding.onboarding_type}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className={`flex justify-between text-sm mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-gray-600">{isRTL ? 'التقدم الإجمالي' : 'Overall Progress'}</span>
                    <span className="font-bold text-blue-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">{isRTL ? 'المهام' : 'Tasks'}</p>
                    <p className="text-lg font-bold">
                      {tasks.filter(t => t.status === 'Completed').length}/{tasks.length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">{isRTL ? 'المستندات' : 'Documents'}</p>
                    <p className="text-lg font-bold">
                      {documents.filter(d => d.status === 'Approved').length}/{documents.length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">{isRTL ? 'التدريب' : 'Training'}</p>
                    <p className="text-lg font-bold">
                      {trainings.filter(t => t.status === 'Completed').length}/{trainings.length}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">{isRTL ? 'الأنظمة' : 'Systems'}</p>
                    <p className="text-lg font-bold">
                      {systemAccess.filter(a => a.status === 'Completed').length}/{systemAccess.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <CheckSquare className="w-4 h-4 mr-2" />
            {isRTL ? 'المهام' : 'Tasks'}
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            {isRTL ? 'المستندات' : 'Documents'}
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <GraduationCap className="w-4 h-4 mr-2" />
            {isRTL ? 'التدريب' : 'Training'}
          </TabsTrigger>
          <TabsTrigger value="systems" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Monitor className="w-4 h-4 mr-2" />
            {isRTL ? 'الأنظمة' : 'Systems'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TaskManagement 
            onboardingId={onboarding.id}
            employeeId={onboarding.employee_id}
            employeeName={onboarding.employee_name}
            onUpdate={loadOnboardingData}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentTracking 
            onboardingId={onboarding.id}
            employeeId={onboarding.employee_id}
            employeeName={onboarding.employee_name}
            onUpdate={loadOnboardingData}
          />
        </TabsContent>

        <TabsContent value="training">
          <TrainingAssignment 
            onboardingId={onboarding.id}
            employeeId={onboarding.employee_id}
            employeeName={onboarding.employee_name}
            onUpdate={loadOnboardingData}
          />
        </TabsContent>

        <TabsContent value="systems">
          <SystemAccessManagement 
            onboardingId={onboarding.id}
            employeeId={onboarding.employee_id}
            employeeName={onboarding.employee_name}
            onUpdate={loadOnboardingData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}