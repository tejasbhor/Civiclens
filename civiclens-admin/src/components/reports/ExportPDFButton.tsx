'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, File, Archive, ChevronDown, Lock, Loader2 } from 'lucide-react';
import { Report } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

interface ExportPDFButtonProps {
    report: Report;
    history?: any[];
    activityLogs?: any[];
    variant?: 'primary' | 'secondary' | 'ghost';
    label?: string;
    showIcon?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function ExportPDFButton({
    report,
    history,
    activityLogs,
    variant = 'secondary',
    label = 'Export PDF',
    showIcon = true,
    className,
    size = 'md',
}: ExportPDFButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleExportPDF = async (level: 'summary' | 'standard' | 'comprehensive') => {
        try {
            setLoading(true);
            setIsOpen(false);

            const { exportReportPDF, PDFExportLevel } = await import('@/lib/utils/pdf-export-service');

            const levelMap = {
                summary: PDFExportLevel.SUMMARY,
                standard: PDFExportLevel.STANDARD,
                comprehensive: PDFExportLevel.COMPREHENSIVE,
            };

            const levelNames = {
                summary: 'Summary',
                standard: 'Standard',
                comprehensive: 'Comprehensive',
            };

            exportReportPDF({
                level: levelMap[level],
                report,
                history: level !== 'summary' ? history : undefined,
                activityLogs: level === 'comprehensive' ? activityLogs : undefined,
            });

            toast.success(`${levelNames[level]} PDF opened in new window`, {
                description: 'Use Ctrl+P (Cmd+P on Mac) to print or save as PDF',
            });
        } catch (error) {
            console.error('PDF export failed:', error);
            toast.error('Failed to export PDF', {
                description: 'Please try again or contact support if the issue persists',
            });
        } finally {
            setLoading(false);
        }
    };

    // Button size variants
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    // Button variant styles
    const variantClasses = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 border-primary-600',
        secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border-transparent',
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={cn(
                    'flex items-center gap-2 rounded-lg border transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed',
                    sizeClasses[size],
                    variantClasses[variant],
                    className
                )}
                aria-label="Export report as PDF"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : showIcon ? (
                    <FileText className="w-4 h-4" />
                ) : null}
                <span>{label}</span>
                <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Summary Option */}
                    <button
                        onClick={() => handleExportPDF('summary')}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-blue-50 transition-colors text-left group"
                        aria-label="Export summary PDF"
                    >
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 mb-1">Summary PDF</div>
                            <div className="text-xs text-gray-600 leading-relaxed">
                                Quick overview for citizens. Includes basic info, status, and location.
                            </div>
                        </div>
                    </button>

                    {/* Standard Option */}
                    <button
                        onClick={() => handleExportPDF('standard')}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-primary-50 transition-colors text-left group"
                        aria-label="Export standard PDF"
                    >
                        <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors flex-shrink-0">
                            <File className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 mb-1">Standard PDF</div>
                            <div className="text-xs text-gray-600 leading-relaxed">
                                Moderate detail for internal use. Includes classifications, assignments, and status history.
                            </div>
                        </div>
                    </button>

                    {/* Comprehensive Option */}
                    <button
                        onClick={() => handleExportPDF('comprehensive')}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-purple-50 transition-colors text-left group"
                        aria-label="Export comprehensive PDF"
                    >
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors flex-shrink-0 relative">
                            <Archive className="w-5 h-5 text-purple-600" />
                            <div className="absolute -top-1 -right-1 p-0.5 bg-purple-600 rounded-full">
                                <Lock className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                Comprehensive PDF
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    Confidential
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 leading-relaxed">
                                Full audit trail with complete activity history. For compliance and internal audit purposes.
                            </div>
                        </div>
                    </button>

                    {/* Info Footer */}
                    <div className="mt-2 px-4 py-2 border-t border-gray-200 bg-gray-50">
                        <p className="text-xs text-gray-500">
                            💡 PDFs will open in a new window. Use <kbd className="px-1 bg-gray-200 rounded text-gray-700 font-mono">Ctrl+P</kbd> to print or save.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
