"use client";

import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  Copy,
  MapPin,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Loader2,
  Eye,
  GitMerge,
  XCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { aiInsightsApi, DuplicateCluster } from '@/lib/api/ai-insights';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SimpleSelect } from '@/components/ui/select';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { showToast, confirmAction } from '@/lib/utils/toast';

export default function InsightsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clusters, setClusters] = useState<DuplicateCluster[]>([]);
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minDuplicates, setMinDuplicates] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Merge modal state
  const [mergeModal, setMergeModal] = useState<{
    isOpen: boolean;
    cluster: DuplicateCluster | null;
    selectedDuplicates: Set<number>;
  }>({ isOpen: false, cluster: null, selectedDuplicates: new Set() });

  const fetchClusters = async () => {
    try {
      setRefreshing(true);
      const data = await aiInsightsApi.getDuplicateClusters({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        min_duplicates: minDuplicates,
        limit: 100
      });
      setClusters(data);
    } catch (error) {
      console.error('Failed to fetch duplicate clusters:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, [statusFilter, categoryFilter, minDuplicates]);

  const handleMerge = async (cluster: DuplicateCluster, duplicateIds: number[]) => {
    const toastId = showToast.loading('Merging duplicate reports...');

    try {
      await aiInsightsApi.mergeDuplicates({
        primary_report_id: cluster.primary_report_id,
        duplicate_report_ids: duplicateIds,
        notes: 'Admin merged duplicate cluster'
      });

      // Close modal first
      setMergeModal({ isOpen: false, cluster: null, selectedDuplicates: new Set() });

      // Force refresh data with loading state
      setLoading(true);
      await fetchClusters();
      setLoading(false);

      showToast.dismiss(toastId);
      showToast.success('Duplicates merged successfully!', {
        description: `${duplicateIds.length} reports merged into primary report #${cluster.primary_report_number}`,
        duration: 5000
      });
    } catch (error: any) {
      console.error('Failed to merge duplicates:', error);
      showToast.dismiss(toastId);
      showToast.error('Failed to merge duplicates', {
        description: error?.message || 'Please try again or contact support',
        duration: 6000
      });
      setLoading(false);
    }
  };

  const handleUnmark = async (reportId: number) => {
    if (!confirmAction('Are you sure you want to unmark this report as duplicate? This will restore it to its original status.')) {
      return;
    }

    const toastId = showToast.loading('Unmarking report...');

    try {
      await aiInsightsApi.unmarkDuplicate({
        report_id: reportId,
        notes: 'Admin unmarked as false positive'
      });

      // Force refresh data
      setLoading(true);
      await fetchClusters();
      setLoading(false);

      showToast.dismiss(toastId);
      showToast.success('Report unmarked successfully!', {
        description: 'The report has been restored to its original status',
        duration: 4000
      });
    } catch (error: any) {
      console.error('Failed to unmark duplicate:', error);
      showToast.dismiss(toastId);
      showToast.error('Failed to unmark report', {
        description: error?.message || 'Please try again',
        duration: 5000
      });
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-600 rounded-lg shadow-sm">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Duplicate Insights</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and merge duplicate report clusters</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={fetchClusters}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 border border-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <SimpleSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="received">Received</option>
                <option value="duplicate">Duplicate</option>
                <option value="classified">Classified</option>
                <option value="assigned_to_department">Assigned to Department</option>
              </SimpleSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <SimpleSelect
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="roads">Roads</option>
                <option value="water">Water</option>
                <option value="sanitation">Sanitation</option>
                <option value="electricity">Electricity</option>
                <option value="streetlight">Street Lights</option>
                <option value="drainage">Drainage</option>
                <option value="public_property">Public Property</option>
                <option value="other">Other</option>
              </SimpleSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Duplicates</label>
              <Input
                type="number"
                min={1}
                value={minDuplicates}
                onChange={(e) => setMinDuplicates(Number(e.target.value))}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Copy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Clusters</p>
              <p className="text-xl font-bold text-gray-900">{clusters.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Duplicates</p>
              <p className="text-xl font-bold text-gray-900">
                {clusters.reduce((sum, c) => sum + c.duplicate_count, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg per Cluster</p>
              <p className="text-xl font-bold text-gray-900">
                {clusters.length > 0
                  ? (clusters.reduce((sum, c) => sum + c.duplicate_count, 0) / clusters.length).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Needs Review</p>
              <p className="text-xl font-bold text-gray-900">
                {clusters.filter(c => c.primary_status === 'duplicate').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Clusters List */}
      <div className="space-y-4">
        {clusters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Copy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Duplicate Clusters Found</h3>
            <p className="text-gray-600">
              {statusFilter || categoryFilter
                ? 'Try adjusting your filters to see more results.'
                : 'Great! No duplicate reports detected.'}
            </p>
          </div>
        ) : (
          clusters.map((cluster) => (
            <Card
              key={cluster.primary_report_id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Cluster Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {cluster.primary_title}
                      </h3>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        {cluster.duplicate_count} duplicates
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {cluster.primary_report_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(cluster.primary_created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {cluster.location.latitude.toFixed(4)}, {cluster.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200" size="sm">
                      {cluster.primary_status}
                    </Badge>
                    {cluster.category && (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200 capitalize" size="sm">
                        {cluster.category.replace('_', ' ')}
                      </Badge>
                    )}
                    <div className={`px-3 py-1 rounded-lg border text-xs font-semibold ${getSeverityColor(cluster.severity)}`}>
                      {cluster.severity.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setExpandedCluster(
                      expandedCluster === cluster.primary_report_id ? null : cluster.primary_report_id
                    )}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {expandedCluster === cluster.primary_report_id ? 'Hide' : 'View'} Duplicates
                    {expandedCluster === cluster.primary_report_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  <Button
                    onClick={() => router.push(`/dashboard/reports?id=${cluster.primary_report_id}`)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Primary Report
                  </Button>

                  <Button
                    onClick={() => setMergeModal({
                      isOpen: true,
                      cluster,
                      selectedDuplicates: new Set(cluster.duplicates.map(d => d.id))
                    })}
                    variant="primary"
                    size="sm"
                    className="gap-2"
                  >
                    <GitMerge className="w-4 h-4" />
                    Merge All
                  </Button>
                </div>
              </div>

              {/* Expanded Duplicates List */}
              {expandedCluster === cluster.primary_report_id && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Duplicate Reports</h4>
                  <div className="space-y-2">
                    {cluster.duplicates.map((duplicate) => (
                      <div
                        key={duplicate.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {duplicate.report_number}
                              </span>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200" size="sm">{duplicate.status}</Badge>
                              {duplicate.ai_confidence && (
                                <span className="text-xs text-gray-600">
                                  AI Confidence: <strong>{(duplicate.ai_confidence * 100).toFixed(0)}%</strong>
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 mb-1">{duplicate.title}</p>
                            <p className="text-xs text-gray-500">
                              Reported {formatDate(duplicate.created_at)} by User #{duplicate.user_id}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/reports?id=${duplicate.id}`)}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Report"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUnmark(duplicate.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Unmark as Duplicate"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Merge Modal */}
      {mergeModal.isOpen && mergeModal.cluster && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-green-600" />
                Merge Duplicate Reports
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Confirm merging {mergeModal.selectedDuplicates.size} duplicate reports into the primary report
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Primary Report</p>
                <p className="text-sm text-green-800">{mergeModal.cluster.primary_title}</p>
                <p className="text-xs text-green-700 mt-1">{mergeModal.cluster.primary_report_number}</p>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-2">
                Duplicates to merge ({mergeModal.selectedDuplicates.size}):
              </p>
              <div className="space-y-2">
                {mergeModal.cluster.duplicates
                  .filter(d => mergeModal.selectedDuplicates.has(d.id))
                  .map((duplicate) => (
                    <div key={duplicate.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-900">{duplicate.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{duplicate.report_number}</p>
                    </div>
                  ))}
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> This action will mark all selected reports as duplicates and link them to the primary report. This cannot be undone automatically.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                onClick={() => setMergeModal({ isOpen: false, cluster: null, selectedDuplicates: new Set() })}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleMerge(mergeModal.cluster!, Array.from(mergeModal.selectedDuplicates))}
                variant="primary"
                className="gap-2"
              >
                <GitMerge className="w-4 h-4" />
                Confirm Merge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
