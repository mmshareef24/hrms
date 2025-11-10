import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isWithinInterval } from "date-fns";

export default function LeaveCalendar({ requests }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const getLeaveRequestsForDate = (date) => {
    return requests.filter(req => {
      const start = parseISO(req.start_date);
      const end = parseISO(req.end_date);
      return isWithinInterval(date, { start, end });
    });
  };

  const leaveDates = requests.flatMap(req => {
    const start = parseISO(req.start_date);
    const end = parseISO(req.end_date);
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  });

  const selectedDateRequests = getLeaveRequestsForDate(selectedDate);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'تقويم الإجازات' : 'Leave Calendar'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
            modifiers={{
              leave: leaveDates
            }}
            modifiersStyles={{
              leave: {
                backgroundColor: '#fef3c7',
                color: '#92400e',
                fontWeight: 'bold'
              }
            }}
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {format(selectedDate, 'MMMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {selectedDateRequests.length > 0 ? (
            <div className="space-y-4">
              {selectedDateRequests.map((req) => (
                <div key={req.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="font-medium text-gray-900">{req.employee_name}</p>
                      <p className="text-sm text-gray-600 mt-1">{req.leave_type_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(parseISO(req.start_date), 'MMM dd')} - {format(parseISO(req.end_date), 'MMM dd')}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {req.days_count} {isRTL ? 'يوم' : 'days'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {isRTL ? 'لا توجد إجازات في هذا التاريخ' : 'No leaves on this date'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}