import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserX, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package,
  FileText,
  Users,
  Building2,
  CreditCard,
  Award,
  Download
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Progress } from "@/components/ui/progress";

export default function EOSBClearance({ records, onRefresh }) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [clearanceData, setClearanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exitInterview, setExitInterview] = useState({
    overall_rating: 0,
    would_recommend: true,
    reason_for_leaving: "",
    liked_most: "",
    liked_least: "",
    suggestions: "",
    rehire_eligible: true
  });
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  // Filter records that need clearance
  const pendingClearance = records.filter(r => 
    r.status === "Calculated" || r.status === "Approved"
  );

  useEffect(() => {
    if (selectedRecord) {
      loadClearanceData();
    }
  }, [selectedRecord]);

  const loadClearanceData = async () => {
    setLoading(true);
    try {
      // Load assets assigned to employee
      const assets = await base44.entities.AssetAssignment.filter({
        employee_id: selectedRecord.employee_id,
        status: "Active"
      });

      // Load pending loans
      const loans = await base44.entities.LoanAccount.filter({
        employee_id: selectedRecord.employee_id,
        status: "Active"
      });

      // Load pending advances
      const advances = await base44.entities.SalaryAdvance.filter({
        employee_id: selectedRecord.employee_id,
        status: "Recovering"
      });

      // Parse existing clearance status if available
      const existingClearance = selectedRecord.clearance_status 
        ? JSON.parse(selectedRecord.clearance_status)
        : {
            hr: { cleared: false, cleared_by: "", cleared_date: "", notes: "" },
            it: { cleared: false, cleared_by: "", cleared_date: "", notes: "" },
            finance: { cleared: false, cleared_by: "", cleared_date: "", notes: "" },
            manager: { cleared: false, cleared_by: "", cleared_date: "", notes: "" },
            admin: { cleared: false, cleared_by: "", cleared_date: "", notes: "" }
          };

      setClearanceData({
        assets: assets,
        loans: loans,
        advances: advances,
        clearanceStatus: existingClearance
      });
    } catch (error) {
      console.error("Error loading clearance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentClearance = async (department, cleared) => {
    const user = await base44.auth.me();
    const updatedStatus = {
      ...clearanceData.clearanceStatus,
      [department]: {
        cleared: cleared,
        cleared_by: user.full_name,
        cleared_date: new Date().toISOString().split('T')[0],
        notes: clearanceData.clearanceStatus[department].notes
      }
    };

    await base44.entities.EOSB.update(selectedRecord.id, {
      clearance_status: JSON.stringify(updatedStatus)
    });

    setClearanceData({
      ...clearanceData,
      clearanceStatus: updatedStatus
    });

    onRefresh();
  };

  const handleAssetReturn = async (assetId) => {
    await base44.entities.AssetAssignment.update(assetId, {
      status: "Returned",
      actual_return_date: new Date().toISOString().split('T')[0],
      return_condition: "Good"
    });
    
    await base44.entities.EOSB.update(selectedRecord.id, {
      assets_returned: true
    });

    loadClearanceData();
    onRefresh();
  };

  const handleExitInterview = async () => {
    // Save exit interview data
    await base44.entities.EOSB.update(selectedRecord.id, {
      exit_interview_completed: true,
      notes: selectedRecord.notes + `\n\nExit Interview:\n${JSON.stringify(exitInterview, null, 2)}`
    });

    onRefresh();
    alert(isRTL ? "تم حفظ مقابلة الخروج" : "Exit interview saved successfully");
  };

  const generateCertificate = async () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll just mark it as issued
    await base44.entities.EOSB.update(selectedRecord.id, {
      certificate_issued: true,
      certificate_url: "https://example.com/certificates/" + selectedRecord.id
    });

    alert(isRTL ? "تم إصدار الشهادة" : "Certificate generated successfully");
    onRefresh();
    setSelectedRecord(null);
  };

  const completeClearance = async () => {
    const allCleared = Object.values(clearanceData.clearanceStatus).every(dept => dept.cleared);
    
    if (!allCleared) {
      alert(isRTL 
        ? "يجب إتمام جميع المخالصات قبل الإغلاق"
        : "All departments must clear before completing");
      return;
    }

    if (clearanceData.assets.length > 0) {
      alert(isRTL 
        ? "يجب إرجاع جميع الأصول"
        : "All assets must be returned");
      return;
    }

    await base44.entities.EOSB.update(selectedRecord.id, {
      status: "Approved",
      documents_completed: true,
      assets_returned: true
    });

    alert(isRTL ? "تمت المخالصة بنجاح" : "Clearance completed successfully");
    onRefresh();
    setSelectedRecord(null);
  };

  const calculateClearanceProgress = () => {
    if (!clearanceData) return 0;
    
    const checks = [
      clearanceData.clearanceStatus.hr.cleared,
      clearanceData.clearanceStatus.it.cleared,
      clearanceData.clearanceStatus.finance.cleared,
      clearanceData.clearanceStatus.manager.cleared,
      clearanceData.clearanceStatus.admin.cleared,
      clearanceData.assets.length === 0,
      selectedRecord.exit_interview_completed
    ];
    
    const completed = checks.filter(Boolean).length;
    return (completed / checks.length) * 100;
  };

  if (selectedRecord && clearanceData) {
    const progress = calculateClearanceProgress();
    
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-2 border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <CardTitle className="text-xl">
                  {isRTL ? 'إجراءات المخالصة - ' : 'Clearance Process - '}{selectedRecord.employee_name}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTL ? 'آخر يوم عمل: ' : 'Last Working Day: '}
                  {format(parseISO(selectedRecord.last_working_day), 'dd/MM/yyyy')}
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className={`flex justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-medium">{isRTL ? 'التقدم الكلي' : 'Overall Progress'}</span>
                <span className="text-sm font-bold text-[#B11116]">{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <Tabs defaultValue="clearance">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="clearance">{isRTL ? 'المخالصات' : 'Clearances'}</TabsTrigger>
                <TabsTrigger value="assets">{isRTL ? 'الأصول' : 'Assets'}</TabsTrigger>
                <TabsTrigger value="interview">{isRTL ? 'مقابلة الخروج' : 'Exit Interview'}</TabsTrigger>
                <TabsTrigger value="certificate">{isRTL ? 'الشهادة' : 'Certificate'}</TabsTrigger>
              </TabsList>

              <TabsContent value="clearance" className="space-y-4 mt-4">
                {/* HR Clearance */}
                <Card className={clearanceData.clearanceStatus.hr.cleared ? "border-green-200 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Users className="w-6 h-6 text-[#B11116]" />
                        <div className={isRTL ? 'text-right' : ''}>
                          <h3 className="font-semibold">{isRTL ? 'الموارد البشرية' : 'Human Resources'}</h3>
                          {clearanceData.clearanceStatus.hr.cleared && (
                            <p className="text-xs text-gray-600">
                              {isRTL ? 'تم المخالصة بواسطة: ' : 'Cleared by: '}
                              {clearanceData.clearanceStatus.hr.cleared_by} - {clearanceData.clearanceStatus.hr.cleared_date}
                            </p>
                          )}
                        </div>
                      </div>
                      {clearanceData.clearanceStatus.hr.cleared ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleDepartmentClearance('hr', true)}
                          className="bg-[#B11116] hover:bg-[#991014]"
                        >
                          {isRTL ? 'مخالصة' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* IT Clearance */}
                <Card className={clearanceData.clearanceStatus.it.cleared ? "border-green-200 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Package className="w-6 h-6 text-[#B11116]" />
                        <div className={isRTL ? 'text-right' : ''}>
                          <h3 className="font-semibold">{isRTL ? 'تقنية المعلومات' : 'Information Technology'}</h3>
                          {clearanceData.clearanceStatus.it.cleared && (
                            <p className="text-xs text-gray-600">
                              {isRTL ? 'تم المخالصة بواسطة: ' : 'Cleared by: '}
                              {clearanceData.clearanceStatus.it.cleared_by} - {clearanceData.clearanceStatus.it.cleared_date}
                            </p>
                          )}
                        </div>
                      </div>
                      {clearanceData.clearanceStatus.it.cleared ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleDepartmentClearance('it', true)}
                          className="bg-[#B11116] hover:bg-[#991014]"
                        >
                          {isRTL ? 'مخالصة' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Finance Clearance */}
                <Card className={clearanceData.clearanceStatus.finance.cleared ? "border-green-200 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <CreditCard className="w-6 h-6 text-[#B11116]" />
                        <div className={isRTL ? 'text-right' : ''}>
                          <h3 className="font-semibold">{isRTL ? 'المالية' : 'Finance'}</h3>
                          {clearanceData.clearanceStatus.finance.cleared && (
                            <p className="text-xs text-gray-600">
                              {isRTL ? 'تم المخالصة بواسطة: ' : 'Cleared by: '}
                              {clearanceData.clearanceStatus.finance.cleared_by} - {clearanceData.clearanceStatus.finance.cleared_date}
                            </p>
                          )}
                          {clearanceData.loans.length > 0 && (
                            <p className="text-xs text-orange-600">
                              {isRTL ? 'قروض معلقة: ' : 'Pending Loans: '}{clearanceData.loans.length}
                            </p>
                          )}
                        </div>
                      </div>
                      {clearanceData.clearanceStatus.finance.cleared ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleDepartmentClearance('finance', true)}
                          className="bg-[#B11116] hover:bg-[#991014]"
                          disabled={clearanceData.loans.length > 0 || clearanceData.advances.length > 0}
                        >
                          {isRTL ? 'مخالصة' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Manager Clearance */}
                <Card className={clearanceData.clearanceStatus.manager.cleared ? "border-green-200 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Building2 className="w-6 h-6 text-[#B11116]" />
                        <div className={isRTL ? 'text-right' : ''}>
                          <h3 className="font-semibold">{isRTL ? 'المدير المباشر' : 'Direct Manager'}</h3>
                          {clearanceData.clearanceStatus.manager.cleared && (
                            <p className="text-xs text-gray-600">
                              {isRTL ? 'تم المخالصة بواسطة: ' : 'Cleared by: '}
                              {clearanceData.clearanceStatus.manager.cleared_by} - {clearanceData.clearanceStatus.manager.cleared_date}
                            </p>
                          )}
                        </div>
                      </div>
                      {clearanceData.clearanceStatus.manager.cleared ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleDepartmentClearance('manager', true)}
                          className="bg-[#B11116] hover:bg-[#991014]"
                        >
                          {isRTL ? 'مخالصة' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Clearance */}
                <Card className={clearanceData.clearanceStatus.admin.cleared ? "border-green-200 bg-green-50" : ""}>
                  <CardContent className="p-4">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <FileText className="w-6 h-6 text-[#B11116]" />
                        <div className={isRTL ? 'text-right' : ''}>
                          <h3 className="font-semibold">{isRTL ? 'الإدارة العامة' : 'Administration'}</h3>
                          {clearanceData.clearanceStatus.admin.cleared && (
                            <p className="text-xs text-gray-600">
                              {isRTL ? 'تم المخالصة بواسطة: ' : 'Cleared by: '}
                              {clearanceData.clearanceStatus.admin.cleared_by} - {clearanceData.clearanceStatus.admin.cleared_date}
                            </p>
                          )}
                        </div>
                      </div>
                      {clearanceData.clearanceStatus.admin.cleared ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleDepartmentClearance('admin', true)}
                          className="bg-[#B11116] hover:bg-[#991014]"
                        >
                          {isRTL ? 'مخالصة' : 'Clear'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assets" className="mt-4">
                {clearanceData.assets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p>{isRTL ? 'جميع الأصول تم إرجاعها' : 'All assets have been returned'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clearanceData.assets.map((asset) => (
                      <Card key={asset.id}>
                        <CardContent className="p-4">
                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={isRTL ? 'text-right' : ''}>
                              <h3 className="font-semibold">{asset.asset_name}</h3>
                              <p className="text-sm text-gray-600">{asset.asset_code}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {isRTL ? 'تاريخ التسليم: ' : 'Assigned: '}
                                {format(parseISO(asset.assignment_date), 'dd/MM/yyyy')}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleAssetReturn(asset.id)}
                              className="bg-[#B11116] hover:bg-[#991014]"
                            >
                              {isRTL ? 'تأكيد الاستلام' : 'Confirm Return'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="interview" className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'التقييم العام (1-5)' : 'Overall Rating (1-5)'}
                      </Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={exitInterview.overall_rating === rating ? "default" : "outline"}
                            onClick={() => setExitInterview({...exitInterview, overall_rating: rating})}
                            className={exitInterview.overall_rating === rating ? "bg-[#B11116]" : ""}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'سبب المغادرة' : 'Reason for Leaving'}
                      </Label>
                      <Textarea
                        value={exitInterview.reason_for_leaving}
                        onChange={(e) => setExitInterview({...exitInterview, reason_for_leaving: e.target.value})}
                        rows={3}
                        className={isRTL ? 'text-right' : ''}
                      />
                    </div>

                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'ما أعجبك أكثر؟' : 'What did you like most?'}
                      </Label>
                      <Textarea
                        value={exitInterview.liked_most}
                        onChange={(e) => setExitInterview({...exitInterview, liked_most: e.target.value})}
                        rows={3}
                        className={isRTL ? 'text-right' : ''}
                      />
                    </div>

                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'ما أعجبك أقل؟' : 'What did you like least?'}
                      </Label>
                      <Textarea
                        value={exitInterview.liked_least}
                        onChange={(e) => setExitInterview({...exitInterview, liked_least: e.target.value})}
                        rows={3}
                        className={isRTL ? 'text-right' : ''}
                      />
                    </div>

                    <div>
                      <Label className={isRTL ? 'text-right block' : ''}>
                        {isRTL ? 'اقتراحات للتحسين' : 'Suggestions for Improvement'}
                      </Label>
                      <Textarea
                        value={exitInterview.suggestions}
                        onChange={(e) => setExitInterview({...exitInterview, suggestions: e.target.value})}
                        rows={3}
                        className={isRTL ? 'text-right' : ''}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recommend"
                        checked={exitInterview.would_recommend}
                        onCheckedChange={(checked) => setExitInterview({...exitInterview, would_recommend: checked})}
                      />
                      <label htmlFor="recommend" className="text-sm">
                        {isRTL ? 'هل توصي بالعمل في الشركة؟' : 'Would you recommend working at this company?'}
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rehire"
                        checked={exitInterview.rehire_eligible}
                        onCheckedChange={(checked) => setExitInterview({...exitInterview, rehire_eligible: checked})}
                      />
                      <label htmlFor="rehire" className="text-sm">
                        {isRTL ? 'مؤهل لإعادة التوظيف' : 'Eligible for rehire'}
                      </label>
                    </div>

                    <Button 
                      onClick={handleExitInterview}
                      disabled={selectedRecord.exit_interview_completed}
                      className="w-full bg-[#B11116] hover:bg-[#991014]"
                    >
                      {selectedRecord.exit_interview_completed 
                        ? (isRTL ? 'تم الحفظ' : 'Saved')
                        : (isRTL ? 'حفظ المقابلة' : 'Save Interview')
                      }
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificate" className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                      <Award className="w-16 h-16 mx-auto mb-4 text-[#B11116]" />
                      <h3 className="text-xl font-bold mb-2">
                        {isRTL ? 'شهادة الخدمة' : 'Service Certificate'}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {isRTL 
                          ? 'شهادة تثبت خدمة الموظف في الشركة'
                          : 'Certificate confirming employee service with the company'
                        }
                      </p>

                      {selectedRecord.certificate_issued ? (
                        <div>
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                          <p className="text-green-600 mb-4">
                            {isRTL ? 'تم إصدار الشهادة' : 'Certificate has been issued'}
                          </p>
                          <Button variant="outline" className={isRTL ? 'flex-row-reverse' : ''}>
                            <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {isRTL ? 'تحميل الشهادة' : 'Download Certificate'}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={generateCertificate}
                          className="bg-[#B11116] hover:bg-[#991014]"
                          disabled={progress < 100}
                        >
                          {isRTL ? 'إصدار الشهادة' : 'Generate Certificate'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className={`flex gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                onClick={completeClearance}
                disabled={progress < 100}
                className="bg-gradient-to-r from-[#B11116] to-[#991014]"
              >
                {isRTL ? 'إتمام المخالصة' : 'Complete Clearance'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <UserX className="w-5 h-5 text-[#B11116]" />
          <span>{isRTL ? 'إجراءات المخالصة' : 'Clearance Procedures'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {pendingClearance.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserX className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>{isRTL ? 'لا توجد مخالصات معلقة' : 'No pending clearances'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingClearance.map((record) => {
              const clearanceStatus = record.clearance_status 
                ? JSON.parse(record.clearance_status)
                : null;
              
              const clearedCount = clearanceStatus 
                ? Object.values(clearanceStatus).filter(dept => dept.cleared).length
                : 0;
              const totalDepts = 5;
              const progress = (clearedCount / totalDepts) * 100;

              return (
                <Card key={record.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4" onClick={() => setSelectedRecord(record)}>
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <h3 className="font-semibold text-lg">{record.employee_name}</h3>
                        <p className="text-sm text-gray-600">{record.company_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {isRTL ? 'آخر يوم عمل: ' : 'Last Working Day: '}
                          {format(parseISO(record.last_working_day), 'dd/MM/yyyy')}
                        </p>
                        <div className="mt-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-600">
                              {isRTL ? 'التقدم' : 'Progress'}
                            </span>
                            <span className="text-xs font-semibold">{clearedCount}/{totalDepts}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className={isRTL ? 'mr-4' : 'ml-4'}>
                        {isRTL ? 'مراجعة' : 'Review'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}