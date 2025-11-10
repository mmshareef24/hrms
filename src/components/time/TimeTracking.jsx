import React, { useState, useEffect } from "react";
import { TimeLog, Employee, Shift } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Clock, Calendar as CalendarIcon, PlayCircle, StopCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimeTracking() {
  const [timeLogs, setTimeLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const [logsData, empData, shiftsData] = await Promise.all([
      TimeLog.filter({ date: dateStr }),
      Employee.list(),
      Shift.list()
    ]);
    setTimeLogs(logsData);
    setEmployees(empData);
    setShifts(shiftsData);
    setLoading(false);
  };

  const getTodayStats = () => {
    const present = timeLogs.filter(log => log.status === "Present").length;
    const late = timeLogs.filter(log => log.status === "Late").length;
    const absent = timeLogs.filter(log => log.status === "Absent").length;
    const totalHours = timeLogs.reduce((sum, log) => sum + (log.total_hours || 0), 0);
    const overtimeHours = timeLogs.reduce((sum, log) => sum + (log.overtime_hours || 0), 0);
    
    return { present, late, absent, totalHours, overtimeHours };
  };

  const stats = getTodayStats();

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className={`w-12 h-12 ${color} bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
        <p className="text-gray-500 mt-1">Monitor employee clock in/out and working hours</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              title="Present"
              value={stats.present}
              icon={PlayCircle}
              color="bg-green-600"
            />
            <StatCard
              title="Late"
              value={stats.late}
              icon={Clock}
              color="bg-orange-600"
            />
            <StatCard
              title="Absent"
              value={stats.absent}
              icon={StopCircle}
              color="bg-red-600"
            />
            <StatCard
              title="Total Hours"
              value={stats.totalHours.toFixed(1)}
              icon={Clock}
              color="bg-blue-600"
            />
            <StatCard
              title="Overtime"
              value={stats.overtimeHours.toFixed(1)}
              icon={Clock}
              color="bg-purple-600"
            />
          </div>

          <Card className="shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle>Time Logs - {format(selectedDate, "MMMM dd, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full mb-4" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Employee</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Overtime</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-gray-50">
                          <TableCell>
                            <p className="font-medium text-gray-900">{log.employee_name}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {log.shift_name || "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{log.clock_in || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{log.clock_out || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{log.total_hours?.toFixed(1) || 0}h</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-purple-600">
                              {log.overtime_hours?.toFixed(1) || 0}h
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                log.status === "Present" 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : log.status === "Late"
                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                  : log.status === "Absent"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {timeLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No time logs for this date
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}