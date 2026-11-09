'use client';

import React, { useMemo } from 'react';
import { Card, Select, Switch, Tag, Button, Badge, Alert } from 'antd';
import {
  PERMISSION_CATALOG,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  RoleType,
  PermissionKey,
  getEffectivePermissions,
} from '@/lib/permissions';
import { Shield, Sparkles, RotateCcw, CheckCircle2, Lock, Unlock } from 'lucide-react';

interface RolePermissionsPickerProps {
  role: RoleType;
  onRoleChange: (newRole: RoleType) => void;
  customPermissions: string[];
  onCustomPermissionsChange: (newCustomPermissions: string[]) => void;
  isAr?: boolean;
  compact?: boolean;
}

const ALL_ROLES: RoleType[] = [
  'EMPLOYEE',
  'LINE_MANAGER',
  'DEPARTMENT_MANAGER',
  'HR_MANAGER',
  'PAYROLL_OFFICER',
  'AUDITOR',
  'SUPER_ADMIN',
];

export function RolePermissionsPicker({
  role,
  onRoleChange,
  customPermissions,
  onCustomPermissionsChange,
  isAr = true,
  compact = false,
}: RolePermissionsPickerProps) {
  const roleDefaults = useMemo(() => new Set<PermissionKey>(ROLE_PERMISSIONS[role] || []), [role]);
  const effectivePermissions = useMemo(
    () => new Set<PermissionKey>(getEffectivePermissions(role, customPermissions)),
    [role, customPermissions]
  );

  // Group catalog by category
  const groupedPermissions = useMemo(() => {
    const groups: Record<
      string,
      {
        categoryAr: string;
        categoryEn: string;
        items: typeof PERMISSION_CATALOG;
      }
    > = {};
    for (const item of PERMISSION_CATALOG) {
      if (!groups[item.categoryEn]) {
        groups[item.categoryEn] = {
          categoryAr: item.categoryAr,
          categoryEn: item.categoryEn,
          items: [],
        };
      }
      groups[item.categoryEn].items.push(item);
    }
    return Object.values(groups);
  }, []);

  const addedCustomCount = customPermissions.filter((p) => !p.startsWith('-')).length;
  const revokedCustomCount = customPermissions.filter((p) => p.startsWith('-')).length;

  const handleTogglePermission = (permKey: PermissionKey, checked: boolean) => {
    const isDefault = roleDefaults.has(permKey);
    const cleaned = customPermissions.filter((p) => p !== permKey && p !== `-${permKey}`);

    if (isDefault) {
      if (!checked) {
        // Revoke a default permission for this specific user
        onCustomPermissionsChange([...cleaned, `-${permKey}`]);
      } else {
        // Restore default permission
        onCustomPermissionsChange(cleaned);
      }
    } else {
      if (checked) {
        // Grant additional custom permission on top of role defaults
        onCustomPermissionsChange([...cleaned, permKey]);
      } else {
        // Remove custom permission
        onCustomPermissionsChange(cleaned);
      }
    }
  };

  const handleSelectRole = (nextRole: RoleType) => {
    onRoleChange(nextRole);
    // Keep only non-redundant custom permissions or reset cleanly so defaults of the new role show clearly
    const nextDefaults = new Set<PermissionKey>(ROLE_PERMISSIONS[nextRole] || []);
    const filteredCustom = customPermissions.filter((p) => {
      if (p.startsWith('-')) return nextDefaults.has(p.slice(1) as PermissionKey);
      return !nextDefaults.has(p as PermissionKey);
    });
    onCustomPermissionsChange(filteredCustom);
  };

  const handleGrantAllAdditional = () => {
    const extras = PERMISSION_CATALOG.map((p) => p.key).filter((k) => !roleDefaults.has(k));
    onCustomPermissionsChange(extras);
  };

  return (
    <div className="space-y-4" data-testid="role-permissions-picker">
      {/* Top Role Selection Card using Ant Design Card + Select */}
      <Card
        size={compact ? 'small' : 'default'}
        className="rounded-2xl border-slate-200 shadow-xs bg-slate-50/60"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>
                {isAr
                  ? '1. اختر الدور الوظيفي الأساسي (يحدد الصلاحيات الافتراضية تلقائياً)'
                  : '1. Select Base Role (Auto-loads role default permissions)'}
              </span>
            </label>
            <Select
              value={role}
              onChange={(val) => handleSelectRole(val as RoleType)}
              size="large"
              className="w-full"
              options={ALL_ROLES.map((r) => ({
                value: r,
                label: `${isAr ? ROLE_LABELS[r].ar : ROLE_LABELS[r].en} (${r}) — ${ROLE_PERMISSIONS[r].length} ${
                  isAr ? 'صلاحية افتراضية' : 'default perms'
                }`,
              }))}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tag color="blue" className="px-3 py-1 text-xs font-bold rounded-lg m-0">
              {isAr ? `الافتراضي للدور: ${roleDefaults.size}` : `Role Defaults: ${roleDefaults.size}`}
            </Tag>
            <Tag color={addedCustomCount > 0 ? 'success' : 'default'} className="px-3 py-1 text-xs font-bold rounded-lg m-0">
              {isAr ? `+ صلاحيات إضافية: ${addedCustomCount}` : `+ Additional Custom: ${addedCustomCount}`}
            </Tag>
            {revokedCustomCount > 0 && (
              <Tag color="volcano" className="px-3 py-1 text-xs font-bold rounded-lg m-0">
                {isAr ? `مستثناة: ${revokedCustomCount}` : `Revoked: ${revokedCustomCount}`}
              </Tag>
            )}
            <Tag color="purple" className="px-3 py-1 text-xs font-bold rounded-lg m-0">
              {isAr
                ? `إجمالي الصلاحيات الفعالة: ${effectivePermissions.size} / ${PERMISSION_CATALOG.length}`
                : `Total Active: ${effectivePermissions.size} / ${PERMISSION_CATALOG.length}`}
            </Tag>
          </div>
        </div>

        {/* Quick Role Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-200/80">
          <div className="flex flex-wrap gap-1.5">
            {ALL_ROLES.map((r) => (
              <Button
                key={r}
                size="small"
                type={role === r ? 'primary' : 'default'}
                onClick={() => handleSelectRole(r)}
                className="text-[11px] font-bold rounded-lg"
              >
                {isAr ? ROLE_LABELS[r].ar.split(' (')[0] : ROLE_LABELS[r].en}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {customPermissions.length > 0 && (
              <Button
                size="small"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => onCustomPermissionsChange([])}
              >
                {isAr ? 'إعادة للافتراضي' : 'Reset to Defaults'}
              </Button>
            )}
            {effectivePermissions.size < PERMISSION_CATALOG.length && (
              <Button
                size="small"
                type="dashed"
                icon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={handleGrantAllAdditional}
              >
                {isAr ? '+ منح كل الصلاحيات الإضافية' : '+ Grant All Extra'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Info Banner */}
      <Alert
        type="info"
        showIcon
        message={
          <span className="text-xs font-bold text-slate-800">
            {isAr
              ? '2. تخصيص الصلاحيات الديناميكية للمستخدم (Dynamic Per-User Permissions): الصلاحيات المفعلة باللون الأزرق هي افتراضية لهذا الدور، ويمكنك تفعيل أي صلاحية إضافية باللون الأخضر لمنح المستخدم وصولاً استثنائياً لأقسام أو أزرار إضافية.'
              : '2. Dynamic User Permissions: Blue switches are role defaults. Toggle any extra switch ON (Green) to grant this user additional permissions & routes.'}
          </span>
        }
        className="rounded-xl"
      />

      {/* Permission Categories Grid using Ant Design Cards & Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groupedPermissions.map((group) => (
          <Card
            key={group.categoryEn}
            size="small"
            title={
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{isAr ? group.categoryAr : group.categoryEn}</span>
                <Badge
                  count={`${group.items.filter((i) => effectivePermissions.has(i.key)).length}/${group.items.length}`}
                  style={{ backgroundColor: '#2563eb' }}
                />
              </div>
            }
            className="rounded-2xl border-slate-200 shadow-xs"
          >
            <div className="divide-y divide-slate-100">
              {group.items.map((perm) => {
                const isDefault = roleDefaults.has(perm.key);
                const isChecked = effectivePermissions.has(perm.key);
                const isAddedCustom = !isDefault && isChecked;
                const isRevokedDefault = isDefault && !isChecked;

                return (
                  <div
                    key={perm.key}
                    data-permission-key={perm.key}
                    className={`py-2.5 px-2 flex items-center justify-between gap-3 rounded-lg transition ${
                      isAddedCustom
                        ? 'bg-emerald-50/70 border border-emerald-200/80 my-1'
                        : isRevokedDefault
                        ? 'bg-rose-50/50 opacity-75 my-1'
                        : ''
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          {isAr ? perm.labelAr : perm.labelEn}
                        </span>
                        {isDefault && isChecked && (
                          <Tag color="blue" className="text-[10px] m-0 px-1.5 py-0 rounded">
                            {isAr ? 'افتراضي للدور' : 'Role Default'}
                          </Tag>
                        )}
                        {isAddedCustom && (
                          <Tag color="success" className="text-[10px] m-0 px-1.5 py-0 font-bold rounded">
                            {isAr ? '+ صلاحية إضافية مخصصة' : '+ Added Custom'}
                          </Tag>
                        )}
                        {isRevokedDefault && (
                          <Tag color="error" className="text-[10px] m-0 px-1.5 py-0 rounded">
                            {isAr ? 'مستثناة' : 'Revoked'}
                          </Tag>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{perm.key}</span>
                        {perm.unlocksRoutes && perm.unlocksRoutes.length > 0 && (
                          <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                            {isChecked ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                            {perm.unlocksRoutes.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <Switch
                      checked={isChecked}
                      onChange={(checked) => handleTogglePermission(perm.key, checked)}
                      checkedChildren={<CheckCircle2 className="w-3 h-3 inline" />}
                      style={{
                        backgroundColor: isAddedCustom
                          ? '#059669'
                          : isChecked
                          ? '#2563eb'
                          : undefined,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

