import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, canApproveRequest, getUserRole } from "@/utils";
import { format } from "date-fns";
import { Plus, Receipt as ReceiptIcon, Trash2, Upload, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const CURRENCIES = ["SAR", "USD", "EUR", "AED"];
const FX_RATES = {
  SAR: 1,
  USD: 3.75,
  EUR: 4.03,
  AED: 1.02,
};

const CATEGORIES = [
  { key: "Travel", ar: "سفر" },
  { key: "Meals", ar: "وجبات" },
  { key: "Accommodation", ar: "إقامة" },
  { key: "Taxi", ar: "تاكسي" },
  { key: "Fuel", ar: "وقود" },
  { key: "PerDiem", ar: "بدل يومي" },
  { key: "Misc", ar: "متفرقات" },
];

const POLICY_LIMITS = {
  Meals: 150,
  Taxi: 200,
  Accommodation: 600,
  Fuel: 300,
  Travel: 5000,
};

function toSAR(amount, currency) {
  const rate = FX_RATES[currency] ?? 1;
  return Math.round((amount ?? 0) * rate * 100) / 100;
}

function computeVat(amount, currency, vatIncluded) {
  if (!vatIncluded || currency !== "SAR") return { vat: 0, net: amount ?? 0 };
  const vat = Math.round(((amount ?? 0) * 0.15) * 100) / 100;
  return { vat, net: Math.round(((amount ?? 0) - vat) * 100) / 100 };
}

export default function ExpenseClaims() {
  const isRTL = typeof window !== "undefined" && document.documentElement.getAttribute("dir") === "rtl";
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClaim, setEditingClaim] = useState(null);
  const [filters, setFilters] = useState({ status: "", q: "" });

  const [form, setForm] = useState({
    claim_date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    lines: [
      {
        expense_date: format(new Date(), "yyyy-MM-dd"),
        category: "Meals",
        vendor: "",
        description: "",
        currency: "SAR",
        amount: 0,
        vat_included: false,
        receipt_url: "",
      },
    ],
  });

  const role = getUserRole();
  const canApprove = canApproveRequest(role);

  useEffect(() => {
    loadClaims();
  }, []);

  async function loadClaims() {
    try {
      setLoading(true);
      const list = await base44.entities.ExpenseClaim.list("-created_date", 200);
      setClaims(list || []);
    } catch (e) {
      console.error("Failed to load claims", e);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      claim_date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      lines: [
        {
          expense_date: format(new Date(), "yyyy-MM-dd"),
          category: "Meals",
          vendor: "",
          description: "",
          currency: "SAR",
          amount: 0,
          vat_included: false,
          receipt_url: "",
        },
      ],
    });
    setEditingClaim(null);
  }

  const totals = useMemo(() => {
    const lines = editingClaim ? editingClaim.lines || [] : form.lines || [];
    let totalSar = 0;
    let totalVat = 0;
    let violations = 0;
    for (const ln of lines) {
      const { vat } = computeVat(ln.amount, ln.currency, ln.vat_included);
      totalVat += vat;
      totalSar += toSAR(ln.amount, ln.currency);
      const limit = POLICY_LIMITS[ln.category];
      if (limit && toSAR(ln.amount, ln.currency) > limit) violations += 1;
    }
    return { totalSar: Math.round(totalSar * 100) / 100, totalVat: Math.round(totalVat * 100) / 100, violations };
  }, [form, editingClaim]);

  function updateLine(idx, patch) {
    const lines = (editingClaim ? editingClaim.lines : form.lines).map((ln, i) => (i === idx ? { ...ln, ...patch } : ln));
    if (editingClaim) setEditingClaim({ ...editingClaim, lines });
    else setForm((f) => ({ ...f, lines }));
  }

  function addLine() {
    const newLine = {
      expense_date: format(new Date(), "yyyy-MM-dd"),
      category: "Meals",
      vendor: "",
      description: "",
      currency: "SAR",
      amount: 0,
      vat_included: false,
      receipt_url: "",
    };
    const lines = editingClaim ? editingClaim.lines || [] : form.lines || [];
    if (editingClaim) setEditingClaim({ ...editingClaim, lines: [...lines, newLine] });
    else setForm((f) => ({ ...f, lines: [...lines, newLine] }));
  }

  function removeLine(idx) {
    const lines = (editingClaim ? editingClaim.lines : form.lines).filter((_, i) => i !== idx);
    if (editingClaim) setEditingClaim({ ...editingClaim, lines });
    else setForm((f) => ({ ...f, lines }));
  }

  async function uploadReceipt(idx, file) {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateLine(idx, { receipt_url: file_url });
    } catch (e) {
      console.error("Upload failed", e);
      alert(isRTL ? "فشل تحميل الإيصال" : "Receipt upload failed");
    }
  }

  async function saveClaim(status = "Draft") {
    const payload = {
      claim_date: editingClaim ? editingClaim.claim_date : form.claim_date,
      description: editingClaim ? editingClaim.description : form.description,
      lines: editingClaim ? editingClaim.lines : form.lines,
      status,
      total_amount_sar: totals.totalSar,
      vat_total_sar: totals.totalVat,
      lines_count: (editingClaim ? editingClaim.lines : form.lines).length,
    };
    try {
      if (editingClaim) {
        await base44.entities.ExpenseClaim.update(editingClaim.id, payload);
      } else {
        await base44.entities.ExpenseClaim.create(payload);
      }
      await loadClaims();
      setShowForm(false);
      resetForm();
    } catch (e) {
      console.error("Save failed", e);
      alert(isRTL ? "فشل حفظ المطالبة" : "Failed to save claim");
    }
  }

  async function deleteClaim(id) {
    if (!confirm(isRTL ? "حذف هذه المطالبة؟" : "Delete this claim?")) return;
    try {
      await base44.entities.ExpenseClaim.delete(id);
      await loadClaims();
    } catch (e) {
      console.error("Delete failed", e);
      alert(isRTL ? "فشل الحذف" : "Delete failed");
    }
  }

  const filtered = useMemo(() => {
    return (claims || []).filter((c) => {
      const statusOk = !filters.status || c.status === filters.status;
      const q = filters.q?.toLowerCase() || "";
      const text = `${c.description || ""} ${(c.lines || []).map((l) => `${l.vendor} ${l.description}`).join(" ")}`.toLowerCase();
      return statusOk && (!q || text.includes(q));
    });
  }, [claims, filters]);

  function openNew() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(claim) {
    setEditingClaim(claim);
    setShowForm(true);
  }

  function addPerDiem(days = 1, rateSar = 150) {
    const line = {
      expense_date: format(new Date(), "yyyy-MM-dd"),
      category: "PerDiem",
      vendor: "",
      description: isRTL ? `بدل يومي ${days} يوم` : `Per-diem ${days} day(s)` ,
      currency: "SAR",
      amount: Math.round(days * rateSar * 100) / 100,
      vat_included: false,
      receipt_url: "",
    };
    const lines = editingClaim ? editingClaim.lines || [] : form.lines || [];
    if (editingClaim) setEditingClaim({ ...editingClaim, lines: [...lines, line] });
    else setForm((f) => ({ ...f, lines: [...lines, line] }));
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={isRTL ? 'text-right' : ''}>
            {isRTL ? 'مطالبات المصروفات' : 'Expense Claims'}
          </CardTitle>
          <Button onClick={openNew} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> {isRTL ? 'مطالبة جديدة' : 'New Claim'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{isRTL ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="Draft">{isRTL ? 'مسودة' : 'Draft'}</SelectItem>
              <SelectItem value="Submitted">{isRTL ? 'مُرسلة' : 'Submitted'}</SelectItem>
              <SelectItem value="Approved">{isRTL ? 'موافقة' : 'Approved'}</SelectItem>
              <SelectItem value="Rejected">{isRTL ? 'مرفوضة' : 'Rejected'}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={isRTL ? 'بحث...' : 'Search...'}
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            className={isRTL ? 'text-right' : ''}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead>{isRTL ? 'الأسطر' : 'Lines'}</TableHead>
                <TableHead>{isRTL ? 'الإجمالي (SAR)' : 'Total (SAR)'}</TableHead>
                <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{isRTL ? 'التصرفات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((claim) => (
                <TableRow key={claim.id} className="hover:bg-gray-50">
                  <TableCell>{format(new Date(claim.claim_date || claim.created_date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{claim.lines_count || (claim.lines?.length ?? 0)}</TableCell>
                  <TableCell className="font-semibold text-green-700">{formatCurrency(claim.total_amount_sar, 'SAR')}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        claim.status === 'Draft' ? 'bg-gray-200 text-gray-800' :
                        claim.status === 'Submitted' ? 'bg-blue-600 text-white' :
                        claim.status === 'Approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                    >
                      {claim.status || 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {claim.status === 'Draft' && (
                        <Button size="sm" onClick={() => openEdit(claim)} variant="outline">
                          {isRTL ? 'تحرير' : 'Edit'}
                        </Button>
                      )}
                      {claim.status === 'Draft' && (
                        <Button size="sm" onClick={() => { setEditingClaim(claim); saveClaim('Submitted'); }} className="bg-blue-600 hover:bg-blue-700">
                          {isRTL ? 'إرسال' : 'Submit'}
                        </Button>
                      )}
                      {claim.status === 'Draft' && (
                        <Button size="sm" variant="outline" onClick={() => deleteClaim(claim.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                          {isRTL ? 'حذف' : 'Delete'}
                        </Button>
                      )}
                      {canApprove && claim.status === 'Submitted' && (
                        <>
                          <Button size="sm" onClick={() => base44.entities.ExpenseClaim.update(claim.id, { status: 'Approved' }).then(loadClaims)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" /> {isRTL ? 'موافقة' : 'Approve'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => base44.entities.ExpenseClaim.update(claim.id, { status: 'Rejected' }).then(loadClaims)} className="text-red-600 border-red-200 hover:bg-red-50">
                            <XCircle className="w-4 h-4 mr-1" /> {isRTL ? 'رفض' : 'Reject'}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {isRTL ? 'لا توجد مطالبات' : 'No claims found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'text-right' : ''}>
              {editingClaim ? (isRTL ? 'تحرير المطالبة' : 'Edit Claim') : (isRTL ? 'مطالبة جديدة' : 'New Claim')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isRTL ? 'text-right' : ''}`}>
              <div>
                <Label>{isRTL ? 'تاريخ المطالبة' : 'Claim Date'}</Label>
                <Input type="date" value={editingClaim ? editingClaim.claim_date : form.claim_date} onChange={(e) => editingClaim ? setEditingClaim({ ...editingClaim, claim_date: e.target.value }) : setForm({ ...form, claim_date: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
                <Input value={editingClaim ? editingClaim.description : form.description} onChange={(e) => editingClaim ? setEditingClaim({ ...editingClaim, description: e.target.value }) : setForm({ ...form, description: e.target.value })} className={isRTL ? 'text-right' : ''} />
              </div>
            </div>

            <div className="space-y-4">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h3 className="font-semibold">{isRTL ? 'أسطر المصروفات' : 'Expense Lines'}</h3>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button variant="outline" onClick={() => addPerDiem(1, 150)}>{isRTL ? 'إضافة بدل يومي' : 'Add Per-diem'}</Button>
                  <Button onClick={addLine}>
                    <Plus className="w-4 h-4 mr-2" /> {isRTL ? 'إضافة سطر' : 'Add Line'}
                  </Button>
                </div>
              </div>

              {(editingClaim ? editingClaim.lines : form.lines).map((line, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                  <div className={`grid grid-cols-1 md:grid-cols-6 gap-3 ${isRTL ? 'text-right' : ''}`}>
                    <div>
                      <Label>{isRTL ? 'التاريخ' : 'Date'}</Label>
                      <Input type="date" value={line.expense_date} onChange={(e) => updateLine(idx, { expense_date: e.target.value })} />
                    </div>
                    <div>
                      <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
                      <Select value={line.category} onValueChange={(v) => updateLine(idx, { category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.key} value={c.key}>{isRTL ? c.ar : c.key}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{isRTL ? 'المورد' : 'Vendor'}</Label>
                      <Input value={line.vendor} onChange={(e) => updateLine(idx, { vendor: e.target.value })} className={isRTL ? 'text-right' : ''} />
                    </div>
                    <div>
                      <Label>{isRTL ? 'العملة' : 'Currency'}</Label>
                      <Select value={line.currency} onValueChange={(v) => updateLine(idx, { currency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{isRTL ? 'المبلغ' : 'Amount'}</Label>
                      <Input type="number" value={line.amount} onChange={(e) => updateLine(idx, { amount: Number(e.target.value) })} />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button variant="outline" onClick={() => updateLine(idx, { vat_included: !line.vat_included })}>
                        {isRTL ? (line.vat_included ? 'مضمنة ض.ق.م' : 'بدون ض.ق.م') : (line.vat_included ? 'VAT Included' : 'No VAT')}
                      </Button>
                      <label className="cursor-pointer inline-flex items-center gap-2">
                        <input type="file" className="hidden" onChange={(e) => uploadReceipt(idx, e.target.files?.[0])} />
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" /> {isRTL ? 'إيصال' : 'Receipt'}
                        </Button>
                        {line.receipt_url && <ReceiptIcon className="w-4 h-4 text-green-600" />}
                      </label>
                      <Button variant="ghost" onClick={() => removeLine(idx)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className={`mt-3 flex items-center gap-3 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {isRTL ? 'SAR: ' : 'SAR: '} {toSAR(line.amount, line.currency)}
                    </Badge>
                    {POLICY_LIMITS[line.category] && (
                      <Badge variant="outline" className={toSAR(line.amount, line.currency) > POLICY_LIMITS[line.category] ? 'bg-red-100 text-red-700' : 'bg-gray-50'}>
                        {isRTL ? 'حد السياسة: ' : 'Policy cap: '} {POLICY_LIMITS[line.category]} SAR
                      </Badge>
                    )}
                    {line.receipt_url && (
                      <a href={line.receipt_url} target="_blank" rel="noreferrer" className="text-green-700 underline">
                        {isRTL ? 'عرض الإيصال' : 'View receipt'}
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {totals.violations > 0 && (
                <Alert className="mt-2 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-xs text-red-800">
                    {isRTL ? `عدد الانتهاكات: ${totals.violations}` : `Policy violations: ${totals.violations}`}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="text-sm text-gray-600">
                <span className="mr-4">{isRTL ? 'إجمالي ض.ق.م: ' : 'VAT Total: '}{formatCurrency(totals.totalVat, 'SAR')}</span>
                <span className="font-semibold text-green-700">{isRTL ? 'الإجمالي: ' : 'Total: '}{formatCurrency(totals.totalSar, 'SAR')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button variant="outline" onClick={() => setShowForm(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
                <Button onClick={() => saveClaim('Draft')}>{isRTL ? '保存 مسودة' : 'Save Draft'}</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => saveClaim('Submitted')}>
                  {isRTL ? 'إرسال للموافقة' : 'Submit for Approval'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </Card>
  );
}