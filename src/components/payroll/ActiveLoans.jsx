import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, DollarSign, Calendar, TrendingDown, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ActiveLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    const data = await base44.entities.LoanAccount.list('-created_date', 100);
    setLoans(data.filter(l => l.status === "Active" || l.status === "Disbursed"));
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const colors = {
      "Active": "bg-green-100 text-green-800",
      "Disbursed": "bg-blue-100 text-blue-800",
      "Paused": "bg-yellow-100 text-yellow-800",
      "Delinquent": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const calculateProgress = (paid, total) => {
    return total > 0 ? (paid / total) * 100 : 0;
  };

  const totalPortfolio = loans.reduce((sum, loan) => sum + (loan.total_outstanding || 0), 0);
  const totalPrincipal = loans.reduce((sum, loan) => sum + (loan.outstanding_principal || 0), 0);
  const delinquentLoans = loans.filter(l => l.delinquent_days > 0).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'إجمالي القروض' : 'Total Loans'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'إجمالي المحفظة' : 'Total Portfolio'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalPortfolio.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">SAR</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'الأصل المستحق' : 'Principal Outstanding'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalPrincipal.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">SAR</p>
              </div>
              <TrendingDown className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'المتأخر' : 'Delinquent'}
                </p>
                <p className="text-2xl font-bold text-red-600">{delinquentLoans}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans List */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'القروض النشطة' : 'Active Loans'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{isRTL ? 'لا توجد قروض نشطة' : 'No active loans'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رقم القرض' : 'Loan #'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Type'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الأصل' : 'Principal'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المدفوع' : 'Paid'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المتبقي' : 'Outstanding'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'القسط التالي' : 'Next Payment'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className={isRTL ? 'text-right' : ''}></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => {
                    const progress = calculateProgress(loan.total_paid || 0, loan.total_loan_cost || loan.principal_amount);
                    return (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">{loan.loan_number}</TableCell>
                        <TableCell>{loan.employee_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{loan.product_type}</Badge>
                        </TableCell>
                        <TableCell>{loan.principal_amount?.toLocaleString()} {loan.currency}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{loan.total_paid?.toLocaleString() || 0}</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-green-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-orange-600">
                          {loan.total_outstanding?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{loan.next_payment_amount?.toLocaleString() || 0}</p>
                            {loan.next_payment_date && (
                              <p className="text-gray-500 text-xs">
                                {format(parseISO(loan.next_payment_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(loan.status)}>
                            {loan.status}
                          </Badge>
                          {loan.delinquent_days > 0 && (
                            <Badge className="bg-red-100 text-red-800 ml-1">
                              {loan.delinquent_days}d overdue
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            {isRTL ? 'عرض' : 'View'}
                          </Button>
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
    </div>
  );
}