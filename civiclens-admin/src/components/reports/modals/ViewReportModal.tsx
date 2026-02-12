import React, { useEffect, useState } from 'react';
import { X, FileText } from 'lucide-react';
import ReportDetail from '@/components/reports/ReportDetail';
import { ExportPDFButton } from '@/components/reports/ExportPDFButton';
import { Report } from '@/types';
import { reportsApi } from '@/lib/api/reports';

interface ViewReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: number;
    admin?: boolean;
    onUpdated?: (report: Report) => void;
}

export function ViewReportModal({ isOpen, onClose, reportId, admin = false, onUpdated }: ViewReportModalProps) {
    const [report, setReport] = useState<Report | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [activityLogs, setActivityLogs] = useState<any[]>([]);

    // Fetch minimal data needed for the header/export actions
    // The ReportDetail component fetches its own full data
    useEffect(() => {
        if (isOpen && reportId) {
            const fetchData = async () => {
                try {
                    // Parallel fetch for export capability
                    const [r, h, logs] = await Promise.all([
                        reportsApi.getReportById(reportId),
                        reportsApi.getStatusHistory(reportId).catch(() => ({ history: [] })),
                        reportsApi.getReportAuditLogs(reportId).catch(() => [])
                    ]);
                    setReport(r);
                    setHistory(h.history || []);
                    setActivityLogs(logs || []);
                } catch (error) {
                    console.error('Failed to load report for modal header:', error);
                }
            };

            fetchData();
        } else {
            setReport(null);
        }
    }, [isOpen, reportId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal Panel */}
                <div
                    className="inline-block w-full max-w-5xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm border border-blue-100">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {report ? `Report ${report.report_number || `#${report.id}`}` : 'Report Details'}
                                </h3>
                                <p className="text-xs text-gray-500">View complete report information and history</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {report && (
                                <ExportPDFButton
                                    report={report}
                                    history={history}
                                    activityLogs={activityLogs}
                                    variant="ghost"
                                    size="sm"
                                    label=""
                                    showIcon={true}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                />
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto bg-gray-50/50">
                        <ReportDetail
                            reportId={reportId}
                            admin={admin}
                            onUpdated={onUpdated}
                            hideHeader={true}
                        />
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                            {report && `Last updated: ${new Date(report.updated_at).toLocaleString()}`}
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
