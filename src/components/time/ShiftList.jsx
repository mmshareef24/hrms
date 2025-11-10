import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Clock, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShiftList({ shifts, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-32 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <Card className="shadow-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No shifts configured</h3>
          <p className="text-gray-500">Create your first shift to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shifts.map((shift) => (
        <Card key={shift.id} className="hover:shadow-xl transition-shadow duration-300">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{shift.shift_name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {shift.shift_code}
                  </Badge>
                </div>
                <Badge 
                  className={shift.is_active 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-gray-100 text-gray-800 border-gray-200"
                  }
                >
                  {shift.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(shift)}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(shift.id)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-900">
                  {shift.start_time} - {shift.end_time}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Hours:</span>
                <span className="font-medium text-gray-900">
                  {shift.working_hours || 8}h
                </span>
              </div>

              {shift.break_duration && (
                <div className="text-sm text-gray-600">
                  Break: {shift.break_duration} minutes
                </div>
              )}

              {shift.days && shift.days.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Working Days:</p>
                  <div className="flex flex-wrap gap-1">
                    {shift.days.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {day.slice(0, 3)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t">
                <div className="text-sm text-gray-600">
                  Overtime Rate: <span className="font-medium text-gray-900">{shift.overtime_rate || 1.5}x</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}