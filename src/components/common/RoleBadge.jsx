import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, User } from "lucide-react";
import { ROLES, getRoleDisplayName } from "@/utils";

/**
 * RoleBadge Component
 * Displays a user's role with appropriate styling
 */
export default function RoleBadge({ role, showIcon = true, size = "default" }) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  
  const getRoleStyle = () => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800 border-purple-300";
      case ROLES.HR_ADMIN:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case ROLES.MANAGER:
        return "bg-green-100 text-green-800 border-green-300";
      case ROLES.EMPLOYEE:
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  
  const getRoleIcon = () => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
      case ROLES.HR_ADMIN:
        return <Shield className="w-3 h-3" />;
      case ROLES.MANAGER:
        return <Users className="w-3 h-3" />;
      case ROLES.EMPLOYEE:
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };
  
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "";
  
  return (
    <Badge 
      variant="outline" 
      className={`${getRoleStyle()} ${sizeClass} ${isRTL ? 'flex-row-reverse' : ''}`}
    >
      {showIcon && (
        <span className={isRTL ? 'ml-1' : 'mr-1'}>
          {getRoleIcon()}
        </span>
      )}
      {getRoleDisplayName(role, isRTL)}
    </Badge>
  );
}