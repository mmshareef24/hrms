
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, DollarSign, Plus, Eye, Calendar, ArrowLeft, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/utils";

import ESSLoanApplicationForm from "./ESSLoanApplicationForm";

export default function ESSLoanRequests({ user }) {
  const [employee, setEmployee] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loanProducts, setLoanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null); // New state for selected loan
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try multiple methods to get employee record
      let emp = null;
      
      try {
        // Method 1: Filter by work_email
        const employeesByEmail = await base44.entities.Employee.filter({ work_email: user.email });
        if (employeesByEmail && employeesByEmail.length > 0) {
          emp = employeesByEmail[0];
        }
      } catch (emailError) {
        console.log("Could not find employee by work_email, trying alternative methods...");
      }

      // Method 2: Try listing all and finding by email
      if (!emp) {
        try {
          const allEmployees = await base44.entities.Employee.list();
          emp = allEmployees.find(e => 
            e.work_email === user.email || 
            e.personal_email === user.email ||
            e.email === user.email
          );
        } catch (listError) {
          console.error("Error listing employees:", listError);
        }
      }

      // Method 3: Create temporary employee object if still not found
      if (!emp) {
        console.warn("Employee record not found in database, using user data as fallback");
        emp = {
          id: user.email,
          full_name: user.full_name || "Employee",
          work_email: user.email,
          employee_id: user.email,
          department: "Unknown",
          job_title: "Employee",
          // Add basic salary info for loan calculations
          basic_salary: 0,
          join_date: new Date().toISOString().split('T')[0]
        };
        
        // Show warning to user
        setError("employee_not_in_system");
      }

      setEmployee(emp);

      // Load loan data with error handling
      try {
        const loanData = await base44.entities.LoanAccount.list('-created_date', 50);
        // Filter for this employee using multiple ID fields
        const myLoans = loanData.filter(l => 
          l.employee_id === emp.id || 
          l.employee_id === emp.employee_id ||
          l.employee_id === user.email
        );
        setLoans(myLoans || []);
      } catch (loanError) {
        console.log("No loan data yet:", loanError);
        setLoans([]);
      }

      // Load loan products
      try {
        const productsData = await base44.entities.LoanProduct.filter({ is_active: true });
        setLoanProducts(productsData || []);
      } catch (productError) {
        console.log("No loan products available:", productError);
        setLoanProducts([]);
      }

    } catch (err) {
      console.error("Error loading data:", err);
      setError("general_error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForLoan = () => {
    if (error === "employee_not_in_system") {
      alert(isRTL 
        ? "عذراً، لا يمكنك التقدم للحصول على قرض لأن سجل الموظف الخاص بك غير موجود في النظام. يرجى التواصل مع قسم الموارد البشرية لإنشاء سجل موظف."
        : "Sorry, you cannot apply for a loan because your employee record is not in the system. Please contact HR to create your employee record."
      );
      return;
    }
    setShowApplicationForm(true);
  };

  const handleSubmitLoan = async (loanData) => {
    try {
      const year = new Date().getFullYear();
      // Ensure loans array is loaded before trying to get its length
      const currentLoansCount = (await base44.entities.LoanAccount.filter({ employee_id: employee?.id || employee?.employee_id || user.email })).length;
      const loan_number = `LOAN-${year}-${String(currentLoansCount + 1).padStart(5, '0')}`;

      await base44.entities.LoanAccount.create({
        ...loanData,
        loan_number,
        employee_id: employee.id || employee.employee_id || user.email,
        employee_name: employee.full_name || user.full_name,
        requested_date: new Date().toISOString().split('T')[0],
        status: "Submitted",
        outstanding_principal: loanData.principal_amount,
        outstanding_interest: 0, // Assuming initial interest is 0 until calculated by system
        total_outstanding: loanData.principal_amount,
        total_paid: 0,
        remaining_term: loanData.term_months,
        currency: loanData.currency || 'SAR', // Ensure currency is passed or defaulted
        product_type: loanData.product_type || 'Personal Loan' // Ensure product_type is passed or defaulted
      });

      alert(isRTL ? "تم تقديم طلب القرض بنجاح!" : "Loan application submitted successfully!");
      setShowApplicationForm(false);
      loadData(); // Reload data to show the new loan
    } catch (err) {
      console.error("Error submitting loan:", err);
      alert(isRTL ? "حدث خطأ في تقديم الطلب: " + err.message : "Error submitting application: " + err.message);
    }
  };

  const renderLoanCard = (loan) => {
    const statusColors = {
      "Draft": "bg-gray-100 text-gray-800",
      "Submitted": "bg-blue-100 text-blue-800",
      "Manager Approved": "bg-yellow-100 text-yellow-800", // Changed to yellow as per common pending status
      "HR Approved": "bg-yellow-100 text-yellow-800",       // Changed to yellow as per common pending status
      "Finance Approved": "bg-green-100 text-green-800",
      "Disbursed": "bg-purple-100 text-purple-800",
      "Active": "bg-green-100 text-green-800",
      "Paid Off": "bg-gray-100 text-gray-800",
      "Closed": "bg-gray-100 text-gray-800", 
      "Rejected": "bg-red-100 text-red-800"
    };

    const progress = (loan.status === "Active" || loan.status === "Disbursed") && loan.total_paid != null && loan.principal_amount
      ? Math.round((loan.total_paid / loan.principal_amount) * 100)
      : 0;

    return (
      <Card key={loan.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-semibold text-lg">{loan.product_type || loan.product_name}</h3>
                <Badge className={statusColors[loan.status] || "bg-gray-100 text-gray-800"}>
                  {loan.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{loan.loan_number}</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(loan.principal_amount, { isRTL, currencyCode: loan.currency || 'SAR' })}
                </p>
                <div className={`flex items-center gap-4 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge variant="outline">
                    {loan.term_months} {isRTL ? 'شهر' : 'months'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {isRTL ? 'القسط: ' : 'Monthly: '}{formatCurrency(loan.installment_amount, { isRTL, showCode: false, currencyCode: loan.currency || 'SAR' })}
                  </span>
                </div>
                {loan.status === "Active" && (
                  <div className="mt-3">
                    <div className={`flex justify-between text-xs text-gray-600 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{isRTL ? 'التقدم' : 'Progress'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL ? 'المتبقي: ' : 'Remaining: '}{formatCurrency(loan.total_outstanding, { isRTL, showCode: false, currencyCode: loan.currency || 'SAR' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedLoan(loan)}
              className="flex-shrink-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show error state if general error
  if (error === "general_error") {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 mb-4">
            {isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
          </p>
          <Button onClick={loadData} variant="outline">
            {isRTL ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show warning banner if employee not in system
  const EmployeeWarningBanner = () => {
    if (error !== "employee_not_in_system") return null;
    
    return (
      <Card className="mb-6 border-orange-300 bg-orange-50">
        <CardContent className="p-6">
          <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
              <h3 className="font-semibold text-orange-900 mb-2">
                {isRTL ? 'سجل الموظف غير موجود' : 'Employee Record Not Found'}
              </h3>
              <p className="text-orange-800 text-sm mb-4">
                {isRTL 
                  ? 'لا يمكننا العثور على سجل موظف مرتبط بحسابك. للتقدم للحصول على قرض، يجب أن يكون لديك سجل موظف نشط في النظام.'
                  : 'We cannot find an employee record linked to your account. To apply for loans, you must have an active employee record in the system.'
                }
              </p>
              <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white"
                  onClick={() => window.location.href = 'mailto:hr@jasco.com'}
                >
                  {isRTL ? 'التواصل مع الموارد البشرية' : 'Contact HR'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-white"
                  onClick={loadData}
                >
                  {isRTL ? 'إعادة التحقق' : 'Recheck'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate loan stats
  const loanStats = {
    activeLoans: loans.filter(l => l.status === "Active" || l.status === "Disbursed").length,
    totalOutstanding: loans
      .filter(l => l.status === "Active" || l.status === "Disbursed")
      .reduce((sum, loan) => sum + (loan.total_outstanding || 0), 0),
    monthlyInstallments: loans
      .filter(l => l.status === "Active" || l.status === "Disbursed")
      .reduce((sum, loan) => sum + (loan.installment_amount || 0), 0),
  };

  // Show Application Form if showApplicationForm is true
  if (showApplicationForm) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setShowApplicationForm(false)}
          className={`mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'رجوع إلى قائمة القروض' : 'Back to Loan List'}
        </Button>
        
        <ESSLoanApplicationForm
          employee={employee}
          loanProducts={loanProducts}
          onSubmit={handleSubmitLoan}
          onCancel={() => setShowApplicationForm(false)}
        />
      </div>
    );
  }

  // Render selected loan details
  if (selectedLoan) {
    const statusColors = {
      "Draft": "bg-gray-100 text-gray-800",
      "Submitted": "bg-blue-100 text-blue-800",
      "Manager Approved": "bg-yellow-100 text-yellow-800",
      "HR Approved": "bg-yellow-100 text-yellow-800",
      "Finance Approved": "bg-green-100 text-green-800",
      "Disbursed": "bg-purple-100 text-purple-800",
      "Active": "bg-green-100 text-green-800",
      "Paid Off": "bg-gray-100 text-gray-800",
      "Closed": "bg-gray-100 text-gray-800",
      "Rejected": "bg-red-100 text-red-800"
    };

    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedLoan(null)}
          className={`mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {isRTL ? 'رجوع إلى قائمة القروض' : 'Back to Loan List'}
        </Button>

        <Card>
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>{isRTL ? 'تفاصيل القرض: ' : 'Loan Details: '}{selectedLoan.loan_number}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-500">{isRTL ? 'رقم القرض' : 'Loan Number'}</p>
              <p className="font-medium">{selectedLoan.loan_number}</p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-500">{isRTL ? 'نوع القرض' : 'Loan Type'}</p>
              <Badge variant="outline" className="mt-1">{selectedLoan.product_type || selectedLoan.product_name}</Badge>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-500">{isRTL ? 'المبلغ الرئيسي' : 'Principal Amount'}</p>
              <p className="font-medium text-green-600">
                {formatCurrency(selectedLoan.principal_amount, { isRTL, currencyCode: selectedLoan.currency || 'SAR' })}
              </p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-500">{isRTL ? 'المدة' : 'Term'}</p>
              <p className="font-medium">{selectedLoan.term_months} {isRTL ? 'شهر' : 'months'}</p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-500">{isRTL ? 'القسط الشهري' : 'Monthly Installment'}</p>
              <p className="font-medium">
                {formatCurrency(selectedLoan.installment_amount, { isRTL, currencyCode: selectedLoan.currency || 'SAR' })}
              </p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-500">{isRTL ? 'تاريخ الطلب' : 'Requested Date'}</p>
              <p className="font-medium">
                {selectedLoan.requested_date ? format(parseISO(selectedLoan.requested_date), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-500">{isRTL ? 'تاريخ البدء' : 'Start Date'}</p>
              <p className="font-medium">
                {selectedLoan.start_date ? format(parseISO(selectedLoan.start_date), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-500">{isRTL ? 'الحالة' : 'Status'}</p>
              <Badge className={`${statusColors[selectedLoan.status]} mt-1`}>
                {selectedLoan.status}
              </Badge>
            </div>
            {(selectedLoan.status === "Active" || selectedLoan.status === "Disbursed") && (
                <>
                    <div className={isRTL ? 'text-right' : ''}>
                        <p className="text-sm text-gray-500">{isRTL ? 'المبلغ المتبقي' : 'Outstanding Amount'}</p>
                        <p className="font-medium text-red-600">
                            {formatCurrency(selectedLoan.total_outstanding, { isRTL, currencyCode: selectedLoan.currency || 'SAR' })}
                        </p>
                    </div>
                    <div className={isRTL ? 'text-right' : ''}>
                        <p className="text-sm text-gray-500">{isRTL ? 'إجمالي المدفوعات' : 'Total Paid'}</p>
                        <p className="font-medium text-blue-600">
                            {formatCurrency(selectedLoan.total_paid, { isRTL, currencyCode: selectedLoan.currency || 'SAR' })}
                        </p>
                    </div>
                </>
            )}
            {selectedLoan.rejection_reason && (
                <div className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-gray-500">{isRTL ? 'سبب الرفض' : 'Rejection Reason'}</p>
                    <p className="font-medium text-red-500">{selectedLoan.rejection_reason}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <EmployeeWarningBanner />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Changed to 3 columns */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'القروض النشطة' : 'Active Loans'}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{loanStats.activeLoans}</p>
              </div>
              <CreditCard className="w-12 h-12 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'إجمالي الديون' : 'Total Outstanding'}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(loanStats.totalOutstanding, { isRTL, decimals: 0, currencyCode: 'SAR' })}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'الأقساط الشهرية' : 'Monthly Installments'}</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {formatCurrency(loanStats.monthlyInstallments, { isRTL, decimals: 0, currencyCode: 'SAR' })}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Products Info */}
      {loanProducts.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : ''}>
                <h3 className="font-semibold text-lg mb-2">
                  {isRTL ? 'منتجات القروض المتاحة' : 'Available Loan Products'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {loanProducts.map(product => (
                    <Badge key={product.id} variant="outline" className="bg-white">
                      {isRTL ? product.product_name_arabic || product.product_name : product.product_name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan List */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CreditCard className="w-5 h-5 text-green-600" />
              <span>{isRTL ? 'طلبات القروض' : 'Loan Applications'}</span>
            </CardTitle>
            <Button 
              onClick={handleApplyForLoan}
              className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}
              disabled={error === "employee_not_in_system" || loanProducts.length === 0}
            >
              <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'طلب قرض' : 'Apply for Loan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{isRTL ? 'لا توجد طلبات قروض' : 'No loan applications yet'}</p>
              {error !== "employee_not_in_system" && loanProducts.length > 0 && (
                <p className="text-sm mt-2">{isRTL ? 'اضغط على "طلب قرض" للبدء' : 'Click "Apply for Loan" to start'}</p>
              )}
              {(error === "employee_not_in_system" || loanProducts.length === 0) && (
                <p className="text-sm text-red-500 mt-2">
                  {isRTL 
                    ? 'لا يمكنك التقدم بطلب قرض حالياً. يرجى مراجعة تنبيه الموظف المتوفر أو توفر منتجات القروض.' 
                    : 'Cannot apply for a loan currently. Please check the employee warning or loan product availability.'
                  }
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Display loans in a grid */}
              {loans.map(renderLoanCard)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
