import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Check, X, Eye, Clock, UserCheck, Building2, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const leaveTypeColors = {
  "Annual Leave": "bg-blue-100 text-blue-800 border-blue-200",
  "Sick Leave": "bg-red-100 text-red-800 border-red-200",
  "Maternity Leave": "bg-pink-100 text-pink-800 border-pink-200",
  "Paternity Leave": "bg-purple-100 text-purple-800 border-purple-200",
  "Unpaid Leave": "bg-gray-100 text-gray-800 border-gray-200",
  "Emergency Leave": "bg-orange-100 text-orange-800 border-orange-200"
};

const getStatusConfig = (status) => {
  const configs = {
    "Draft": { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock },
    "Pending Manager Approval": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: UserCheck },
    "Pending HR Approval": { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Building2 },
    "Approved": { color: "bg-green-100 text-green-800 border-green-200", icon: Check },
    "Rejected": { color: "bg-red-100 text-red-800 border-red-200", icon: X },
    "Cancelled": { color: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertCircle }
  };
  return configs[status] || configs["Draft"];
};

export default function LeaveRequestList({ 
  requests, 
  loading, 
  onApprove, 
  onReject, 
  onEdit,
  currentUser,
  userRole 
}) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalComments, setApprovalComments] = useState("");
  const [actionType, setActionType] = useState(null); // 'manager' or 'hr'
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setApprovalComments("");
    
    // Determine action type based on current status
    if (request.status === "Pending Manager Approval") {
      setActionType('manager');
    } else if (request.status === "Pending HR Approval") {
      setActionType('hr');
    }
    
    setShowApprovalDialog(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setRejectionReason("");
    
    // Determine action type based on current status
    if (request.status === "Pending Manager Approval") {
      setActionType('manager');
    } else if (request.status === "Pending HR Approval") {
      setActionType('hr');
    }
    
    setShowRejectDialog(true);
  };

  const confirmApproval = async () => {
    if (selectedRequest && onApprove) {
      await onApprove(selectedRequest.id, actionType, approvalComments);
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setApprovalComments("");
    }
  };

  const confirmRejection = async () => {
    if (!rejectionReason.trim()) {
      alert(isRTL ? "يرجى إدخال سبب الرفض" : "Please enter rejection reason");
      return;
    }
    
    if (selectedRequest && onReject) {
      await onReject(selectedRequest.id, actionType, rejectionReason);
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
    }
  };

  const canApproveRequest = (request) => {
    if (!currentUser || !userRole) return false;
    
    // Manager can approve if status is "Pending Manager Approval"
    if (request.status === "Pending Manager Approval" && userRole === "Manager") {
      return true;
    }
    
    // HR can approve if status is "Pending HR Approval"
    if (request.status === "Pending HR Approval" && userRole === "HR") {
      return true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <Card className="shadow-lg overflow-hidden">
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-4 border-b last:border-b-0">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                <TableHead className="font-semibold">{isRTL ? 'نوع الإجازة' : 'Leave Type'}</TableHead>
                <TableHead className="font-semibold">{isRTL ? 'المدة' : 'Duration'}</TableHead>
                <TableHead className="font-semibold">{isRTL ? 'الأيام' : 'Days'}</TableHead>
                <TableHead className="font-semibold">{isRTL ? 'السبب' : 'Reason'}</TableHead>
                <TableHead className="font-semibold">{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="font-semibold">{isRTL ? 'مرحلة الموافقة' : 'Approval Stage'}</TableHead>
                <TableHead className={`font-semibold ${isRTL ? 'text-left' : 'text-right'}`}>
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const statusConfig = getStatusConfig(request.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <TableRow key={request.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-gray-900">{request.employee_name}</div>
                      <div className="text-sm text-gray-500">{request.employee_id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={leaveTypeColors[request.leave_type_name] || "bg-gray-100"}>
                        {request.leave_type_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(parseISO(request.start_date), "MMM dd, yyyy")}</div>
                        <div className="text-gray-500">to {format(parseISO(request.end_date), "MMM dd, yyyy")}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{request.days_count}</span> {isRTL ? 'يوم' : 'days'}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-gray-600">
                        {request.reason || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${statusConfig.color} flex items-center gap-1 w-fit`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        {request.manager_approved_date && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Check className="w-3 h-3" />
                            <span>{isRTL ? 'موافقة المدير' : 'Manager'} ✓</span>
                          </div>
                        )}
                        {request.hr_approved_date && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Check className="w-3 h-3" />
                            <span>{isRTL ? 'موافقة الموارد البشرية' : 'HR'} ✓</span>
                          </div>
                        )}
                        {request.rejected_at_stage && (
                          <div className="flex items-center gap-1 text-red-600">
                            <X className="w-3 h-3" />
                            <span>{isRTL ? 'مرفوض من' : 'Rejected by'} {request.rejected_at_stage}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                      {canApproveRequest(request) ? (
                        <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                          <Button
                            size="sm"
                            onClick={() => handleApproveClick(request)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {isRTL ? 'موافقة' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectClick(request)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            {isRTL ? 'رفض' : 'Reject'}
                          </Button>
                        </div>
                      ) : request.status === "Draft" && onEdit ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {isRTL ? 'عرض' : 'View'}
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400">
                          {isRTL ? 'لا توجد إجراءات' : 'No actions'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'تأكيد الموافقة' : 'Confirm Approval'}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? `هل أنت متأكد من الموافقة على طلب الإجازة لـ ${selectedRequest?.employee_name}؟`
                : `Are you sure you want to approve the leave request for ${selectedRequest?.employee_name}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'تعليقات (اختياري)' : 'Comments (Optional)'}</Label>
              <Textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder={isRTL ? "أضف أي تعليقات..." : "Add any comments..."}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={confirmApproval} className="bg-green-600 hover:bg-green-700">
              {isRTL ? 'تأكيد الموافقة' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {isRTL ? 'تأكيد الرفض' : 'Confirm Rejection'}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? `هل أنت متأكد من رفض طلب الإجازة لـ ${selectedRequest?.employee_name}؟`
                : `Are you sure you want to reject the leave request for ${selectedRequest?.employee_name}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'سبب الرفض *' : 'Rejection Reason *'}</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={isRTL ? "يرجى تقديم سبب الرفض..." : "Please provide reason for rejection..."}
                rows={4}
                className={!rejectionReason.trim() ? "border-red-300" : ""}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={confirmRejection} 
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              {isRTL ? 'تأكيد الرفض' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}