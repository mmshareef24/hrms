
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Printer, Mail, MessageCircle, Search, RotateCcw, User } from "lucide-react";

import LEA01LeaveApplication from "./forms/LEA01LeaveApplication";
import LEA02LeaveCancellation from "./forms/LEA02LeaveCancellation";
import LEA03AttendanceCorrection from "./forms/LEA03AttendanceCorrection";
import LEA04OvertimeRequest from "./forms/LEA04OvertimeRequest";
import LEA05HolidayWorkApproval from "./forms/LEA05HolidayWorkApproval";

export default function Forms() {
  const [activeForm, setActiveForm] = useState("lea01");
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceExceptions, setAttendanceExceptions] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadUser();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadEmployeeData(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const empList = await base44.entities.Employee.list();
      const emp = empList.find(e => 
        e.work_email === userData.email || 
        e.personal_email === userData.email ||
        e.email === userData.email
      );
      if (emp) {
        setEmployee(emp);
        setSelectedEmployeeId(emp.id);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      const empList = await base44.entities.Employee.list();
      setEmployees(empList);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const loadEmployeeData = async (employeeId) => {
    try {
      const emp = employees.find(e => e.id === employeeId);
      if (emp) {
        setEmployee(emp);
      }

      // Load leave requests for this employee
      const leaves = await base44.entities.LeaveRequest.filter({ employee_id: employeeId });
      setLeaveRequests(leaves || []);

      // Load attendance exceptions
      const exceptions = await base44.entities.AttendanceException.filter({ employee_id: employeeId });
      setAttendanceExceptions(exceptions || []);
    } catch (error) {
      console.error("Error loading employee data:", error);
    }
  };

  const handleRequestSelection = (requestId) => {
    setSelectedRequestId(requestId);
    
    if (activeForm === "lea01" || activeForm === "lea02") {
      const request = leaveRequests.find(r => r.id === requestId);
      setSelectedRequest(request);
    } else if (activeForm === "lea03") {
      const exception = attendanceExceptions.find(e => e.id === requestId);
      setSelectedRequest(exception);
    }
  };

  const forms = [
    { id: "lea01", title: "Leave Application", titleAr: "طلب إجازة", code: "LEA-01" },
    { id: "lea02", title: "Leave Cancellation", titleAr: "إلغاء إجازة", code: "LEA-02" },
    { id: "lea03", title: "Attendance Correction", titleAr: "تصحيح حضور", code: "LEA-03" },
    { id: "lea04", title: "Overtime Request", titleAr: "طلب عمل إضافي", code: "LEA-04" },
    { id: "lea05", title: "Holiday Work Approval", titleAr: "موافقة عمل في عطلة", code: "LEA-05" }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    if (!user) return;
    
    try {
      const formTitle = forms.find(f => f.id === activeForm)?.title;
      await base44.integrations.Core.SendEmail({
        to: employee?.work_email || user.email,
        subject: `${forms.find(f => f.id === activeForm)?.code} - ${formTitle}`,
        body: `Your form ${activeForm.toUpperCase()} has been generated and is ready for printing.\n\nEmployee: ${employee?.full_name}\nForm: ${formTitle}\n\nPlease print or download the PDF from the system.`
      });
      alert(isRTL ? "تم إرسال النموذج بالبريد الإلكتروني" : "Form sent to email successfully");
    } catch (error) {
      alert(isRTL ? "فشل إرسال البريد الإلكتروني" : "Failed to send email");
    }
  };

  const handleSendWhatsApp = () => {
    const formTitle = forms.find(f => f.id === activeForm)?.title || activeForm;
    const formCode = forms.find(f => f.id === activeForm)?.code;
    const message = `📄 *${formCode} - ${formTitle}*\n\nEmployee: ${employee?.full_name}\nEmployee ID: ${employee?.employee_id}\n\nThis form has been generated and is ready for review.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.work_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailableRequests = () => {
    if (activeForm === "lea01") {
      return leaveRequests.filter(r => r.status === "Approved" || r.status === "Rejected");
    } else if (activeForm === "lea02") {
      return leaveRequests.filter(r => r.status === "Approved");
    } else if (activeForm === "lea03") {
      return attendanceExceptions.filter(e => e.status === "Approved" || e.status === "Rejected");
    }
    return [];
  };

  return (
    <div>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h2 className="text-2xl font-bold text-gray-900">
            {isRTL ? 'النماذج والمستندات' : 'Forms & Documents'}
          </h2>
          <p className="text-gray-500 mt-1">
            {isRTL ? 'نماذج الإجازات والحضور القابلة للطباعة' : 'Printable Leave & Attendance Forms'}
          </p>
        </div>
        
        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button onClick={handlePrint} variant="outline" className={`${isRTL ? 'flex-row-reverse' : ''}`}>
            <Printer className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'طباعة' : 'Print'}
          </Button>
          <Button onClick={handleSendEmail} variant="outline" className={`${isRTL ? 'flex-row-reverse' : ''}`}>
            <Mail className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'بريد إلكتروني' : 'Email'}
          </Button>
          <Button onClick={handleSendWhatsApp} variant="outline" className={`${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'واتساب' : 'WhatsApp'}
          </Button>
        </div>
      </div>

      {/* Employee Search and Request Selection */}
      <Card className="mb-6 print:hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <User className="w-5 h-5 text-[#B11116]" />
            <span>{isRTL ? 'بحث الموظف واختيار الطلب' : 'Employee Search & Request Selection'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Employee Search */}
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'بحث عن موظف' : 'Search Employee'}
              </Label>
              <div className="relative mt-2">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={isRTL ? "اسم، رقم الموظف، أو البريد الإلكتروني..." : "Name, ID, or email..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                />
              </div>
              
              {searchTerm && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setSearchTerm("");
                      }}
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${isRTL ? 'text-right' : ''}`}
                    >
                      <p className="font-medium text-gray-900">{emp.full_name}</p>
                      <p className="text-sm text-gray-500">{emp.employee_id} • {emp.department}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {employee && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <p className="font-semibold text-gray-900">{employee.full_name}</p>
                      <p className="text-sm text-gray-600">{employee.employee_id} • {employee.department}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEmployee(null);
                        setSelectedEmployeeId("");
                        setSelectedRequest(null);
                        setSelectedRequestId("");
                      }}
                      className="text-[#B11116] hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Request Selection for Re-print */}
            <div>
              <Label className={isRTL ? 'text-right block' : ''}>
                {isRTL ? 'طباعة طلب سابق' : 'Re-print Previous Request'}
              </Label>
              <Select value={selectedRequestId} onValueChange={handleRequestSelection}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={isRTL ? "اختر طلباً للطباعة..." : "Select a request to print..."} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRequests().map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.leave_type_name || req.exception_type} - {req.start_date || req.exception_date} ({req.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedRequest && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm font-medium text-gray-700">
                      {isRTL ? 'تم تحديد الطلب' : 'Request Selected'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {isRTL ? 'سيتم ملء النموذج تلقائياً بالبيانات' : 'Form will be auto-filled with data'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeForm} onValueChange={setActiveForm}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white shadow-sm print:hidden">
          {forms.map((form) => (
            <TabsTrigger 
              key={form.id} 
              value={form.id}
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B11116] data-[state=active]:to-[#991014] data-[state=active]:text-white ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">{form.code}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="lea01" className="print:block print:scale-95">
          <LEA01LeaveApplication employee={employee} user={user} selectedRequest={selectedRequest} />
        </TabsContent>

        <TabsContent value="lea02" className="print:block print:scale-95">
          <LEA02LeaveCancellation employee={employee} user={user} selectedRequest={selectedRequest} />
        </TabsContent>

        <TabsContent value="lea03" className="print:block print:scale-95">
          <LEA03AttendanceCorrection employee={employee} user={user} selectedRequest={selectedRequest} />
        </TabsContent>

        <TabsContent value="lea04" className="print:block print:scale-95">
          <LEA04OvertimeRequest employee={employee} user={user} />
        </TabsContent>

        <TabsContent value="lea05" className="print:block print:scale-95">
          <LEA05HolidayWorkApproval employee={employee} user={user} />
        </TabsContent>
      </Tabs>

      <style>{`
        @media print {
          /* Hide everything first */
          body * {
            visibility: hidden;
          }
          
          /* Show only the active tab content */
          [role="tabpanel"][data-state="active"],
          [role="tabpanel"][data-state="active"] * {
            visibility: visible !important;
          }
          
          /* Position the content properly */
          [role="tabpanel"][data-state="active"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          /* Hide print:hidden elements */
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Force show print:block elements */
          .print\\:block {
            display: block !important;
            visibility: visible !important;
          }
          
          /* Page setup - single page */
          @page {
            size: A4;
            margin: 1cm;
          }
          
          /* Force content to fit on one page */
          [role="tabpanel"][data-state="active"] {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          
          /* Scale content to fit */
          .print\\:scale-95 {
            transform: scale(0.85) !important;
            transform-origin: top left;
          }
          
          /* Reduce padding and margins for print */
          .print\\:p-6 {
            padding: 0.75rem !important;
          }
          
          .print\\:p-4 {
            padding: 0.5rem !important;
          }
          
          .print\\:my-2 {
            margin-top: 0.25rem !important;
            margin-bottom: 0.25rem !important;
          }
          
          .print\\:mb-3 {
            margin-bottom: 0.5rem !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 0.75rem !important;
          }
          
          /* Reduce text sizes for print */
          .print\\:text-sm {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
          }
          
          .print\\:text-xs {
            font-size: 0.65rem !important;
            line-height: 0.9rem !important;
          }
          
          /* Ensure cards are visible */
          .print\\:border-2 {
            border-width: 1px !important;
          }
          
          .print\\:border-black {
            border-color: black !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:bg-white {
            background-color: white !important;
          }
          
          .print\\:text-black {
            color: black !important;
          }
          
          /* Prevent page breaks */
          .page-break {
            page-break-after: avoid !important;
          }
          
          /* Make sure text is visible */
          h1, h2, h3, h4, h5, h6 {
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin-top: 0.5rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          h1 { font-size: 1.25rem !important; }
          h2 { font-size: 1.1rem !important; }
          h3 { font-size: 1rem !important; }
          
          p, span, label, input, textarea, select {
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-size: 0.75rem !important;
            line-height: 1.2 !important;
          }
          
          label {
            font-weight: 500 !important;
            margin-bottom: 0.15rem !important;
          }
          
          /* Compact form elements */
          input, textarea, select {
            border: 1px solid black !important;
            background-color: white !important;
            padding: 0.25rem 0.5rem !important;
            margin-bottom: 0.25rem !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Compact grids */
          .grid {
            gap: 0.5rem !important;
          }
          
          /* Borders for forms */
          .border, .border-2, .border-t-2, .border-b-2 {
            border-color: black !important;
            border-width: 1px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Background colors for headers - lighter for print */
          .bg-red-50, .bg-green-50 {
            background-color: #f9f9f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .bg-blue-50 {
            background-color: #f5f5f5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .bg-gray-50 {
            background-color: #fafafa !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Compact card header */
          [class*="CardHeader"] {
            padding: 0.75rem !important;
          }
          
          /* Compact card content */
          [class*="CardContent"] {
            padding: 0.75rem !important;
          }
          
          /* Compact sections */
          .space-y-4 > * + * {
            margin-top: 0.5rem !important;
          }
          
          .space-y-6 > * + * {
            margin-top: 0.75rem !important;
          }
          
          .space-y-8 > * + * {
            margin-top: 1rem !important;
          }
          
          /* Signature boxes - smaller */
          .h-16 {
            height: 2.5rem !important;
          }
          
          .h-10 {
            height: 2rem !important;
          }
          
          /* Reduce badge sizes */
          [class*="Badge"] {
            font-size: 0.65rem !important;
            padding: 0.15rem 0.4rem !important;
          }
        }
      `}</style>
    </div>
  );
}
