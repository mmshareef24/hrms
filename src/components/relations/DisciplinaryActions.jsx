import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, FileWarning, Ban, TrendingDown } from "lucide-react";

import DisciplinaryActionList from "./disciplinary/DisciplinaryActionList";
import DisciplinaryActionForm from "./disciplinary/DisciplinaryActionForm";
import DisciplinaryActionDetails from "./disciplinary/DisciplinaryActionDetails";

export default function DisciplinaryActions() {
  const [showForm, setShowForm] = useState(false);
  const [actions, setActions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cases, setCases] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [actionsData, employeesData, casesData] = await Promise.all([
        base44.entities.DisciplinaryAction.list('-created_date', 200),
        base44.entities.Employee.list(),
        base44.entities.EmployeeCase.list()
      ]);

      setActions(actionsData || []);
      setEmployees(employeesData || []);
      setCases(casesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSave = async (actionData) => {
    try {
      const year = new Date().getFullYear();
      const count = actions.length + 1;
      const action_number = `DA-${year}-${String(count).padStart(5, '0')}`;

      if (selectedAction) {
        await base44.entities.DisciplinaryAction.update(selectedAction.id, actionData);
      } else {
        await base44.entities.DisciplinaryAction.create({
          ...actionData,
          action_number,
          action_date: new Date().toISOString().split('T')[0],
          status: "Active",
          issued_by_id: user.email,
          issued_by_name: user.full_name
        });
      }

      setShowForm(false);
      setSelectedAction(null);
      loadData();
    } catch (error) {
      console.error("Error saving action:", error);
      alert(isRTL ? "حدث خطأ في الحفظ" : "Error saving action");
    }
  };

  const handleView = (action) => {
    setSelectedAction(action);
    setShowForm(false);
  };

  const handleAcknowledge = async (actionId) => {
    try {
      await base44.entities.DisciplinaryAction.update(actionId, {
        acknowledged_by_employee: true,
        acknowledgment_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error("Error acknowledging action:", error);
    }
  };

  const stats = {
    total: actions.length,
    active: actions.filter(a => a.status === "Active").length,
    verbal: actions.filter(a => a.action_type === "Verbal Warning").length,
    written: actions.filter(a => a.action_type === "Written Warning").length,
    final: actions.filter(a => a.action_type === "Final Warning").length,
    suspension: actions.filter(a => a.action_type?.includes("Suspension")).length,
    termination: actions.filter(a => a.action_type === "Termination").length,
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
      {!showForm && !selectedAction && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'نشطة' : 'Active'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'إنذار شفهي' : 'Verbal'}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.verbal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'إنذار كتابي' : 'Written'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.written}</p>
                </div>
                <FileWarning className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'إنذار أخير' : 'Final'}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.final}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'إيقاف' : 'Suspension'}</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.suspension}</p>
                </div>
                <Ban className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'فصل' : 'Termination'}</p>
                  <p className="text-2xl font-bold text-red-700">{stats.termination}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-700" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {showForm ? (
        <DisciplinaryActionForm
          actionData={selectedAction}
          employees={employees}
          cases={cases}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setSelectedAction(null);
          }}
        />
      ) : selectedAction ? (
        <DisciplinaryActionDetails
          actionData={selectedAction}
          employees={employees}
          onClose={() => setSelectedAction(null)}
          onEdit={() => setShowForm(true)}
          onAcknowledge={handleAcknowledge}
        />
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <AlertTriangle className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'الإجراءات التأديبية' : 'Disciplinary Actions'}</span>
              </CardTitle>
              <Button 
                onClick={() => {
                  setSelectedAction(null);
                  setShowForm(true);
                }}
                className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إجراء جديد' : 'New Action'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="active">{isRTL ? 'نشطة' : 'Active'} ({stats.active})</TabsTrigger>
                <TabsTrigger value="warnings">{isRTL ? 'إنذارات' : 'Warnings'} ({stats.verbal + stats.written + stats.final})</TabsTrigger>
                <TabsTrigger value="suspensions">{isRTL ? 'إيقافات' : 'Suspensions'} ({stats.suspension})</TabsTrigger>
                <TabsTrigger value="all">{isRTL ? 'الكل' : 'All'} ({stats.total})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                <DisciplinaryActionList
                  actions={actions.filter(a => a.status === "Active")}
                  employees={employees}
                  onView={handleView}
                />
              </TabsContent>

              <TabsContent value="warnings" className="mt-6">
                <DisciplinaryActionList
                  actions={actions.filter(a => 
                    a.action_type === "Verbal Warning" || 
                    a.action_type === "Written Warning" || 
                    a.action_type === "Final Warning"
                  )}
                  employees={employees}
                  onView={handleView}
                />
              </TabsContent>

              <TabsContent value="suspensions" className="mt-6">
                <DisciplinaryActionList
                  actions={actions.filter(a => a.action_type?.includes("Suspension"))}
                  employees={employees}
                  onView={handleView}
                />
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                <DisciplinaryActionList
                  actions={actions}
                  employees={employees}
                  onView={handleView}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}