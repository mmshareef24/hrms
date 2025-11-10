import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

/**
 * ProtectedRoute Component
 * Wraps content that requires specific permissions
 */
export default function ProtectedRoute({ 
  children, 
  hasAccess = true, 
  fallbackMessage,
  fallbackComponent 
}) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  if (!hasAccess) {
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            {fallbackMessage || (isRTL 
              ? 'عذراً، ليس لديك صلاحية الوصول إلى هذا القسم.'
              : 'Sorry, you don\'t have permission to access this section.'
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return <>{children}</>;
}