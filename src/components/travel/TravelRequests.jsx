import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Plane, Calendar, DollarSign, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO, differenceInDays } from "date-fns";
import TravelRequestForm from "./TravelRequestForm";

export default function TravelRequests() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [userData, requestData] = await Promise.all([
      base44.auth.me(),
      base44.entities.TravelRequest.list('-created_date', 50)
    ]);
    setUser(userData);
    setRequests(requestData);
    setLoading(false);
  };

  const handleCreateRequest = () => {
    setEditingRequest(null);
    setShowForm(true);
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  const handleSaveRequest = async (requestData) => {
    if (editingRequest) {
      await base44.entities.TravelRequest.update(editingRequest.id, requestData);
    } else {
      // Generate request number
      const year = new Date().getFullYear();
      const count = requests.length + 1;
      const request_number = `TRV-REQ-${year}-${String(count).padStart(4, '0')}`;
      
      await base44.entities.TravelRequest.create({
        ...requestData,
        request_number,
        employee_id: user.id || user.email,
        employee_name: user.full_name,
        status: "Draft"
      });
    }
    setShowForm(false);
    loadData();
  };

  const handleSubmitRequest = async (requestId) => {
    await base44.entities.TravelRequest.update(requestId, {
      status: "Submitted",
      submitted_date: new Date().toISOString().split('T')[0]
    });
    loadData();
  };

  const getStatusBadge = (status) => {
    const colors = {
      "Draft": "bg-gray-100 text-gray-800",
      "Submitted": "bg-blue-100 text-blue-800",
      "Manager Approved": "bg-green-100 text-green-800",
      "Approved": "bg-green-100 text-green-800",
      "In Travel": "bg-purple-100 text-purple-800",
      "Completed": "bg-gray-100 text-gray-800",
      "Cancelled": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (showForm) {
    return (
      <TravelRequestForm
        request={editingRequest}
        onSave={handleSaveRequest}
        onCancel={() => setShowForm(false)}
        user={user}
      />
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Plane className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'طلبات السفر' : 'Travel Requests'}</span>
          </CardTitle>
          <Button onClick={handleCreateRequest} className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'طلب جديد' : 'New Request'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Plane className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>{isRTL ? 'لا توجد طلبات سفر' : 'No travel requests yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رقم الطلب' : 'Request #'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الغرض' : 'Purpose'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الوجهات' : 'Destinations'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التواريخ' : 'Dates'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الأيام' : 'Days'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الميزانية' : 'Budget'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'إجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const destinations = JSON.parse(request.destinations || '[]');
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.trip_purpose}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{destinations.length > 0 ? destinations[0] : 'N/A'}</span>
                          {destinations.length > 1 && (
                            <Badge variant="secondary" className="ml-1">+{destinations.length - 1}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {request.departure_date && format(parseISO(request.departure_date), 'MMM dd')} - {request.return_date && format(parseISO(request.return_date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>{request.total_days || 0}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>{request.estimated_budget?.toLocaleString()} {request.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {request.status === "Draft" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEditRequest(request)}>
                                {isRTL ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button size="sm" onClick={() => handleSubmitRequest(request.id)} className="bg-green-600">
                                {isRTL ? 'إرسال' : 'Submit'}
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            {isRTL ? 'عرض' : 'View'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}