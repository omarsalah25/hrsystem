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

export interface PermissionDefinition {
  key: PermissionKey;
  labelAr: string;
  labelEn: string;
  categoryAr: string;
  categoryEn: string;
  unlocksRoutes?: string[];
}

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  // 1. Platform & Governance
  {
    key: 'view_platform_admin',
    labelAr: 'دخول لوحة مالك المنظومة القابضة (/admin)',
    labelEn: 'Access Platform Owner Cockpit (/admin)',
    categoryAr: 'إدارة المنظومة والحوكمة',
    categoryEn: 'Platform & Governance',
    unlocksRoutes: ['/admin'],
  },
  {
    key: 'manage_companies',
    labelAr: 'إضافة وتعديل الكيانات القانونية والشركات',
    labelEn: 'Create & Edit Legal Entities',
    categoryAr: 'إدارة المنظومة والحوكمة',
    categoryEn: 'Platform & Governance',
    unlocksRoutes: ['/company'],
  },
  {
    key: 'manage_branches',
    labelAr: 'إدارة الفروع والنطاق الجغرافي (Geofence)',
    labelEn: 'Manage Branches & GPS Geofences',
    categoryAr: 'إدارة المنظومة والحوكمة',
    categoryEn: 'Platform & Governance',
    unlocksRoutes: ['/company'],
  },
  {
    key: 'manage_settings',
    labelAr: 'إدارة إعدادات النظام وأجهزة البصمة والصلاحيات',
    labelEn: 'Manage System Settings, RBAC & ADMS Devices',
    categoryAr: 'إدارة المنظومة والحوكمة',
    categoryEn: 'Platform & Governance',
    unlocksRoutes: ['/settings'],
  },
  {
    key: 'view_audit_logs',
    labelAr: 'استعراض وفحص سجل التدقيق المشفر (SHA-256)',
    labelEn: 'View & Verify SHA-256 Cryptographic Audit Ledger',
    categoryAr: 'إدارة المنظومة والحوكمة',
    categoryEn: 'Platform & Governance',
    unlocksRoutes: ['/audit'],
  },

  // 2. Executive Dashboard & Reports
  {
    key: 'view_executive_dashboard',
    labelAr: 'عرض لوحة القيادة التنفيذية للشركة (/)',
    labelEn: 'View Company Executive Dashboard (/)',
    categoryAr: 'التقارير ومؤشرات القيادة',
    categoryEn: 'Dashboards & Analytics',
    unlocksRoutes: ['/'],
  },
  {
    key: 'view_reports',
    labelAr: 'عرض وتصدير تقارير نطاقات ومصر 12 ودرجة برادفورد',
    labelEn: 'View & Export Nitaqat, Law 12 & Bradford Reports',
    categoryAr: 'التقارير ومؤشرات القيادة',
    categoryEn: 'Dashboards & Analytics',
    unlocksRoutes: ['/reports'],
  },
  {
    key: 'view_payroll_simulator',
    labelAr: 'استخدام حاسبة محاكاة الرواتب والتأمينات',
    labelEn: 'Use Regional Payroll & GOSI Simulator',
    categoryAr: 'التقارير ومؤشرات القيادة',
    categoryEn: 'Dashboards & Analytics',
  },

  // 3. Employees & Dossier 360
  {
    key: 'view_employees_directory',
    labelAr: 'استعراض سجل الموظفين الشامل (/employees)',
    labelEn: 'View Full Employees Directory (/employees)',
    categoryAr: 'شؤون الموظفين والملفات',
    categoryEn: 'Employees & Dossiers',
    unlocksRoutes: ['/employees'],
  },
  {
    key: 'create_employee',
    labelAr: 'إضافة وتعيين موظف جديد (/employees/new)',
    labelEn: 'Onboard & Create New Employee',
    categoryAr: 'شؤون الموظفين والملفات',
    categoryEn: 'Employees & Dossiers',
    unlocksRoutes: ['/employees', '/employees/new'],
  },
  {
    key: 'edit_employee',
    labelAr: 'تعديل الملفات الوظيفية الشاملة 360°',
    labelEn: 'Edit Employee 360° Dossier',
    categoryAr: 'شؤون الموظفين والملفات',
    categoryEn: 'Employees & Dossiers',
    unlocksRoutes: ['/employees'],
  },
  {
    key: 'terminate_employee',
    labelAr: 'إيقاف أو إنهاء خدمة موظف',
    labelEn: 'Deactivate or Terminate Employee',
    categoryAr: 'شؤون الموظفين والملفات',
    categoryEn: 'Employees & Dossiers',
  },
  {
    key: 'view_all_salaries',
    labelAr: 'الاطلاع على الرواتب والبدلات السرية للموظفين',
    labelEn: 'View Confidential Employee Salaries',
    categoryAr: 'شؤون الموظفين والملفات',
    categoryEn: 'Employees & Dossiers',
  },

  // 4. Attendance, Shifts & Leaves
  {
    key: 'view_company_attendance',
    labelAr: 'مراقبة سجلات الحضور والبصمة للشركة (/attendance)',
    labelEn: 'Monitor Company-Wide Attendance Logs',
    categoryAr: 'الحضور والورديات والإجازات',
    categoryEn: 'Attendance, Shifts & Leaves',
    unlocksRoutes: ['/attendance'],
  },
  {
    key: 'reconcile_attendance',
    labelAr: 'تسوية ومعالجة حركات البصمة (First-In / Last-Out)',
    labelEn: 'Reconcile Biometric Attendance Punches',
    categoryAr: 'الحضور والورديات والإجازات',
    categoryEn: 'Attendance, Shifts & Leaves',
    unlocksRoutes: ['/attendance'],
  },
  {
    key: 'manage_shifts',
    labelAr: 'إدارة الورديات ومواعيد شهر رمضان (/shifts)',
    labelEn: 'Manage Shifts & Ramadan Schedules (/shifts)',
    categoryAr: 'الحضور والورديات والإجازات',
    categoryEn: 'Attendance, Shifts & Leaves',
    unlocksRoutes: ['/shifts'],
  },
  {
    key: 'approve_leaves',
    labelAr: 'اعتماد ورفض طلبات إجازات الموظفين',
    labelEn: 'Approve & Reject Leave Requests',
    categoryAr: 'الحضور والورديات والإجازات',
    categoryEn: 'Attendance, Shifts & Leaves',
    unlocksRoutes: ['/leaves'],
  },
  {
    key: 'request_leave',
    labelAr: 'تقديم طلب إجازة شخصية',
    labelEn: 'Submit Personal Leave Request',
    categoryAr: 'الحضور والورديات والإجازات',
    categoryEn: 'Attendance, Shifts & Leaves',
    unlocksRoutes: ['/leaves', '/leaves/apply'],
  },

  // 5. Payroll & Offboarding
  {
    key: 'view_payroll_workbench',
    labelAr: 'استعراض مسير الرواتب وقسائم الدفع (/payroll)',
    labelEn: 'View Payroll Workbench & Payslips (/payroll)',
    categoryAr: 'الرواتب ومكافأة نهاية الخدمة',
    categoryEn: 'Payroll & Offboarding',
    unlocksRoutes: ['/payroll'],
  },
  {
    key: 'run_payroll',
    labelAr: 'تشغيل واحتساب مسير الرواتب الشهري وتعديله',
    labelEn: 'Run Monthly Payroll & Adjust Payslips',
    categoryAr: 'الرواتب ومكافأة نهاية الخدمة',
    categoryEn: 'Payroll & Offboarding',
    unlocksRoutes: ['/payroll'],
  },
  {
    key: 'approve_payroll',
    labelAr: 'اعتماد وصرف مسير الرواتب النهائي',
    labelEn: 'Final Payroll Approval & Disbursement',
    categoryAr: 'الرواتب ومكافأة نهاية الخدمة',
    categoryEn: 'Payroll & Offboarding',
    unlocksRoutes: ['/payroll'],
  },
  {
    key: 'export_wps',
    labelAr: 'تصدير ملفات حماية الأجور البنكية (Mudad WPS SIF)',
    labelEn: 'Export Bank WPS SIF Files',
    categoryAr: 'الرواتب ومكافأة نهاية الخدمة',
    categoryEn: 'Payroll & Offboarding',
    unlocksRoutes: ['/payroll'],
  },
  {
    key: 'view_offboarding',
    labelAr: 'حاسبة نهاية الخدمة (المادة 84/85) وإخلاء الطرف (/offboarding)',
    labelEn: 'Access Offboarding & ESB Calculator (/offboarding)',
    categoryAr: 'الرواتب ومكافأة نهاية الخدمة',
    categoryEn: 'Payroll & Offboarding',
    unlocksRoutes: ['/offboarding'],
  },
  {
    key: 'initiate_offboarding',
    labelAr: 'اعتماد التصفية النهائية (FNF Settlement)',
    labelEn: 'Initiate & Finalize FNF Settlement',
    categoryAr: 'الرواتب ومكافأة نهاية الخدمة',
    categoryEn: 'Payroll & Offboarding',
    unlocksRoutes: ['/offboarding'],
  },

  // 6. Talent, Assets & Relations
  {
    key: 'view_recruitment',
    labelAr: 'استعراض نظام التوظيف والمرشحين (/recruitment)',
    labelEn: 'View Recruitment ATS Pipeline (/recruitment)',
    categoryAr: 'تطوير المواهب والعهد وعلاقات العمل',
    categoryEn: 'Talent, Assets & Relations',
    unlocksRoutes: ['/recruitment'],
  },
  {
    key: 'manage_recruitment',
    labelAr: 'نشر الوظائف وتحريك مراحل المرشحين في ATS',
    labelEn: 'Post Jobs & Advance Candidates in ATS',
    categoryAr: 'تطوير المواهب والعهد وعلاقات العمل',
    categoryEn: 'Talent, Assets & Relations',
    unlocksRoutes: ['/recruitment'],
  },
  {
    key: 'manage_okr_goals',
    labelAr: 'إنشاء وتعديل الأهداف الاستراتيجية (OKRs)',
    labelEn: 'Create & Manage OKR Goals',
    categoryAr: 'تطوير المواهب والعهد وعلاقات العمل',
    categoryEn: 'Talent, Assets & Relations',
    unlocksRoutes: ['/performance'],
  },
  {
    key: 'view_9box_matrix',
    labelAr: 'استعراض مصفوفة الكفاءات والقيادات (9-Box Grid)',
    labelEn: 'View 9-Box Talent Calibration Matrix',
    categoryAr: 'تطوير المواهب والعهد وعلاقات العمل',
    categoryEn: 'Talent, Assets & Relations',
    unlocksRoutes: ['/performance'],
  },
  {
    key: 'manage_courses',
    labelAr: 'إضافة الدورات التدريبية وإصدار الشهادات (/learning)',
    labelEn: 'Add Training Courses & Issue Certificates',
    categoryAr: 'تطوير المواهب والعهد وعلاقات العمل',
    categoryEn: 'Talent, Assets & Relations',
    unlocksRoutes: ['/learning'],
  },
  {
    key: 'manage_assets',
    labelAr: 'إدارة العهد والأصول وتسليمها للموظفين (/assets)',
    labelEn: 'Manage Hardware Custody & Assets (/assets)',
    categoryAr: 'تطوير المواهب والعهد وعلاقات العمل',
    categoryEn: 'Talent, Assets & Relations',
    unlocksRoutes: ['/assets'],
  },
  {
    key: 'view_all_grievances',
    labelAr: 'الاطلاع على سجل الشكاوى والتحقيقات السرية للشركة',
    labelEn: 'View All Confidential Company Grievances',
    categoryAr: 'تطوير المواهب والعهد وعلاقات العمل',
    categoryEn: 'Talent, Assets & Relations',
    unlocksRoutes: ['/employee-relations'],
  },
  {
    key: 'manage_grievances',
    labelAr: 'إدارة ملفات التحقيق والبت في الشكاوى العمالية',
    labelEn: 'Investigate & Resolve Grievance Cases',
    categoryAr: 'تطوير المواهب والعهد وعلاقات العمل',
    categoryEn: 'Talent, Assets & Relations',
    unlocksRoutes: ['/employee-relations'],
  },
];

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
  SUPER_ADMIN: PERMISSION_CATALOG.map((p) => p.key),
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

