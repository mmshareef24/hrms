import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DocumentUploader({ documents, onChange, requiredDocs }) {
  const [uploading, setUploading] = useState(false);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);

    try {
      const uploadedDocs = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedDocs.push({
          name: file.name,
          url: file_url,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });
      }
      onChange([...documents, ...uploadedDocs]);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const newDocs = documents.filter((_, i) => i !== index);
    onChange(newDocs);
  };

  const requiredDocsList = requiredDocs ? JSON.parse(requiredDocs) : [
    "National ID / Iqama",
    "Salary Certificate",
    "Bank Statement (3 months)"
  ];

  return (
    <Card>
      <CardHeader className="border-b border-gray-100">
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Upload className="w-5 h-5 text-green-600" />
          <span>{isRTL ? 'تحميل المستندات' : 'Upload Documents'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Required Documents Info */}
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            <p className={`font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'المستندات المطلوبة:' : 'Required Documents:'}
            </p>
            <ul className={`text-sm space-y-1 ${isRTL ? 'text-right list-none' : 'list-disc list-inside'}`}>
              {requiredDocsList.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              className={`w-full cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}
              disabled={uploading}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <Upload className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {uploading 
                ? (isRTL ? 'جاري التحميل...' : 'Uploading...')
                : (isRTL ? 'اختر الملفات' : 'Choose Files')
              }
            </Button>
          </label>
          <p className={`text-xs text-gray-500 mt-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'PDF, JPG, PNG (الحد الأقصى 10 ميجابايت لكل ملف)' : 'PDF, JPG, PNG (Max 10MB per file)'}
          </p>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className={`font-medium text-sm ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'المستندات المحملة' : 'Uploaded Documents'} ({documents.length})
            </h4>
            {documents.map((doc, index) => (
              <div key={index} className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 flex-1 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <File className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <File className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">{isRTL ? 'لم يتم تحميل أي مستندات بعد' : 'No documents uploaded yet'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}