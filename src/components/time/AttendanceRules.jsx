import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import AttendanceRuleList from "./AttendanceRuleList";
import AttendanceRuleForm from "./AttendanceRuleForm";

export default function AttendanceRules() {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    const data = await base44.entities.AttendanceRule.list("-created_date");
    setRules(data);
    setLoading(false);
  };

  const handleSave = async (ruleData) => {
    if (editingRule) {
      await base44.entities.AttendanceRule.update(editingRule.id, ruleData);
    } else {
      await base44.entities.AttendanceRule.create(ruleData);
    }
    setShowForm(false);
    setEditingRule(null);
    loadRules();
  };

  const handleDelete = async (ruleId) => {
    if (confirm(isRTL ? "هل أنت متأكد من حذف هذه القاعدة؟" : "Are you sure you want to delete this rule?")) {
      await base44.entities.AttendanceRule.delete(ruleId);
      loadRules();
    }
  };

  return (
    <div>
      <div className={`flex justify-between items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'قواعد الحضور' : 'Attendance Rules'}
          </h2>
          <p className="text-gray-500 mt-1">
            {isRTL ? 'إدارة قواعد الحضور والانصراف والعمل الإضافي' : 'Configure grace periods, overtime, and attendance policies'}
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingRule(null);
            setShowForm(true);
          }}
          className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus className={`w-5 h-5 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
          {isRTL ? 'إضافة قاعدة' : 'Add Rule'}
        </Button>
      </div>

      {showForm ? (
        <AttendanceRuleForm
          rule={editingRule}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingRule(null);
          }}
        />
      ) : (
        <AttendanceRuleList
          rules={rules}
          loading={loading}
          onEdit={(rule) => {
            setEditingRule(rule);
            setShowForm(true);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}