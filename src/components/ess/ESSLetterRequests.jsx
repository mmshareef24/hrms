import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from "date-fns";

export default function ESSLetterRequests({ user }) {
  const [requests, setRequests] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    letter_type: "",
    purpose: "",
    addressee: "",
    language: "English",
    include_salary_details: false,
    delivery_method: "Email",
    urgent: false,
    additional_notes: ""
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
      const letterRequests = await base44.entities.LetterRequest.filter(
        { employee_id: emp.id },
        '-requested_date',
        20
      );
      setRequests(letterRequests);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requestData = {
      ...formData,
      employee_id: employee.id,
      employee_name: employee.full_name,
      requested_date: new Date().toISOString().split('T')[0],
      status: "Requested"
    };

    // Generate request number
    const year = new Date().getFullYear();
    const count = requests.length + 1;
    requestData.request_number = `LTR-${year}-${String(count).padStart(4, '0')}`;

    await base44.entities.LetterRequest.create(requestData);
    setShowForm(false);
    setFormData({
      letter_type: "",
      purpose: "",
      addressee: "",
      language: "English",
      include_salary_details: false,
      delivery_method: "Email",
      urgent: false,
      additional_notes: ""
    });
    loadData();
  };

  const getStatusBadge = (status) => {
    const colors = {
      "Requested": "bg-blue-100 text-blue-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      "Approved": "bg-green-100 text-green-800",
      "Ready": "bg-purple-100 text-purple-800",
      "Delivered": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FileText className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'طلبات الخطابات' : 'Letter Requests'}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'نوع الخطاب' : 'Letter Type'}
                </label>
                <Select 
                  value={formData.letter_type} 
                  onValueChange={(v) => setFormData({...formData, letter_type: v})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر النوع" : "Select type"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary Certificate">{isRTL ? 'شهادة راتب' : 'Salary Certificate'}</SelectItem>
                    <SelectItem value="Employment Verification">{isRTL ? 'إثبات عمل' : 'Employment Verification'}</SelectItem>
                    <SelectItem value="NOC (No Objection Certificate)">{isRTL ? 'خطاب عدم ممانعة' : 'NOC'}</SelectItem>
                    <SelectItem value="To Whom It May Concern">{isRTL ? 'لمن يهمه الأمر' : 'To Whom It May Concern'}</SelectItem>
                    <SelectItem value="Experience Letter">{isRTL ? 'خطاب خبرة' : 'Experience Letter'}</SelectItem>
                    <SelectItem value="Bank Letter">{isRTL ? 'خطاب للبنك' : 'Bank Letter'}</SelectItem>
                    <SelectItem value="Other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? 'اللغة' : 'Language'}
                </label>
                <Select 
                  value={formData.language} 
                  onValueChange={(v) => setFormData({...formData, language: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">{isRTL ? 'إنجليزي' : 'English'}</SelectItem>
                    <SelectItem value="Arabic">{isRTL ? 'عربي' : 'Arabic'}</SelectItem>
                    <SelectItem value="Both">{isRTL ? 'الاثنين' : 'Both'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'الغرض' : 'Purpose'}
              </label>
              <Input
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                placeholder={isRTL ? "قرض بنكي، تأشيرة، إلخ..." : "Bank loan, visa, etc..."}
                required
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'المرسل إليه' : 'Addressee'}
              </label>
              <Input
                value={formData.addressee}
                onChange={(e) => setFormData({...formData, addressee: e.target.value})}
                placeholder={isRTL ? "اسم البنك، السفارة، إلخ..." : "Bank name, embassy, etc..."}
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
              </label>
              <Textarea
                value={formData.additional_notes}
                onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                rows={3}
                className={isRTL ? 'text-right' : ''}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="salary"
                  checked={formData.include_salary_details}
                  onCheckedChange={(checked) => setFormData({...formData, include_salary_details: checked})}
                />
                <label htmlFor="salary" className="text-sm">
                  {isRTL ? 'تضمين تفاصيل الراتب' : 'Include salary details'}
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="urgent"
                  checked={formData.urgent}
                  onCheckedChange={(checked) => setFormData({...formData, urgent: checked})}
                />
                <label htmlFor="urgent" className="text-sm text-red-600 font-medium">
                  {isRTL ? 'عاجل' : 'Urgent'}
                </label>
              </div>
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
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>{isRTL ? 'لا توجد طلبات' : 'No requests yet'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رقم الطلب' : 'Request #'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Type'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الغرض' : 'Purpose'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المرسل إليه' : 'Addressee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.request_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.letter_type}</Badge>
                    </TableCell>
                    <TableCell>{request.purpose}</TableCell>
                    <TableCell className="text-sm text-gray-500">{request.addressee || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {request.requested_date && format(parseISO(request.requested_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(request.status === "Ready" || request.status === "Delivered") && request.generated_document_url && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}