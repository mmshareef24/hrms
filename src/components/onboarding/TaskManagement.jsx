import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const data = await base44.entities.OnboardingTask.list('-due_date');
    setTasks(data || []);
    setLoading(false);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await base44.entities.OnboardingTask.update(taskId, {
        status: 'Completed',
        completed_date: new Date().toISOString().split('T')[0],
        completed_by: (await base44.auth.me()).email
      });
      loadTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status !== 'Completed' && task.status !== 'Skipped';
    if (filter === 'completed') return task.status === 'Completed';
    if (filter === 'overdue') {
      if (!task.due_date || task.status === 'Completed') return false;
      return differenceInDays(new Date(), parseISO(task.due_date)) > 0;
    }
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Blocked': 'bg-red-100 text-red-800',
      'Completed': 'bg-green-100 text-green-800',
      'Skipped': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-gray-100 text-gray-700',
      'Medium': 'bg-blue-100 text-blue-700',
      'High': 'bg-orange-100 text-orange-700',
      'Critical': 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          {isRTL ? 'الكل' : 'All'} ({tasks.length})
        </Button>
        <Button 
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          size="sm"
        >
          {isRTL ? 'معلق' : 'Pending'} ({tasks.filter(t => t.status !== 'Completed' && t.status !== 'Skipped').length})
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          size="sm"
        >
          {isRTL ? 'مكتمل' : 'Completed'} ({tasks.filter(t => t.status === 'Completed').length})
        </Button>
        <Button 
          variant={filter === 'overdue' ? 'default' : 'outline'}
          onClick={() => setFilter('overdue')}
          size="sm"
        >
          {isRTL ? 'متأخر' : 'Overdue'}
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CheckCircle className="w-5 h-5 text-[#B11116]" />
            <span>{isRTL ? 'إدارة المهام' : 'Task Management'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المهمة' : 'Task'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'مسند إلى' : 'Assigned To'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الفئة' : 'Category'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الأولوية' : 'Priority'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B11116] mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {isRTL ? 'لا توجد مهام' : 'No tasks found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => {
                    const isOverdue = task.due_date && differenceInDays(new Date(), parseISO(task.due_date)) > 0 && task.status !== 'Completed';
                    
                    return (
                      <TableRow key={task.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                        <TableCell className={isRTL ? 'text-right' : ''}>
                          <div className="flex items-center gap-2">
                            {task.status === 'Completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-medium">{task.task_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : ''}>
                          {task.employee_name}
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : ''}>
                          {task.assigned_to_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {task.task_category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : ''}>
                          {task.due_date ? (
                            <div>
                              <p>{format(parseISO(task.due_date), 'MMM dd')}</p>
                              {isOverdue && (
                                <p className="text-xs text-red-600">
                                  {differenceInDays(new Date(), parseISO(task.due_date))} {isRTL ? 'يوم تأخير' : 'days late'}
                                </p>
                              )}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.status !== 'Completed' && task.status !== 'Skipped' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCompleteTask(task.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              {isRTL ? 'إكمال' : 'Complete'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}