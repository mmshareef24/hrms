import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function LoanApplicationList({ applications, employee, loading, onRefresh, showApprovalActions }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const getStatusBadge = (status) => {
    const colors = {
      "Draft": "bg-gray-100 text-gray-800",
      "Submitted": "bg-blue-100 text-blue-800",
      "Manager Approved": "bg-green-100 text-green-800",
      "HR Approved": "bg-green-100 text-green-800",
      "Finance Approved": "bg-green-100 text-green-800",
      "Disbursed": "bg-purple-100 text-purple-800",
      "Active": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleApprove = async (loanId, currentStatus) => {
    let newStatus = "Submitted";
    if (currentStatus === "Submitted") newStatus = "Manager Approved";
    else if (currentStatus === "Manager Approved") newStatus = "HR Approved";
    else if (currentStatus === "HR Approved") newStatus = "Finance Approved";

    await base44.entities.LoanAccount.update(loanId, {
      status: newStatus,
      [`${newStatus.toLowerCase().replace(' ', '_')}_by`]: employee?.full_name,
      [`${newStatus.toLowerCase().replace(' ', '_')}_date`]: new Date().toISOString().split('T')[0]
    });
    onRefresh();
  };

  const handleReject = async (loanId) => {
    const reason = prompt(isRTL ? "سبب الرفض:" : "Rejection reason:");
    if (!reason) return;

    await base44.entities.LoanAccount.update(loanId, {
      status: "Rejected",
      rejection_reason: reason
    });
    onRefresh();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>{isRTL ? 'لا توجد طلبات' : 'No applications found'}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رقم الطلب' : 'Loan #'}</TableHead>
            {showApprovalActions && (
              <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
            )}
            <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Type'}</TableHead>
            <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
            <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المدة' : 'Term'}</TableHead>
            <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'القسط الشهري' : 'Monthly EMI'}</TableHead>
            <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ الطلب' : 'Request Date'}</TableHead>
            <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.loan_number}</TableCell>
              {showApprovalActions && (
                <TableCell>{app.employee_name}</TableCell>
              )}
              <TableCell>
                <Badge variant="outline">{app.product_type}</Badge>
              </TableCell>
              <TableCell>{app.principal_amount?.toLocaleString()} {app.currency}</TableCell>
              <TableCell>{app.term_months}m</TableCell>
              <TableCell className="font-medium">{app.installment_amount?.toLocaleString()}</TableCell>
              <TableCell className="text-sm text-gray-500">
                {app.requested_date && format(parseISO(app.requested_date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadge(app.status)}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {showApprovalActions && (app.status === "Submitted" || app.status === "Manager Approved" || app.status === "HR Approved") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(app.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(app.id, app.status)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}