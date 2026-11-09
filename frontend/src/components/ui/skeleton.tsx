'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton as AntdSkeleton, Card as AntdCard } from 'antd';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-xl bg-slate-200/80', className)}
      {...props}
    />
  );
}

/**
 * Ant Design (antd) Page Skeleton Loader used across all HRSystem pages
 * while asynchronous API requests or route hydration are in progress.
 */
export function PageSkeleton({
  variant = 'dashboard',
  rows = 5,
}: {
  variant?: 'dashboard' | 'table' | 'cards' | 'form' | 'detail';
  rows?: number;
}) {
  return (
    <div className="space-y-6 py-2" data-testid="page-skeleton" data-slot="skeleton">
      {/* Header Banner Skeleton using antd Skeleton */}
      <AntdCard className="rounded-2xl border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full max-w-md">
            <AntdSkeleton active title={{ width: '65%' }} paragraph={{ rows: 1, width: ['90%'] }} />
          </div>
          <div className="flex items-center gap-2.5">
            <AntdSkeleton.Button active size="large" shape="round" style={{ width: 120 }} />
            <AntdSkeleton.Button active size="large" shape="round" style={{ width: 140 }} />
          </div>
        </div>
      </AntdCard>

      {/* KPI Summary Cards Row */}
      {(variant === 'dashboard' || variant === 'table' || variant === 'cards') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <AntdCard key={idx} className="rounded-2xl border-slate-200 shadow-xs">
              <AntdSkeleton active avatar={{ shape: 'square', size: 'default' }} paragraph={{ rows: 2 }} />
            </AntdCard>
          ))}
        </div>
      )}

      {/* Main Content Area by Variant */}
      {variant === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AntdCard className="lg:col-span-2 rounded-2xl border-slate-200 shadow-xs">
            <AntdSkeleton active paragraph={{ rows: 6 }} />
          </AntdCard>
          <AntdCard className="rounded-2xl border-slate-200 shadow-xs">
            <AntdSkeleton active avatar paragraph={{ rows: 5 }} />
          </AntdCard>
        </div>
      )}

      {variant === 'table' && (
        <AntdCard className="rounded-2xl border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <AntdSkeleton.Input active style={{ width: 260 }} />
            <div className="flex gap-2">
              <AntdSkeleton.Button active style={{ width: 95 }} />
              <AntdSkeleton.Button active style={{ width: 95 }} />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <AntdSkeleton key={i} active avatar paragraph={{ rows: 1 }} />
            ))}
          </div>
        </AntdCard>
      )}

      {variant === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <AntdCard key={i} className="rounded-2xl border-slate-200 shadow-xs">
              <AntdSkeleton active avatar paragraph={{ rows: 3 }} />
            </AntdCard>
          ))}
        </div>
      )}

      {variant === 'form' && (
        <AntdCard className="max-w-4xl mx-auto rounded-2xl border-slate-200 shadow-xs">
          <AntdSkeleton active paragraph={{ rows: 8 }} />
        </AntdCard>
      )}

      {variant === 'detail' && (
        <div className="space-y-6">
          <AntdCard className="rounded-2xl border-slate-200 shadow-xs">
            <AntdSkeleton active avatar={{ size: 64, shape: 'square' }} paragraph={{ rows: 3 }} />
          </AntdCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AntdCard className="rounded-2xl border-slate-200 shadow-xs">
              <AntdSkeleton active paragraph={{ rows: 5 }} />
            </AntdCard>
            <AntdCard className="rounded-2xl border-slate-200 shadow-xs">
              <AntdSkeleton active paragraph={{ rows: 5 }} />
            </AntdCard>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook that provides an initial skeleton loading state on page mount
 * so even synchronous/client-hydrated pages display smooth antd Skeleton placeholders.
 */
export function usePageSkeleton(initialDelayMs = 240) {
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsSkeletonLoading(false), initialDelayMs);
    return () => clearTimeout(timer);
  }, [initialDelayMs]);
  return { isSkeletonLoading, setIsSkeletonLoading };
}
