import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import LeaveTypeForm from "./LeaveTypeForm";

export default function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    setLoading(true);
    const data = await base44.entities.LeaveType.list("leave_type_name");
    setLeaveTypes(data || []);
    setLoading(false);
  };

  const handleSave = async (typeData) => {
    try {
      if (editingType) {
        await base44.entities.LeaveType.update(editingType.id, typeData);
      } else {
        await base44.entities.LeaveType.create(typeData);
      }
      setShowForm(false);
      setEditingType(null);
      await loadLeaveTypes();
    } catch (error) {
      console.error("Error saving leave type:", error);
      alert(isRTL ? "حدث خطأ في حفظ نوع الإجازة" : "Error saving leave type");
    }
  };

  const handleDelete = async (typeId) => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف نوع الإجازة هذا؟" : "Are you sure you want to delete this leave type?")) {
      return;
    }
    try {
      await base44.entities.LeaveType.delete(typeId);
      await loadLeaveTypes();
    } catch (error) {
      console.error("Error deleting leave type:", error);
      alert(isRTL ? "حدث خطأ في حذف نوع الإجازة" : "Error deleting leave type");
    }
  };

  if (showForm) {
    return (
      <LeaveTypeForm
        leaveType={editingType}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingType(null);
        }}
      />
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span>{isRTL ? 'أنواع الإجازات' : 'Leave Types'}</span>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-green-600 to-green-700"
            onClick={() => {
              setEditingType(null);
              setShowForm(true);
            }}
          >
            <Plus className={`w-4 h-4 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة نوع' : 'Add Type'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الرمز' : 'Code'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الفئة' : 'Category'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحد الأقصى' : 'Max Days'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الاستحقاق' : 'Accrual'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الترحيل' : 'Carry Forward'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموافقة' : 'Approval'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : leaveTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    {isRTL ? 'لا توجد أنواع إجازات' : 'No leave types found'}
                  </TableCell>
                </TableRow>
              ) : (
                leaveTypes.map((lt) => (
                  <TableRow key={lt.id} className="hover:bg-gray-50">
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      <span className="font-mono font-medium">{lt.leave_type_code}</span>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      <div>
                        <p className="font-medium">{lt.leave_type_name}</p>
                        {lt.leave_type_name_arabic && (
                          <p className="text-sm text-gray-500">{lt.leave_type_name_arabic}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {lt.leave_category}
                      </Badge>
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      {lt.max_days_per_year} {isRTL ? 'يوم' : 'days'}
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {lt.accrual_method}
                      </Badge>
                      {lt.accrual_method === 'Monthly' && lt.accrual_rate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {lt.accrual_rate} {isRTL ? 'يوم/شهر' : 'days/month'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      {lt.carry_forward_allowed ? (
                        <span className="text-green-600">
                          {lt.carry_forward_max_days} {isRTL ? 'يوم' : 'days'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className={isRTL ? 'text-right' : ''}>
                      {lt.require_approval ? (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {isRTL ? 'مطلوبة' : 'Required'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {isRTL ? 'تلقائية' : 'Auto'}
                        </Badge>
                      )}
                      {lt.auto_approve_under_days > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {isRTL ? 'تلقائي تحت' : 'Auto under'} {lt.auto_approve_under_days} {isRTL ? 'يوم' : 'days'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={lt.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {lt.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingType(lt);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(lt.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}