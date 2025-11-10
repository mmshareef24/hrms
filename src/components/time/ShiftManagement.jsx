import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ShiftList from "./ShiftList";
import ShiftForm from "./ShiftForm";
import ShiftAssignment from "./ShiftAssignment";

export default function ShiftManagement() {
  const [shifts, setShifts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("shifts");
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setLoading(true);
    const data = await base44.entities.Shift.list("-created_date");
    setShifts(data);
    setLoading(false);
  };

  const handleSave = async (shiftData) => {
    if (editingShift) {
      await base44.entities.Shift.update(editingShift.id, shiftData);
    } else {
      await base44.entities.Shift.create(shiftData);
    }
    setShowForm(false);
    setEditingShift(null);
    loadShifts();
  };

  const handleDelete = async (shiftId) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذه الوردية؟" : "Are you sure you want to delete this shift?")) {
      await base44.entities.Shift.delete(shiftId);
      loadShifts();
    }
  };

  return (
    <div>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'إدارة الورديات' : 'Shift Management'}
          </h2>
          <p className="text-gray-500 mt-1">
            {isRTL ? 'إنشاء الورديات وتعيينها للموظفين' : 'Create shifts and assign to employees'}
          </p>
        </div>
        {activeTab === "shifts" && (
          <Button 
            onClick={() => {
              setEditingShift(null);
              setShowForm(true);
            }}
            className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className={`w-5 h-5 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة وردية' : 'Add Shift'}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
          <TabsTrigger value="shifts" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? 'الورديات' : 'Shifts'}
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            {isRTL ? 'تعيين الموظفين' : 'Employee Assignment'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shifts">
          {showForm ? (
            <ShiftForm
              shift={editingShift}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingShift(null);
              }}
            />
          ) : (
            <ShiftList
              shifts={shifts}
              loading={loading}
              onEdit={(shift) => {
                setEditingShift(shift);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="assignments">
          <ShiftAssignment />
        </TabsContent>
      </Tabs>
    </div>
  );
}