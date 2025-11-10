import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { filterDataByRole, canApproveRequest } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AttendanceExceptions({ userRole, employee }) {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadExceptions();
  }, [userRole, employee]);

  const loadExceptions = async () => {
    setLoading(true);
    try {
      const allExceptions = await base44.entities.AttendanceException.list('-created_date', 100);
      
      // Filter based on role
      const filtered = filterDataByRole(
        allExceptions,
        userRole,
        employee?.id,
        'request'
      );
      
      setExceptions(filtered || []);
    } catch (error) {
      console.error("Error loading exceptions:", error);
      setExceptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (exceptionId, requesterId, requesterManagerId) => {
    const canApprove = canApproveRequest(userRole, 'attendance', requesterManagerId, employee?.id);
    
    if (!canApprove) {
      alert(isRTL ? "ليس لديك صلاحية الموافقة على هذا الطلب" : "You don't have permission to approve this request");
      return;
    }

    try {
      await base44.entities.AttendanceException.update(exceptionId, {
        status: "Approved",
        approved_by: employee?.full_name || "System",
        approval_date: new Date().toISOString().split('T')[0]
      });
      
      await loadExceptions();
    } catch (error) {
      console.error("Error approving exception:", error);
      alert(isRTL ? "حدث خطأ في الموافقة" : "Error approving request");
    }
  };

  const handleRejectClick = (exception) => {
    setSelectedRequest(exception);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert(isRTL ? "يرجى إدخال سبب الرفض" : "Please enter rejection reason");
      return;
    }

    const canReject = canApproveRequest(
      userRole, 
      'attendance', 
      selectedRequest.manager_id, 
      employee?.id
    );
    
    if (!canReject) {
      alert(isRTL ? "ليس لديك صلاحية رفض هذا الطلب" : "You don't have permission to reject this request");
      return;
    }

    try {
      await base44.entities.AttendanceException.update(selectedRequest.id, {
        status: "Rejected",
        rejection_reason: rejectionReason
      });
      
      setShowRejectDialog(false);
      setSelectedRequest(null);
      await loadExceptions();
    } catch (error) {
      console.error("Error rejecting exception:", error);
      alert(isRTL ? "حدث خطأ في الرفض" : "Error rejecting request");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>{isRTL ? 'طلبات تصحيح الحضور' : 'Attendance Correction Requests'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                  <TableHead>{isRTL ? 'المطلوب' : 'Requested'}</TableHead>
                  <TableHead>{isRTL ? 'السبب' : 'Reason'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-left' : 'text-right'}>
                    {isRTL ? 'الإجراءات' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.map((exception) => {
                  const canApprove = canApproveRequest(
                    userRole, 
                    'attendance', 
                    exception.manager_id, 
                    employee?.id
                  );

                  return (
                    <TableRow key={exception.id}>
                      <TableCell className="font-medium">{exception.employee_name}</TableCell>
                      <TableCell>
                        {exception.exception_date && format(parseISO(exception.exception_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{exception.exception_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {exception.requested_clock_in || '-'} → {exception.requested_clock_out || '-'}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {exception.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            exception.status === "Approved"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : exception.status === "Rejected"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-orange-100 text-orange-800 border-orange-200"
                          }
                        >
                          {exception.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                        {exception.status === "Pending" && canApprove ? (
                          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectClick(exception)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(
                                exception.id,
                                exception.employee_id,
                                exception.manager_id
                              )}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
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
            {exceptions.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                {isRTL ? 'لا توجد طلبات تصحيح' : 'No correction requests'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {isRTL ? 'رفض طلب التصحيح' : 'Reject Correction Request'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'سبب الرفض *' : 'Rejection Reason *'}</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={isRTL ? "يرجى تقديم سبب الرفض..." : "Please provide reason for rejection..."}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleReject} 
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