import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Plus, Calendar, Users } from "lucide-react";

import ReviewCyclesList from "./reviews/ReviewCyclesList";
import ReviewCycleForm from "./reviews/ReviewCycleForm";
import ReviewsList from "./reviews/ReviewsList";
import ReviewForm from "./reviews/ReviewForm";

export default function PerformanceReviews() {
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [goals, setGoals] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cycles");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [cyclesData, reviewsData, employeesData, goalsData, competenciesData] = await Promise.all([
        base44.entities.ReviewCycle.list('-created_date'),
        base44.entities.PerformanceReview.list('-created_date'),
        base44.entities.Employee.list(),
        base44.entities.Goal.list(),
        base44.entities.Competency.list()
      ]);

      setCycles(cyclesData || []);
      setReviews(reviewsData || []);
      setEmployees(employeesData || []);
      setGoals(goalsData || []);
      setCompetencies(competenciesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSaveCycle = async (cycleData) => {
    try {
      if (editingCycle) {
        await base44.entities.ReviewCycle.update(editingCycle.id, cycleData);
      } else {
        await base44.entities.ReviewCycle.create(cycleData);
      }
      setShowCycleForm(false);
      setEditingCycle(null);
      loadData();
    } catch (error) {
      console.error("Error saving cycle:", error);
      alert(isRTL ? "حدث خطأ في الحفظ" : "Error saving cycle");
    }
  };

  const handleDeleteCycle = async (cycleId) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف دورة التقييم؟" : "Are you sure you want to delete this review cycle?")) {
      try {
        await base44.entities.ReviewCycle.delete(cycleId);
        loadData();
      } catch (error) {
        console.error("Error deleting cycle:", error);
      }
    }
  };

  const handleInitiateCycle = async (cycle) => {
    if (confirm(isRTL 
      ? `هل تريد إنشاء مراجعات لجميع الموظفين النشطين في ${cycle.cycle_name}؟`
      : `Create reviews for all active employees in ${cycle.cycle_name}?`
    )) {
      try {
        const activeEmployees = employees.filter(e => e.status === "Active");
        
        for (const emp of activeEmployees) {
          // Check if review already exists
          const existingReview = reviews.find(r => 
            r.review_cycle_id === cycle.id && r.employee_id === emp.id
          );
          
          if (!existingReview) {
            const manager = employees.find(e => e.id === emp.manager_id);
            await base44.entities.PerformanceReview.create({
              review_cycle_id: cycle.id,
              cycle_name: cycle.cycle_name,
              employee_id: emp.id,
              employee_name: emp.full_name,
              employee_job_title: emp.job_title,
              employee_department: emp.department,
              reviewer_id: emp.manager_id || "",
              reviewer_name: manager?.full_name || "",
              review_type: "Manager",
              review_period_start: cycle.period_start,
              review_period_end: cycle.period_end,
              status: "Draft"
            });
          }
        }

        // Update cycle status
        await base44.entities.ReviewCycle.update(cycle.id, {
          status: "Self Review",
          total_employees: activeEmployees.length
        });

        alert(isRTL 
          ? `تم إنشاء ${activeEmployees.length} مراجعة بنجاح`
          : `Successfully created ${activeEmployees.length} reviews`
        );
        loadData();
      } catch (error) {
        console.error("Error initiating cycle:", error);
        alert(isRTL ? "حدث خطأ" : "Error occurred");
      }
    }
  };

  const stats = {
    activeCycles: cycles.filter(c => c.status !== "Completed" && c.status !== "Closed").length,
    pendingReviews: reviews.filter(r => r.status === "Draft" || r.status === "Self Review Started").length,
    completedReviews: reviews.filter(r => r.status === "Completed" || r.status === "Acknowledged").length,
    avgRating: reviews.filter(r => r.overall_score).length > 0
      ? (reviews.filter(r => r.overall_score).reduce((sum, r) => sum + (r.overall_score || 0), 0) / reviews.filter(r => r.overall_score).length).toFixed(1)
      : "N/A"
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
      {!showCycleForm && !showReviewForm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'الدورات النشطة' : 'Active Cycles'}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeCycles}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'قيد المراجعة' : 'Pending'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</p>
                </div>
                <ClipboardCheck className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'مكتمل' : 'Completed'}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedReviews}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'متوسط التقييم' : 'Avg Rating'}</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgRating}</p>
                </div>
                <ClipboardCheck className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {showCycleForm ? (
        <ReviewCycleForm
          cycle={editingCycle}
          onSave={handleSaveCycle}
          onCancel={() => {
            setShowCycleForm(false);
            setEditingCycle(null);
          }}
        />
      ) : showReviewForm ? (
        <ReviewForm
          review={selectedReview}
          employees={employees}
          goals={goals}
          competencies={competencies}
          onSave={async (reviewData) => {
            try {
              if (selectedReview) {
                await base44.entities.PerformanceReview.update(selectedReview.id, reviewData);
              } else {
                await base44.entities.PerformanceReview.create(reviewData);
              }
              setShowReviewForm(false);
              setSelectedReview(null);
              loadData();
            } catch (error) {
              console.error("Error saving review:", error);
            }
          }}
          onCancel={() => {
            setShowReviewForm(false);
            setSelectedReview(null);
          }}
        />
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ClipboardCheck className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'مراجعات الأداء' : 'Performance Reviews'}</span>
              </CardTitle>
              <Button 
                onClick={() => {
                  setEditingCycle(null);
                  setShowCycleForm(true);
                }}
                className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'دورة جديدة' : 'New Cycle'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="cycles" className={isRTL ? 'flex-row-reverse' : ''}>
                  <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'دورات التقييم' : 'Review Cycles'}
                </TabsTrigger>
                <TabsTrigger value="reviews" className={isRTL ? 'flex-row-reverse' : ''}>
                  <ClipboardCheck className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'المراجعات' : 'Reviews'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cycles">
                <ReviewCyclesList
                  cycles={cycles}
                  onEdit={(cycle) => {
                    setEditingCycle(cycle);
                    setShowCycleForm(true);
                  }}
                  onDelete={handleDeleteCycle}
                  onInitiate={handleInitiateCycle}
                />
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewsList
                  reviews={reviews}
                  onEdit={(review) => {
                    setSelectedReview(review);
                    setShowReviewForm(true);
                  }}
                  onView={(review) => {
                    setSelectedReview(review);
                    setShowReviewForm(true);
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