'use client';

import React, { useMemo, useCallback } from 'react';
import { SystemHealthBar } from '@/components/dashboard/SystemHealthBar';
import { TodaySnapshot } from '@/components/dashboard/TodaySnapshot';
import { PerformanceCard } from '@/components/dashboard/PerformanceCard';
import { WorkloadCard } from '@/components/dashboard/WorkloadCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import dynamic from 'next/dynamic';
import { Building2, RefreshCw, LayoutDashboard, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useDashboardData } from '@/lib/hooks/useDashboardData';

// Constants - Configurable values
const SLA_COMPLIANCE_TARGET = 85;
const TARGET_RESOLUTION_TIME = 48; // hours
const OVERLOAD_THRESHOLD = 15; // max active reports per officer
const MAX_DEPARTMENTS_DISPLAY = 5;

// Dynamic import for map to avoid SSR issues and improve initial load
const CityMap = dynamic(() => import('@/components/map/CityMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const { stats, departmentStats, officerStats, loading, error, refresh } = useDashboardData();

  // Memoized calculations for performance
  const healthScore = useMemo(() => {
    if (!stats) return 0;
    const resolvedCount = stats.reports_by_status?.resolved || 0;
    const resolutionRate = (resolvedCount / (stats.total_reports || 1)) * 100;
    const responseTimeScore = stats.avg_resolution_time <= TARGET_RESOLUTION_TIME ? 100 : 70;
    return Math.round(
      (SLA_COMPLIANCE_TARGET * 0.4) +
      (resolutionRate * 0.3) +
      (responseTimeScore * 0.3)
    );
  }, [stats]);

  const departmentPerformance = useMemo(() => {
    return departmentStats
      .map(dept => ({
        name: dept.department_name,
        rate: Math.round(dept.resolution_rate),
        total: dept.total_reports,
        resolved: dept.resolved_reports
      }))
      .slice(0, MAX_DEPARTMENTS_DISPLAY);
  }, [departmentStats]);

  const todayNewReports = useMemo(() => {
    return Math.floor((stats?.pending_tasks || 0) * 0.3);
  }, [stats]);

  const overloadedCount = useMemo(() => {
    return officerStats.filter(o =>
      o.capacity_level === 'overloaded' || (o.active_reports || 0) > OVERLOAD_THRESHOLD
    ).length;
  }, [officerStats]);

  // Callbacks for better performance
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const getRatingColor = useCallback((rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  // Loading State
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Following Standard Pattern */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-600 rounded-lg shadow-sm">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of civic issue management system
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 border border-gray-200"
            aria-label="Refresh dashboard data"
            aria-busy={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* System Health Bar */}
      <SystemHealthBar
        healthScore={healthScore}
        criticalIssues={stats?.critical_priority_count || 0}
        pendingTasks={stats?.pending_tasks || 0}
        slaCompliance={SLA_COMPLIANCE_TARGET}
        loading={loading}
      />

      {/* Error Message - Standard Pattern */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Error Loading Data</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-sm text-red-600 mt-1">Using cached data. Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Snapshot */}
      <TodaySnapshot
        newReports={todayNewReports}
        resolved={stats?.resolved_today || 0}
        critical={stats?.critical_priority_count || 0}
        loading={loading}
      />

      {/* Map & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geographic Distribution Map - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Geographic Distribution</h2>
          </div>

          <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200 relative z-0">
            <CityMap />
          </div>

          {/* Map Legend */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
              <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Critical</p>
                <p className="text-sm font-semibold text-gray-900">{stats?.critical_priority_count || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-sm font-semibold text-gray-900">{stats?.reports_by_status?.in_progress || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Resolved</p>
                <p className="text-sm font-semibold text-gray-900">{stats?.reports_by_status?.resolved || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance - 1 column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Top Departments</h2>
          </div>

          <div className="space-y-3">
            {departmentPerformance.length > 0 ? (
              departmentPerformance.map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{dept.name}</p>
                    <p className="text-xs text-gray-600">{dept.resolved}/{dept.total} resolved</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className={cn('text-lg font-bold', getRatingColor(dept.rate))}>
                      {dept.rate}%
                    </p>
                    <div className="flex gap-0.5 mt-1 justify-end">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-2 h-2 rounded-full transition-colors',
                            i < Math.floor(dept.rate / 25) ? 'bg-green-500' : 'bg-gray-300'
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No department data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance, Workload & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PerformanceCard
          avgResolutionTime={stats?.avg_resolution_time || 0}
          targetTime={TARGET_RESOLUTION_TIME}
          slaCompliance={SLA_COMPLIANCE_TARGET}
          loading={loading}
        />
        <WorkloadCard
          totalDepartments={departmentStats.length}
          totalOfficers={officerStats.length}
          overloadedOfficers={overloadedCount}
          loading={loading}
        />
        <RecentActivity loading={loading} />
      </div>
    </div>
  );
}
