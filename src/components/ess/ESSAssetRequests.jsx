import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ESSAssetRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    request_type: "",
    description: "",
    priority: "Medium"
  });
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const employees = await base44.entities.Employee.filter({ work_email: user.email });
    if (employees.length > 0) {
      const emp = employees[0];
      setEmployee(emp);
      const facilityRequests = await base44.entities.FacilityRequest.filter(
        { employee_id: emp.id },
        '-request_date',
        20
      );
      setRequests(facilityRequests);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requestData = {
      ...formData,
      employee_id: employee.id,
      employee_name: employee.full_name,
      request_date: new Date().toISOString().split('T')[0],
      status: "Submitted"
    };

    // Generate request number
    const year = new Date().getFullYear();
    const count = requests.length + 1;
    requestData.request_number = `FAC-${year}-${String(count).padStart(4, '0')}`;

    await base44.entities.FacilityRequest.create(requestData);
    setShowForm(false);
    setFormData({ request_type: "", description: "", priority: "Medium" });
    loadData();
  };

  const getStatusBadge = (status) => {
    const colors = {
      "Submitted": "bg-blue-100 text-blue-800",
      "Approved": "bg-green-100 text-green-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      "Completed": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const stats = {
    pending: requests.filter(r => r.status === "Submitted" || r.status === "Approved" || r.status === "In Progress").length,
    completed: requests.filter(r => r.status === "Completed").length,
    rejected: requests.filter(r => r.status === "Rejected").length
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'قيد المعالجة' : 'Pending'}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'مكتمل' : 'Completed'}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500">{isRTL ? 'مرفوض' : 'Rejected'}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Package className="w-5 h-5 text-green-600" />
              <span>{isRTL ? 'طلبات الأصول والمرافق' : 'Asset & Facility Requests'}</span>
            </CardTitle>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'طلب جديد' : 'New Request'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'نوع الطلب' : 'Request Type'}
                </label>
                <Select 
                  value={formData.request_type} 
                  onValueChange={(v) => setFormData({...formData, request_type: v})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر النوع" : "Select type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ID Card">{isRTL ? 'بطاقة هوية' : 'ID Card'}</SelectItem>
                    <SelectItem value="Access Badge">{isRTL ? 'بطاقة دخول' : 'Access Badge'}</SelectItem>
                    <SelectItem value="Parking Pass">{isRTL ? 'تصريح موقف' : 'Parking Pass'}</SelectItem>
                    <SelectItem value="Desk Move">{isRTL ? 'نقل مكتب' : 'Desk Move'}</SelectItem>
                    <SelectItem value="Locker Assignment">{isRTL ? 'خزانة' : 'Locker'}</SelectItem>
                    <SelectItem value="Key Request">{isRTL ? 'مفتاح' : 'Key'}</SelectItem>
                    <SelectItem value="Building Access">{isRTL ? 'دخول المبنى' : 'Building Access'}</SelectItem>
                    <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'التفاصيل' : 'Description'}
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder={isRTL ? "اشرح طلبك..." : "Describe your request..."}
                  required
                  className={isRTL ? 'text-right' : ''}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'الأولوية' : 'Priority'}
                </label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => setFormData({...formData, priority: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">{isRTL ? 'منخفضة' : 'Low'}</SelectItem>
                    <SelectItem value="Medium">{isRTL ? 'متوسطة' : 'Medium'}</SelectItem>
                    <SelectItem value="High">{isRTL ? 'عالية' : 'High'}</SelectItem>
                    <SelectItem value="Urgent">{isRTL ? 'عاجل' : 'Urgent'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {isRTL ? 'إرسال الطلب' : 'Submit Request'}
                </Button>
              </div>
            </form>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{isRTL ? 'لا توجد طلبات' : 'No requests yet'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رقم الطلب' : 'Request #'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Type'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التفاصيل' : 'Description'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الأولوية' : 'Priority'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.request_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.description}</TableCell>
                      <TableCell>
                        <Badge className={
                          request.priority === "Urgent" ? "bg-red-100 text-red-800" :
                          request.priority === "High" ? "bg-orange-100 text-orange-800" :
                          request.priority === "Medium" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {request.request_date && format(parseISO(request.request_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}