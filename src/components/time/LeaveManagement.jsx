
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission, filterDataByRole, PERMISSIONS } from "@/utils";
import ProtectedRoute from "../common/ProtectedRoute";

import LeaveRequestList from "../leave/LeaveRequestList";
import LeaveRequestForm from "../leave/LeaveRequestForm";
import LeaveBalances from "../leave/LeaveBalances";
import LeaveTypes from "../leave/LeaveTypes";
import LeaveCalendar from "../leave/LeaveCalendar";
import LeaveAccrualManagement from "../leave/LeaveAccrualManagement";

export default function LeaveManagement({ userRole, employee }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const [currentUser, setCurrentUser] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadUser();
    loadData();
  }, [userRole, employee]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [leaveData, empData, typesData] = await Promise.all([
        base44.entities.LeaveRequest.list("-created_date"),
        base44.entities.Employee.list(),
        base44.entities.LeaveType.list("leave_type_name")
      ]);
      
      // Filter data based on role
      const filteredLeaves = filterDataByRole(
        leaveData || [],
        userRole,
        employee?.id,
        'request'
      );
      
      const filteredEmployees = filterDataByRole(
        empData || [],
        userRole,
        employee?.id,
        'employee'
      );
      
      setLeaveRequests(filteredLeaves);
      setEmployees(filteredEmployees);
      setLeaveTypes(typesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setLeaveRequests([]);
      setEmployees([]);
      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowConfig = async () => {
    try {
      const workflows = await base44.entities.WorkflowDefinition.filter({
        workflow_type: "Leave Request",
        is_active: true
      });
      return workflows.length > 0 ? workflows[0] : null;
    } catch (error) {
      console.error("Error loading workflow config:", error);
      return null;
    }
  };

  const getWorkflowSteps = (workflow) => {
    try {
      return JSON.parse(workflow?.steps || '[]');
    } catch {
      return [];
    }
  };

  const sendNotificationEmail = async (to, subject, body) => {
    try {
      await base44.integrations.Core.SendEmail({
        to: to,
        subject: subject,
        body: body
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const sendNotificationToApprover = async (request, step, emp) => {
    try {
      let approverEmail = null;
      let approverName = null;
      let approverId = null;

      // Determine approver based on step configuration
      if (step.approver_type === "Direct Manager") {
        const manager = employees.find(e => e.id === emp?.manager_id);
        approverEmail = manager?.work_email;
        approverName = manager?.full_name;
        approverId = manager?.id;
      } else if (step.approver_type === "HR") {
        // Find HR users
        const hrUsers = employees.filter(e => e.job_title?.toLowerCase().includes('hr'));
        if (hrUsers.length > 0) {
          approverEmail = hrUsers[0].work_email;
          approverName = hrUsers[0].full_name;
          approverId = hrUsers[0].id;
        }
      } else if (step.approver_type === "Department Head") {
        // Find department head
        const deptHead = employees.find(e => 
          e.department === emp?.department && 
          e.job_title?.toLowerCase().includes('head')
        );
        approverEmail = deptHead?.work_email;
        approverName = deptHead?.full_name;
        approverId = deptHead?.id;
      }

      if (approverEmail && step.send_notification) {
        await base44.integrations.Core.SendEmail({
          to: approverEmail,
          subject: `Leave Request Pending Your Approval - ${emp?.full_name}`,
          body: `A leave request is pending your approval at Step ${step.step_number}: ${step.step_name}\n\n` +
            `Employee: ${emp?.full_name}\n` +
            `Leave Type: ${request.leave_type_name}\n` +
            `Duration: ${request.start_date} to ${request.end_date} (${request.days_count} days)\n` +
            `Reason: ${request.reason || 'N/A'}\n\n` +
            `SLA: ${step.sla_hours} hours\n\n` +
            `Please review and approve/reject this request in the system.`
        });

        // Create in-app notification
        await base44.entities.Notification.create({
          employee_id: approverId || approverEmail, // Using ID if available, otherwise email as a unique identifier
          employee_name: approverName,
          notification_type: "Leave Approval",
          title: "Leave Request Pending Approval",
          title_arabic: "طلب إجازة في انتظار الموافقة",
          message: `Leave request from ${emp?.full_name} awaits your approval`,
          message_arabic: `طلب إجازة من ${emp?.full_name} في انتظار موافقتك`,
          priority: "High",
          channels: JSON.stringify(['in-app', 'email']),
          sent_date: new Date().toISOString(),
          read: false,
          action_url: "/timemanagement?tab=leaves"
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleSave = async (requestData) => {
    try {
      let savedRequest;
      
      if (editingRequest && editingRequest.id) {
        await base44.entities.LeaveRequest.update(editingRequest.id, requestData);
        savedRequest = { ...editingRequest, ...requestData };
      } else {
        // New request - initialize workflow
        const emp = employees.find(e => e.id === requestData.employee_id);
        const workflow = await getWorkflowConfig();
        const steps = workflow ? getWorkflowSteps(workflow) : [];
        
        if (steps.length === 0) {
          // No workflow configured - use default legacy approval
          const workflowData = {
            ...requestData,
            status: "Pending Manager Approval",
            approval_level: 1,
            current_approver_role: "Manager",
            manager_id: emp?.manager_id || "",
            manager_name: emp?.manager_name || ""
          };
          
          savedRequest = await base44.entities.LeaveRequest.create(workflowData);
          
          // Send notification to manager (legacy)
          if (emp?.manager_id) {
            const managerEmployee = employees.find(e => e.id === emp.manager_id);
            if (managerEmployee?.work_email) {
              await sendNotificationEmail(
                managerEmployee.work_email,
                `New Leave Request - ${emp.full_name}`,
                `A new leave request has been submitted by ${emp.full_name}.\n\n` +
                `Leave Type: ${requestData.leave_type_name}\n` +
                `Duration: ${requestData.start_date} to ${requestData.end_date} (${requestData.days_count} days)\n` +
                `Reason: ${requestData.reason || 'N/A'}\n\n` +
                `Please review and approve/reject this request in the system.`
              );
            }
          }
        } else {
          // Use configured workflow
          const firstStep = steps[0];
          const workflowData = {
            ...requestData,
            status: "Pending", // Status is "Pending" for workflow, until final approval
            approval_level: 1, // First step
            current_approver_role: firstStep.approver_type,
            workflow_id: workflow.id, // Link to workflow definition
            manager_id: emp?.manager_id || "",
            manager_name: emp?.manager_name || ""
          };
          
          savedRequest = await base44.entities.LeaveRequest.create(workflowData);
          
          // Create workflow instance
          await base44.entities.WorkflowInstance.create({
            workflow_id: workflow.id,
            workflow_name: workflow.workflow_name,
            entity_type: "LeaveRequest",
            entity_id: savedRequest.id,
            requester_id: requestData.employee_id,
            requester_name: emp?.full_name, // Use emp?.full_name for requester_name
            current_step: 1,
            status: "In Progress",
            started_date: new Date().toISOString().split('T')[0],
            sla_deadline: new Date(Date.now() + firstStep.sla_hours * 60 * 60 * 1000).toISOString()
          });
          
          // Send notification for first step
          await sendNotificationToApprover(savedRequest, firstStep, emp);
        }
      }
      
      setShowForm(false);
      setEditingRequest(null);
      await loadData();
    } catch (error) {
      console.error("Error saving leave request:", error);
      alert(isRTL ? "حدث خطأ في حفظ الطلب" : "Error saving leave request");
      throw error;
    }
  };

  const handleApprove = async (requestId, approverType, comments) => {
    try {
      if (!requestId) {
        console.error("No request ID provided");
        return;
      }
      
      const request = leaveRequests.find(r => r.id === requestId);
      if (!request) return;
      
      const emp = employees.find(e => e.id === request.employee_id);
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Get workflow configuration
      const workflow = await getWorkflowConfig();
      const steps = workflow ? getWorkflowSteps(workflow) : [];
      
      if (steps.length === 0 || !request.workflow_id) {
        // Legacy approval (no workflow or request not linked to workflow)
        let updateData = {};
        
        if (approverType === 'manager') {
          updateData = {
            status: "Pending HR Approval",
            approval_level: 2,
            current_approver_role: "HR",
            manager_approved_by: currentUser?.full_name || currentUser?.email,
            manager_approved_date: currentDate,
            manager_comments: comments || ""
          };
          
          // Send HR notification (legacy)
          const hrUsers = employees.filter(e => e.job_title?.toLowerCase().includes('hr'));
          for (const hrUser of hrUsers) {
            if (hrUser.work_email) {
              await sendNotificationEmail(
                hrUser.work_email,
                `Leave Request Pending HR Approval - ${emp?.full_name}`,
                `A leave request has been approved by the manager and is now pending your approval.\n\n` +
                `Employee: ${emp?.full_name}\n` +
                `Leave Type: ${request.leave_type_name}\n` +
                `Duration: ${request.start_date} to ${request.end_date} (${request.days_count} days)\n` +
                `Manager Comments: ${comments || 'None'}\n\n` +
                `Please review and approve/reject this request in the system.`
              );
            }
          }
          
        } else if (approverType === 'hr') {
          updateData = {
            status: "Approved",
            approval_level: 3,
            hr_approved_by: currentUser?.full_name || currentUser?.email,
            hr_approved_date: currentDate,
            hr_comments: comments || "",
            final_approved_by: currentUser?.full_name || currentUser?.email,
            final_approved_date: currentDate
          };
          
          // Send employee notification (legacy)
          if (emp?.work_email) {
            await sendNotificationEmail(
              emp.work_email,
              `Leave Request Approved`,
              `Good news! Your leave request has been approved.\n\n` +
              `Leave Type: ${request.leave_type_name}\n` +
              `Duration: ${request.start_date} to ${request.end_date} (${request.days_count} days)\n` +
              `HR Comments: ${comments || 'None'}\n\n` +
              `Your leave has been recorded in the system.`
            );
          }
        }
        
        await base44.entities.LeaveRequest.update(requestId, updateData);
        
      } else {
        // Workflow-based approval
        const currentStepIndex = (request.approval_level || 1) - 1; // 0-indexed
        const currentStepConfig = steps[currentStepIndex];

        // Record approval action
        await base44.entities.ApprovalAction.create({
          workflow_instance_id: request.workflow_id, // This is the workflow DEFINITION ID
          entity_id: requestId, // Link to the specific leave request
          step_number: currentStepIndex + 1,
          step_name: currentStepConfig?.step_name || `Step ${currentStepIndex + 1}`,
          approver_id: currentUser?.email, // Using email as approver ID for now
          approver_name: currentUser?.full_name || currentUser?.email,
          action: "Approved",
          action_date: currentDate,
          comments: comments || ""
        });
        
        const nextStep = currentStepIndex + 2; // Next step number (1-indexed)
        
        if (nextStep > steps.length) {
          // Final approval
          await base44.entities.LeaveRequest.update(requestId, {
            status: "Approved",
            approval_level: nextStep,
            final_approved_by: currentUser?.full_name || currentUser?.email,
            final_approved_date: currentDate
          });
          
          // Update workflow instance
          const workflowInstance = await base44.entities.WorkflowInstance.filter({
              workflow_id: request.workflow_id,
              entity_id: requestId
          });
          if (workflowInstance.length > 0) {
            await base44.entities.WorkflowInstance.update(workflowInstance[0].id, {
              status: "Approved",
              completed_date: currentDate,
              current_step: currentStepIndex + 1 // Set to the last completed step
            });
          }
          
          // Notify employee of final approval
          if (emp?.work_email) {
            await sendNotificationEmail(
              emp.work_email,
              `Leave Request Approved`,
              `Good news! Your leave request has been fully approved.\n\n` +
                `Leave Type: ${request.leave_type_name}\n` +
                `Duration: ${request.start_date} to ${request.end_date} (${request.days_count} days)\n\n` +
                `Your leave has been recorded in the system.`
            );
          }
        } else {
          // Move to next step
          const nextStepConfig = steps[nextStep - 1];
          await base44.entities.LeaveRequest.update(requestId, {
            status: "Pending", // Status remains "Pending" until final approval
            approval_level: nextStep,
            current_approver_role: nextStepConfig.approver_type
          });
          
          // Update workflow instance
          const workflowInstance = await base44.entities.WorkflowInstance.filter({
              workflow_id: request.workflow_id,
              entity_id: requestId
          });
          if (workflowInstance.length > 0) {
              await base44.entities.WorkflowInstance.update(workflowInstance[0].id, {
                  current_step: nextStep,
                  status: "In Progress",
                  sla_deadline: new Date(Date.now() + nextStepConfig.sla_hours * 60 * 60 * 1000).toISOString()
              });
          }
          
          // Send notification for next step
          await sendNotificationToApprover(request, nextStepConfig, emp);
        }
      }
      
      await loadData();
      
    } catch (error) {
      console.error("Error approving leave request:", error);
      alert(isRTL ? "حدث خطأ في الموافقة" : "Error approving request");
    }
  };

  const handleReject = async (requestId, approverType, reason) => {
    try {
      if (!requestId) {
        console.error("No request ID provided");
        return;
      }
      
      const request = leaveRequests.find(r => r.id === requestId);
      if (!request) return;
      
      const emp = employees.find(e => e.id === request.employee_id);
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Handle workflow rejection
      const workflow = await getWorkflowConfig();
      const steps = workflow ? getWorkflowSteps(workflow) : [];

      if (request.workflow_id && steps.length > 0) {
        const currentStepIndex = (request.approval_level || 1) - 1; // 0-indexed
        const currentStepConfig = steps[currentStepIndex];

        // Record rejection action
        await base44.entities.ApprovalAction.create({
          workflow_instance_id: request.workflow_id,
          entity_id: requestId,
          step_number: currentStepIndex + 1,
          step_name: currentStepConfig?.step_name || `Step ${currentStepIndex + 1}`,
          approver_id: currentUser?.email,
          approver_name: currentUser?.full_name || currentUser?.email,
          action: "Rejected",
          action_date: currentDate,
          comments: reason || ""
        });

        // Update workflow instance
        const workflowInstance = await base44.entities.WorkflowInstance.filter({
          workflow_id: request.workflow_id,
          entity_id: requestId
        });
        if (workflowInstance.length > 0) {
          await base44.entities.WorkflowInstance.update(workflowInstance[0].id, {
            status: "Rejected",
            completed_date: currentDate,
            current_step: currentStepIndex + 1
          });
        }
      }

      // Update leave request status
      const updateData = {
        status: "Rejected",
        rejection_reason: reason,
        rejected_by: currentUser?.full_name || currentUser?.email,
        rejected_at_stage: approverType === 'manager' ? 'Manager' : 'HR',
        rejection_date: currentDate
      };
      
      await base44.entities.LeaveRequest.update(requestId, updateData);
      
      // Notify employee of rejection
      if (emp?.work_email) {
        await sendNotificationEmail(
          emp.work_email,
          `Leave Request Rejected`,
          `Your leave request has been rejected.\n\n` +
          `Leave Type: ${request.leave_type_name}\n` +
          `Duration: ${request.start_date} to ${request.end_date} (${request.days_count} days)\n` +
          `Rejected by: ${approverType === 'manager' ? 'Manager' : 'HR'}\n` +
          `Reason: ${reason}\n\n` +
          `Please contact your manager or HR if you have any questions.`
        );
      }
      
      await loadData();
      
    } catch (error) {
      console.error("Error rejecting leave request:", error);
      alert(isRTL ? "حدث خطأ في الرفض" : "Error rejecting request");
    }
  };

  const handleEdit = (request) => {
    if (request && request.id) {
      setEditingRequest(request);
      setShowForm(true);
    }
  };

  const canManageLeaveTypes = hasPermission(userRole, PERMISSIONS.MANAGE_LEAVE_TYPES);
  const canViewAllBalances = hasPermission(userRole, PERMISSIONS.VIEW_ALL_LEAVES);

  return (
    <div>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'إدارة الإجازات' : 'Leave Management'}
          </h2>
          <p className="text-gray-500 mt-1">
            {isRTL ? 'إدارة طلبات الإجازات والأرصدة' : 'Manage leave requests and balances'}
          </p>
        </div>
        {activeTab === "requests" && (
          <Button 
            onClick={() => {
              setEditingRequest(null);
              setShowForm(true);
            }}
            className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className={`w-5 h-5 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
            {isRTL ? 'طلب إجازة' : 'New Leave Request'}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="requests" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? 'الطلبات' : 'Requests'}
          </TabsTrigger>
          <TabsTrigger value="balances" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? 'الأرصدة' : 'Balances'}
          </TabsTrigger>
          {canManageLeaveTypes && (
            <TabsTrigger value="types" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              {isRTL ? 'الأنواع' : 'Types'}
            </TabsTrigger>
          )}
          {canManageLeaveTypes && (
            <TabsTrigger value="accruals" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              {isRTL ? 'الاستحقاقات' : 'Accruals'}
            </TabsTrigger>
          )}
          <TabsTrigger value="calendar" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? 'التقويم' : 'Calendar'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          {showForm ? (
            <LeaveRequestForm
              request={editingRequest}
              employees={employees}
              leaveTypes={leaveTypes}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingRequest(null);
              }}
            />
          ) : (
            <LeaveRequestList
              requests={leaveRequests}
              loading={loading}
              onEdit={handleEdit}
              onApprove={handleApprove}
              onReject={handleReject}
              currentUser={currentUser}
              userRole={userRole}
            />
          )}
        </TabsContent>

        <TabsContent value="balances">
          <LeaveBalances 
            employees={canViewAllBalances ? employees : employees.filter(e => e.id === employee?.id)} 
            leaveTypes={leaveTypes}
            userRole={userRole}
          />
        </TabsContent>

        {canManageLeaveTypes && (
          <TabsContent value="types">
            <ProtectedRoute hasAccess={canManageLeaveTypes}>
              <LeaveTypes />
            </ProtectedRoute>
          </TabsContent>
        )}

        {canManageLeaveTypes && (
          <TabsContent value="accruals">
            <ProtectedRoute hasAccess={canManageLeaveTypes}>
              <LeaveAccrualManagement />
            </ProtectedRoute>
          </TabsContent>
        )}

        <TabsContent value="calendar">
          <LeaveCalendar 
            requests={leaveRequests.filter(r => r && r.status === "Approved")} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
