import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PolicyList({ policies, myAcknowledgments, onView, highlightPending = false }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  if (policies.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>{isRTL ? 'لا توجد سياسات' : 'No policies found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {policies.map((policy) => {
        const hasAcknowledged = myAcknowledgments.some(a => a.policy_id === policy.id);
        const needsAcknowledgment = policy.requires_acknowledgment && !hasAcknowledged;

        return (
          <Card 
            key={policy.id} 
            className={`hover:shadow-lg transition-shadow ${highlightPending && needsAcknowledgment ? 'border-orange-300 border-2' : ''}`}
          >
            <CardContent className="p-6">
              <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-start gap-4 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className={`flex-1 space-y-2 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {isRTL ? (policy.policy_name_arabic || policy.policy_name) : policy.policy_name}
                      </h3>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {policy.policy_code}
                      </Badge>
                      {policy.version && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          v{policy.version}
                        </Badge>
                      )}
                      <Badge variant="outline" className={
                        policy.category === "HR" ? "bg-purple-100 text-purple-800" :
                        policy.category === "IT" ? "bg-blue-100 text-blue-800" :
                        policy.category === "Safety" ? "bg-red-100 text-red-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {policy.category}
                      </Badge>
                    </div>

                    {policy.summary && (
                      <p className="text-gray-600 line-clamp-2">
                        {policy.summary}
                      </p>
                    )}

                    <div className={`flex items-center gap-4 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {policy.effective_date && (
                        <span>
                          {isRTL ? 'تاريخ السريان: ' : 'Effective: '}
                          {format(parseISO(policy.effective_date), 'MMM dd, yyyy')}
                        </span>
                      )}
                      {policy.requires_acknowledgment && (
                        <>
                          <span className="text-gray-400">|</span>
                          {hasAcknowledged ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              {isRTL ? 'تم الإقرار' : 'Acknowledged'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="w-4 h-4" />
                              {isRTL ? 'يتطلب إقرار' : 'Requires Acknowledgment'}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(policy)}
                  className={isRTL ? 'flex-row-reverse' : ''}
                >
                  <Eye className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'عرض' : 'View'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}