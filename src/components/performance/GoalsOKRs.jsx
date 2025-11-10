import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Plus, TrendingUp, Users, Building2 } from "lucide-react";

import GoalsList from "./goals/GoalsList";
import GoalForm from "./goals/GoalForm";
import GoalCascade from "./goals/GoalCascade";
import GoalDashboard from "./goals/GoalDashboard";

export default function GoalsOKRs() {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [goalsData, employeesData] = await Promise.all([
        base44.entities.Goal.list('-created_date'),
        base44.entities.Employee.list()
      ]);

      setGoals(goalsData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSave = async (goalData) => {
    try {
      if (editingGoal) {
        await base44.entities.Goal.update(editingGoal.id, goalData);
      } else {
        await base44.entities.Goal.create(goalData);
      }
      setShowForm(false);
      setEditingGoal(null);
      loadData();
    } catch (error) {
      console.error("Error saving goal:", error);
      alert(isRTL ? "حدث خطأ في الحفظ" : "Error saving goal");
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = async (goalId) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف الهدف؟" : "Are you sure you want to delete this goal?")) {
      try {
        await base44.entities.Goal.delete(goalId);
        loadData();
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  const filteredGoals = selectedLevel === "all" 
    ? goals 
    : goals.filter(g => g.goal_type === selectedLevel);

  const stats = {
    total: goals.length,
    company: goals.filter(g => g.goal_type === "Company").length,
    department: goals.filter(g => g.goal_type === "Department").length,
    team: goals.filter(g => g.goal_type === "Team").length,
    individual: goals.filter(g => g.goal_type === "Individual").length,
    onTrack: goals.filter(g => g.status === "On Track").length,
    atRisk: goals.filter(g => g.status === "At Risk").length,
    completed: goals.filter(g => g.status === "Completed").length,
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
      {!showForm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedLevel("Company")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'أهداف الشركة' : 'Company Goals'}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.company}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedLevel("Department")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'أهداف الأقسام' : 'Department Goals'}</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.department}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedLevel("Team")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'أهداف الفرق' : 'Team Goals'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.team}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedLevel("Individual")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'أهداف فردية' : 'Individual Goals'}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.individual}</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {showForm ? (
        <GoalForm
          goal={editingGoal}
          goals={goals}
          employees={employees}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
        />
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Target className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'الأهداف و OKRs' : 'Goals & OKRs'}</span>
              </CardTitle>
              <Button 
                onClick={() => {
                  setEditingGoal(null);
                  setShowForm(true);
                }}
                className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إضافة هدف' : 'Add Goal'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="dashboard" className={isRTL ? 'flex-row-reverse' : ''}>
                  <TrendingUp className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'لوحة المعلومات' : 'Dashboard'}
                </TabsTrigger>
                <TabsTrigger value="list" className={isRTL ? 'flex-row-reverse' : ''}>
                  <Target className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'قائمة الأهداف' : 'Goals List'}
                </TabsTrigger>
                <TabsTrigger value="cascade" className={isRTL ? 'flex-row-reverse' : ''}>
                  <Building2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'الترتيب الهرمي' : 'Cascade View'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <GoalDashboard 
                  goals={goals} 
                  stats={stats}
                  onEdit={handleEdit}
                />
              </TabsContent>

              <TabsContent value="list">
                <GoalsList
                  goals={filteredGoals}
                  selectedLevel={selectedLevel}
                  onLevelChange={setSelectedLevel}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </TabsContent>

              <TabsContent value="cascade">
                <GoalCascade
                  goals={goals}
                  employees={employees}
                  onEdit={handleEdit}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}