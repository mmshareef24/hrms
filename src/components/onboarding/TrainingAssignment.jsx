import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, CheckCircle, Clock, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function TrainingAssignment() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    setLoading(true);
    const data = await base44.entities.OnboardingTraining.list('-created_date');
    setTrainings(data || []);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Waived': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'In Progress': case 'Scheduled': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <GraduationCap className="w-4 h-4 text-gray-400" />;
    }
  };

  const completedCount = trainings.filter(t => t.status === 'Completed').length;
  const inProgressCount = trainings.filter(t => t.status === 'In Progress' || t.status === 'Scheduled').length;
  const notStartedCount = trainings.filter(t => t.status === 'Not Started').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'مكتمل' : 'Completed'}</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="w-8 h-8 text-blue-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <GraduationCap className="w-8 h-8 text-gray-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'لم يبدأ' : 'Not Started'}</p>
                <p className="text-2xl font-bold text-gray-900">{notStartedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <GraduationCap className="w-5 h-5 text-[#B11116]" />
            <span>{isRTL ? 'تعيين التدريب' : 'Training Assignments'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التدريب' : 'Training'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Type'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المدة' : 'Duration'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النتيجة' : 'Score'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B11116] mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : trainings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {isRTL ? 'لا يوجد تدريب' : 'No training assignments'}
                    </TableCell>
                  </TableRow>
                ) : (
                  trainings.map((training) => (
                    <TableRow key={training.id} className="hover:bg-gray-50">
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {training.employee_name}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(training.status)}
                          <div>
                            <p className="font-medium">{training.training_name}</p>
                            {training.is_mandatory && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 text-xs mt-1">
                                {isRTL ? 'إلزامي' : 'Mandatory'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {training.training_type}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {training.duration_hours} {isRTL ? 'ساعة' : 'hrs'}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {training.due_date ? format(parseISO(training.due_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(training.status)}>
                          {training.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {training.score ? (
                          <span className="font-semibold">{training.score}%</span>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}