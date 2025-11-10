import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Zap
} from "lucide-react";

import EMISimulator from "./EMISimulator";
import EligibilityChecker from "./EligibilityChecker";
import DocumentUploader from "./DocumentUploader";

export default function LoanApplicationForm({ employee, onSuccess, onCancel }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: "",
    principal_amount: "",
    term_months: 12,
    purpose: "",
    is_emergency: false,
    documents: []
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [emiDetails, setEmiDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Product, 2: Amount/Term, 3: Documents, 4: Review
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await base44.entities.LoanProduct.list("product_name");
    const activeProducts = data.filter(p => p.is_active);
    setProducts(activeProducts);
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    setFormData({
      ...formData,
      product_id: productId,
      principal_amount: product?.min_amount || "",
      term_months: product?.min_term_months || 12
    });
  };

  const checkEligibility = async () => {
    if (!selectedProduct || !formData.principal_amount) return;

    // Calculate DTI
    const basicSalary = employee.basic_salary || 0;
    const netSalary = basicSalary * 0.85; // Rough estimate after GOSI

    // Get existing loans
    const existingLoans = await base44.entities.LoanAccount.list();
    const activeLoans = existingLoans.filter(l => 
      l.employee_id === employee.id && 
      (l.status === "Active" || l.status === "Disbursed")
    );

    const existingDeductions = activeLoans.reduce((sum, loan) => 
      sum + (loan.installment_amount || 0), 0
    );

    // Calculate proposed EMI
    const amount = parseFloat(formData.principal_amount);
    const months = parseInt(formData.term_months);
    const rate = selectedProduct.annual_rate / 100 / 12;

    let proposedEMI = 0;
    if (selectedProduct.calculation_method === "Reducing Balance" && rate > 0) {
      proposedEMI = (amount * rate * Math.pow(1 + rate, months)) / 
                    (Math.pow(1 + rate, months) - 1);
    } else if (selectedProduct.calculation_method === "Flat Rate") {
      const totalInterest = amount * (selectedProduct.annual_rate / 100) * (months / 12);
      proposedEMI = (amount + totalInterest) / months;
    } else {
      proposedEMI = amount / months;
    }

    const totalDeductions = existingDeductions + proposedEMI;
    const dtiPercent = (totalDeductions / netSalary) * 100;
    const dtiCap = 33; // Configurable

    // Check eligibility criteria
    const checks = {
      tenureCheck: {
        passed: true, // employee.join_date check
        message: isRTL ? 'مدة الخدمة مستوفاة' : 'Tenure requirement met'
      },
      amountCheck: {
        passed: amount >= selectedProduct.min_amount && amount <= selectedProduct.max_amount,
        message: isRTL 
          ? `المبلغ يجب أن يكون بين ${selectedProduct.min_amount} و ${selectedProduct.max_amount}`
          : `Amount must be between ${selectedProduct.min_amount} and ${selectedProduct.max_amount}`
      },
      dtiCheck: {
        passed: dtiPercent <= dtiCap,
        message: isRTL 
          ? `نسبة الدين للدخل: ${dtiPercent.toFixed(1)}% (الحد الأقصى: ${dtiCap}%)`
          : `DTI Ratio: ${dtiPercent.toFixed(1)}% (Max: ${dtiCap}%)`
      },
      concurrentCheck: {
        passed: activeLoans.length < (selectedProduct.max_concurrent_per_employee || 1),
        message: isRTL 
          ? `القروض النشطة: ${activeLoans.length}/${selectedProduct.max_concurrent_per_employee || 1}`
          : `Active loans: ${activeLoans.length}/${selectedProduct.max_concurrent_per_employee || 1}`
      },
      probationCheck: {
        passed: employee.status !== "On Probation" || !selectedProduct.exclude_probation,
        message: isRTL ? 'حالة فترة التجربة' : 'Probation status'
      }
    };

    const allPassed = Object.values(checks).every(check => check.passed);

    setEligibility({
      eligible: allPassed,
      checks,
      dtiPercent: dtiPercent.toFixed(1),
      dtiCap,
      existingDeductions,
      proposedEMI: proposedEMI.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netSalary: netSalary.toFixed(2)
    });

    // Calculate EMI details
    let totalInterest = 0;
    if (selectedProduct.calculation_method === "Reducing Balance" && rate > 0) {
      totalInterest = (proposedEMI * months) - amount;
    } else if (selectedProduct.calculation_method === "Flat Rate") {
      totalInterest = amount * (selectedProduct.annual_rate / 100) * (months / 12);
    }

    setEmiDetails({
      principal: amount,
      monthlyEMI: proposedEMI.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPayable: (amount + totalInterest + selectedProduct.admin_fee).toFixed(2),
      adminFee: selectedProduct.admin_fee
    });
  };

  useEffect(() => {
    if (selectedProduct && formData.principal_amount && formData.term_months) {
      checkEligibility();
    }
  }, [selectedProduct, formData.principal_amount, formData.term_months]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const loanData = {
        employee_id: employee.id,
        employee_name: employee.full_name,
        company_id: employee.company_id,
        company_name: employee.company_name,
        department: employee.department,
        cost_center: employee.cost_center,
        product_id: formData.product_id,
        product_name: selectedProduct.product_name,
        product_type: selectedProduct.product_type,
        calculation_method: selectedProduct.calculation_method,
        principal_amount: parseFloat(formData.principal_amount),
        currency: "SAR",
        annual_rate: selectedProduct.annual_rate,
        admin_fee: selectedProduct.admin_fee,
        total_loan_cost: parseFloat(emiDetails.totalPayable),
        term_months: parseInt(formData.term_months),
        grace_period_months: selectedProduct.grace_period_months || 0,
        installment_amount: parseFloat(emiDetails.monthlyEMI),
        outstanding_principal: parseFloat(formData.principal_amount),
        outstanding_interest: parseFloat(emiDetails.totalInterest),
        total_outstanding: parseFloat(emiDetails.totalPayable),
        purpose: formData.purpose,
        attached_documents: JSON.stringify(formData.documents),
        requested_date: new Date().toISOString().split('T')[0],
        status: formData.is_emergency ? "Submitted" : "Draft",
        deduction_priority: selectedProduct.deduction_priority
      };

      // Generate loan number
      const existingLoans = await base44.entities.LoanAccount.list();
      const year = new Date().getFullYear();
      const count = existingLoans.length + 1;
      loanData.loan_number = `LON-${year}-${String(count).padStart(4, '0')}`;

      await base44.entities.LoanAccount.create(loanData);

      // Auto-submit if emergency
      if (formData.is_emergency) {
        alert(isRTL 
          ? 'تم تقديم طلب القرض الطارئ بنجاح! سيتم مراجعته بشكل عاجل.'
          : 'Emergency loan application submitted successfully! It will be fast-tracked for review.');
      }

      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'نوع القرض' : 'Loan Product'}
        </label>
        <Select value={formData.product_id} onValueChange={handleProductChange}>
          <SelectTrigger>
            <SelectValue placeholder={isRTL ? "اختر نوع القرض" : "Select loan product"} />
          </SelectTrigger>
          <SelectContent>
            {products.map(product => (
              <SelectItem key={product.id} value={product.id}>
                <div className="flex items-center justify-between gap-4">
                  <span>{isRTL ? product.product_name_arabic || product.product_name : product.product_name}</span>
                  <Badge variant="outline">{product.product_type}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProduct && (
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'الحد الأدنى للمبلغ' : 'Min Amount'}</p>
                <p className="text-lg font-bold text-green-700">{selectedProduct.min_amount.toLocaleString()} SAR</p>
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'الحد الأقصى للمبلغ' : 'Max Amount'}</p>
                <p className="text-lg font-bold text-green-700">{selectedProduct.max_amount.toLocaleString()} SAR</p>
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'المعدل السنوي' : 'Annual Rate'}</p>
                <p className="text-lg font-bold text-green-700">{selectedProduct.annual_rate}%</p>
              </div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-sm text-gray-600">{isRTL ? 'المدة' : 'Term'}</p>
                <p className="text-lg font-bold text-green-700">
                  {selectedProduct.min_term_months}-{selectedProduct.max_term_months} {isRTL ? 'شهر' : 'months'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="emergency"
          checked={formData.is_emergency}
          onChange={(e) => setFormData({...formData, is_emergency: e.target.checked})}
          className="w-5 h-5 text-red-600"
        />
        <label htmlFor="emergency" className={`flex items-center gap-2 text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Zap className="w-5 h-5 text-red-600" />
          <span>{isRTL ? 'طلب طارئ (موافقة سريعة)' : 'Emergency Request (Fast-Track Approval)'}</span>
        </label>
      </div>

      {formData.is_emergency && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className={isRTL ? 'text-right' : ''}>
            {isRTL 
              ? 'سيتم مراجعة الطلبات الطارئة خلال 24 ساعة. يرجى إرفاق المستندات الداعمة.'
              : 'Emergency requests will be reviewed within 24 hours. Please attach supporting documents.'
            }
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button 
          onClick={() => setStep(2)} 
          disabled={!formData.product_id}
          className="bg-green-600 hover:bg-green-700"
        >
          {isRTL ? 'التالي' : 'Next'}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'مبلغ القرض (ريال)' : 'Loan Amount (SAR)'}
          </label>
          <Input
            type="number"
            value={formData.principal_amount}
            onChange={(e) => setFormData({...formData, principal_amount: e.target.value})}
            min={selectedProduct?.min_amount}
            max={selectedProduct?.max_amount}
            step="1000"
            className={isRTL ? 'text-right' : ''}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'المدة (بالأشهر)' : 'Term (Months)'}
          </label>
          <Select 
            value={String(formData.term_months)} 
            onValueChange={(v) => setFormData({...formData, term_months: parseInt(v)})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectedProduct && Array.from(
                { length: selectedProduct.max_term_months - selectedProduct.min_term_months + 1 },
                (_, i) => selectedProduct.min_term_months + i
              ).filter(m => m % (selectedProduct.min_term_months >= 12 ? 6 : 1) === 0).map(months => (
                <SelectItem key={months} value={String(months)}>
                  {months} {isRTL ? 'شهر' : 'months'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'الغرض من القرض' : 'Purpose of Loan'}
        </label>
        <Textarea
          value={formData.purpose}
          onChange={(e) => setFormData({...formData, purpose: e.target.value})}
          rows={3}
          placeholder={isRTL ? "اشرح سبب حاجتك للقرض..." : "Explain why you need this loan..."}
          className={isRTL ? 'text-right' : ''}
        />
      </div>

      {eligibility && (
        <div className="space-y-4">
          <EligibilityChecker eligibility={eligibility} />
          {eligibility.eligible && emiDetails && (
            <EMISimulator emiDetails={emiDetails} product={selectedProduct} />
          )}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(1)}>
          {isRTL ? 'السابق' : 'Back'}
        </Button>
        <Button 
          onClick={() => setStep(3)} 
          disabled={!eligibility?.eligible || !formData.purpose}
          className="bg-green-600 hover:bg-green-700"
        >
          {isRTL ? 'التالي' : 'Next'}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <DocumentUploader
        documents={formData.documents}
        onChange={(docs) => setFormData({...formData, documents: docs})}
        requiredDocs={selectedProduct?.required_documents}
      />

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(2)}>
          {isRTL ? 'السابق' : 'Back'}
        </Button>
        <Button 
          onClick={() => setStep(4)}
          className="bg-green-600 hover:bg-green-700"
        >
          {isRTL ? 'مراجعة' : 'Review'}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : ''}>{isRTL ? 'ملخص الطلب' : 'Application Summary'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-600">{isRTL ? 'نوع القرض' : 'Loan Type'}</p>
              <p className="font-bold">{selectedProduct?.product_name}</p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-600">{isRTL ? 'المبلغ' : 'Amount'}</p>
              <p className="font-bold">{parseFloat(formData.principal_amount).toLocaleString()} SAR</p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-600">{isRTL ? 'المدة' : 'Term'}</p>
              <p className="font-bold">{formData.term_months} {isRTL ? 'شهر' : 'months'}</p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-600">{isRTL ? 'القسط الشهري' : 'Monthly EMI'}</p>
              <p className="font-bold text-green-600">{emiDetails?.monthlyEMI} SAR</p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-600">{isRTL ? 'إجمالي الفائدة' : 'Total Interest'}</p>
              <p className="font-bold">{emiDetails?.totalInterest} SAR</p>
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="text-sm text-gray-600">{isRTL ? 'إجمالي المبلغ المستحق' : 'Total Payable'}</p>
              <p className="font-bold text-blue-600">{emiDetails?.totalPayable} SAR</p>
            </div>
          </div>

          {formData.is_emergency && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              <Zap className="w-4 h-4 mr-1" />
              {isRTL ? 'طلب طارئ' : 'Emergency Request'}
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(3)}>
          {isRTL ? 'السابق' : 'Back'}
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading 
            ? (isRTL ? 'جاري التقديم...' : 'Submitting...')
            : (isRTL ? 'تقديم الطلب' : 'Submit Application')
          }
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, label: isRTL ? 'اختيار المنتج' : 'Product' },
          { num: 2, label: isRTL ? 'المبلغ والمدة' : 'Amount & Term' },
          { num: 3, label: isRTL ? 'المستندات' : 'Documents' },
          { num: 4, label: isRTL ? 'المراجعة' : 'Review' }
        ].map((s, idx) => (
          <div key={s.num} className={`flex items-center ${idx < 3 ? 'flex-1' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex flex-col items-center ${isRTL ? 'items-end' : 'items-start'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s.num 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.num ? <CheckCircle className="w-6 h-6" /> : s.num}
              </div>
              <p className="text-xs mt-2 text-gray-600">{s.label}</p>
            </div>
            {idx < 3 && (
              <div className={`flex-1 h-1 mx-4 ${
                step > s.num ? 'bg-green-600' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}