/**
 * Merges a role's default permissions with any dynamic custom permissions assigned to the user.
 */
export function getEffectivePermissions(
  role: RoleType,
  customPermissions: string[] = []
): PermissionKey[] {
  const defaults = ROLE_PERMISSIONS[role] || [];
  const merged = new Set<PermissionKey>(defaults);
  for (const perm of customPermissions) {
    if (perm.startsWith('-')) {
      merged.delete(perm.slice(1) as PermissionKey);
    } else {
      merged.add(perm as PermissionKey);
    }
  }
  return Array.from(merged);
}

/**
 * Computes all routes accessible to a user by combining their role's default routes
 * with any routes unlocked by their dynamic custom permissions.
 */
export function canRoleAccessRoute(
  role: RoleType,
  pathname: string,
  customPermissions: string[] = []
): boolean {
  if (pathname === '/login' || pathname === '/admin/login') return true;
  const baseRoutes = new Set<string>(ROLE_ALLOWED_ROUTES[role] || ROLE_ALLOWED_ROUTES.EMPLOYEE);

  const effectivePerms = getEffectivePermissions(role, customPermissions);
  for (const def of PERMISSION_CATALOG) {
    if (effectivePerms.includes(def.key) && def.unlocksRoutes) {
      for (const r of def.unlocksRoutes) {
        baseRoutes.add(r);
      }
    }
  }

  return Array.from(baseRoutes).some((prefix) => {
    if (prefix === '/') {
      return pathname === '/';
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

export function roleHasPermission(
  role: RoleType,
  permission: PermissionKey,
  customPermissions: string[] = []
): boolean {
  const effective = getEffectivePermissions(role, customPermissions);
  return effective.includes(permission);
}

export interface StoredUserWithPermissions {
  id?: string | number;
  name: string;
  role: RoleType;
  email?: string;
  custom_permissions: string[];
}

export function getStoredUserRole(): StoredUserWithPermissions {
  if (typeof window === 'undefined') {
    return { name: 'مدير النظام التنفيذي', role: 'SUPER_ADMIN', custom_permissions: [] };
  }
  try {
    const raw = localStorage.getItem('hr_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      const role = (parsed?.role as RoleType) || 'EMPLOYEE';
      const validRole: RoleType = ROLE_ALLOWED_ROUTES[role] ? role : 'EMPLOYEE';
      const customPerms = Array.isArray(parsed?.custom_permissions)
        ? parsed.custom_permissions
        : [];
      return {
        id: parsed?.id,
        name: parsed?.name || 'مستخدم النظام',
        role: validRole,
        email: parsed?.email,
        custom_permissions: customPerms,
      };
    }
  } catch {}
  return { name: 'مدير النظام التنفيذي', role: 'SUPER_ADMIN', custom_permissions: [] };
}

export function usePermissions() {
  const [userState, setUserState] = useState<StoredUserWithPermissions>({
    name: 'مدير النظام التنفيذي',
    role: 'SUPER_ADMIN',
    custom_permissions: [],
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUserState(getStoredUserRole());
      setMounted(true);
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('hr-permissions-updated', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('hr-permissions-updated', syncUser);
    };
  }, []);

  const role = userState.role;
  const customPermissions = userState.custom_permissions || [];

  return {
    mounted,
    user: userState,
    role,
    customPermissions,
    effectivePermissions: getEffectivePermissions(role, customPermissions),
    roleInfo: ROLE_LABELS[role] || ROLE_LABELS.EMPLOYEE,
    homeRoute: getHomeRouteForRole(role),
    canAccessRoute: (pathname: string) => canRoleAccessRoute(role, pathname, customPermissions),
    can: (permission: PermissionKey) => roleHasPermission(role, permission, customPermissions),
  };
}
