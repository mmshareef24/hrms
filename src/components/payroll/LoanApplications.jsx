import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";

export default function LoanApplications() {
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all-pending");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
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

      // Try multiple methods to get employee record
      let emp = null;
      
      try {
        // Method 1: Filter by work_email
        const employeesByEmail = await base44.entities.Employee.filter({ work_email: currentUser.email });
        if (employeesByEmail && employeesByEmail.length > 0) {
          emp = employeesByEmail[0];
        }
      } catch (emailError) {
        console.log("Could not find employee by work_email, trying alternative methods...");
      }

      // Method 2: Try listing all and finding by email
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

      // Method 3: Use user as fallback
      if (!emp) {
        console.warn("Employee record not found, using user data as fallback");
        emp = {
          id: currentUser.email,
          full_name: currentUser.full_name || "User",
          work_email: currentUser.email,
          employee_id: currentUser.email,
          department: "Unknown",
          job_title: currentUser.role || "User"
        };
      }

      setEmployee(emp);

      // Load loan applications with error handling
      try {
        const allApps = await base44.entities.LoanAccount.list('-created_date', 100);
        setApplications(allApps || []);
      } catch (appError) {
        console.log("No loan applications yet:", appError);
        setApplications([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error.message || "Failed to load data");
    }
    setLoading(false);
  };

  const handleApprove = async (loanId, level) => {
    try {
      const loan = applications.find(a => a.id === loanId);
      let updateData = {};

      if (level === "manager") {
        updateData = {
          status: "Manager Approved",
          manager_approved_by: user?.full_name || user?.email,
          manager_approved_date: new Date().toISOString().split('T')[0]
        };
      } else if (level === "hr") {
        updateData = {
          status: "HR Approved",
          hr_approved_by: user?.full_name || user?.email,
          hr_approved_date: new Date().toISOString().split('T')[0]
        };
      } else if (level === "finance") {
        updateData = {
          status: "Finance Approved",
          finance_approved_by: user?.full_name || user?.email,
          finance_approved_date: new Date().toISOString().split('T')[0]
        };
      }

      await base44.entities.LoanAccount.update(loanId, updateData);
      setShowApprovalDialog(false);
      setSelectedLoan(null);
      loadData();
      
      alert(isRTL 
        ? `تمت الموافقة على القرض بنجاح (${level})`
        : `Loan approved successfully (${level})`
      );
    } catch (error) {
      console.error("Error approving loan:", error);
      alert(isRTL ? "حدث خطأ في الموافقة" : "Error approving loan");
    }
  };

  const handleReject = async (loanId) => {
    if (!rejectionReason.trim()) {
      alert(isRTL ? "يرجى إدخال سبب الرفض" : "Please enter rejection reason");
      return;
    }

    try {
      await base44.entities.LoanAccount.update(loanId, {
        status: "Rejected",
        rejection_reason: rejectionReason,
        status_reason: `Rejected by ${user?.full_name || user?.email} on ${new Date().toISOString().split('T')[0]}`
      });

      setShowApprovalDialog(false);
      setSelectedLoan(null);
      setRejectionReason("");
      loadData();
      
      alert(isRTL ? "تم رفض القرض" : "Loan rejected");
    } catch (error) {
      console.error("Error rejecting loan:", error);
      alert(isRTL ? "حدث خطأ في الرفض" : "Error rejecting loan");
    }
  };

  const handleDisburse = async (loanId) => {
    try {
      const loan = applications.find(a => a.id === loanId);
      
      await base44.entities.LoanAccount.update(loanId, {
        status: "Disbursed",
        disbursement_date: new Date().toISOString().split('T')[0],
        disbursement_method: "Bank Transfer",
        disbursement_reference: `DISB-${Date.now()}`,
        start_date: new Date().toISOString().split('T')[0],
        first_payment_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        outstanding_principal: loan.principal_amount,
        total_outstanding: loan.total_loan_cost
      });

      // Change status to Active after disbursement
      setTimeout(async () => {
        await base44.entities.LoanAccount.update(loanId, {
          status: "Active"
        });
        loadData();
      }, 1000);

      alert(isRTL 
        ? `تم صرف القرض ${loan.principal_amount} ${loan.currency} للموظف ${loan.employee_name}`
        : `Loan disbursed: ${loan.principal_amount} ${loan.currency} to ${loan.employee_name}`
      );

      setShowApprovalDialog(false);
      setSelectedLoan(null);
      loadData();
    } catch (error) {
      console.error("Error disbursing loan:", error);
      alert(isRTL ? "حدث خطأ في الصرف" : "Error disbursing loan");
    }
  };

  const getNextApprovalLevel = (status) => {
    if (status === "Submitted") return "manager";
    if (status === "Manager Approved") return "hr";
    if (status === "HR Approved") return "finance";
    return null;
  };

  const canApprove = (loan) => {
    if (!user) return false;
    
    const nextLevel = getNextApprovalLevel(loan.status);
    
    // Check if user has approval rights (simplified - in production use role-based permissions)
    if (nextLevel === "manager" && user.role === "admin") return true;
    if (nextLevel === "hr" && user.role === "admin") return true;
    if (nextLevel === "finance" && user.role === "admin") return true;
    
    return user.role === "admin"; // Admins can approve at any level
  };

  const canDisburse = (loan) => {
    return user?.role === "admin" && loan.status === "Finance Approved";
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === "all-pending") {
      return ["Submitted", "Manager Approved", "HR Approved", "Finance Approved"].includes(app.status);
    } else if (activeTab === "pending-my-approval") {
      return canApprove(app);
    } else if (activeTab === "approved") {
      return app.status === "Finance Approved" || app.status === "Disbursed" || app.status === "Active";
    } else if (activeTab === "rejected") {
      return app.status === "Rejected";
    }
    return true;
  });

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
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-600">{error}</p>
          <Button onClick={loadData} className="mt-4">
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'قيد المراجعة' : 'Pending'}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {applications.filter(a => ["Submitted", "Manager Approved", "HR Approved"].includes(a.status)).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'معتمدة' : 'Approved'}</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(a => a.status === "Finance Approved" || a.status === "Disbursed" || a.status === "Active").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'مرفوضة' : 'Rejected'}</p>
                <p className="text-2xl font-bold text-red-600">
                  {applications.filter(a => a.status === "Rejected").length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'الإجمالي' : 'Total'}</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'طلبات القروض' : 'Loan Applications'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-pending">
                {isRTL ? 'قيد الانتظار' : 'All Pending'}
              </TabsTrigger>
              <TabsTrigger value="pending-my-approval">
                {isRTL ? 'تحتاج موافقتي' : 'Needs My Approval'}
              </TabsTrigger>
              <TabsTrigger value="approved">
                {isRTL ? 'معتمدة' : 'Approved'}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                {isRTL ? 'مرفوضة' : 'Rejected'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{isRTL ? 'لا توجد طلبات' : 'No applications found'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={isRTL ? 'text-right' : ''}>
                          {isRTL ? 'رقم الطلب' : 'Loan #'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : ''}>
                          {isRTL ? 'الموظف' : 'Employee'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : ''}>
                          {isRTL ? 'نوع القرض' : 'Product'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : ''}>
                          {isRTL ? 'المبلغ' : 'Amount'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : ''}>
                          {isRTL ? 'المدة' : 'Term'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : ''}>
                          {isRTL ? 'تاريخ الطلب' : 'Requested'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-right' : ''}>
                          {isRTL ? 'الحالة' : 'Status'}
                        </TableHead>
                        <TableHead className={isRTL ? 'text-left' : 'text-right'}>
                          {isRTL ? 'الإجراءات' : 'Actions'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">
                            {app.loan_number}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.employee_name}</p>
                              <p className="text-sm text-gray-500">{app.department}</p>
                            </div>
                          </TableCell>
                          <TableCell>{app.product_name}</TableCell>
                          <TableCell className="font-semibold">
                            {parseFloat(app.principal_amount || 0).toLocaleString()} {app.currency}
                          </TableCell>
                          <TableCell>{app.term_months} {isRTL ? 'شهر' : 'months'}</TableCell>
                          <TableCell>
                            {app.requested_date && format(parseISO(app.requested_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              app.status === "Submitted" ? "bg-blue-100 text-blue-800" :
                              app.status === "Manager Approved" ? "bg-yellow-100 text-yellow-800" :
                              app.status === "HR Approved" ? "bg-yellow-100 text-yellow-800" :
                              app.status === "Finance Approved" ? "bg-green-100 text-green-800" :
                              app.status === "Disbursed" || app.status === "Active" ? "bg-green-100 text-green-800" :
                              app.status === "Rejected" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLoan(app);
                                  setApprovalAction(null);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {canApprove(app) && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedLoan(app);
                                    setApprovalAction("approve");
                                    setShowApprovalDialog(true);
                                  }}
                                >
                                  {isRTL ? 'موافقة' : 'Approve'}
                                </Button>
                              )}
                              {canDisburse(app) && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleDisburse(app.id)}
                                >
                                  {isRTL ? 'صرف' : 'Disburse'}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      {selectedLoan && showApprovalDialog && (
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={isRTL ? 'text-right' : ''}>
                {approvalAction === "approve" 
                  ? (isRTL ? 'الموافقة على القرض' : 'Approve Loan')
                  : (isRTL ? 'رفض القرض' : 'Reject Loan')
                }
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className={`font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'تفاصيل القرض' : 'Loan Details'}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className={isRTL ? 'text-right' : ''}>
                    <span className="text-gray-500">{isRTL ? 'الموظف:' : 'Employee:'}</span>
                    <p className="font-medium">{selectedLoan.employee_name}</p>
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <span className="text-gray-500">{isRTL ? 'المبلغ:' : 'Amount:'}</span>
                    <p className="font-medium">
                      {parseFloat(selectedLoan.principal_amount || 0).toLocaleString()} {selectedLoan.currency}
                    </p>
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <span className="text-gray-500">{isRTL ? 'المنتج:' : 'Product:'}</span>
                    <p className="font-medium">{selectedLoan.product_name}</p>
                  </div>
                  <div className={isRTL ? 'text-right' : ''}>
                    <span className="text-gray-500">{isRTL ? 'المدة:' : 'Term:'}</span>
                    <p className="font-medium">{selectedLoan.term_months} {isRTL ? 'شهر' : 'months'}</p>
                  </div>
                  {selectedLoan.purpose && (
                    <div className={`col-span-2 ${isRTL ? 'text-right' : ''}`}>
                      <span className="text-gray-500">{isRTL ? 'الغرض:' : 'Purpose:'}</span>
                      <p className="font-medium">{selectedLoan.purpose}</p>
                    </div>
                  )}
                </div>
              </div>

              {approvalAction === "approve" ? (
                <div className={`space-y-3 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm text-gray-600">
                    {isRTL 
                      ? `بالضغط على "تأكيد الموافقة"، أنت توافق على هذا القرض على مستوى ${getNextApprovalLevel(selectedLoan.status)}.`
                      : `By clicking "Confirm Approval", you are approving this loan at the ${getNextApprovalLevel(selectedLoan.status)} level.`
                    }
                  </p>
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                    <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedLoan.id, getNextApprovalLevel(selectedLoan.status))}
                    >
                      {isRTL ? 'تأكيد الموافقة' : 'Confirm Approval'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className={isRTL ? 'text-right block' : ''}>
                    {isRTL ? 'سبب الرفض *' : 'Rejection Reason *'}
                  </Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={isRTL ? "اشرح سبب رفض هذا القرض..." : "Explain why this loan is being rejected..."}
                    rows={4}
                    className={isRTL ? 'text-right' : ''}
                  />
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                    <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => handleReject(selectedLoan.id)}
                    >
                      {isRTL ? 'تأكيد الرفض' : 'Confirm Rejection'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Details Dialog */}
      {selectedLoan && !showApprovalDialog && (
        <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className={isRTL ? 'text-right' : ''}>
                {isRTL ? 'تفاصيل طلب القرض' : 'Loan Application Details'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Employee & Loan Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className={isRTL ? 'text-right' : ''}>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {isRTL ? 'معلومات الموظف' : 'Employee Information'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">{isRTL ? 'الاسم:' : 'Name:'}</span>
                      <p className="font-medium">{selectedLoan.employee_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{isRTL ? 'القسم:' : 'Department:'}</span>
                      <p className="font-medium">{selectedLoan.department || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{isRTL ? 'مركز التكلفة:' : 'Cost Center:'}</span>
                      <p className="font-medium">{selectedLoan.cost_center || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className={isRTL ? 'text-right' : ''}>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {isRTL ? 'معلومات القرض' : 'Loan Information'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">{isRTL ? 'رقم القرض:' : 'Loan Number:'}</span>
                      <p className="font-medium">{selectedLoan.loan_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{isRTL ? 'المنتج:' : 'Product:'}</span>
                      <p className="font-medium">{selectedLoan.product_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{isRTL ? 'النوع:' : 'Type:'}</span>
                      <p className="font-medium">{selectedLoan.product_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">{isRTL ? 'تاريخ الطلب:' : 'Requested:'}</span>
                      <p className="font-medium">
                        {selectedLoan.requested_date && format(parseISO(selectedLoan.requested_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className={`bg-blue-50 p-4 rounded-lg ${isRTL ? 'text-right' : ''}`}>
                <h4 className="font-semibold text-blue-900 mb-3">
                  {isRTL ? 'التفاصيل المالية' : 'Financial Details'}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">{isRTL ? 'مبلغ القرض:' : 'Principal Amount:'}</span>
                    <p className="font-bold text-lg text-blue-900">
                      {parseFloat(selectedLoan.principal_amount || 0).toLocaleString()} {selectedLoan.currency}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">{isRTL ? 'المدة:' : 'Term:'}</span>
                    <p className="font-bold text-lg text-blue-900">
                      {selectedLoan.term_months} {isRTL ? 'شهر' : 'months'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">{isRTL ? 'القسط الشهري:' : 'Monthly Installment:'}</span>
                    <p className="font-bold text-blue-900">
                      {parseFloat(selectedLoan.installment_amount || 0).toLocaleString()} {selectedLoan.currency}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700">{isRTL ? 'إجمالي التكلفة:' : 'Total Cost:'}</span>
                    <p className="font-bold text-blue-900">
                      {parseFloat(selectedLoan.total_loan_cost || 0).toLocaleString()} {selectedLoan.currency}
                    </p>
                  </div>
                  {selectedLoan.annual_rate > 0 && (
                    <div>
                      <span className="text-blue-700">{isRTL ? 'معدل الفائدة:' : 'Interest Rate:'}</span>
                      <p className="font-bold text-blue-900">{selectedLoan.annual_rate}% {isRTL ? 'سنوياً' : 'p.a.'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose */}
              {selectedLoan.purpose && (
                <div className={isRTL ? 'text-right' : ''}>
                  <Label className="text-gray-700">{isRTL ? 'الغرض:' : 'Purpose:'}</Label>
                  <p className="text-gray-900 mt-1">{selectedLoan.purpose}</p>
                </div>
              )}

              {/* Approval Timeline */}
              {selectedLoan.status !== "Submitted" && (
                <div className={isRTL ? 'text-right' : ''}>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {isRTL ? 'سجل الموافقات' : 'Approval Timeline'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedLoan.manager_approved_by && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>
                          {isRTL ? 'موافقة المدير:' : 'Manager Approved:'} {selectedLoan.manager_approved_by}
                          {selectedLoan.manager_approved_date && ` - ${format(parseISO(selectedLoan.manager_approved_date), 'MMM dd, yyyy')}`}
                        </span>
                      </div>
                    )}
                    {selectedLoan.hr_approved_by && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>
                          {isRTL ? 'موافقة الموارد البشرية:' : 'HR Approved:'} {selectedLoan.hr_approved_by}
                          {selectedLoan.hr_approved_date && ` - ${format(parseISO(selectedLoan.hr_approved_date), 'MMM dd, yyyy')}`}
                        </span>
                      </div>
                    )}
                    {selectedLoan.finance_approved_by && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>
                          {isRTL ? 'موافقة المالية:' : 'Finance Approved:'} {selectedLoan.finance_approved_by}
                          {selectedLoan.finance_approved_date && ` - ${format(parseISO(selectedLoan.finance_approved_date), 'MMM dd, yyyy')}`}
                        </span>
                      </div>
                    )}
                    {selectedLoan.status === "Rejected" && (
                      <div className="mt-3 p-3 bg-red-50 rounded">
                        <div className="flex items-center gap-2 text-red-800">
                          <XCircle className="w-4 h-4" />
                          <span className="font-semibold">{isRTL ? 'مرفوض' : 'Rejected'}</span>
                        </div>
                        {selectedLoan.rejection_reason && (
                          <p className="text-sm text-red-700 mt-2">{selectedLoan.rejection_reason}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                <Button variant="outline" onClick={() => setSelectedLoan(null)}>
                  {isRTL ? 'إغلاق' : 'Close'}
                </Button>
                {canApprove(selectedLoan) && (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setApprovalAction("reject");
                        setShowApprovalDialog(true);
                      }}
                    >
                      {isRTL ? 'رفض' : 'Reject'}
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setApprovalAction("approve");
                        setShowApprovalDialog(true);
                      }}
                    >
                      {isRTL ? 'موافقة' : 'Approve'}
                    </Button>
                  </>
                )}
                {canDisburse(selectedLoan) && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleDisburse(selectedLoan.id)}
                  >
                    {isRTL ? 'صرف القرض' : 'Disburse Loan'}
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}