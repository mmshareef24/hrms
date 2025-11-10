import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, X } from "lucide-react";

export default function ESSLoanApplicationForm({ employee, loanProducts, onSubmit, onCancel }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  const [formData, setFormData] = useState({
    product_id: "",
    principal_amount: "",
    term_months: "",
    purpose: "",
    notes: ""
  });
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [calculation, setCalculation] = useState(null);

  const handleProductChange = (productId) => {
    const product = loanProducts.find(p => p.id === productId);
    setSelectedProduct(product);
    setFormData({
      ...formData,
      product_id: productId,
      principal_amount: "",
      term_months: product?.min_term_months || ""
    });
    setCalculation(null);
  };

  const calculateLoan = () => {
    if (!selectedProduct || !formData.principal_amount || !formData.term_months) {
      return;
    }

    const principal = parseFloat(formData.principal_amount);
    const months = parseInt(formData.term_months);
    const annualRate = selectedProduct.annual_rate || 0;
    const adminFee = selectedProduct.admin_fee || 0;

    let installment = 0;
    let totalCost = principal;

    if (selectedProduct.calculation_method === "Interest Free") {
      installment = principal / months;
      totalCost = principal + adminFee;
    } else if (selectedProduct.calculation_method === "Flat Rate") {
      const totalInterest = (principal * annualRate * months) / (12 * 100);
      totalCost = principal + totalInterest + adminFee;
      installment = totalCost / months;
    } else if (selectedProduct.calculation_method === "Reducing Balance") {
      const monthlyRate = annualRate / (12 * 100);
      if (monthlyRate === 0) {
        installment = principal / months;
      } else {
        installment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                     (Math.pow(1 + monthlyRate, months) - 1);
      }
      totalCost = (installment * months) + adminFee;
    }

    setCalculation({
      installment: installment.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalInterest: (totalCost - principal - adminFee).toFixed(2),
      adminFee: adminFee.toFixed(2)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.product_id || !formData.principal_amount || !formData.term_months || !formData.purpose) {
      alert(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    const principal = parseFloat(formData.principal_amount);
    const months = parseInt(formData.term_months);

    // Validation
    if (selectedProduct) {
      if (principal < selectedProduct.min_amount) {
        alert(isRTL 
          ? `الحد الأدنى للمبلغ هو ${selectedProduct.min_amount}`
          : `Minimum amount is ${selectedProduct.min_amount}`
        );
        return;
      }
      if (principal > selectedProduct.max_amount) {
        alert(isRTL 
          ? `الحد الأقصى للمبلغ هو ${selectedProduct.max_amount}`
          : `Maximum amount is ${selectedProduct.max_amount}`
        );
        return;
      }
      if (months < selectedProduct.min_term_months) {
        alert(isRTL 
          ? `الحد الأدنى للمدة هو ${selectedProduct.min_term_months} شهر`
          : `Minimum term is ${selectedProduct.min_term_months} months`
        );
        return;
      }
      if (months > selectedProduct.max_term_months) {
        alert(isRTL 
          ? `الحد الأقصى للمدة هو ${selectedProduct.max_term_months} شهر`
          : `Maximum term is ${selectedProduct.max_term_months} months`
        );
        return;
      }
    }

    const loanData = {
      ...formData,
      product_name: selectedProduct?.product_name,
      product_type: selectedProduct?.product_type,
      calculation_method: selectedProduct?.calculation_method,
      annual_rate: selectedProduct?.annual_rate || 0,
      admin_fee: selectedProduct?.admin_fee || 0,
      principal_amount: principal,
      term_months: months,
      installment_amount: calculation ? parseFloat(calculation.installment) : 0,
      total_loan_cost: calculation ? parseFloat(calculation.totalCost) : principal,
      currency: "SAR",
      company_id: employee.company_id,
      company_name: employee.company_name,
      department: employee.department,
      cost_center: employee.cost_center
    };

    onSubmit(loanData);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'طلب قرض جديد' : 'New Loan Application'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Product Selection */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'نوع القرض' : 'Loan Product'} <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.product_id} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? 'اختر نوع القرض' : 'Select loan product'} />
              </SelectTrigger>
              <SelectContent>
                {loanProducts.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {isRTL ? (product.product_name_arabic || product.product_name) : product.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Details */}
          {selectedProduct && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-gray-600">{isRTL ? 'المبلغ المسموح:' : 'Amount Range:'}</span>
                <span className="text-sm font-medium">
                  {selectedProduct.min_amount.toLocaleString()} - {selectedProduct.max_amount.toLocaleString()} SAR
                </span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-gray-600">{isRTL ? 'المدة المسموحة:' : 'Term Range:'}</span>
                <span className="text-sm font-medium">
                  {selectedProduct.min_term_months} - {selectedProduct.max_term_months} {isRTL ? 'شهر' : 'months'}
                </span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-gray-600">{isRTL ? 'معدل الفائدة:' : 'Interest Rate:'}</span>
                <span className="text-sm font-medium">{selectedProduct.annual_rate || 0}% {isRTL ? 'سنوياً' : 'per annum'}</span>
              </div>
              {selectedProduct.admin_fee > 0 && (
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm text-gray-600">{isRTL ? 'رسوم إدارية:' : 'Admin Fee:'}</span>
                  <span className="text-sm font-medium">{selectedProduct.admin_fee.toLocaleString()} SAR</span>
                </div>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'المبلغ المطلوب (ريال سعودي)' : 'Loan Amount (SAR)'} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.principal_amount}
              onChange={(e) => setFormData({...formData, principal_amount: e.target.value})}
              placeholder="10000"
              disabled={!selectedProduct}
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Term */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'المدة (بالأشهر)' : 'Term (Months)'} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={formData.term_months}
              onChange={(e) => setFormData({...formData, term_months: e.target.value})}
              placeholder="12"
              disabled={!selectedProduct}
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Calculate Button */}
          {selectedProduct && formData.principal_amount && formData.term_months && (
            <Button
              type="button"
              variant="outline"
              onClick={calculateLoan}
              className={`w-full ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Calculator className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'احسب القسط الشهري' : 'Calculate Monthly Installment'}
            </Button>
          )}

          {/* Calculation Results */}
          {calculation && (
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg space-y-3">
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-700">{isRTL ? 'القسط الشهري:' : 'Monthly Installment:'}</span>
                <span className="text-xl font-bold text-green-600">{calculation.installment} SAR</span>
              </div>
              <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-600">{isRTL ? 'إجمالي التكلفة:' : 'Total Cost:'}</span>
                <span className="font-medium">{calculation.totalCost} SAR</span>
              </div>
              <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-600">{isRTL ? 'إجمالي الفائدة:' : 'Total Interest:'}</span>
                <span className="font-medium">{calculation.totalInterest} SAR</span>
              </div>
              {parseFloat(calculation.adminFee) > 0 && (
                <div className={`flex justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'الرسوم الإدارية:' : 'Admin Fee:'}</span>
                  <span className="font-medium">{calculation.adminFee} SAR</span>
                </div>
              )}
            </div>
          )}

          {/* Purpose */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'الغرض من القرض' : 'Loan Purpose'} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              placeholder={isRTL ? 'اذكر سبب طلب القرض...' : 'Explain why you need this loan...'}
              rows={3}
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label className={isRTL ? 'text-right block' : ''}>
              {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional information...'}
              rows={2}
              className={isRTL ? 'text-right' : ''}
            />
          </div>

          {/* Submit Buttons */}
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-green-700">
              {isRTL ? 'تقديم الطلب' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}