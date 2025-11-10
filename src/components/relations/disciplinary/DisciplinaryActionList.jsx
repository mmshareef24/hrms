import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, AlertTriangle, FileWarning, Ban } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function DisciplinaryActionList({ actions, employees, onView }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const getActionIcon = (type) => {
    if (type?.includes("Suspension")) return Ban;
    if (type === "Final Warning") return AlertTriangle;
    return FileWarning;
  };

  const getActionColor = (type) => {
    switch (type) {
      case "Verbal Warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Written Warning": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Final Warning": return "bg-red-100 text-red-800 border-red-200";
      case "Suspension (Paid)":
      case "Suspension (Unpaid)": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Termination": return "bg-red-200 text-red-900 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>{isRTL ? 'لا توجد إجراءات' : 'No actions found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => {
        const employee = employees.find(e => e.id === action.employee_id);
        const Icon = getActionIcon(action.action_type);
        const daysActive = action.action_date 
          ? differenceInDays(new Date(), parseISO(action.action_date))
          : 0;
        const daysUntilExpiry = action.expiry_date
          ? differenceInDays(parseISO(action.expiry_date), new Date())
          : null;

        return (
          <Card key={action.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-start gap-4 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  
                  <div className={`flex-1 space-y-2 ${isRTL ? 'text-right' : ''}`}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {action.action_number}
                      </h3>
                      <Badge variant="outline" className={getActionColor(action.action_type)}>
                        {action.action_type}
                      </Badge>
                      {action.status && (
                        <Badge variant="outline" className={
                          action.status === "Active" ? "bg-green-100 text-green-800" :
                          action.status === "Expired" ? "bg-gray-100 text-gray-800" :
                          "bg-blue-100 text-blue-800"
                        }>
                          {action.status}
                        </Badge>
                      )}
                    </div>

                    <div className={`flex items-center gap-4 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="font-medium">
                        {employee?.full_name || action.employee_name}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span>{action.violation_type}</span>
                      {action.action_date && (
                        <>
                          <span className="text-gray-400">|</span>
                          <span>{format(parseISO(action.action_date), 'MMM dd, yyyy')}</span>
                        </>
                      )}
                    </div>

                    <p className="text-gray-700 line-clamp-2">
                      {action.violation_description}
                    </p>

                    <div className={`flex items-center gap-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {isRTL ? `تنتهي خلال ${daysUntilExpiry} يوم` : `Expires in ${daysUntilExpiry} days`}
                        </Badge>
                      )}
                      {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          {isRTL ? 'منتهية' : 'Expired'}
                        </Badge>
                      )}
                      {!action.acknowledged_by_employee && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {isRTL ? 'في انتظار الإقرار' : 'Pending Acknowledgment'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(action)}
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