

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  LogOut,
  Building2,
  DollarSign,
  Globe,
  Gift,
  TrendingUp,
  Scale,
  Package,
  HeartPulse,
  User,
  UserCog
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import NotificationBell from "@/components/common/NotificationBell";

const navigationItems = [
  {
    title: "Dashboard",
    titleAr: "لوحة التحكم",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard
  },
  {
    title: "Employee Self-Service",
    titleAr: "الخدمة الذاتية للموظفين",
    url: createPageUrl("ESS"),
    icon: User
  },
  {
    title: "Manager Self-Service",
    titleAr: "الخدمة الذاتية للمديرين",
    url: createPageUrl("MSS"),
    icon: UserCog
  },
  {
    title: "Companies",
    titleAr: "الشركات",
    url: createPageUrl("Companies"),
    icon: Building2
  },
  {
    title: "Personal Administration",
    titleAr: "الإدارة الشخصية",
    url: createPageUrl("PersonalAdministration"),
    icon: Users
  },
  {
    title: "Onboarding",
    titleAr: "الإعداد والتوظيف",
    url: createPageUrl("Onboarding"),
    icon: UserCog
  },
  {
    title: "Time Management",
    titleAr: "إدارة الوقت",
    url: createPageUrl("TimeManagement"),
    icon: Clock
  },
  {
    title: "Payroll & Compensation",
    titleAr: "الرواتب والتعويضات",
    url: createPageUrl("PayrollCompensation"),
    icon: DollarSign
  },
  {
    title: "Benefits & Rewards",
    titleAr: "المزايا والمكافآت",
    url: createPageUrl("BenefitsRewards"),
    icon: Gift
  },
  {
    title: "Performance",
    titleAr: "إدارة الأداء",
    url: createPageUrl("Performance"),
    icon: TrendingUp
  },
  {
    title: "Travel & Expense",
    titleAr: "السفر والمصروفات",
    url: createPageUrl("TravelExpense"),
    icon: Globe
  },
  {
    title: "Employee Relations",
    titleAr: "العلاقات الوظيفية",
    url: createPageUrl("EmployeeRelations"),
    icon: Scale
  },
  {
    title: "Assets & Facilities",
    titleAr: "الأصول والمرافق",
    url: createPageUrl("AssetsFacilities"),
    icon: Package
  },
  {
    title: "Health & Safety",
    titleAr: "الصحة والسلامة",
    url: createPageUrl("HealthSafety"),
    icon: HeartPulse
  },
  {
    title: "Documents",
    titleAr: "المستندات",
    url: createPageUrl("Documents"),
    icon: FileText
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isRTL, setIsRTL] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (isRTL) {
      document.documentElement.setAttribute('dir', 'rtl');
      document.body.style.fontFamily = "'Cairo', 'Tajawal', sans-serif";
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.body.style.fontFamily = "";
    }
  }, [isRTL]);

  const toggleLanguage = () => {
    setIsRTL(!isRTL);
  };

  return (
    <SidebarProvider>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Tajawal:wght@400;500;700&display=swap');

        :root {
          --primary: 0 75% 35%;
          --primary-foreground: 0 0% 100%;
          --accent: 0 75% 35%;
          --destructive: 0 75% 35%;
        }

        [dir="rtl"] * {
          font-family: 'Cairo', 'Tajawal', sans-serif !important;
        }

        [dir="rtl"] .sidebar-flip {
          transform: scaleX(-1);
        }

        /* Override all green colors to red #B11116 */
        .bg-green-50 { background-color: #fef2f2 !important; }
        .bg-green-100 { background-color: #fee2e2 !important; }
        .bg-green-600 { background-color: #B11116 !important; }
        .bg-green-700 { background-color: #991014 !important; }
        .bg-green-800 { background-color: #7f0d11 !important; }

        .text-green-600 { color: #B11116 !important; }
        .text-green-700 { color: #991014 !important; }
        .text-green-800 { color: #7f0d11 !important; }

        .border-green-200 { border-color: #fecaca !important; }
        .border-green-300 { border-color: #fca5a5 !important; }
        .border-green-600 { border-color: #B11116 !important; }
        .border-green-700 { border-color: #991014 !important; }

        .from-green-50 { --tw-gradient-from: #fef2f2 !important; }
        .from-green-100 { --tw-gradient-from: #fee2e2 !important; }
        .from-green-600 { --tw-gradient-from: #B11116 !important; }
        .from-green-700 { --tw-gradient-from: #991014 !important; }

        .to-green-100 { --tw-gradient-to: #fee2e2 !important; }
        .to-green-200 { --tw-gradient-to: #fecaca !important; }
        .to-green-700 { --tw-gradient-to: #991014 !important; }
        .to-green-800 { --tw-gradient-to: #7f0d11 !important; }

        .hover\\:bg-green-50:hover { background-color: #fef2f2 !important; }
        .hover\\:bg-green-700:hover { background-color: #991014 !important; }
        .hover\\:bg-green-800:hover { background-color: #7f0d11 !important; }

        .hover\\:from-green-700:hover { --tw-gradient-from: #991014 !important; }
        .hover\\:to-green-800:hover { --tw-gradient-to: #7f0d11 !important; }

        .hover\\:text-green-600:hover { color: #B11116 !important; }

        /* Update indigo colors to red as well */
        .bg-indigo-600 { background-color: #B11116 !important; }
        .bg-indigo-700 { background-color: #991014 !important; }
        .hover\\:bg-indigo-700:hover { background-color: #991014 !important; }
        .hover\\:bg-indigo-800:hover { background-color: #7f0d11 !important; }
        .from-indigo-600 { --tw-gradient-from: #B11116 !important; }
        .to-indigo-700 { --tw-gradient-to: #991014 !important; }

        /* Tab colors override */
        button[data-state="active"] {
          background: linear-gradient(to right, #B11116, #991014) !important;
          color: white !important;
        }

        button[data-state="active"]:hover {
          background: linear-gradient(to right, #991014, #7f0d11) !important;
        }

        /* Specific tab trigger styles */
        [role="tab"][data-state="active"] {
          background: linear-gradient(to right, #B11116, #991014) !important;
          color: white !important;
          border-color: transparent !important;
        }

        [role="tab"][data-state="active"]:hover {
          background: linear-gradient(to right, #991014, #7f0d11) !important;
        }

        /* Tab list styles */
        .bg-white [role="tab"][data-state="active"] {
          background: linear-gradient(to right, #B11116, #991014) !important;
          color: white !important;
          border-color: transparent !important;
        }

        /* Override any remaining green in tabs */
        [role="tablist"] button[data-state="active"] {
          background: linear-gradient(to right, #B11116, #991014) !important;
          color: white !important;
        }

        [role="tablist"] button[data-state="active"] svg {
          color: white !important;
        }

        /* Ensure tab text and icons are white when active */
        button[data-state="active"] span,
        button[data-state="active"] svg {
          color: white !important;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
        <Sidebar className={`border-gray-200 bg-white ${isRTL ? 'border-l' : 'border-r'}`}>
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <h2 className="font-bold text-xl text-gray-900">
                    {isRTL ? 'ماتريكس إتش آر' : 'MatrixHRMS'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'نظام إدارة الموارد البشرية' : 'HR Management System'}
                  </p>
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md hover:shadow-lg'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <Link to={item.url} className={`flex items-center gap-3 px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'} ${isRTL ? 'sidebar-flip' : ''}`} />
                            <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                              {isRTL ? item.titleAr : item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4 space-y-3">
            <Button
              variant="outline"
              onClick={toggleLanguage}
              className={`w-full flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Globe className="w-4 h-4" />
              <span>{isRTL ? 'English' : 'العربية'}</span>
            </Button>

            {user && (
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-semibold text-sm">
                      {user.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : ''}`}>
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => base44.auth.logout()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className={`w-4 h-4 text-gray-600 ${isRTL ? 'sidebar-flip' : ''}`} />
                </button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors md:hidden" />
              <h1 className="text-xl font-bold text-gray-900 flex-1">
                {isRTL ? 'ماتريكس إتش آر' : 'MatrixHRMS'}
              </h1>
              {user && <NotificationBell user={user} />}
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

