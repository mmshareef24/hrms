import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PERMISSIONS, getUserRole, hasPermission, sendNotification } from "@/utils";

import OnboardingDashboard from "../components/onboarding/OnboardingDashboard";
import OnboardingList from "../components/onboarding/OnboardingList";
import OnboardingForm from "../components/onboarding/OnboardingForm";
import OnboardingDetails from "../components/onboarding/OnboardingDetails";

export default function Onboarding() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const employees = await base44.entities.Employee.filter({ work_email: userData.email });
      const emp = employees.length > 0 ? employees[0] : null;
      
      const role = getUserRole(userData, emp);
      setUserRole(role);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOnboarding = async (onboardingData) => {
    try {
      if (selectedOnboarding && selectedOnboarding.id) {
        await base44.entities.OnboardingChecklist.update(selectedOnboarding.id, onboardingData);
      } else {
        const newOnboarding = await base44.entities.OnboardingChecklist.create({
          ...onboardingData,
          overall_progress_percent: 0,
          documents_progress: 0,
          training_progress: 0,
          system_access_progress: 0,
          equipment_progress: 0
        });

        await createDefaultTasks(newOnboarding.id, onboardingData.employee_id, onboardingData.employee_name);
        await createDefaultDocuments(newOnboarding.id, onboardingData.employee_id, onboardingData.employee_name);

        await sendNotification({
          employeeId: onboardingData.employee_id || user.email,
          employeeName: onboardingData.employee_name,
          type: 'System Alert',
          title: 'Welcome to the Team!',
          titleAr: 'مرحباً بك في الفريق!',
          message: `Your onboarding has been initiated. Please complete all required tasks and documents.`,
          messageAr: `تم بدء عملية إعدادك. يرجى إكمال جميع المهام والمستندات المطلوبة.`,
          priority: 'High',
          actionUrl: '/ess?tab=onboarding'
        });
      }

      setShowForm(false);
      setSelectedOnboarding(null);
      setActiveTab('list');
    } catch (error) {
      console.error("Error saving onboarding:", error);
      throw error;
    }
  };

  const createDefaultTasks = async (onboardingId, employeeId, employeeName) => {
    const defaultTasks = [
      {
        task_name: 'Complete Employee Information Form',
        task_name_arabic: 'إكمال نموذج معلومات الموظف',
        task_category: 'Employee',
        assigned_to_role: 'Employee',
        priority: 'High',
        sequence: 1,
        estimated_hours: 0.5
      },
      {
        task_name: 'Review and Sign Employment Contract',
        task_name_arabic: 'مراجعة وتوقيع عقد العمل',
        task_category: 'HR',
        assigned_to_role: 'Employee',
        priority: 'Critical',
        sequence: 2,
        estimated_hours: 1
      },
      {
        task_name: 'Complete Benefits Enrollment',
        task_name_arabic: 'إكمال تسجيل المزايا',
        task_category: 'HR',
        assigned_to_role: 'Employee',
        priority: 'High',
        sequence: 3,
        estimated_hours: 0.5
      },
      {
        task_name: 'IT Equipment Setup',
        task_name_arabic: 'إعداد معدات تقنية المعلومات',
        task_category: 'IT',
        assigned_to_role: 'IT',
        priority: 'High',
        sequence: 4,
        estimated_hours: 2
      },
      {
        task_name: 'Workplace Orientation',
        task_name_arabic: 'جولة في مكان العمل',
        task_category: 'Manager',
        assigned_to_role: 'Manager',
        priority: 'Medium',
        sequence: 5,
        estimated_hours: 1
      }
    ];

    await Promise.all(
      defaultTasks.map(task =>
        base44.entities.OnboardingTask.create({
          onboarding_id: onboardingId,
          employee_id: employeeId,
          employee_name: employeeName,
          status: 'Not Started',
          ...task
        })
      )
    );
  };

  const createDefaultDocuments = async (onboardingId, employeeId, employeeName) => {
    const defaultDocuments = [
      { document_type: 'National ID/Iqama', document_name: 'National ID/Iqama Copy', is_mandatory: true },
      { document_type: 'Passport', document_name: 'Passport Copy', is_mandatory: true },
      { document_type: 'Educational Certificates', document_name: 'Educational Certificates', is_mandatory: true },
      { document_type: 'Bank Details', document_name: 'Bank Account Details', is_mandatory: true },
      { document_type: 'Emergency Contact Form', document_name: 'Emergency Contact Form', is_mandatory: true },
      { document_type: 'Photo', document_name: 'Passport Size Photo', is_mandatory: true }
    ];

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await Promise.all(
      defaultDocuments.map(doc =>
        base44.entities.OnboardingDocument.create({
          onboarding_id: onboardingId,
          employee_id: employeeId,
          employee_name: employeeName,
          status: 'Pending',
          due_date: dueDate.toISOString().split('T')[0],
          reminder_sent_count: 0,
          ...doc
        })
      )
    );
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (selectedOnboarding) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <OnboardingDetails 
            onboarding={selectedOnboarding} 
            onBack={() => setSelectedOnboarding(null)}
          />
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <OnboardingForm
            onboarding={null}
            onSave={handleSaveOnboarding}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  const canManageOnboarding = hasPermission(userRole, PERMISSIONS.MANAGE_ONBOARDING);

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`mb-8 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'إعداد الموظفين' : 'Employee Onboarding'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isRTL ? 'إدارة عملية إعداد الموظفين الجدد' : 'Manage new hire onboarding process'}
            </p>
          </div>
          {canManageOnboarding && activeTab === 'list' && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-600 to-green-700"
            >
              <UserPlus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'موظف جديد' : 'New Hire'}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              {isRTL ? 'لوحة التحكم' : 'Dashboard'}
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              {isRTL ? 'القائمة' : 'List'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <OnboardingDashboard onViewDetails={setSelectedOnboarding} />
          </TabsContent>

          <TabsContent value="list">
            <OnboardingList onViewDetails={setSelectedOnboarding} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}