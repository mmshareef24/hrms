
import React, { useState, useEffect } from "react";
import { Document, Employee } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import DocumentList from "../components/documents/DocumentList";
import DocumentForm from "../components/documents/DocumentForm";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for RTL direction
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [docData, empData] = await Promise.all([
      Document.list("-created_date"),
      Employee.list()
    ]);
    setDocuments(docData);
    setEmployees(empData);
    setLoading(false);
  };

  const handleSave = async (documentData) => {
    if (editingDocument) {
      await Document.update(editingDocument.id, documentData);
    } else {
      await Document.create(documentData);
    }
    setShowForm(false);
    setEditingDocument(null);
    loadData();
  };

  const handleDelete = async (documentId) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await Document.delete(documentId);
      loadData();
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'إدارة المستندات' : 'Document Management'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isRTL ? 'تتبع مستندات الموظفين وتواريخ انتهاء الصلاحية' : 'Track employee documents and expiry dates'}
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingDocument(null);
              setShowForm(true);
            }}
            className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className={`w-5 h-5 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة مستند' : 'Add Document'}
          </Button>
        </div>

        {showForm ? (
          <DocumentForm
            document={editingDocument}
            employees={employees}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingDocument(null);
            }}
          />
        ) : (
          <DocumentList
            documents={documents}
            loading={loading}
            onEdit={(doc) => {
              setEditingDocument(doc);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
