import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, CheckCircle, Clock, Users } from "lucide-react";

import PolicyList from "./policy/PolicyList";
import PolicyForm from "./policy/PolicyForm";
import PolicyView from "./policy/PolicyView";
import PolicyAcknowledgments from "./policy/PolicyAcknowledgments";

export default function PolicyCenter() {
  const [showForm, setShowForm] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [acknowledgments, setAcknowledgments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [policiesData, acknowledmentsData, employeesData] = await Promise.all([
        base44.entities.Policy.list('-created_date'),
        base44.entities.PolicyAcknowledgment.list(),
        base44.entities.Employee.list()
      ]);

      setPolicies(policiesData || []);
      setAcknowledgments(acknowledmentsData || []);
      setEmployees(employeesData || []);

      // Get employee record
      const emp = employeesData.find(e => e.work_email === currentUser.email);
      setEmployee(emp);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSave = async (policyData) => {
    try {
      const year = new Date().getFullYear();
      const count = policies.length + 1;
      const policy_code = `POL-${year}-${String(count).padStart(4, '0')}`;

      if (selectedPolicy) {
        await base44.entities.Policy.update(selectedPolicy.id, policyData);
      } else {
        await base44.entities.Policy.create({
          ...policyData,
          policy_code,
          status: "Draft",
          total_acknowledgments: 0,
          pending_acknowledgments: 0
        });
      }

      setShowForm(false);
      setSelectedPolicy(null);
      loadData();
    } catch (error) {
      console.error("Error saving policy:", error);
      alert(isRTL ? "حدث خطأ في الحفظ" : "Error saving policy");
    }
  };

  const handleView = (policy) => {
    setSelectedPolicy(policy);
    setShowForm(false);
  };

  const handleAcknowledge = async (policyId) => {
    try {
      if (!employee) {
        alert(isRTL ? "خطأ: لم يتم العثور على سجل الموظف" : "Error: Employee record not found");
        return;
      }

      const policy = policies.find(p => p.id === policyId);
      
      await base44.entities.PolicyAcknowledgment.create({
        policy_id: policyId,
        policy_name: policy.policy_name,
        policy_version: policy.version,
        employee_id: employee.id,
        employee_name: employee.full_name,
        acknowledged_date: new Date().toISOString().split('T')[0]
      });

      // Update policy stats
      const currentAcks = policy.total_acknowledgments || 0;
      await base44.entities.Policy.update(policyId, {
        total_acknowledgments: currentAcks + 1
      });

      loadData();
      alert(isRTL ? "شكراً لإقرارك باستلام السياسة" : "Thank you for acknowledging the policy");
    } catch (error) {
      console.error("Error acknowledging policy:", error);
      alert(isRTL ? "حدث خطأ في الإقرار" : "Error acknowledging policy");
    }
  };

  const myAcknowledgments = employee 
    ? acknowledgments.filter(a => a.employee_id === employee.id)
    : [];

  const pendingPolicies = policies.filter(p => 
    p.is_active && 
    p.requires_acknowledgment &&
    !myAcknowledgments.some(a => a.policy_id === p.id)
  );

  const stats = {
    total: policies.length,
    active: policies.filter(p => p.is_active).length,
    pending: pendingPolicies.length,
    acknowledged: myAcknowledgments.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {!showForm && !selectedPolicy && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'إجمالي السياسات' : 'Total Policies'}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'نشطة' : 'Active'}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'في انتظار الإقرار' : 'Pending'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'تم الإقرار' : 'Acknowledged'}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.acknowledged}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {showForm ? (
        <PolicyForm
          policyData={selectedPolicy}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setSelectedPolicy(null);
          }}
        />
      ) : selectedPolicy ? (
        <PolicyView
          policy={selectedPolicy}
          hasAcknowledged={myAcknowledgments.some(a => a.policy_id === selectedPolicy.id)}
          onClose={() => setSelectedPolicy(null)}
          onEdit={() => setShowForm(true)}
          onAcknowledge={handleAcknowledge}
        />
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <FileText className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'مركز السياسات' : 'Policy Center'}</span>
              </CardTitle>
              {user.role === 'admin' && (
                <Button 
                  onClick={() => {
                    setSelectedPolicy(null);
                    setShowForm(true);
                  }}
                  className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Plus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'سياسة جديدة' : 'New Policy'}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                <TabsTrigger value="all">{isRTL ? 'جميع السياسات' : 'All Policies'} ({stats.active})</TabsTrigger>
                <TabsTrigger value="pending">{isRTL ? 'تحتاج إقرار' : 'Need Acknowledgment'} ({stats.pending})</TabsTrigger>
                <TabsTrigger value="acknowledged">{isRTL ? 'تم الإقرار' : 'Acknowledged'} ({stats.acknowledged})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <PolicyList
                  policies={policies.filter(p => p.is_active)}
                  myAcknowledgments={myAcknowledgments}
                  onView={handleView}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <PolicyList
                  policies={pendingPolicies}
                  myAcknowledgments={myAcknowledgments}
                  onView={handleView}
                  highlightPending={true}
                />
              </TabsContent>

              <TabsContent value="acknowledged" className="mt-6">
                <PolicyAcknowledgments
                  acknowledgments={myAcknowledgments}
                  policies={policies}
                  onView={(policyId) => {
                    const policy = policies.find(p => p.id === policyId);
                    if (policy) handleView(policy);
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}