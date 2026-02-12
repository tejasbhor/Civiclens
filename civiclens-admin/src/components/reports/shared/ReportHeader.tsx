"use client";

import React from 'react';
import { Report } from '@/types';
import {
  Badge

} from '@/components/ui/Badge';
import { ExportPDFButton } from '@/components/reports/ExportPDFButton';

interface ReportHeaderProps {
  report: Report;
  showExportButton?: boolean;
  onExport?: (level: 'summary' | 'standard' | 'comprehensive') => void;
  className?: string;
  history?: any[];
  activityLogs?: any[];
}

export function ReportHeader({
  report,
  showExportButton = true,
  onExport,
  className = '',
  history,
  activityLogs
}: ReportHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {report.report_number || `CL-${report.id}`}
          </h2>
          <Badge status={report.status} size="md" />
          <Badge status={report.severity} size="md" />
        </div>
        <p className="text-sm text-gray-500">
          Reported on {formatDate(report.created_at)}
        </p>
      </div>

      {showExportButton && (
        <ExportPDFButton
          report={report}
          history={history}
          activityLogs={activityLogs}
          variant="primary"
          label="Export PDF"
          size="md"
        />
      )}
    </div>
  );
}
