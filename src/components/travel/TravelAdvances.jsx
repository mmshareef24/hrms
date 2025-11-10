import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, AlertCircle, CheckCircle, Clock } from "lucide-react";

import AdvanceRequestForm from "./AdvanceRequestForm";
import AdvanceList from "./AdvanceList";
import AdvanceSettlement from "./AdvanceSettlement";

export default function TravelAdvances() {
  const [showForm, setShowForm] = useState(false);
  const [advances, setAdvances] = useState([]);
  const [travelRequests, setTravelRequests] = useState([]);
  const [expenseReports, setExpenseReports] = useState([]);
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Try to get employee record with multiple methods
      let emp = null;
      
      try {
        // Method 1: Filter by work_email
        const employeesByEmail = await base44.entities.Employee.filter({ work_email: currentUser.email });
        if (employeesByEmail && employeesByEmail.length > 0) {
          emp = employeesByEmail[0];
        }
      } catch (emailError) {
        console.log("Could not find employee by email, trying alternative methods...");
      }

      // Method 2: If not found by email, try by user email field
      if (!emp) {
        try {
          const allEmployees = await base44.entities.Employee.list();
          emp = allEmployees.find(e => 
            e.work_email === currentUser.email || 
            e.personal_email === currentUser.email ||
            e.email === currentUser.email
          );
        } catch (listError) {
          console.error("Error listing employees:", listError);
        }
      }

      // Method 3: Create a temporary employee record if still not found
      if (!emp) {
        console.warn("Employee record not found, using user data");
        emp = {
          id: currentUser.email,
          full_name: currentUser.full_name || "Employee",
          work_email: currentUser.email,
          employee_id: currentUser.email
        };
      }

      setEmployee(emp);

      // Load data with proper error handling
      const dataPromises = [
        base44.entities.TravelAdvance.list('-created_date', 100).catch(e => {
          console.error("Error loading advances:", e);
          return [];
        }),
        base44.entities.TravelRequest.list('-created_date', 100).catch(e => {
          console.error("Error loading travel requests:", e);
          return [];
        }),
        base44.entities.ExpenseReport.list('-created_date', 100).catch(e => {
          console.error("Error loading expense reports:", e);
          return [];
        })
      ];

      const [advancesData, travelsData, expensesData] = await Promise.all(dataPromises);

      setAdvances(advancesData || []);
      setTravelRequests(travelsData || []);
      setExpenseReports(expensesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error.message || "Failed to load data");
    }
    setLoading(false);
  };

  const handleSave = async (advanceData) => {
    try {
      if (!employee) {
        alert(isRTL ? "خطأ: لم يتم العثور على سجل الموظف" : "Error: Employee record not found");
        return;
      }

      // Generate advance number
      const year = new Date().getFullYear();
      const count = advances.length + 1;
      const advance_number = `ADV-${year}-${String(count).padStart(5, '0')}`;

      await base44.entities.TravelAdvance.create({
        ...advanceData,
        advance_number,
        employee_id: employee.id || employee.employee_id || user.email,
        employee_name: employee.full_name || user.full_name,
        request_date: new Date().toISOString().split('T')[0],
        status: "Requested"
      });

      setShowForm(false);
      loadData();
    } catch (error) {
      console.error("Error saving advance:", error);
      alert(isRTL ? "حدث خطأ في الحفظ: " + error.message : "Error saving advance: " + error.message);
    }
  };

  const handleApprove = async (advanceId, level) => {
    try {
      const advance = advances.find(a => a.id === advanceId);
      let updateData = {};

      if (level === "manager") {
        updateData = {
          status: "Manager Approved",
          approved_by_manager: user.full_name,
          manager_approval_date: new Date().toISOString().split('T')[0]
        };
      } else if (level === "finance") {
        updateData = {
          status: "Finance Approved",
          approved_by_finance: user.full_name,
          finance_approval_date: new Date().toISOString().split('T')[0]
        };
      }

      await base44.entities.TravelAdvance.update(advanceId, updateData);
      loadData();
    } catch (error) {
      console.error("Error approving advance:", error);
      alert(isRTL ? "حدث خطأ في الموافقة" : "Error approving advance");
    }
  };

  const handleDisburse = async (advanceId) => {
    try {
      const advance = advances.find(a => a.id === advanceId);
      
      await base44.entities.TravelAdvance.update(advanceId, {
        status: "Disbursed",
        disbursement_date: new Date().toISOString().split('T')[0],
        disbursement_reference: `PAY-${Date.now()}`
      });

      alert(isRTL 
        ? `تم صرف السلفة ${advance.amount} ${advance.currency}`
        : `Advance disbursed: ${advance.amount} ${advance.currency}`
      );
      
      loadData();
    } catch (error) {
      console.error("Error disbursing advance:", error);
      alert(isRTL ? "حدث خطأ في الصرف" : "Error disbursing advance");
    }
  };

  const handleSettle = async (advanceId, expenseAmount) => {
    try {
      const advance = advances.find(a => a.id === advanceId);
      const balance = advance.amount - expenseAmount;

      const updateData = {
        status: "Settled",
        settled_amount: expenseAmount,
        settlement_date: new Date().toISOString().split('T')[0],
        balance: balance,
        refund_due: balance > 0 ? balance : 0
      };

      if (balance < 0) {
        updateData.status = "Settled - Owed to Employee";
      } else if (balance > 0) {
        updateData.status = "Settled - Pending Recovery";
        updateData.refund_method = "Payroll Deduction";
      }

      await base44.entities.TravelAdvance.update(advanceId, updateData);
      
      if (balance > 0) {
        alert(isRTL
          ? `التسوية مكتملة. المبلغ المستحق للاسترداد: ${balance.toFixed(2)} ${advance.currency}`
          : `Settlement complete. Amount to recover: ${balance.toFixed(2)} ${advance.currency}`
        );
      } else if (balance < 0) {
        alert(isRTL
          ? `التسوية مكتملة. المبلغ المستحق للموظف: ${Math.abs(balance).toFixed(2)} ${advance.currency}`
          : `Settlement complete. Amount owed to employee: ${Math.abs(balance).toFixed(2)} ${advance.currency}`
        );
      } else {
        alert(isRTL ? "التسوية مكتملة بدون فروقات" : "Settlement complete with no variance");
      }

      loadData();
    } catch (error) {
      console.error("Error settling advance:", error);
      alert(isRTL ? "حدث خطأ في التسوية" : "Error settling advance");
    }
  };

  const myAdvances = employee ? advances.filter(a => 
    a.employee_id === employee.id || 
    a.employee_id === employee.employee_id ||
    a.employee_id === user.email
  ) : [];

  const stats = {
    requested: myAdvances.filter(a => a.status === "Requested" || a.status === "Manager Approved").length,
    disbursed: myAdvances.filter(a => a.status === "Disbursed").length,
    settled: myAdvances.filter(a => a.status === "Settled").length,
    pendingRecovery: myAdvances.filter(a => a.status === "Settled - Pending Recovery").length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData} variant="outline">
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-12 text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-400" />
          <p className="mb-4">{isRTL ? 'لم يتم العثور على سجل الموظف' : 'Employee record not found'}</p>
          <p className="text-sm text-gray-400 mb-4">
            {isRTL 
              ? 'الرجاء التواصل مع قسم الموارد البشرية لإنشاء سجل موظف'
              : 'Please contact HR to create an employee record'
            }
          </p>
          <Button onClick={loadData} variant="outline">
            {isRTL ? 'إعادة التحميل' : 'Reload'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {!showForm && !selectedAdvance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("requested")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'قيد المراجعة' : 'Requested'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.requested}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("disbursed")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'مصروفة' : 'Disbursed'}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.disbursed}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("settled")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'مسوّاة' : 'Settled'}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.settled}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("recovery")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'قيد الاسترداد' : 'Recovery'}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.pendingRecovery}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {showForm ? (
        <AdvanceRequestForm
          travelRequests={travelRequests.filter(t => 
            (t.employee_id === employee.id || t.employee_id === employee.employee_id || t.employee_id === user.email) && 
            (t.status === "Approved" || t.status === "Manager Approved")
          )}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      ) : selectedAdvance ? (
        <AdvanceSettlement
          advance={selectedAdvance}
          expenseReports={expenseReports.filter(e => 
            e.travel_request_id === selectedAdvance.travel_request_id
          )}
          onSettle={handleSettle}
          onCancel={() => setSelectedAdvance(null)}
        />
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'سلف السفر' : 'Travel Advances'}</span>
              </CardTitle>
              <Button 
                onClick={() => setShowForm(true)}
                className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'طلب جديد' : 'New Request'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-6">
                <TabsTrigger value="all">{isRTL ? 'الكل' : 'All'}</TabsTrigger>
                <TabsTrigger value="requested">{isRTL ? 'المطلوبة' : 'Requested'}</TabsTrigger>
                <TabsTrigger value="disbursed">{isRTL ? 'المصروفة' : 'Disbursed'}</TabsTrigger>
                <TabsTrigger value="settled">{isRTL ? 'المسوّاة' : 'Settled'}</TabsTrigger>
                <TabsTrigger value="recovery">{isRTL ? 'الاسترداد' : 'Recovery'}</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <AdvanceList
                  advances={myAdvances}
                  travelRequests={travelRequests}
                  onApprove={handleApprove}
                  onDisburse={handleDisburse}
                  onSettle={(advance) => setSelectedAdvance(advance)}
                  showActions={true}
                />
              </TabsContent>

              <TabsContent value="requested">
                <AdvanceList
                  advances={myAdvances.filter(a => a.status === "Requested" || a.status === "Manager Approved")}
                  travelRequests={travelRequests}
                  onApprove={handleApprove}
                  showActions={true}
                />
              </TabsContent>

              <TabsContent value="disbursed">
                <AdvanceList
                  advances={myAdvances.filter(a => a.status === "Disbursed")}
                  travelRequests={travelRequests}
                  onSettle={(advance) => setSelectedAdvance(advance)}
                  showActions={true}
                />
              </TabsContent>

              <TabsContent value="settled">
                <AdvanceList
                  advances={myAdvances.filter(a => a.status === "Settled" || a.status === "Settled - Owed to Employee")}
                  travelRequests={travelRequests}
                  showActions={false}
                />
              </TabsContent>

              <TabsContent value="recovery">
                <AdvanceList
                  advances={myAdvances.filter(a => a.status === "Settled - Pending Recovery")}
                  travelRequests={travelRequests}
                  showActions={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}