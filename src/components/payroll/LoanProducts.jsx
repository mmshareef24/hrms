import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LoanProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await base44.entities.LoanProduct.list("product_name");
    setProducts(data);
    setLoading(false);
  };

  const getProductTypeBadge = (type) => {
    const colors = {
      "Personal Loan": "bg-blue-100 text-blue-800",
      "Salary Advance": "bg-green-100 text-green-800",
      "Emergency Advance": "bg-red-100 text-red-800",
      "Housing Loan": "bg-purple-100 text-purple-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Settings className="w-5 h-5 text-green-600" />
            <span>{isRTL ? 'منتجات القروض' : 'Loan Products'}</span>
          </CardTitle>
          <Button className={`bg-gradient-to-r from-green-600 to-green-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Plus className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة منتج' : 'Add Product'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>{isRTL ? 'لا توجد منتجات قروض' : 'No loan products configured'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'رمز المنتج' : 'Code'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'اسم المنتج' : 'Product Name'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'النوع' : 'Type'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الطريقة' : 'Method'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المعدل السنوي' : 'Rate'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحد الأدنى' : 'Min'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحد الأقصى' : 'Max'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'المدة' : 'Term'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : ''}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.product_code}</TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>
                      <Badge className={getProductTypeBadge(product.product_type)}>
                        {product.product_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.calculation_method}</Badge>
                    </TableCell>
                    <TableCell>{product.annual_rate}%</TableCell>
                    <TableCell>{product.min_amount?.toLocaleString()}</TableCell>
                    <TableCell>{product.max_amount?.toLocaleString()}</TableCell>
                    <TableCell>{product.min_term_months}-{product.max_term_months}m</TableCell>
                    <TableCell>
                      <Badge className={product.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {product.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        {isRTL ? 'تعديل' : 'Edit'}
                      </Button>
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