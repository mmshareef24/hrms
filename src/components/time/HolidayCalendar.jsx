import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import HolidayForm from "./HolidayForm";

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCountry, setSelectedCountry] = useState("Saudi Arabia");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadHolidays();
  }, [selectedCountry]);

  const loadHolidays = async () => {
    setLoading(true);
    const data = await base44.entities.PublicHoliday.filter(
      { country: selectedCountry },
      "holiday_date"
    );
    setHolidays(data || []);
    setLoading(false);
  };

  const handleSave = async (holidayData) => {
    try {
      if (editingHoliday) {
        await base44.entities.PublicHoliday.update(editingHoliday.id, holidayData);
      } else {
        await base44.entities.PublicHoliday.create(holidayData);
      }
      setShowForm(false);
      setEditingHoliday(null);
      await loadHolidays();
    } catch (error) {
      console.error("Error saving holiday:", error);
      alert(isRTL ? "حدث خطأ في حفظ العطلة" : "Error saving holiday");
    }
  };

  const handleDelete = async (holidayId) => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذه العطلة؟" : "Are you sure you want to delete this holiday?")) {
      return;
    }
    try {
      await base44.entities.PublicHoliday.delete(holidayId);
      await loadHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      alert(isRTL ? "حدث خطأ في حذف العطلة" : "Error deleting holiday");
    }
  };

  const holidayDates = holidays.map(h => parseISO(h.holiday_date));

  const upcomingHolidays = holidays
    .filter(h => new Date(h.holiday_date) >= new Date())
    .slice(0, 10);

  if (showForm) {
    return (
      <HolidayForm
        holiday={editingHoliday}
        defaultCountry={selectedCountry}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingHoliday(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Saudi Arabia">{isRTL ? 'السعودية' : 'Saudi Arabia'}</SelectItem>
            <SelectItem value="UAE">{isRTL ? 'الإمارات' : 'UAE'}</SelectItem>
            <SelectItem value="Kuwait">{isRTL ? 'الكويت' : 'Kuwait'}</SelectItem>
            <SelectItem value="Bahrain">{isRTL ? 'البحرين' : 'Bahrain'}</SelectItem>
            <SelectItem value="Qatar">{isRTL ? 'قطر' : 'Qatar'}</SelectItem>
            <SelectItem value="Oman">{isRTL ? 'عمان' : 'Oman'}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setEditingHoliday(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-green-600 to-green-700"
        >
          <Plus className={`w-4 h-4 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
          {isRTL ? 'إضافة عطلة' : 'Add Holiday'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'التقويم' : 'Calendar'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                holiday: holidayDates
              }}
              modifiersStyles={{
                holiday: {
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className={`text-sm text-green-800 ${isRTL ? 'text-right' : ''}`}>
                <span className="font-semibold">{holidays.length}</span> {isRTL ? 'عطلة في' : 'holidays in'} {selectedCountry}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className={isRTL ? 'text-right' : ''}>
              {isRTL ? 'العطلات القادمة' : 'Upcoming Holidays'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingHolidays.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {isRTL ? 'لا توجد عطلات قادمة' : 'No upcoming holidays'}
                  </div>
                ) : (
                  upcomingHolidays.map((holiday) => (
                    <div key={holiday.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">{holiday.holiday_name}</p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                holiday.holiday_type === 'National Day' 
                                  ? 'bg-purple-50 text-purple-700'
                                  : holiday.holiday_type === 'Eid Al-Fitr' || holiday.holiday_type === 'Eid Al-Adha'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {holiday.holiday_type}
                            </Badge>
                          </div>
                          {holiday.holiday_name_arabic && (
                            <p className="text-sm text-gray-500 mb-1">{holiday.holiday_name_arabic}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {format(parseISO(holiday.holiday_date), 'EEEE, MMMM dd, yyyy')}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {holiday.is_paid && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                {isRTL ? 'مدفوع' : 'Paid'}
                              </Badge>
                            )}
                            {holiday.applies_to_all && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                {isRTL ? 'للجميع' : 'All Staff'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingHoliday(holiday);
                              setShowForm(true);
                            }}
                          >
                            {isRTL ? 'تعديل' : 'Edit'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(holiday.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isRTL ? 'حذف' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}