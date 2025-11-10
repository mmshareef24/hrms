import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Settings, 
  GitBranch,
  Bell,
  Save,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LeaveWorkflowConfig() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const wfDefinitions = await base44.entities.WorkflowDefinition.filter({
        workflow_type: "Leave Request",
        is_active: true
      });

      if (wfDefinitions.length > 0) {
        setWorkflows(wfDefinitions);
        setSelectedWorkflow(wfDefinitions[0]);
      } else {
        // Create default workflow if none exists
        await createDefaultWorkflow();
      }
    } catch (error) {
      console.error("Error loading workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultWorkflow = async () => {
    try {
      const defaultWorkflow = await base44.entities.WorkflowDefinition.create({
        workflow_code: "LEAVE_DEFAULT",
        workflow_name: "Default Leave Approval",
        workflow_name_arabic: "موافقة الإجازة الافتراضية",
        workflow_type: "Leave Request",
        description: "Standard two-level approval: Manager then HR",
        is_active: true,
        sla_hours: 48,
        escalation_enabled: true,
        escalation_after_hours: 72,
        vacation_delegation_enabled: true,
        steps: JSON.stringify([
          {
            step_number: 1,
            step_name: "Manager Approval",
            step_name_arabic: "موافقة المدير",
            approver_type: "Direct Manager",
            is_mandatory: true,
            sla_hours: 24,
            send_notification: true
          },
          {
            step_number: 2,
            step_name: "HR Approval",
            step_name_arabic: "موافقة الموارد البشرية",
            approver_type: "HR",
            is_mandatory: true,
            sla_hours: 24,
            send_notification: true
          }
        ])
      });

      setWorkflows([defaultWorkflow]);
      setSelectedWorkflow(defaultWorkflow);
    } catch (error) {
      console.error("Error creating default workflow:", error);
    }
  };

  const parseSteps = (workflow) => {
    try {
      return JSON.parse(workflow?.steps || '[]');
    } catch {
      return [];
    }
  };

  const handleAddStep = () => {
    if (!selectedWorkflow) return;
    
    const steps = parseSteps(selectedWorkflow);
    const newStep = {
      step_number: steps.length + 1,
      step_name: `Approval Step ${steps.length + 1}`,
      step_name_arabic: `خطوة الموافقة ${steps.length + 1}`,
      approver_type: "Direct Manager",
      is_mandatory: true,
      sla_hours: 24,
      send_notification: true
    };

    const updatedSteps = [...steps, newStep];
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: JSON.stringify(updatedSteps)
    });
    setEditMode(true);
  };

  const handleRemoveStep = (stepNumber) => {
    if (!selectedWorkflow) return;
    
    const steps = parseSteps(selectedWorkflow);
    const updatedSteps = steps
      .filter(s => s.step_number !== stepNumber)
      .map((s, idx) => ({ ...s, step_number: idx + 1 }));

    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: JSON.stringify(updatedSteps)
    });
    setEditMode(true);
  };

  const handleMoveStep = (stepNumber, direction) => {
    if (!selectedWorkflow) return;
    
    const steps = parseSteps(selectedWorkflow);
    const index = steps.findIndex(s => s.step_number === stepNumber);
    
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    // Renumber steps
    updatedSteps.forEach((s, idx) => {
      s.step_number = idx + 1;
    });

    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: JSON.stringify(updatedSteps)
    });
    setEditMode(true);
  };

  const handleStepChange = (stepNumber, field, value) => {
    if (!selectedWorkflow) return;
    
    const steps = parseSteps(selectedWorkflow);
    const updatedSteps = steps.map(s => 
      s.step_number === stepNumber ? { ...s, [field]: value } : s
    );

    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: JSON.stringify(updatedSteps)
    });
    setEditMode(true);
  };

  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow) return;

    setSaving(true);
    try {
      await base44.entities.WorkflowDefinition.update(selectedWorkflow.id, {
        ...selectedWorkflow,
        escalation_enabled: Boolean(selectedWorkflow.escalation_enabled),
        vacation_delegation_enabled: Boolean(selectedWorkflow.vacation_delegation_enabled)
      });

      setEditMode(false);
      await loadWorkflows();
      
      alert(isRTL 
        ? "تم حفظ إعدادات سير العمل بنجاح" 
        : "Workflow settings saved successfully");
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert(isRTL 
        ? "حدث خطأ في حفظ الإعدادات" 
        : "Error saving workflow settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const steps = selectedWorkflow ? parseSteps(selectedWorkflow) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <GitBranch className="w-6 h-6 text-green-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <CardTitle className="text-xl">
                  {isRTL ? 'إعدادات سير عمل الموافقات' : 'Approval Workflow Configuration'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTL 
                    ? 'قم بتكوين خطوات الموافقة متعددة المستويات للطلبات' 
                    : 'Configure multi-level approval steps for leave requests'}
                </p>
              </div>
            </div>
            {editMode && (
              <Button 
                onClick={handleSaveWorkflow}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Settings */}
      {selectedWorkflow && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Settings className="w-5 h-5 text-green-600" />
              <span>{isRTL ? 'الإعدادات العامة' : 'General Settings'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'اسم سير العمل' : 'Workflow Name'}
                </Label>
                <Input
                  value={selectedWorkflow.workflow_name}
                  onChange={(e) => {
                    setSelectedWorkflow({...selectedWorkflow, workflow_name: e.target.value});
                    setEditMode(true);
                  }}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
              
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'المهلة الزمنية (ساعات)' : 'Overall SLA (hours)'}
                </Label>
                <Input
                  type="number"
                  value={selectedWorkflow.sla_hours}
                  onChange={(e) => {
                    setSelectedWorkflow({...selectedWorkflow, sla_hours: parseInt(e.target.value)});
                    setEditMode(true);
                  }}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            </div>

            <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <Label className="text-base font-medium">
                  {isRTL ? 'تفعيل التصعيد التلقائي' : 'Enable Auto-Escalation'}
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTL 
                    ? 'تصعيد الطلبات المعلقة بعد فترة زمنية محددة' 
                    : 'Escalate pending requests after specified time'}
                </p>
              </div>
              <Switch
                checked={selectedWorkflow.escalation_enabled}
                onCheckedChange={(checked) => {
                  setSelectedWorkflow({...selectedWorkflow, escalation_enabled: checked});
                  setEditMode(true);
                }}
              />
            </div>

            {selectedWorkflow.escalation_enabled && (
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'التصعيد بعد (ساعات)' : 'Escalate After (hours)'}
                </Label>
                <Input
                  type="number"
                  value={selectedWorkflow.escalation_after_hours}
                  onChange={(e) => {
                    setSelectedWorkflow({...selectedWorkflow, escalation_after_hours: parseInt(e.target.value)});
                    setEditMode(true);
                  }}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            )}

            <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <Label className="text-base font-medium">
                  {isRTL ? 'تفويض الإجازات' : 'Vacation Delegation'}
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTL 
                    ? 'السماح بتفويض الموافقات أثناء إجازة المدير' 
                    : 'Allow delegation during manager\'s vacation'}
                </p>
              </div>
              <Switch
                checked={selectedWorkflow.vacation_delegation_enabled}
                onCheckedChange={(checked) => {
                  setSelectedWorkflow({...selectedWorkflow, vacation_delegation_enabled: checked});
                  setEditMode(true);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Steps */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <GitBranch className="w-5 h-5 text-green-600" />
              <span>{isRTL ? 'خطوات الموافقة' : 'Approval Steps'}</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {steps.length} {isRTL ? 'خطوة' : 'step(s)'}
              </Badge>
            </CardTitle>
            <Button onClick={handleAddStep} size="sm" variant="outline">
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إضافة خطوة' : 'Add Step'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {steps.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isRTL 
                  ? 'لم يتم تكوين خطوات موافقة. انقر على "إضافة خطوة" لبدء الإعداد.' 
                  : 'No approval steps configured. Click "Add Step" to get started.'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card key={step.step_number} className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Step Header */}
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                            {step.step_number}
                          </Badge>
                          <Input
                            value={step.step_name}
                            onChange={(e) => handleStepChange(step.step_number, 'step_name', e.target.value)}
                            className={`font-medium ${isRTL ? 'text-right' : ''}`}
                          />
                        </div>
                        
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveStep(step.step_number, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveStep(step.step_number, 'down')}
                            disabled={index === steps.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveStep(step.step_number)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Step Configuration */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                            {isRTL ? 'نوع الموافق' : 'Approver Type'}
                          </Label>
                          <Select
                            value={step.approver_type}
                            onValueChange={(value) => handleStepChange(step.step_number, 'approver_type', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Direct Manager">
                                {isRTL ? 'المدير المباشر' : 'Direct Manager'}
                              </SelectItem>
                              <SelectItem value="Department Head">
                                {isRTL ? 'رئيس القسم' : 'Department Head'}
                              </SelectItem>
                              <SelectItem value="HR">
                                {isRTL ? 'الموارد البشرية' : 'HR'}
                              </SelectItem>
                              <SelectItem value="Finance">
                                {isRTL ? 'المالية' : 'Finance'}
                              </SelectItem>
                              <SelectItem value="Specific User">
                                {isRTL ? 'مستخدم محدد' : 'Specific User'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className={`text-sm ${isRTL ? 'text-right block' : ''}`}>
                            {isRTL ? 'المهلة (ساعات)' : 'SLA (hours)'}
                          </Label>
                          <Input
                            type="number"
                            value={step.sla_hours}
                            onChange={(e) => handleStepChange(step.step_number, 'sla_hours', parseInt(e.target.value))}
                            className={`mt-1 ${isRTL ? 'text-right' : ''}`}
                          />
                        </div>

                        <div className="flex items-end">
                          <div className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Switch
                              checked={step.is_mandatory}
                              onCheckedChange={(checked) => handleStepChange(step.step_number, 'is_mandatory', checked)}
                            />
                            <Label className="text-sm cursor-pointer">
                              {isRTL ? 'إلزامي' : 'Mandatory'}
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Notification Settings */}
                      <div className={`flex items-center gap-3 p-3 bg-blue-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Bell className="w-5 h-5 text-blue-600" />
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Switch
                            checked={step.send_notification}
                            onCheckedChange={(checked) => handleStepChange(step.step_number, 'send_notification', checked)}
                          />
                          <Label className="text-sm">
                            {isRTL ? 'إرسال إشعار عند الوصول لهذه الخطوة' : 'Send notification when reaching this step'}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Diagram */}
      {steps.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'مخطط سير العمل' : 'Workflow Diagram'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-4">
                {steps.map((step, index) => (
                  <React.Fragment key={step.step_number}>
                    <div className="flex flex-col items-center min-w-[180px]">
                      <div className="w-full p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg text-center">
                        <Badge className="bg-green-600 text-white mb-2">
                          {isRTL ? 'الخطوة' : 'Step'} {step.step_number}
                        </Badge>
                        <p className="font-medium text-gray-900 text-sm">{step.step_name}</p>
                        <p className="text-xs text-gray-600 mt-1">{step.approver_type}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {step.sla_hours}h SLA
                        </Badge>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex items-center">
                        <div className={`w-12 h-0.5 bg-green-400 ${isRTL ? 'transform rotate-180' : ''}`} />
                        <div className={`w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent ${isRTL ? 'border-r-4 border-r-green-400' : 'border-l-4 border-l-green-400'}`} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}