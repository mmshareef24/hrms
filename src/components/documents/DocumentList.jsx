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
import { Pencil, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const documentTypeColors = {
  "Iqama": "bg-purple-100 text-purple-800 border-purple-200",
  "Passport": "bg-blue-100 text-blue-800 border-blue-200",
  "Contract": "bg-green-100 text-green-800 border-green-200",
  "Work Permit": "bg-orange-100 text-orange-800 border-orange-200",
  "Medical Insurance": "bg-pink-100 text-pink-800 border-pink-200",
  "Gosi Certificate": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Other": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function DocumentList({ documents, loading, onEdit, onDelete }) {
  const isRTL = typeof window !== 'undefined' && document?.documentElement?.getAttribute('dir') === 'rtl';
  
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = differenceInDays(parseISO(expiryDate), new Date());
    
    if (daysUntilExpiry < 0) {
      return { 
        text: isRTL ? "منتهي" : "Expired", 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: true 
      };
    } else if (daysUntilExpiry <= 30) {
      return { 
        text: isRTL ? `${daysUntilExpiry} يوم متبقي` : `${daysUntilExpiry}d left`, 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: true 
      };
    } else if (daysUntilExpiry <= 90) {
      return { 
        text: isRTL ? `${daysUntilExpiry} يوم متبقي` : `${daysUntilExpiry}d left`, 
        color: "bg-orange-100 text-orange-800 border-orange-200", 
        icon: true 
      };
    }
    return { 
      text: format(parseISO(expiryDate), "MMM dd, yyyy"), 
      color: "bg-gray-100 text-gray-800 border-gray-200", 
      icon: false 
    };
  };

  const getDocTypeArabic = (type) => {
    const types = {
      "Iqama": "الإقامة",
      "Passport": "جواز السفر",
      "Contract": "العقد",
      "Work Permit": "رخصة العمل",
      "Medical Insurance": "التأمين الطبي",
      "Gosi Certificate": "شهادة التأمينات",
      "Other": "أخرى"
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Card className="shadow-lg overflow-hidden">
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-4 border-b last:border-b-0">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
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
                {isRTL ? 'الموظف' : 'Employee'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'نوع المستند' : 'Document Type'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'رقم المستند' : 'Document Number'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'تاريخ الإصدار' : 'Issue Date'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </TableHead>
              <TableHead className={`font-semibold ${isRTL ? 'text-left' : 'text-right'}`}>
                {isRTL ? 'الإجراءات' : 'Actions'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const expiryStatus = getExpiryStatus(doc.expiry_date);
              return (
                <TableRow key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className={isRTL ? 'text-right' : ''}>
                    <p className="font-medium text-gray-900">{doc.employee_name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={documentTypeColors[doc.document_type]}>
                      {isRTL ? getDocTypeArabic(doc.document_type) : doc.document_type}
                    </Badge>
                  </TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-gray-900">{doc.document_number || "-"}</p>
                  </TableCell>
                  <TableCell className={isRTL ? 'text-right' : ''}>
                    <p className="text-sm text-gray-600">
                      {doc.issue_date ? format(parseISO(doc.issue_date), "MMM dd, yyyy") : "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {expiryStatus ? (
                      <Badge variant="outline" className={`${expiryStatus.color} ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {expiryStatus.icon && <AlertTriangle className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />}
                        {expiryStatus.text}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                    <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                      {doc.file_url && (
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(doc)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(doc.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}