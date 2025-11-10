import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AdvanceList({ advances, travelRequests, onApprove, onDisburse, onSettle, showActions }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const getStatusColor = (status) => {
    const colors = {
      "Requested": "bg-yellow-100 text-yellow-800",
      "Manager Approved": "bg-blue-100 text-blue-800",
      "Finance Approved": "bg-green-100 text-green-800",
      "Disbursed": "bg-purple-100 text-purple-800",
      "Settled": "bg-green-100 text-green-800",
      "Settled - Owed to Employee": "bg-blue-100 text-blue-800",
      "Settled - Pending Recovery": "bg-red-100 text-red-800",
      "Cancelled": "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTravelInfo = (travelId) => {
    return travelRequests.find(t => t.id === travelId);
  };

  return (
    <div className="space-y-4">
      {advances.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'لا توجد سلف' : 'No advances found'}</p>
        </Card>
      ) : (
        advances.map((advance) => {
          const travel = getTravelInfo(advance.travel_request_id);
          
          return (
            <Card key={advance.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                    {/* Header */}
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <span className="text-sm font-mono text-gray-500">{advance.advance_number}</span>
                      <Badge className={getStatusColor(advance.status)}>
                        {advance.status}
                      </Badge>
                      <Badge variant="outline">{advance.payout_method}</Badge>
                    </div>

                    {/* Travel Info */}
                    {travel && (
                      <div className="mb-3">
                        <p className="font-medium text-gray-900">{travel.trip_purpose}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {travel.request_number} • {format(parseISO(travel.departure_date), 'MMM dd')} - {format(parseISO(travel.return_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}

                    {/* Amount */}
                    <div className={`flex items-center gap-4 mt-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                      <div>
                        <p className="text-xs text-gray-500">{isRTL ? 'مبلغ السلفة' : 'Advance Amount'}</p>
                        <p className="text-2xl font-bold text-green-600">
                          {advance.amount?.toLocaleString()} {advance.currency}
                        </p>
                      </div>

                      {advance.settled_amount > 0 && (
                        <>
                          <div className="text-gray-300">→</div>
                          <div>
                            <p className="text-xs text-gray-500">{isRTL ? 'المصروفات' : 'Expenses'}</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {advance.settled_amount?.toLocaleString()} {advance.currency}
                            </p>
                          </div>
                        </>
                      )}

                      {advance.balance !== undefined && advance.balance !== 0 && (
                        <>
                          <div className="text-gray-300">=</div>
                          <div>
                            <p className="text-xs text-gray-500">
                              {advance.balance > 0 
                                ? (isRTL ? 'للاسترداد' : 'To Recover') 
                                : (isRTL ? 'مستحق للموظف' : 'Owed to Employee')
                              }
                            </p>
                            <p className={`text-lg font-semibold ${advance.balance > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {Math.abs(advance.balance)?.toLocaleString()} {advance.currency}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      {advance.request_date && (
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4" />
                          <span>{isRTL ? 'طلبت في: ' : 'Requested: '}{format(parseISO(advance.request_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      {advance.disbursement_date && (
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>{isRTL ? 'صرفت في: ' : 'Disbursed: '}{format(parseISO(advance.disbursement_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      {advance.settlement_due_date && advance.status === "Disbursed" && (
                        <div className={`flex items-center gap-1 text-orange-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <AlertTriangle className="w-4 h-4" />
                          <span>{isRTL ? 'موعد التسوية: ' : 'Due: '}{format(parseISO(advance.settlement_due_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    {/* Recovery Method */}
                    {advance.refund_due > 0 && advance.refund_method && (
                      <div className={`flex items-center gap-2 mt-3 p-2 bg-red-50 rounded ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700">
                          {isRTL ? 'الاسترداد عبر: ' : 'Recovery via: '}{advance.refund_method}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className={`flex flex-col gap-2 ${isRTL ? 'items-end' : 'items-start'}`}>
                      {advance.status === "Requested" && onApprove && (
                        <Button 
                          size="sm"
                          onClick={() => onApprove(advance.id, "manager")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isRTL ? 'موافقة' : 'Approve'}
                        </Button>
                      )}

                      {advance.status === "Manager Approved" && onApprove && (
                        <Button 
                          size="sm"
                          onClick={() => onApprove(advance.id, "finance")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isRTL ? 'موافقة مالية' : 'Finance Approve'}
                        </Button>
                      )}

                      {advance.status === "Finance Approved" && onDisburse && (
                        <Button 
                          size="sm"
                          onClick={() => onDisburse(advance.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isRTL ? 'صرف' : 'Disburse'}
                        </Button>
                      )}

                      {advance.status === "Disbursed" && onSettle && (
                        <Button 
                          size="sm"
                          onClick={() => onSettle(advance)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isRTL ? 'تسوية' : 'Settle'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}