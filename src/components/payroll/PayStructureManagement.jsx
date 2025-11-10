import React, { useState, useEffect } from "react";
import { PayComponent, EmployeePayStructure, Employee } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PayComponentList from "./PayComponentList";
import PayComponentForm from "./PayComponentForm";
import EmployeePayStructureSetup from "./EmployeePayStructureSetup";

export default function PayStructureManagement() {
  const [components, setComponents] = useState([]);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    setLoading(true);
    const data = await PayComponent.list("component_code");
    setComponents(data);
    setLoading(false);
  };

  const handleSave = async (data) => {
    if (editingComponent) {
      await PayComponent.update(editingComponent.id, data);
    } else {
      await PayComponent.create(data);
    }
    setShowComponentForm(false);
    setEditingComponent(null);
    loadComponents();
  };

  const handleDelete = async (id) => {
    if (confirm(isRTL ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      await PayComponent.delete(id);
      loadComponents();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="components" className="space-y-4">
        <TabsList>
          <TabsTrigger value="components">
            <Settings className="w-4 h-4 mr-2" />
            {isRTL ? 'مكونات الرواتب' : 'Pay Components'}
          </TabsTrigger>
          <TabsTrigger value="employee-structure">
            {isRTL ? 'هيكل رواتب الموظفين' : 'Employee Pay Structure'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          {!showComponentForm ? (
            <>
              <div className={`flex justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-xl font-bold">
                  {isRTL ? 'مكونات الرواتب' : 'Pay Components (Earnings & Deductions)'}
                </h2>
                <Button 
                  onClick={() => {
                    setEditingComponent(null);
                    setShowComponentForm(true);
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isRTL ? 'إضافة مكون' : 'Add Component'}
                </Button>
              </div>
              <PayComponentList
                components={components}
                loading={loading}
                onEdit={(comp) => {
                  setEditingComponent(comp);
                  setShowComponentForm(true);
                }}
                onDelete={handleDelete}
              />
            </>
          ) : (
            <PayComponentForm
              component={editingComponent}
              onSave={handleSave}
              onCancel={() => {
                setShowComponentForm(false);
                setEditingComponent(null);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="employee-structure">
          <EmployeePayStructureSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
}