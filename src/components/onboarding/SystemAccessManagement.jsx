import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function SystemAccessManagement() {
  const [systemAccess, setSystemAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadSystemAccess();
  }, []);

  const loadSystemAccess = async () => {
    setLoading(true);
    const data = await base44.entities.SystemAccess.list('-created_date');
    setSystemAccess(data || []);
    setLoading(false);
  };

  const handleProvision = async (accessId) => {
    try {
      await base44.entities.SystemAccess.update(accessId, {
        status: 'Completed',
        account_created: true,
        account_creation_date: new Date().toISOString().split('T')[0],
        provisioned_by: (await base44.auth.me()).email,
        provisioned_date: new Date().toISOString().split('T')[0]
      });
      loadSystemAccess();
    } catch (error) {
      console.error("Error provisioning access:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Requested': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-orange-100 text-orange-800',
      'Completed': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Not Required': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const completedCount = systemAccess.filter(a => a.status === 'Completed').length;
  const pendingCount = systemAccess.filter(a => a.status !== 'Completed' && a.status !== 'Rejected').length;
  const rejectedCount = systemAccess.filter(a => a.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">{isRTL ? 'مكتمل' : 'Completed'}</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="w-8 h-8 text-blue-600" />
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
              <AlertCircle className="w-8 h-8 text-red-600" />
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
            <Key className="w-5 h-5 text-[#B11116]" />
            <span>{isRTL ? 'إدارة صلاحيات النظام' : 'System Access Management'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النظام' : 'System'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Type'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'مستوى الوصول' : 'Access Level'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'اسم المستخدم' : 'Username'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B11116] mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : systemAccess.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {isRTL ? 'لا توجد صلاحيات نظام' : 'No system access records'}
                    </TableCell>
                  </TableRow>
                ) : (
                  systemAccess.map((access) => (
                    <TableRow key={access.id} className="hover:bg-gray-50">
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {access.employee_name}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <div className="flex items-center gap-2">
                          {access.account_created && <CheckCircle className="w-4 h-4 text-green-600" />}
                          <span>{access.system_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {access.system_type}
                        </Badge>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        {access.access_level}
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : ''}>
                        <span className="font-mono text-sm">{access.username || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(access.status)}>
                          {access.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {access.status !== 'Completed' && access.status !== 'Rejected' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleProvision(access.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            {isRTL ? 'إنشاء' : 'Provision'}
                          </Button>
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