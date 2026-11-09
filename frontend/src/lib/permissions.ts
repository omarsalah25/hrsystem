'use client';

import { useEffect, useState } from 'react';

export type RoleType =
  | 'SUPER_ADMIN'
  | 'HR_MANAGER'
  | 'PAYROLL_OFFICER'
  | 'AUDITOR'
  | 'DEPARTMENT_MANAGER'
  | 'LINE_MANAGER'
  | 'EMPLOYEE';

export type PermissionKey =
  // Platform & System
  | 'view_platform_admin'
  | 'manage_companies'
  | 'manage_branches'
  | 'manage_settings'
  | 'view_audit_logs'
  // Dashboard & Analytics
  | 'view_executive_dashboard'
  | 'view_reports'
  | 'view_payroll_simulator'
  // Employees
  | 'view_employees_directory'
  | 'create_employee'
  | 'edit_employee'
  | 'terminate_employee'
  | 'view_all_salaries'
  // Attendance & Shifts
  | 'view_company_attendance'
  | 'reconcile_attendance'
  | 'manage_shifts'
  // Leaves
  | 'approve_leaves'
  | 'request_leave'
  // Payroll & Offboarding
  | 'view_payroll_workbench'
  | 'run_payroll'
  | 'approve_payroll'
  | 'export_wps'
  | 'view_offboarding'
  | 'initiate_offboarding'
  // Talent & Culture
  | 'view_recruitment'
  | 'manage_recruitment'
  | 'manage_okr_goals'
  | 'view_9box_matrix'
  | 'manage_courses'
  | 'manage_assets'
  | 'view_all_grievances'
  | 'manage_grievances';

