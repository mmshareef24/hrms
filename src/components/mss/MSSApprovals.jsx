
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, DollarSign, CreditCard, Package, Sparkles, Loader2, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, parseISO } from "date-fns";
import SmartLeaveApproval from "./SmartLeaveApproval";
import { formatCurrency } from "@/utils";

export default function MSSApprovals({ employee, teamMembers }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceExceptions, setAttendanceExceptions] = useState([]);
  const [expenseClaims, setExpenseClaims] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [loanAction, setLoanAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null); // Used for both Smart Approval and direct Rejection dialog
  const [showSmartApproval, setShowSmartApproval] = useState(false);
  const [showLeaveRejectDialog, setShowLeaveRejectDialog] = useState(false); // New state for leave rejection dialog

  const isRTL = typeof window !== 'undefined' && document?.documentElement?.getAttribute('dir') === 'rtl';

  const [aiSuggestionResponse, setAiSuggestionResponse] = useState(null); // Not used in this component after SmartLeaveApproval extraction
  const [loadingSuggestionId, setLoadingSuggestionId] = useState(null); // Not used in this component after SmartLeaveApproval extraction

  useEffect(() => {
    if (teamMembers && teamMembers.length > 0) {
      loadApprovals();
    } else {
      setLoading(false);
    }
  }, [teamMembers]);

  const loadApprovals = async () => {
    if (!teamMembers || teamMembers.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const teamIds = teamMembers.map(m => m.id);

    try {
      // Get all leave requests
      const allLeaves = await base44.entities.LeaveRequest.list('-created_date', 200);
      const pendingLeaves = allLeaves.filter(l =>
        teamIds.includes(l.employee_id) &&
        l.status === "Pending"
      );

      // Fetch leave balances for each pending leave request
      const leavesWithBalance = await Promise.all(
        pendingLeaves.map(async (leave) => {
          try {
            const currentYear = new Date().getFullYear();
            const balances = await base44.entities.LeaveBalance.filter({
              employee_id: leave.employee_id,
              leave_type_id: leave.leave_type_id,
              year: currentYear
            });
            return {
              ...leave,
              leaveBalance: balances.length > 0 ? balances[0] : null
            };
          } catch (error) {
            console.error("Error fetching balance for leave:", error);
            return {
              ...leave,
              leaveBalance: null
            };
          }
        })
      );

      setLeaveRequests(leavesWithBalance);

      const [exceptions, expenses, loans] = await Promise.all([
        base44.entities.AttendanceException.list('-created_date', 50),
        base44.entities.ExpenseClaim.list('-created_date', 50),
        base44.entities.LoanAccount.list('-created_date', 50)
      ]);

      setAttendanceExceptions((exceptions || []).filter(e => teamIds.includes(e.employee_id) && e.status === "Pending"));
      setExpenseClaims((expenses || []).filter(e => teamIds.includes(e.employee_id) && e.status === "Submitted"));
      setLoanRequests((loans || []).filter(l =>
        teamIds.includes(l.employee_id) &&
        (l.status === "Submitted" || l.status === "Pending")
      ));
    } catch (error) {
      console.error("Error loading approvals:", error);
      setLeaveRequests([]);
      setAttendanceExceptions([]);
      setExpenseClaims([]);
      setLoanRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveApproval = async (leaveId, approved, comments = "") => {
    await base44.entities.LeaveRequest.update(leaveId, {
      status: approved ? "Approved" : "Rejected",
      approved_by: employee.full_name,
      approved_date: new Date().toISOString().split('T')[0],
      rejection_reason: approved ? "" : comments
    });
    // These states are managed by SmartLeaveApproval directly now
    // setAiSuggestionResponse(null);
    // setLoadingSuggestionId(null);
    setShowSmartApproval(false);
    setShowLeaveRejectDialog(false); // Close rejection dialog
    setSelectedLeaveRequest(null);
    loadApprovals();
  };

  const handleExceptionApproval = async (exceptionId, approved) => {
    await base44.entities.AttendanceException.update(exceptionId, {
      status: approved ? "Approved" : "Rejected",
      approved_by: employee.full_name,
      approval_date: new Date().toISOString().split('T')[0]
    });
    loadApprovals();
  };

  const handleExpenseApproval = async (expenseId, approved) => {
    await base44.entities.ExpenseClaim.update(expenseId, {
      status: approved ? "Approved" : "Rejected",
      approved_by: employee.full_name,
      approval_date: new Date().toISOString().split('T')[0]
    });
    loadApprovals();
  };

  const handleLoanApproval = async (loanId, approved) => {
    try {
      if (approved) {
        await base44.entities.LoanAccount.update(loanId, {
          status: "Manager Approved",
          manager_approved_by: employee.full_name,
          manager_approved_date: new Date().toISOString().split('T')[0]
        });
        alert(isRTL ? "تمت الموافقة على القرض" : "Loan approved successfully");
      } else {
        if (!rejectionReason.trim()) {
          alert(isRTL ? "يرجى إدخال سبب الرفض" : "Please enter rejection reason");
          return;
        }
        await base44.entities.LoanAccount.update(loanId, {
          status: "Rejected",
          rejection_reason: rejectionReason,
          status_reason: `Rejected by ${employee.full_name} on ${new Date().toISOString().split('T')[0]}`
        });
        alert(isRTL ? "تم رفض القرض" : "Loan rejected");
      }

      setShowLoanDialog(false);
      setSelectedLoan(null);
      setRejectionReason("");
      loadApprovals();
    } catch (error) {
      console.error("Error processing loan approval:", error);
      alert(isRTL ? "حدث خطأ في المعالجة" : "Error processing approval");
    }
  };

  const openSmartApproval = (request) => {
    setSelectedLeaveRequest(request);
    setShowSmartApproval(true);
  };

  const openLeaveRejectDialog = (request) => {
    setSelectedLeaveRequest(request);
    setRejectionReason(""); // Clear previous reason
    setShowLeaveRejectDialog(true);
  };

  const renderLeaveCard = (leave) => {
    const balance = leave.leaveBalance;
    const projectedBalance = balance
      ? (balance.current_balance || 0) - leave.days_count
      : null;
    const hasBalanceIssue = projectedBalance !== null && projectedBalance < 0;

    return (
      <Card key={leave.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-semibold text-lg">{leave.employee_name}</h3>
                {hasBalanceIssue && (
                  <Badge variant="destructive" className="text-xs">
                    {isRTL ? 'رصيد غير كافٍ' : 'Insufficient Balance'}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{leave.leave_type_name}</span>
                  {leave.leave_category && ` (${leave.leave_category})`}
                </p>
                <p className="text-sm text-gray-500">
                  {format(parseISO(leave.start_date), 'MMM dd')} - {format(parseISO(leave.end_date), 'MMM dd, yyyy')}
                </p>
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {leave.days_count} {isRTL ? 'يوم' : 'day(s)'}
                  </Badge>
                  {balance && (
                    <div className={`flex items-center gap-2 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-gray-500">
                        {isRTL ? 'الرصيد:' : 'Balance:'}
                      </span>
                      <Badge
                        variant="outline"
                        className={hasBalanceIssue ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}
                      >
                        {balance.current_balance || 0} {isRTL ? 'متاح' : 'available'}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge
                        variant="outline"
                        className={hasBalanceIssue ? "bg-red-100 text-red-800 font-semibold" : "bg-gray-50"}
                      >
                        {projectedBalance} {isRTL ? 'متبقي' : 'remaining'}
                      </Badge>
                    </div>
                  )}
                </div>
                {leave.reason && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    {isRTL ? 'السبب: ' : 'Reason: '}{leave.reason}
                  </p>
                )}
                {hasBalanceIssue && (
                  <Alert className="mt-2 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-xs text-red-800">
                      {isRTL
                        ? `هذا الطلب سيتجاوز الرصيد المتاح بـ ${Math.abs(projectedBalance)} يوم`
                        : `This request will exceed available balance by ${Math.abs(projectedBalance)} day(s)`
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            <div className={`flex flex-col gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openSmartApproval(leave)}
                className="whitespace-nowrap"
              >
                <Sparkles className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'مراجعة ذكية' : 'Smart Review'}
              </Button>
              <Button
                size="sm"
                onClick={() => handleLeaveApproval(leave.id, true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'موافقة' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openLeaveRejectDialog(leave)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'رفض' : 'Reject'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {isRTL ? 'لا يوجد أعضاء في الفريق' : 'No team members found'}
        </p>
      </div>
    );
  }

  if (showSmartApproval && selectedLeaveRequest) {
    return (
      <SmartLeaveApproval
        request={selectedLeaveRequest}
        employee={employee}
        teamMembers={teamMembers}
        onApprove={handleLeaveApproval}
        onReject={handleLeaveApproval}
        onCancel={() => {
          setShowSmartApproval(false);
          setSelectedLeaveRequest(null);
        }}
      />
    );
  }

  const totalPending = leaveRequests.length + attendanceExceptions.length + expenseClaims.length + loanRequests.length;

  return (
    <div>
      <Card className="shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle>{isRTL ? 'الموافقات المعلقة' : 'Pending Approvals'}</CardTitle>
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              {totalPending}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="leaves" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white shadow-sm">
          <TabsTrigger value="leaves" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? `الإجازات (${leaveRequests.length})` : `Leaves (${leaveRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? `الحضور (${attendanceExceptions.length})` : `Attendance (${attendanceExceptions.length})`}
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? `المصروفات (${expenseClaims.length})` : `Expenses (${expenseClaims.length})`}
          </TabsTrigger>
          <TabsTrigger value="loans" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? `القروض (${loanRequests.length})` : `Loans (${loanRequests.length})`}
          </TabsTrigger>
          <TabsTrigger value="other" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? 'أخرى' : 'Other'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaves">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'طلبات الإجازة' : 'Leave Requests'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {leaveRequests.map((request) => renderLeaveCard(request))}
                {leaveRequests.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    {isRTL ? 'لا توجد طلبات إجازة معلقة' : 'No pending leave requests'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle>{isRTL ? 'استثناءات الحضور' : 'Attendance Exceptions'}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {attendanceExceptions.map((exception) => (
                  <div key={exception.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <p className="font-medium text-gray-900">{exception.employee_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{exception.exception_type}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(parseISO(exception.exception_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">{exception.reason}</p>
                      </div>
                      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExceptionApproval(exception.id, false)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleExceptionApproval(exception.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {attendanceExceptions.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    {isRTL ? 'لا توجد استثناءات حضور معلقة' : 'No pending attendance exceptions'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'مطالبات المصروفات' : 'Expense Claims'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {expenseClaims.map((claim) => (
                  <div key={claim.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <p className="font-medium text-gray-900">{claim.employee_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{claim.expense_category}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(parseISO(claim.expense_date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">{claim.description}</p>
                        <p className="text-lg font-bold text-green-600 mt-2">
                          {formatCurrency(claim.amount, { isRTL })}
                        </p>
                      </div>
                      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExpenseApproval(claim.id, false)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleExpenseApproval(claim.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {expenseClaims.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    {isRTL ? 'لا توجد مطالبات مصروفات معلقة' : 'No pending expense claims'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CreditCard className="w-5 h-5 text-green-600" />
                <span>{isRTL ? 'طلبات القروض' : 'Loan Requests'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {loanRequests.map((loan) => (
                  <div key={loan.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                        <p className="font-medium text-gray-900">{loan.employee_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{loan.product_name} - {loan.product_type}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {loan.term_months} {isRTL ? 'شهر' : 'months'} | {isRTL ? 'القسط الشهري:' : 'Monthly:'} {formatCurrency(loan.installment_amount, { isRTL })}
                        </p>
                        {loan.purpose && (
                          <p className="text-sm text-gray-400 mt-2">
                            {isRTL ? 'الغرض: ' : 'Purpose: '}{loan.purpose}
                          </p>
                        )}
                        <p className="text-lg font-bold text-green-600 mt-2">
                          {formatCurrency(loan.principal_amount, { isRTL })}
                        </p>
                      </div>
                      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setLoanAction("reject");
                            setShowLoanDialog(true);
                          }}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleLoanApproval(loan.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {loanRequests.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    {isRTL ? 'لا توجد طلبات قروض معلقة' : 'No pending loan requests'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other">
          <Card className="shadow-lg">
            <CardContent className="p-12">
              <div className="text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>{isRTL ? 'قريباً - الموافقات الأخرى' : 'Coming Soon - Other Approvals'}</p>
                <p className="text-sm mt-2">{isRTL ? 'السفر، الأصول، والتوظيف' : 'Travel, Assets, and Hiring'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loan Rejection Dialog */}
      {selectedLoan && showLoanDialog && loanAction === "reject" && (
        <Dialog open={showLoanDialog} onOpenChange={setShowLoanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={isRTL ? 'text-right' : ''}>
                {isRTL ? 'رفض طلب القرض' : 'Reject Loan Request'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className={`bg-gray-50 p-4 rounded-lg ${isRTL ? 'text-right' : ''}`}>
                <p className="font-medium">{selectedLoan.employee_name}</p>
                <p className="text-sm text-gray-600">{selectedLoan.product_name}</p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  {formatCurrency(selectedLoan.principal_amount, { isRTL })}
                </p>
              </div>
              <div className="space-y-2">
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
              </div>
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                <Button variant="outline" onClick={() => setShowLoanDialog(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleLoanApproval(selectedLoan.id, false)}
                >
                  {isRTL ? 'تأكيد الرفض' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Leave Rejection Dialog */}
      {selectedLeaveRequest && showLeaveRejectDialog && (
        <Dialog open={showLeaveRejectDialog} onOpenChange={setShowLeaveRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={isRTL ? 'text-right' : ''}>
                {isRTL ? 'رفض طلب الإجازة' : 'Reject Leave Request'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className={`bg-gray-50 p-4 rounded-lg ${isRTL ? 'text-right' : ''}`}>
                <p className="font-medium">{selectedLeaveRequest.employee_name}</p>
                <p className="text-sm text-gray-600">{selectedLeaveRequest.leave_type_name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {format(parseISO(selectedLeaveRequest.start_date), 'MMM dd')} - {format(parseISO(selectedLeaveRequest.end_date), 'MMM dd, yyyy')} ({selectedLeaveRequest.days_count} {isRTL ? 'أيام' : 'days'})
                </p>
              </div>
              <div className="space-y-2">
                <Label className={isRTL ? 'text-right block' : ''}>
                  {isRTL ? 'سبب الرفض *' : 'Rejection Reason *'}
                </Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={isRTL ? "اشرح سبب رفض طلب الإجازة هذا..." : "Explain why this leave request is being rejected..."}
                  rows={4}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'justify-end'}`}>
                <Button variant="outline" onClick={() => setShowLeaveRejectDialog(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleLeaveApproval(selectedLeaveRequest.id, false, rejectionReason)}
                  disabled={!rejectionReason.trim()}
                >
                  {isRTL ? 'تأكيد الرفض' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
