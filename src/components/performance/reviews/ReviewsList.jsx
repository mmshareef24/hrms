import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, User } from "lucide-react";

export default function ReviewsList({ reviews, onEdit, onView }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const getStatusColor = (status) => {
    const colors = {
      "Draft": "bg-gray-100 text-gray-800",
      "Self Review Started": "bg-blue-100 text-blue-800",
      "Self Review Completed": "bg-purple-100 text-purple-800",
      "Manager Review": "bg-yellow-100 text-yellow-800",
      "HR Review": "bg-orange-100 text-orange-800",
      "Calibration": "bg-indigo-100 text-indigo-800",
      "Completed": "bg-green-100 text-green-800",
      "Acknowledged": "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getRatingColor = (rating) => {
    const colors = {
      "Outstanding": "bg-green-100 text-green-800",
      "Exceeds Expectations": "bg-blue-100 text-blue-800",
      "Meets Expectations": "bg-gray-100 text-gray-800",
      "Needs Improvement": "bg-yellow-100 text-yellow-800",
      "Unsatisfactory": "bg-red-100 text-red-800"
    };
    return colors[rating] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>{isRTL ? 'لا توجد مراجعات' : 'No reviews found'}</p>
        </Card>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                    <Badge className={getStatusColor(review.status)}>
                      {review.status}
                    </Badge>
                    {review.overall_rating && (
                      <Badge className={getRatingColor(review.overall_rating)}>
                        {review.overall_rating}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900">{review.employee_name}</h3>
                  <p className="text-sm text-gray-600">{review.employee_job_title} • {review.employee_department}</p>
                  <p className="text-sm text-gray-500 mt-1">{review.cycle_name}</p>
                  
                  {review.overall_score && (
                    <div className={`flex items-center gap-2 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm text-gray-600">{isRTL ? 'التقييم:' : 'Score:'}</span>
                      <span className="text-xl font-bold text-green-600">{review.overall_score}/5</span>
                    </div>
                  )}
                </div>

                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onView(review)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEdit(review)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}