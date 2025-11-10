import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Upload, CheckCircle, XCircle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function DocumentTracking() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const data = await base44.entities.OnboardingDocument.list('-created_date');
    setDocuments(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Submitted': case 'Under Review': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Not Required': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const pendingCount = documents.filter(d => d.status === 'Pending' && d.is_mandatory).length;
  const approvedCount = documents.filter(d => d.status === 'Approved').length;
  const rejectedCount = documents.filter(d => d.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'معلق' : 'Pending'}</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'موافق عليه' : 'Approved'}</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <XCircle className="w-8 h-8 text-red-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'مرفوض' : 'Rejected'}</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <FileText className="w-5 h-5 text-[#B11116]" />
            <span>{isRTL ? 'تتبع المستندات' : 'Document Tracking'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المستند' : 'Document'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Type'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'تاريخ الاستحقاق' : 'Due Date'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الملف' : 'File'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B11116] mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {isRTL ? 'لا توجد مستندات' : 'No documents found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50">
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {doc.employee_name}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          <span>{doc.document_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {doc.document_type}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {doc.due_date ? format(parseISO(doc.due_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {doc.file_url ? (
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {isRTL ? 'عرض' : 'View'}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}