import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Trash } from "lucide-react";
import { filterDataByRole, canEditEmployee, getUserRole } from "@/utils";
import ProtectedRoute from "../common/ProtectedRoute";

export default function EmployeeList({ employees: providedEmployees, loading: providedLoading, onEdit, onView, onNew, onDelete }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // If external employees are provided, use them and stop the local loading state
    if (Array.isArray(providedEmployees)) {
      setEmployees(providedEmployees);
      if (typeof providedLoading === 'boolean') {
        setLoading(providedLoading);
      }
    }
  }, [providedEmployees, providedLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current user
      const userData = await base44.auth.me();
      setUser(userData);

      // Get current user's employee record
      const currentEmployees = await base44.entities.Employee.filter({ 
        work_email: userData.email 
      });
      const currentEmp = currentEmployees.length > 0 ? currentEmployees[0] : null;
      setEmployee(currentEmp);

      // Determine role
      const role = getUserRole(userData, currentEmp);
      setUserRole(role);

      // Source employees: provided externally or load from store
      const allEmployees = Array.isArray(providedEmployees)
        ? providedEmployees
        : await base44.entities.Employee.list();
      
      // Filter based on role
      const filteredEmployees = filterDataByRole(
        allEmployees,
        role,
        currentEmp?.id,
        'employee'
      );
      
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error("Error loading employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = (targetEmployee) => {
    if (!employee || !userRole) return false;
    return canEditEmployee(userRole, employee.id, targetEmployee.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle>{isRTL ? 'الموظفون' : 'Employees'}</CardTitle>
          {onNew && (
            <Button 
              onClick={onNew}
              className={`bg-green-600 hover:bg-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'موظف جديد' : 'New Employee'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                <TableHead>{isRTL ? 'المعرف' : 'ID'}</TableHead>
                <TableHead>{isRTL ? 'القسم' : 'Department'}</TableHead>
                <TableHead>{isRTL ? 'المسمى الوظيفي' : 'Job Title'}</TableHead>
                <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className={isRTL ? 'text-left' : 'text-right'}>
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.full_name}</TableCell>
                  <TableCell>{emp.employee_id}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.job_title}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        emp.status === 'Active'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }
                    >
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                      {onView && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onView(emp)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onEdit && canEdit(emp) && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(emp)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDelete(emp.id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {employees.length === 0 && (
            <p className="text-center py-8 text-gray-500">
              {isRTL ? 'لا يوجد موظفون' : 'No employees found'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}