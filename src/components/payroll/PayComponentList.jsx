import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PayComponentList({ components, loading, onEdit, onDelete }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  if (loading) {
    return (
      <Card className="shadow-lg overflow-hidden">
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))}
        </div>
      </Card>
    );
  }

  if (components.length === 0) {
    return (
      <Card className="shadow-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isRTL ? 'لا توجد مكونات' : 'No pay components yet'}
          </h3>
          <p className="text-gray-500">
            {isRTL ? 'أضف أول مكون للبدء' : 'Add your first component to get started'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'الرمز' : 'Code'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'الاسم' : 'Name'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'النوع' : 'Type'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'طريقة الحساب' : 'Calculation'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'التكرار' : 'Frequency'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'WPS' : 'WPS'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-left' : 'text-right'}`}>
                {isRTL ? 'الإجراءات' : 'Actions'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {components.map((comp) => (
              <TableRow key={comp.id} className="hover:bg-gray-50">
                <TableCell className={isRTL ? 'text-right' : ''}>
                  <span className="font-mono font-medium">{comp.component_code}</span>
                </TableCell>
                <TableCell className={isRTL ? 'text-right' : ''}>
                  <div>
                    <p className="font-medium">{comp.component_name}</p>
                    {comp.component_name_arabic && (
                      <p className="text-sm text-gray-500">{comp.component_name_arabic}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={`${isRTL ? 'flex-row-reverse' : ''} ${
                      comp.component_type === "Earning" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {comp.component_type === "Earning" ? (
                      <TrendingUp className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    ) : (
                      <TrendingDown className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    )}
                    {isRTL 
                      ? (comp.component_type === "Earning" ? "استحقاق" : "خصم")
                      : comp.component_type
                    }
                  </Badge>
                </TableCell>
                <TableCell className={isRTL ? 'text-right' : ''}>
                  <span className="text-sm">{comp.calculation_type}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {isRTL 
                      ? (comp.frequency === "Recurring" ? "متكرر" : "لمرة واحدة")
                      : comp.frequency
                    }
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={comp.is_wps_reportable 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {comp.is_wps_reportable ? (isRTL ? 'نعم' : 'Yes') : (isRTL ? 'لا' : 'No')}
                  </Badge>
                </TableCell>
                <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                  <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(comp)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(comp.id)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}