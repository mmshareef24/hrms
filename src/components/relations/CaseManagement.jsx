import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, Search, Filter } from "lucide-react";

import CaseList from "./cases/CaseList";
import CaseForm from "./cases/CaseForm";
import CaseDetails from "./cases/CaseDetails";
import CaseFilters from "./cases/CaseFilters";

export default function CaseManagement() {
  const [showForm, setShowForm] = useState(false);
  const [cases, setCases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState("open");
  const [filters, setFilters] = useState({
    type: "all",
    severity: "all",
    status: "all"
  });
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [casesData, employeesData] = await Promise.all([
        base44.entities.EmployeeCase.list('-created_date', 200),
        base44.entities.Employee.list()
      ]);

      setCases(casesData || []);
      setEmployees(employeesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSave = async (caseData) => {
    try {
      // Generate case number
      const year = new Date().getFullYear();
      const count = cases.length + 1;
      const case_number = `CASE-${year}-${String(count).padStart(5, '0')}`;

      if (selectedCase) {
        await base44.entities.EmployeeCase.update(selectedCase.id, caseData);
      } else {
        await base44.entities.EmployeeCase.create({
          ...caseData,
          case_number,
          reported_date: new Date().toISOString().split('T')[0],
          status: "Open"
        });
      }

      setShowForm(false);
      setSelectedCase(null);
      loadData();
    } catch (error) {
      console.error("Error saving case:", error);
      alert(isRTL ? "حدث خطأ في الحفظ" : "Error saving case");
    }
  };

  const handleViewCase = (caseItem) => {
    setSelectedCase(caseItem);
    setShowForm(false);
  };

  const handleUpdateStatus = async (caseId, newStatus, data = {}) => {
    try {
      await base44.entities.EmployeeCase.update(caseId, {
        status: newStatus,
        ...data
      });
      loadData();
      if (selectedCase && selectedCase.id === caseId) {
        setSelectedCase({ ...selectedCase, status: newStatus, ...data });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(isRTL ? "حدث خطأ في التحديث" : "Error updating status");
    }
  };

  const filteredCases = cases.filter(c => {
    const typeMatch = filters.type === "all" || c.case_type === filters.type;
    const severityMatch = filters.severity === "all" || c.severity === filters.severity;
    const statusMatch = filters.status === "all" || c.status === filters.status;
    return typeMatch && severityMatch && statusMatch;
  });

  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === "Open").length,
    investigation: cases.filter(c => c.status === "Under Investigation").length,
    resolved: cases.filter(c => c.status === "Resolved").length,
    closed: cases.filter(c => c.status === "Closed").length,
    critical: cases.filter(c => c.severity === "Critical" && c.status !== "Closed").length,
    high: cases.filter(c => c.severity === "High" && c.status !== "Closed").length
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
      {!showForm && !selectedCase && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("open")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'مفتوحة' : 'Open'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.open}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("investigation")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'تحقيق' : 'Investigation'}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.investigation}</p>
                </div>
                <Search className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("resolved")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'محلولة' : 'Resolved'}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("closed")}>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'مغلقة' : 'Closed'}</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'حرجة' : 'Critical'}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'عالية' : 'High'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {showForm ? (
        <CaseForm
          caseData={selectedCase}
          employees={employees}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setSelectedCase(null);
          }}
        />
      ) : selectedCase ? (
        <CaseDetails
          caseData={selectedCase}
          employees={employees}
          onUpdate={handleUpdateStatus}
          onClose={() => setSelectedCase(null)}
          onEdit={() => setShowForm(true)}
        />
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <AlertCircle className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'إدارة القضايا' : 'Case Management'}</span>
              </CardTitle>
              <Button 
                onClick={() => {
                  setSelectedCase(null);
                  setShowForm(true);
                }}
                className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'قضية جديدة' : 'New Case'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <CaseFilters
              filters={filters}
              onFilterChange={setFilters}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="open">{isRTL ? 'مفتوحة' : 'Open'} ({stats.open})</TabsTrigger>
                <TabsTrigger value="investigation">{isRTL ? 'تحقيق' : 'Investigation'} ({stats.investigation})</TabsTrigger>
                <TabsTrigger value="resolved">{isRTL ? 'محلولة' : 'Resolved'} ({stats.resolved})</TabsTrigger>
                <TabsTrigger value="closed">{isRTL ? 'مغلقة' : 'Closed'} ({stats.closed})</TabsTrigger>
              </TabsList>

              <TabsContent value="open" className="mt-6">
                <CaseList
                  cases={filteredCases.filter(c => c.status === "Open")}
                  employees={employees}
                  onViewCase={handleViewCase}
                  onUpdateStatus={handleUpdateStatus}
                />
              </TabsContent>

              <TabsContent value="investigation" className="mt-6">
                <CaseList
                  cases={filteredCases.filter(c => c.status === "Under Investigation")}
                  employees={employees}
                  onViewCase={handleViewCase}
                  onUpdateStatus={handleUpdateStatus}
                />
              </TabsContent>

              <TabsContent value="resolved" className="mt-6">
                <CaseList
                  cases={filteredCases.filter(c => c.status === "Resolved")}
                  employees={employees}
                  onViewCase={handleViewCase}
                  onUpdateStatus={handleUpdateStatus}
                />
              </TabsContent>

              <TabsContent value="closed" className="mt-6">
                <CaseList
                  cases={filteredCases.filter(c => c.status === "Closed")}
                  employees={employees}
                  onViewCase={handleViewCase}
                  onUpdateStatus={handleUpdateStatus}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}