export const ROLE_LABELS: Record<RoleType, { ar: string; en: string; badgeClass: string }> = {
  SUPER_ADMIN: {
    ar: 'مدير النظام التنفيذي (مالك المنظومة)',
    en: 'Platform Super Admin',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  HR_MANAGER: {
    ar: 'مدير الموارد البشرية',
    en: 'HR Director',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  PAYROLL_OFFICER: {
    ar: 'مسؤول الرواتب والعمليات المالية',
    en: 'Payroll Officer',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  AUDITOR: {
    ar: 'مراقب الامتثال والتدقيق الداخلي',
    en: 'Compliance & Internal Auditor',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  DEPARTMENT_MANAGER: {
    ar: 'مدير قسم',
    en: 'Department Manager',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  LINE_MANAGER: {
    ar: 'مدير مباشر',
    en: 'Line Manager',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  EMPLOYEE: {
    ar: 'موظف (الخدمة الذاتية)',
    en: 'Employee (Self-Service)',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

/**
 * Allowed route prefixes per role.
 * Any route not matching the role's allowed list will be hidden from navigation and blocked by DashboardLayout.
 */
export const ROLE_ALLOWED_ROUTES: Record<RoleType, string[]> = {
  SUPER_ADMIN: [
    '/admin',
    '/',
    '/self-service',
    '/employees',
    '/org-chart',
    '/attendance',
    '/shifts',
    '/leaves',
    '/payroll',
    '/recruitment',
    '/performance',
    '/learning',
    '/assets',
    '/company',
    '/employee-relations',
    '/reports',
    '/offboarding',
    '/audit',
    '/settings',
  ],
  HR_MANAGER: [
    '/',
    '/self-service',
    '/employees',
    '/org-chart',
    '/attendance',
    '/shifts',
    '/leaves',
    '/payroll',
    '/recruitment',
    '/performance',
    '/learning',
    '/assets',
    '/company',
    '/employee-relations',
    '/reports',
    '/offboarding',
    '/settings',
  ],
  PAYROLL_OFFICER: [
    '/',
    '/self-service',
    '/employees',
    '/attendance',
    '/leaves',
    '/payroll',
    '/offboarding',
    '/reports',
  ],
  AUDITOR: [
    '/',
    '/employees',
    '/attendance',
    '/payroll',
    '/company',
    '/reports',
    '/audit',
  ],
  DEPARTMENT_MANAGER: [
    '/',
    '/self-service',
    '/employees',
    '/org-chart',
    '/attendance',
    '/shifts',
    '/leaves',
    '/recruitment',
    '/performance',
    '/learning',
  ],
  LINE_MANAGER: [
    '/',
    '/self-service',
    '/org-chart',
    '/attendance',
    '/leaves',
    '/performance',
    '/learning',
  ],
  EMPLOYEE: [
    '/self-service',
    '/leaves',
    '/learning',
    '/performance',
    '/employee-relations',
    '/org-chart',
  ],
};

export const ROLE_PERMISSIONS: Record<RoleType, PermissionKey[]> = {
  SUPER_ADMIN: [
    'view_platform_admin',
    'manage_companies',
    'manage_branches',
    'manage_settings',
    'view_audit_logs',
    'view_executive_dashboard',
    'view_reports',
    'view_payroll_simulator',
    'view_employees_directory',
    'create_employee',
    'edit_employee',
    'terminate_employee',
    'view_all_salaries',
    'view_company_attendance',
    'reconcile_attendance',
    'manage_shifts',
    'approve_leaves',
    'request_leave',
    'view_payroll_workbench',
    'run_payroll',
    'approve_payroll',
    'export_wps',
    'view_offboarding',
    'initiate_offboarding',
    'view_recruitment',
    'manage_recruitment',
    'manage_okr_goals',
    'view_9box_matrix',
    'manage_courses',
    'manage_assets',
    'view_all_grievances',
    'manage_grievances',
  ],
  HR_MANAGER: [
    'manage_branches',
    'manage_settings',
    'view_executive_dashboard',
    'view_reports',
    'view_payroll_simulator',
    'view_employees_directory',
    'create_employee',
    'edit_employee',
    'terminate_employee',
    'view_all_salaries',
    'view_company_attendance',
    'reconcile_attendance',
    'manage_shifts',
    'approve_leaves',
    'request_leave',
    'view_payroll_workbench',
    'run_payroll',
    'view_offboarding',
    'initiate_offboarding',
    'view_recruitment',
    'manage_recruitment',
    'manage_okr_goals',
    'view_9box_matrix',
    'manage_courses',
    'manage_assets',
    'view_all_grievances',
    'manage_grievances',
  ],
  PAYROLL_OFFICER: [
    'view_executive_dashboard',
    'view_reports',
    'view_payroll_simulator',
    'view_employees_directory',
    'view_all_salaries',
    'view_company_attendance',
    'request_leave',
    'view_payroll_workbench',
    'run_payroll',
    'approve_payroll',
    'export_wps',
    'view_offboarding',
  ],
  AUDITOR: [
    'view_audit_logs',
    'view_executive_dashboard',
    'view_reports',
    'view_employees_directory',
    'view_all_salaries',
    'view_company_attendance',
    'view_payroll_workbench',
  ],
  DEPARTMENT_MANAGER: [
    'view_executive_dashboard',
    'view_employees_directory',
    'view_company_attendance',
    'manage_shifts',
    'approve_leaves',
    'request_leave',
    'view_recruitment',
    'manage_okr_goals',
    'view_9box_matrix',
  ],
  LINE_MANAGER: [
    'view_executive_dashboard',
    'view_company_attendance',
    'approve_leaves',
    'request_leave',
    'manage_okr_goals',
  ],
  EMPLOYEE: [
    'request_leave',
  ],
};

export function getHomeRouteForRole(role: RoleType): string {
  if (role === 'SUPER_ADMIN') return '/admin';
  if (role === 'EMPLOYEE') return '/self-service';
  return '/';
}

export function canRoleAccessRoute(role: RoleType, pathname: string): boolean {
  if (pathname === '/login' || pathname === '/admin/login') return true;
  const allowed = ROLE_ALLOWED_ROUTES[role] || ROLE_ALLOWED_ROUTES.EMPLOYEE;

  return allowed.some((prefix) => {
    if (prefix === '/') {
      return pathname === '/';
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export function roleHasPermission(role: RoleType, permission: PermissionKey): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

export function getStoredUserRole(): { name: string; role: RoleType; email?: string } {
  if (typeof window === 'undefined') {
    return { name: 'مدير النظام التنفيذي', role: 'SUPER_ADMIN' };
  }
  try {
    const raw = localStorage.getItem('hr_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      const role = (parsed?.role as RoleType) || 'EMPLOYEE';
      const validRole: RoleType = ROLE_ALLOWED_ROUTES[role] ? role : 'EMPLOYEE';
      return {
        name: parsed?.name || 'مستخدم النظام',
        role: validRole,
        email: parsed?.email,
      };
    }
  } catch {}
  return { name: 'مدير النظام التنفيذي', role: 'SUPER_ADMIN' };
}

export function usePermissions() {
  const [userState, setUserState] = useState<{ name: string; role: RoleType; email?: string }>({
    name: 'مدير النظام التنفيذي',
    role: 'SUPER_ADMIN',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUserState(getStoredUserRole());
      setMounted(true);
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const role = userState.role;

  return {
    mounted,
    user: userState,
    role,
    roleInfo: ROLE_LABELS[role] || ROLE_LABELS.EMPLOYEE,
    homeRoute: getHomeRouteForRole(role),
    canAccessRoute: (pathname: string) => canRoleAccessRoute(role, pathname),
    can: (permission: PermissionKey) => roleHasPermission(role, permission),
  };
}

