import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, XCircle, AlertCircle } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function AdvanceRequestForm({ travelRequests, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    travel_request_id: "",
    amount: "",
    currency: "SAR",
    purpose: "",
    payout_method: "Bank Transfer",
    notes: ""
  });

  const [selectedTravel, setSelectedTravel] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "travel_request_id") {
      const travel = travelRequests.find(t => t.id === value);
      setSelectedTravel(travel);
      
      if (travel) {
        // Auto-calculate settlement due date (7 days after return)
        const returnDate = new Date(travel.return_date);
        returnDate.setDate(returnDate.getDate() + 7);
        
        setFormData(prev => ({
          ...prev,
          travel_request_id: value,
          currency: travel.currency || "SAR",
          amount: travel.estimated_budget || "",
          purpose: travel.trip_purpose,
          settlement_due_date: returnDate.toISOString().split('T')[0]
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedTravel) {
      alert(isRTL ? "الرجاء اختيار طلب سفر" : "Please select a travel request");
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-3xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-2xl ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'طلب سلفة سفر' : 'Request Travel Advance'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Travel Request Selection */}
          <div>
            <Label className={`block mb-2 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'طلب السفر *' : 'Travel Request *'}
            </Label>
            <Select 
              value={formData.travel_request_id} 
              onValueChange={(value) => handleChange('travel_request_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? "اختر طلب سفر" : "Select a travel request"} />
              </SelectTrigger>
              <SelectContent>
                {travelRequests.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {isRTL ? 'لا توجد طلبات سفر معتمدة' : 'No approved travel requests'}
                  </div>
                ) : (
                  travelRequests.map(travel => (
                    <SelectItem key={travel.id} value={travel.id}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span className="font-medium">{travel.request_number}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-600">{travel.trip_purpose}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Travel Info */}
          {selectedTravel && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                <Badge className="bg-blue-600">{selectedTravel.trip_type}</Badge>
                <Badge variant="outline">{selectedTravel.status}</Badge>
              </div>
              
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm font-medium text-gray-900">{selectedTravel.trip_purpose}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {format(parseISO(selectedTravel.departure_date), 'MMM dd, yyyy')} - {format(parseISO(selectedTravel.return_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'المدة: ' : 'Duration: '}
                  {differenceInDays(parseISO(selectedTravel.return_date), parseISO(selectedTravel.departure_date))} {isRTL ? 'يوم' : 'days'}
                </p>
                <p className="text-sm font-medium text-green-600 mt-2">
                  {isRTL ? 'الميزانية المقدرة: ' : 'Estimated Budget: '}
                  {selectedTravel.estimated_budget?.toLocaleString()} {selectedTravel.currency}
                </p>
              </div>
            </div>
          )}

          {/* Advance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className={`block mb-2 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'المبلغ *' : 'Amount *'}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                className={isRTL ? 'text-right' : ''}
                required
              />
            </div>

            <div>
              <Label className={`block mb-2 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'العملة' : 'Currency'}
              </Label>
              <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payout Method */}
          <div>
            <Label className={`block mb-2 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'طريقة الصرف *' : 'Payout Method *'}
            </Label>
            <Select value={formData.payout_method} onValueChange={(value) => handleChange('payout_method', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank Transfer">{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</SelectItem>
                <SelectItem value="Payroll">{isRTL ? 'عبر الراتب' : 'Payroll'}</SelectItem>
                <SelectItem value="Cash">{isRTL ? 'نقداً' : 'Cash'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div>
            <Label className={`block mb-2 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'الغرض' : 'Purpose'}
            </Label>
            <Textarea
              value={formData.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              className={`h-20 ${isRTL ? 'text-right' : ''}`}
              placeholder={isRTL ? "تفاصيل الغرض من السلفة" : "Details about the advance purpose"}
            />
          </div>

          {/* Notes */}
          <div>
            <Label className={`block mb-2 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'ملاحظات' : 'Notes'}
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className={`h-20 ${isRTL ? 'text-right' : ''}`}
              placeholder={isRTL ? "ملاحظات إضافية" : "Additional notes"}
            />
          </div>

          {/* Info Box */}
          <div className={`flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className={`text-sm ${isRTL ? 'text-right' : ''}`}>
              <p className="font-medium text-yellow-900">
                {isRTL ? 'ملاحظة هامة' : 'Important Note'}
              </p>
              <p className="text-yellow-700 mt-1">
                {isRTL 
                  ? 'يجب تسوية السلفة خلال 7 أيام من العودة من السفر عن طريق تقديم تقرير المصروفات. أي مبلغ زائد سيتم استرداده من الراتب.'
                  : 'Advance must be settled within 7 days of return by submitting expense report. Any excess amount will be recovered from payroll.'
                }
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className={`flex gap-3 border-t border-gray-100 bg-gray-50 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
          <Button type="button" variant="outline" onClick={onCancel} className={isRTL ? 'flex-row-reverse' : ''}>
            <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button type="submit" className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إرسال الطلب' : 'Submit Request'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}