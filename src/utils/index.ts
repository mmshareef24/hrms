


export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_ADMIN: 'HR_ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  MANAGE_EMPLOYEES: 'MANAGE_EMPLOYEES',
  APPROVE_TIME: 'APPROVE_TIME',
  MANAGE_PAYROLL: 'MANAGE_PAYROLL',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.APPROVE_TIME,
    PERMISSIONS.MANAGE_PAYROLL,
  ],
  [ROLES.HR_ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_EMPLOYEES,
    PERMISSIONS.APPROVE_TIME,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.APPROVE_TIME,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_DASHBOARD,
  ],
};

export function getRoleDisplayName(role: Role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return 'Super Admin';
    case ROLES.HR_ADMIN:
      return 'HR Admin';
    case ROLES.MANAGER:
      return 'Manager';
    case ROLES.EMPLOYEE:
      return 'Employee';
    default:
      return String(role);
  }
}

export function getUserRole(): Role {
  // Simple placeholder: could be sourced from auth/user context later
  return ROLES.MANAGER;
}

export function hasPermission(permission: Permission, role: Role = getUserRole()) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function filterDataByRole<T = any>(data: T[], role: Role = getUserRole()): T[] {
  // Placeholder: return data unchanged; plug real filtering rules per role later
  return Array.isArray(data) ? data : [];
}

export function canApproveRequest(role: Role = getUserRole()) {
  return role === ROLES.MANAGER || role === ROLES.HR_ADMIN || role === ROLES.SUPER_ADMIN;
}

export function canEditEmployee(role: Role = getUserRole()) {
  return role === ROLES.HR_ADMIN || role === ROLES.SUPER_ADMIN;
}

export function formatCurrency(amount: number | undefined, currency = 'SAR') {
  if (amount == null) return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return String(amount);
  }
}

export function sendNotification(payload: { title: string; message: string; to?: string }) {
  // Placeholder: integrate with actual notification service later
  console.log('Notification:', payload);
  return true;
}

export function createPageUrl(pageName: string) {
  return '/' + pageName.toLowerCase().replace(/ /g, '-');
}