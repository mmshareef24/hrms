import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { XCircle, Save } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ShiftForm({ shift, onSave, onCancel }) {
  const [formData, setFormData] = useState(shift || {
    shift_name: "",
    shift_code: "",
    start_time: "09:00",
    end_time: "17:00",
    break_duration: 60,
    working_hours: 8,
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    overtime_rate: 1.5,
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days?.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...(prev.days || []), day]
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-lg max-w-3xl mx-auto">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <CardTitle className="text-2xl">
            {shift ? "Edit Shift" : "Create New Shift"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shift_name">Shift Name *</Label>
                <Input
                  id="shift_name"
                  value={formData.shift_name}
                  onChange={(e) => handleChange("shift_name", e.target.value)}
                  placeholder="e.g., Morning Shift"
                  required
                />
              </div>

              <div>
                <Label htmlFor="shift_code">Shift Code *</Label>
                <Input
                  id="shift_code"
                  value={formData.shift_code}
                  onChange={(e) => handleChange("shift_code", e.target.value)}
                  placeholder="e.g., MS01"
                  required
                />
              </div>

              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="working_hours">Working Hours</Label>
                <Input
                  id="working_hours"
                  type="number"
                  step="0.5"
                  value={formData.working_hours}
                  onChange={(e) => handleChange("working_hours", parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="break_duration">Break Duration (minutes)</Label>
                <Input
                  id="break_duration"
                  type="number"
                  value={formData.break_duration}
                  onChange={(e) => handleChange("break_duration", parseInt(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="overtime_rate">Overtime Rate Multiplier</Label>
                <Input
                  id="overtime_rate"
                  type="number"
                  step="0.1"
                  value={formData.overtime_rate}
                  onChange={(e) => handleChange("overtime_rate", parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Working Days</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.days?.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <label
                      htmlFor={day}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Active Shift
              </label>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50">
          <Button type="button" variant="outline" onClick={onCancel}>
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Shift
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}