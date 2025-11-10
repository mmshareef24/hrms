import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { MapPin, Camera, Clock, LogIn, LogOut, Coffee, AlertCircle } from "lucide-react";
import { format, parse, differenceInMinutes } from "date-fns";

export default function TimePunch() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [shift, setShift] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [lastPunch, setLastPunch] = useState(null);
  const [punching, setPunching] = useState(false);
  const [shiftStatus, setShiftStatus] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadUser();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.log('Location error:', error)
      );
    }
  }, []);

  useEffect(() => {
    if (shift) {
      checkShiftStatus();
    }
  }, [currentTime, shift]);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    
    // Get employee record
    const employees = await base44.entities.Employee.filter({ work_email: userData.email });
    if (employees.length > 0) {
      const emp = employees[0];
      setEmployee(emp);
      
      // Load shift if assigned
      if (emp.shift_id) {
        const shifts = await base44.entities.Shift.filter({ id: emp.shift_id });
        if (shifts.length > 0) {
          setShift(shifts[0]);
        }
      }
    }
    
    // Load last punch
    const today = format(new Date(), 'yyyy-MM-dd');
    const punches = await base44.entities.PunchRecord.list('-punch_datetime', 100);
    const todayPunches = punches.filter(p => 
      p.employee_id === userData.id &&
      p.punch_datetime.startsWith(today)
    );
    
    if (todayPunches.length > 0) {
      setLastPunch(todayPunches[0]);
    }
  };

  const checkShiftStatus = () => {
    if (!shift) return;
    
    const now = format(currentTime, 'HH:mm');
    const shiftStart = shift.start_time;
    const shiftEnd = shift.end_time;
    
    const nowMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);
    const startMinutes = parseInt(shiftStart.split(':')[0]) * 60 + parseInt(shiftStart.split(':')[1]);
    const endMinutes = parseInt(shiftEnd.split(':')[0]) * 60 + parseInt(shiftEnd.split(':')[1]);
    
    if (nowMinutes < startMinutes - 30) {
      setShiftStatus({ type: 'early', message: isRTL ? 'مبكر جداً' : 'Too Early' });
    } else if (nowMinutes >= startMinutes - 30 && nowMinutes <= startMinutes + 15) {
      setShiftStatus({ type: 'ontime', message: isRTL ? 'في الوقت المحدد' : 'On Time' });
    } else if (nowMinutes > startMinutes + 15 && nowMinutes < endMinutes) {
      setShiftStatus({ type: 'late', message: isRTL ? 'متأخر' : 'Late' });
    } else if (nowMinutes >= endMinutes) {
      setShiftStatus({ type: 'after', message: isRTL ? 'بعد انتهاء الوردية' : 'After Shift' });
    }
  };

  const handlePunch = async (punchType) => {
    if (!user || !employee) return;
    
    setPunching(true);
    
    try {
      const punchData = {
        employee_id: employee.id,
        employee_name: employee.full_name,
        punch_datetime: new Date().toISOString(),
        punch_type: punchType,
        punch_method: "Web",
        location_latitude: location?.latitude,
        location_longitude: location?.longitude,
        is_manual: false
      };

      await base44.entities.PunchRecord.create(punchData);
      
      // Create/Update TimeLog for today
      const today = format(new Date(), 'yyyy-MM-dd');
      const timeLogs = await base44.entities.TimeLog.filter({ 
        employee_id: employee.id, 
        date: today 
      });
      
      const timeLogData = {
        employee_id: employee.id,
        employee_name: employee.full_name,
        shift_id: shift?.id,
        shift_name: shift?.shift_name,
        date: today
      };
      
      if (punchType === "Clock In") {
        timeLogData.clock_in = format(new Date(), 'HH:mm:ss');
        // Determine status based on shift
        if (shift && shiftStatus?.type === 'late') {
          timeLogData.status = "Late";
        } else {
          timeLogData.status = "Present";
        }
      } else if (punchType === "Clock Out") {
        timeLogData.clock_out = format(new Date(), 'HH:mm:ss');
        // Calculate hours
        if (timeLogs.length > 0 && timeLogs[0].clock_in) {
          const clockIn = parse(timeLogs[0].clock_in, 'HH:mm:ss', new Date());
          const clockOut = new Date();
          const hours = differenceInMinutes(clockOut, clockIn) / 60;
          timeLogData.total_hours = Math.round(hours * 100) / 100;
          
          if (shift) {
            timeLogData.regular_hours = Math.min(hours, shift.working_hours || 8);
            timeLogData.overtime_hours = Math.max(0, hours - (shift.working_hours || 8));
          }
        }
      }
      
      if (timeLogs.length > 0) {
        await base44.entities.TimeLog.update(timeLogs[0].id, timeLogData);
      } else {
        await base44.entities.TimeLog.create(timeLogData);
      }
      
      await loadUser();
    } finally {
      setPunching(false);
    }
  };

  const getNextPunchType = () => {
    if (!lastPunch) return "Clock In";
    if (lastPunch.punch_type === "Clock In") return "Break Start";
    if (lastPunch.punch_type === "Break Start") return "Break End";
    if (lastPunch.punch_type === "Break End") return "Clock Out";
    return "Clock In";
  };

  const getPunchIcon = (type) => {
    switch(type) {
      case "Clock In": return LogIn;
      case "Clock Out": return LogOut;
      case "Break Start":
      case "Break End": return Coffee;
      default: return Clock;
    }
  };

  const nextPunchType = getNextPunchType();
  const PunchIcon = getPunchIcon(nextPunchType);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Clock className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'تسجيل الحضور' : 'Time Punch'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Shift Info */}
            {shift && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{isRTL ? 'الوردية' : 'Your Shift'}</p>
                <p className="text-lg font-bold text-gray-900">{shift.shift_name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {shift.start_time} - {shift.end_time}
                </p>
                {shiftStatus && (
                  <Badge 
                    variant="outline" 
                    className={`mt-2 ${
                      shiftStatus.type === 'ontime' ? 'bg-green-100 text-green-800' :
                      shiftStatus.type === 'late' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {shiftStatus.message}
                  </Badge>
                )}
              </div>
            )}

            {!shift && employee && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm font-medium text-orange-900">
                    {isRTL ? 'لم يتم تعيين وردية' : 'No Shift Assigned'}
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    {isRTL ? 'يرجى التواصل مع قسم الموارد البشرية' : 'Please contact HR to assign a shift'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500 mb-2">
                {isRTL ? 'الوقت الحالي' : 'Current Time'}
              </p>
              <p className="text-4xl font-bold text-gray-900">
                {format(currentTime, 'HH:mm:ss')}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {format(currentTime, 'EEEE, MMMM dd, yyyy')}
              </p>
            </div>

            {location && (
              <div className={`flex items-center justify-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-4 h-4" />
                <span>
                  {isRTL ? 'الموقع تم تحديده' : 'Location detected'}
                </span>
              </div>
            )}

            <Button
              size="lg"
              onClick={() => handlePunch(nextPunchType)}
              disabled={punching}
              className={`w-full h-20 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <PunchIcon className={`w-6 h-6 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {isRTL 
                ? (nextPunchType === "Clock In" ? "تسجيل دخول" : 
                   nextPunchType === "Clock Out" ? "تسجيل خروج" :
                   nextPunchType === "Break Start" ? "بدء الاستراحة" : "إنهاء الاستراحة")
                : nextPunchType
              }
            </Button>

            {lastPunch && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">
                  {isRTL ? 'آخر تسجيل' : 'Last Punch'}
                </p>
                <Badge variant="outline" className="text-base px-4 py-2">
                  {lastPunch.punch_type} - {format(new Date(lastPunch.punch_datetime), 'HH:mm')}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'نشاط اليوم' : "Today's Activity"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">{isRTL ? 'ساعات العمل' : 'Work Hours'}</span>
              <span className="text-2xl font-bold text-blue-600">
                {shift ? `${shift.working_hours || 8}h` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium">{isRTL ? 'وقت الاستراحة' : 'Break Time'}</span>
              <span className="text-2xl font-bold text-orange-600">
                {shift ? `${(shift.break_duration || 60) / 60}h` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">{isRTL ? 'إجمالي ساعات الوردية' : 'Total Shift Hours'}</span>
              <span className="text-2xl font-bold text-green-600">
                {shift ? `${(shift.working_hours || 8) + (shift.break_duration || 60) / 60}h` : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}