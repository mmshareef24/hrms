import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Building2, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyList({ companies, loading, onEdit, onDelete }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-40 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <Card className="shadow-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isRTL ? 'لا توجد شركات' : 'No companies found'}
          </h3>
          <p className="text-gray-500">
            {isRTL ? 'أضف أول شركة للبدء' : 'Add your first company to get started'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <Card key={company.id} className="hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 border-b">
            <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-md">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <Badge variant="outline" className="bg-white text-green-700 border-green-200 font-mono font-bold">
                    {company.company_code}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(company)}
                  className="hover:bg-white hover:text-green-600"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(company.id)}
                  className="hover:bg-white hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <h3 className={`text-xl font-bold text-gray-900 ${isRTL ? 'text-right' : ''}`}>
              {company.company_name}
            </h3>
          </div>

          <div className="p-6 space-y-3">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-gray-500">{isRTL ? 'الحالة' : 'Status'}</span>
              <Badge 
                variant="outline"
                className={company.is_active 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                {isRTL 
                  ? (company.is_active ? "نشطة" : "غير نشطة")
                  : (company.is_active ? "Active" : "Inactive")
                }
              </Badge>
            </div>

            {company.address && (
              <div className={`pt-3 border-t ${isRTL ? 'text-right' : ''}`}>
                <p className="text-sm text-gray-500 mb-1">{isRTL ? 'العنوان' : 'Address'}</p>
                <p className="text-sm text-gray-900">{company.address}</p>
              </div>
            )}

            {(company.contact_email || company.contact_phone) && (
              <div className="pt-3 border-t space-y-2">
                {company.contact_email && (
                  <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{company.contact_email}</span>
                  </div>
                )}
                {company.contact_phone && (
                  <div className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{company.contact_phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}