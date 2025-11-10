import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Edit, X, CheckCircle, AlertCircle, Download } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PolicyView({ policy, hasAcknowledged, onClose, onEdit, onAcknowledge }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle>
              {isRTL ? (policy.policy_name_arabic || policy.policy_name) : policy.policy_name}
            </CardTitle>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {policy.policy_code}
            </Badge>
            <Badge variant="outline">
              v{policy.version}
            </Badge>
            {policy.is_active && (
              <Badge className="bg-green-100 text-green-800">
                {isRTL ? 'نشطة' : 'Active'}
              </Badge>
            )}
          </div>
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Policy Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={isRTL ? 'text-right' : ''}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {isRTL ? 'الفئة' : 'Category'}
            </h3>
            <Badge variant="outline" className={
              policy.category === "HR" ? "bg-purple-100 text-purple-800" :
              policy.category === "IT" ? "bg-blue-100 text-blue-800" :
              policy.category === "Safety" ? "bg-red-100 text-red-800" :
              "bg-green-100 text-green-800"
            }>
              {policy.category}
            </Badge>
          </div>

          <div className={isRTL ? 'text-right' : ''}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {isRTL ? 'تاريخ السريان' : 'Effective Date'}
            </h3>
            <p className="text-base text-gray-900">
              {policy.effective_date ? format(parseISO(policy.effective_date), 'MMMM dd, yyyy') : 'N/A'}
            </p>
          </div>

          <div className={isRTL ? 'text-right' : ''}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {isRTL ? 'ينطبق على' : 'Applies To'}
            </h3>
            <p className="text-base text-gray-900">{policy.applies_to}</p>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        {policy.summary && (
          <>
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {isRTL ? 'الملخص' : 'Summary'}
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-900">{policy.summary}</p>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Content */}
        <div className={isRTL ? 'text-right' : ''}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {isRTL ? 'محتوى السياسة' : 'Policy Content'}
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg prose max-w-none">
            <p className="text-gray-900 whitespace-pre-wrap">{policy.content}</p>
          </div>
        </div>

        {/* Document Download */}
        {policy.document_url && (
          <>
            <Separator />
            <div className={isRTL ? 'text-right' : ''}>
              <Button variant="outline" className={isRTL ? 'flex-row-reverse' : ''}>
                <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تحميل المستند' : 'Download Document'}
              </Button>
            </div>
          </>
        )}

        {/* Acknowledgment */}
        {policy.requires_acknowledgment && (
          <>
            <Separator />
            <div className={`p-4 rounded-lg ${hasAcknowledged ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {hasAcknowledged ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                  <span className={`font-medium ${hasAcknowledged ? 'text-green-900' : 'text-orange-900'}`}>
                    {hasAcknowledged 
                      ? (isRTL ? 'لقد أقررت باستلام هذه السياسة' : 'You have acknowledged this policy')
                      : (isRTL ? 'يرجى الإقرار بأنك قرأت وفهمت هذه السياسة' : 'Please acknowledge that you have read and understood this policy')
                    }
                  </span>
                </div>
                {!hasAcknowledged && (
                  <Button 
                    onClick={() => onAcknowledge(policy.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isRTL ? 'إقرار الاستلام' : 'Acknowledge'}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Review Date */}
        {policy.review_date && (
          <>
            <Separator />
            <div className={`p-4 bg-blue-50 rounded-lg ${isRTL ? 'text-right' : ''}`}>
              <p className="text-sm text-blue-900">
                {isRTL ? 'تاريخ المراجعة القادمة: ' : 'Next Review Date: '}
                <span className="font-medium">
                  {format(parseISO(policy.review_date), 'MMMM dd, yyyy')}
                </span>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}