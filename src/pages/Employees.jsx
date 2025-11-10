
import React, { useState, useEffect } from "react";
import { Employee } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import EmployeeList from "../components/employees/EmployeeList";
import EmployeeForm from "../components/employees/EmployeeForm";
import EmployeeFilters from "../components/employees/EmployeeFilters";
import EmployeeImportExport from "../components/employees/EmployeeImportExport"; // Added import

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ department: "all", status: "all", nationality: "all" });
  const [loading, setLoading] = useState(true);

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, filters]);

  const loadEmployees = async () => {
    setLoading(true);
    const data = await Employee.list("-created_date");
    setEmployees(data);
    setLoading(false);
  };

  const filterEmployees = () => {
    let result = employees;
    
    if (searchTerm) {
      result = result.filter(emp => 
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.department !== "all") {
      result = result.filter(emp => emp.department === filters.department);
    }

    if (filters.status !== "all") {
      result = result.filter(emp => emp.status === filters.status);
    }

    if (filters.nationality !== "all") {
      result = result.filter(emp => emp.nationality === filters.nationality);
    }

    setFilteredEmployees(result);
  };

  const handleSave = async (employeeData) => {
    if (editingEmployee) {
      await Employee.update(editingEmployee.id, employeeData);
    } else {
      await Employee.create(employeeData);
    }
    setShowForm(false);
    setEditingEmployee(null);
    loadEmployees();
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذا الموظف؟" : "Are you sure you want to delete this employee?")) {
      await Employee.delete(employeeId);
      loadEmployees();
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'إدارة الموظفين' : 'Employee Management'}
            </h1>
            <p className="text-gray-500 mt-2">
              {filteredEmployees.length} {isRTL ? 'موظف' : 'employees'}
            </p>
          </div>
          <div className={`flex flex-col sm:flex-row gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <EmployeeImportExport onImportComplete={loadEmployees} /> {/* Added EmployeeImportExport */}
            <Button 
              onClick={() => {
                setEditingEmployee(null);
                setShowForm(true);
              }}
              className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Plus className={`w-5 h-5 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
              {isRTL ? 'إضافة موظف' : 'Add Employee'}
            </Button>
          </div>
        </div>

        {showForm ? (
          <EmployeeForm
            employee={editingEmployee}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingEmployee(null);
            }}
          />
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <Input
                  placeholder={isRTL ? "البحث بالاسم، الرقم التعريفي، أو البريد الإلكتروني..." : "Search by name, ID, or email..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`bg-white shadow-sm ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                />
              </div>
              
              <EmployeeFilters 
                filters={filters}
                onFilterChange={setFilters}
              />
            </div>

            <EmployeeList
              employees={filteredEmployees}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </div>
  );
}
