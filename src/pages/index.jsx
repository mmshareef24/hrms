import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Employees from "./Employees";

import Documents from "./Documents";

import TimeManagement from "./TimeManagement";

import Companies from "./Companies";

import Payroll from "./Payroll";

import PayrollCompensation from "./PayrollCompensation";

import PersonalAdministration from "./PersonalAdministration";

import BenefitsRewards from "./BenefitsRewards";

import Performance from "./Performance";

import EmployeeRelations from "./EmployeeRelations";

import TravelExpense from "./TravelExpense";

import AssetsFacilities from "./AssetsFacilities";

import HealthSafety from "./HealthSafety";

import ESS from "./ESS";

import MSS from "./MSS";

import Administration from "./Administration";

import Reporting from "./Reporting";

import Onboarding from "./Onboarding";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Employees: Employees,
    
    Documents: Documents,
    
    TimeManagement: TimeManagement,
    
    Companies: Companies,
    
    Payroll: Payroll,
    
    PayrollCompensation: PayrollCompensation,
    
    PersonalAdministration: PersonalAdministration,
    
    BenefitsRewards: BenefitsRewards,
    
    Performance: Performance,
    
    EmployeeRelations: EmployeeRelations,
    
    TravelExpense: TravelExpense,
    
    AssetsFacilities: AssetsFacilities,
    
    HealthSafety: HealthSafety,
    
    ESS: ESS,
    
    MSS: MSS,
    
    Administration: Administration,
    
    Reporting: Reporting,
    
    Onboarding: Onboarding,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Employees" element={<Employees />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/TimeManagement" element={<TimeManagement />} />
                
                <Route path="/Companies" element={<Companies />} />
                
                <Route path="/Payroll" element={<Payroll />} />
                
                <Route path="/PayrollCompensation" element={<PayrollCompensation />} />
                
                <Route path="/PersonalAdministration" element={<PersonalAdministration />} />
                
                <Route path="/BenefitsRewards" element={<BenefitsRewards />} />
                
                <Route path="/Performance" element={<Performance />} />
                
                <Route path="/EmployeeRelations" element={<EmployeeRelations />} />
                
                <Route path="/TravelExpense" element={<TravelExpense />} />
                
                <Route path="/AssetsFacilities" element={<AssetsFacilities />} />
                
                <Route path="/HealthSafety" element={<HealthSafety />} />
                
                <Route path="/ESS" element={<ESS />} />
                
                <Route path="/MSS" element={<MSS />} />
                
                <Route path="/Administration" element={<Administration />} />
                
                <Route path="/Reporting" element={<Reporting />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}