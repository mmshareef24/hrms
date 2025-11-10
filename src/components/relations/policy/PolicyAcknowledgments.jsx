import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PolicyAcknowledgments({ acknowledgments, policies, onView }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  if (acknowledgments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>{isRTL ? 'لم تقر باستلام أي سياسات بعد' : 'No policy acknowledgments yet'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {acknowledgments.map((ack) => {
        const policy = policies.find(p => p.id === ack.policy_id);
        if (!policy) return null;

        return (
          <Card key={ack.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-start gap-4 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className={`flex-1 space-y-2 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {isRTL ? (policy.policy_name_arabic || policy.policy_name) : policy.policy_name}
                      </h3>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {policy.policy_code}
                      </Badge>
                      {ack.policy_version && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          v{ack.policy_version}
                        </Badge>
                      )}
                    </div>

                    <div className={`flex items-center gap-2 text-sm text-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {isRTL ? 'تم الإقرار في: ' : 'Acknowledged on: '}
                        {ack.acknowledged_date ? format(parseISO(ack.acknowledged_date), 'MMMM dd, yyyy') : 'N/A'}
                      </span>
                    </div>

                    <Badge variant="outline" className={
                      policy.category === "HR" ? "bg-purple-100 text-purple-800" :
                      policy.category === "IT" ? "bg-blue-100 text-blue-800" :
                      policy.category === "Safety" ? "bg-red-100 text-red-800" :
                      "bg-green-100 text-green-800"
                    }>
                      {policy.category}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(ack.policy_id)}
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