import React, { useState, useEffect } from "react";
import { EmployeePayStructure, Employee, PayComponent } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmployeePayStructureSetup() {
  const [employees, setEmployees] = useState([]);
  const [components, setComponents] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeStructure();
    }
  }, [selectedEmployee]);

  const loadData = async () => {
    const [empData, compData] = await Promise.all([
      Employee.list("full_name"),
      PayComponent.filter({ is_active: true })
    ]);
    setEmployees(empData);
    setComponents(compData);
  };

  const loadEmployeeStructure = async () => {
    setLoading(true);
    const data = await EmployeePayStructure.filter({ 
      employee_id: selectedEmployee,
      is_active: true 
    });
    setStructure(data);
    setLoading(false);
  };

  const addComponent = () => {
    setStructure([...structure, {
      component_id: "",
      component_code: "",
      component_name: "",
      component_type: "",
      amount: 0,
      effective_from: new Date().toISOString().split('T')[0],
      is_new: true
    }]);
  };

  const updateComponent = (index, field, value) => {
    const newStructure = [...structure];
    newStructure[index][field] = value;
    
    if (field === "component_id") {
      const comp = components.find(c => c.id === value);
      if (comp) {
        newStructure[index].component_code = comp.component_code;
        newStructure[index].component_name = comp.component_name;
        newStructure[index].component_type = comp.component_type;
      }
    }
    
    setStructure(newStructure);
  };

  const removeComponent = async (index) => {
    const item = structure[index];
    if (item.id) {
      await EmployeePayStructure.delete(item.id);
    }
    setStructure(structure.filter((_, i) => i !== index));
  };

  const saveStructure = async () => {
    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) return;

    setLoading(true);
    
    for (const item of structure) {
      if (item.is_new) {
        await EmployeePayStructure.create({
          employee_id: selectedEmployee,
          employee_name: employee.full_name,
          company_id: employee.company_id,
          component_id: item.component_id,
          component_code: item.component_code,
          component_name: item.component_name,
          component_type: item.component_type,
          amount: item.amount,
          effective_from: item.effective_from,
          is_active: true
        });
      } else if (item.id) {
        await EmployeePayStructure.update(item.id, {
          amount: item.amount,
          effective_from: item.effective_from
        });
      }
    }
    
    await loadEmployeeStructure();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'إعداد هيكل رواتب الموظف' : 'Employee Pay Structure Setup'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <Label htmlFor="employee" className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'اختر الموظف' : 'Select Employee'}
            </Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className={isRTL ? 'text-right' : ''}>
                <SelectValue placeholder={isRTL ? "اختر موظف..." : "Select employee..."} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <>
              <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-semibold">
                  {isRTL ? 'المكونات' : 'Components'}
                </h3>
                <Button onClick={addComponent} size="sm" className="bg-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {isRTL ? 'إضافة مكون' : 'Add Component'}
                </Button>
              </div>

              <div className="space-y-4">
                {structure.map((item, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <Label className={isRTL ? 'text-right block' : ''}>
                            {isRTL ? 'المكون' : 'Component'}
                          </Label>
                          <Select 
                            value={item.component_id} 
                            onValueChange={(v) => updateComponent(index, "component_id", v)}
                          >
                            <SelectTrigger className={isRTL ? 'text-right' : ''}>
                              <SelectValue placeholder={isRTL ? "اختر المكون..." : "Select component..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {components.map((comp) => (
                                <SelectItem key={comp.id} value={comp.id}>
                                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Badge variant="outline" className={
                                      comp.component_type === "Earning" 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-red-100 text-red-800"
                                    }>
                                      {comp.component_type}
                                    </Badge>
                                    {comp.component_name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className={isRTL ? 'text-right block' : ''}>
                            {isRTL ? 'المبلغ' : 'Amount'}
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => updateComponent(index, "amount", parseFloat(e.target.value) || 0)}
                            className={isRTL ? 'text-right' : ''}
                          />
                        </div>

                        <div>
                          <Label className={isRTL ? 'text-right block' : ''}>
                            {isRTL ? 'ساري من' : 'Effective From'}
                          </Label>
                          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Input
                              type="date"
                              value={item.effective_from}
                              onChange={(e) => updateComponent(index, "effective_from", e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeComponent(index)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {structure.length > 0 && (
                <Button 
                  onClick={saveStructure} 
                  disabled={loading}
                  className={`w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الهيكل' : 'Save Structure')}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}