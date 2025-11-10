import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Save, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export default function TravelRequestForm({ request, onSave, onCancel, user }) {
  const [formData, setFormData] = useState(request || {
    trip_purpose: "",
    trip_type: "Domestic",
    departure_date: "",
    return_date: "",
    destinations: "[]",
    estimated_budget: 0,
    estimated_airfare: 0,
    estimated_hotel: 0,
    estimated_perdiem: 0,
    currency: "SAR",
    advance_required: false,
    advance_amount: 0,
    department: "",
    cost_center: "",
    project_code: ""
  });

  const [destinations, setDestinations] = useState([]);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    if (request && request.destinations) {
      try {
        setDestinations(JSON.parse(request.destinations));
      } catch {
        setDestinations([]);
      }
    }
  }, [request]);

  useEffect(() => {
    // Calculate total days
    if (formData.departure_date && formData.return_date) {
      const days = differenceInDays(parseISO(formData.return_date), parseISO(formData.departure_date)) + 1;
      const nights = days - 1;
      setFormData(prev => ({
        ...prev,
        total_days: days,
        total_nights: nights
      }));
    }
  }, [formData.departure_date, formData.return_date]);

  const addDestination = () => {
    setDestinations([...destinations, { city: "", country: "" }]);
  };

  const removeDestination = (index) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const updateDestination = (index, field, value) => {
    const newDests = [...destinations];
    newDests[index][field] = value;
    setDestinations(newDests);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const destinationsList = destinations.map(d => `${d.city}, ${d.country}`);
    onSave({
      ...formData,
      destinations: JSON.stringify(destinationsList),
      estimated_budget: parseFloat(formData.estimated_airfare || 0) + 
                       parseFloat(formData.estimated_hotel || 0) + 
                       parseFloat(formData.estimated_perdiem || 0)
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className={`text-xl ${isRTL ? 'text-right' : ''}`}>
            {request 
              ? (isRTL ? 'تعديل طلب السفر' : 'Edit Travel Request')
              : (isRTL ? 'طلب سفر جديد' : 'New Travel Request')
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'الغرض من السفر *' : 'Trip Purpose *'}
              </Label>
              <Textarea
                value={formData.trip_purpose}
                onChange={(e) => handleChange('trip_purpose', e.target.value)}
                rows={2}
                required
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'نوع السفر' : 'Trip Type'}
              </Label>
              <Select value={formData.trip_type} onValueChange={(v) => handleChange('trip_type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Domestic">{isRTL ? 'محلي' : 'Domestic'}</SelectItem>
                  <SelectItem value="International">{isRTL ? 'دولي' : 'International'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'العملة' : 'Currency'}
              </Label>
              <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
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

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'تاريخ المغادرة *' : 'Departure Date *'}
              </Label>
              <Input
                type="date"
                value={formData.departure_date}
                onChange={(e) => handleChange('departure_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'تاريخ العودة *' : 'Return Date *'}
              </Label>
              <Input
                type="date"
                value={formData.return_date}
                onChange={(e) => handleChange('return_date', e.target.value)}
                min={formData.departure_date}
                required
              />
            </div>

            {formData.total_days > 0 && (
              <div className="md:col-span-2">
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{isRTL ? `${formData.total_days} أيام` : `${formData.total_days} Days`}</span>
                  <span>{isRTL ? `${formData.total_nights} ليالي` : `${formData.total_nights} Nights`}</span>
                </div>
              </div>
            )}
          </div>

          {/* Destinations */}
          <div>
            <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Label className={isRTL ? 'text-right' : ''}>{isRTL ? 'الوجهات *' : 'Destinations *'}</Label>
              <Button type="button" onClick={addDestination} variant="outline" size="sm" className={isRTL ? 'flex-row-reverse' : ''}>
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'إضافة وجهة' : 'Add Destination'}
              </Button>
            </div>
            <div className="space-y-3">
              {destinations.map((dest, index) => (
                <div key={index} className={`flex gap-2 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={isRTL ? "المدينة" : "City"}
                    value={dest.city}
                    onChange={(e) => updateDestination(index, 'city', e.target.value)}
                    className={`flex-1 ${isRTL ? 'text-right' : ''}`}
                    required
                  />
                  <Input
                    placeholder={isRTL ? "البلد" : "Country"}
                    value={dest.country}
                    onChange={(e) => updateDestination(index, 'country', e.target.value)}
                    className={`flex-1 ${isRTL ? 'text-right' : ''}`}
                    required
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeDestination(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Estimates */}
          <div>
            <Label className={`block mb-3 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'الميزانية المقدرة' : 'Estimated Budget'}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الطيران' : 'Airfare'}</Label>
                <Input
                  type="number"
                  value={formData.estimated_airfare}
                  onChange={(e) => handleChange('estimated_airfare', parseFloat(e.target.value) || 0)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'الفندق' : 'Hotel'}</Label>
                <Input
                  type="number"
                  value={formData.estimated_hotel}
                  onChange={(e) => handleChange('estimated_hotel', parseFloat(e.target.value) || 0)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
              <div>
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'البدل اليومي' : 'Per Diem'}</Label>
                <Input
                  type="number"
                  value={formData.estimated_perdiem}
                  onChange={(e) => handleChange('estimated_perdiem', parseFloat(e.target.value) || 0)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-medium text-gray-700">
                  {isRTL ? 'الإجمالي:' : 'Total:'}
                </span>
                <span className="text-lg font-bold text-green-600">
                  {((parseFloat(formData.estimated_airfare) || 0) + 
                    (parseFloat(formData.estimated_hotel) || 0) + 
                    (parseFloat(formData.estimated_perdiem) || 0)).toLocaleString()} {formData.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'القسم' : 'Department'}</Label>
              <Input
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'مركز التكلفة' : 'Cost Center'}</Label>
              <Input
                value={formData.cost_center}
                onChange={(e) => handleChange('cost_center', e.target.value)}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'رمز المشروع' : 'Project Code'}</Label>
              <Input
                value={formData.project_code}
                onChange={(e) => handleChange('project_code', e.target.value)}
                className={isRTL ? 'text-right' : ''}
              />
            </div>
          </div>

          {/* Advance */}
          <div>
            <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Checkbox
                id="advance_required"
                checked={formData.advance_required}
                onCheckedChange={(checked) => handleChange('advance_required', checked)}
              />
              <label htmlFor="advance_required" className="text-sm font-medium cursor-pointer">
                {isRTL ? 'طلب سلفة سفر' : 'Request Travel Advance'}
              </label>
            </div>
            {formData.advance_required && (
              <div className="mt-3">
                <Label className={isRTL ? 'text-right block' : ''}>{isRTL ? 'مبلغ السلفة' : 'Advance Amount'}</Label>
                <Input
                  type="number"
                  value={formData.advance_amount}
                  onChange={(e) => handleChange('advance_amount', parseFloat(e.target.value) || 0)}
                  className={isRTL ? 'text-right' : ''}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex gap-3 pt-4 border-t ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
            <Button type="button" variant="outline" onClick={onCancel} className={isRTL ? 'flex-row-reverse' : ''}>
              <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}