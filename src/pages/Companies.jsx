import React, { useState, useEffect } from "react";
import { Company } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import CompanyList from "../components/companies/CompanyList";
import CompanyForm from "../components/companies/CompanyForm";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    const data = await Company.list("company_code");
    setCompanies(data);
    setLoading(false);
  };

  const handleSave = async (companyData) => {
    if (editingCompany) {
      await Company.update(editingCompany.id, companyData);
    } else {
      await Company.create(companyData);
    }
    setShowForm(false);
    setEditingCompany(null);
    loadCompanies();
  };

  const handleDelete = async (companyId) => {
    if (confirm("Are you sure you want to delete this company?")) {
      await Company.delete(companyId);
      loadCompanies();
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'إدارة الشركات' : 'Company Management'}
            </h1>
            <p className="text-gray-500 mt-2">
              {companies.length} {isRTL ? 'شركة في ماتريكس إتش آر' : 'companies in MatrixHRMS'}
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingCompany(null);
              setShowForm(true);
            }}
            className={`bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className={`w-5 h-5 ${isRTL ? 'mr-0 ml-2' : 'mr-2'}`} />
            {isRTL ? 'إضافة شركة' : 'Add Company'}
          </Button>
        </div>

        {showForm ? (
          <CompanyForm
            company={editingCompany}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingCompany(null);
            }}
          />
        ) : (
          <CompanyList
            companies={companies}
            loading={loading}
            onEdit={(company) => {
              setEditingCompany(company);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}