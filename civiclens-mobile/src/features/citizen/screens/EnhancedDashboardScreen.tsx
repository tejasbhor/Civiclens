/**
 * Enhanced Dashboard Screen — Production Ready
 * Real stats from API, real recent reports, working quick actions.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_CONFIG } from '@/config/appConfig';
import { useNavigation } from '@react-navigation/native';

import { TopNavbar } from '@shared/components';
import { useDashboardStore } from '@store/dashboardStore';
import { useEnhancedReportStore } from '@store/enhancedReportStore';
import { useAuthStore } from '@store/authStore';
import { networkService } from '@shared/services/network/networkService';
import { getContentContainerStyle } from '@shared/utils/screenPadding';


// ── Offline indicator ──────────────────────────────────────────────────────

interface OfflineIndicatorProps {
  isOffline: boolean;
  lastSync: number | null;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOffline, lastSync }) => {
  if (!isOffline && !lastSync) return null;

  const getLastSyncText = () => {
    if (!lastSync) return 'Never synced';
    const diff = Date.now() - lastSync;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just synced';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <View style={[styles.offlineIndicator, isOffline && styles.offlineIndicatorRed]}>
      <Ionicons
        name={isOffline ? 'cloud-offline' : 'cloud-done'}
        size={14}
        color={isOffline ? '#F44336' : '#4CAF50'}
      />
      <Text style={[styles.offlineText, isOffline && styles.offlineTextRed]}>
        {isOffline ? 'Offline' : getLastSyncText()}
      </Text>
    </View>
  );
};

// ── Stats card ─────────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, loading }) => (
  <View style={styles.statsCard}>
    <LinearGradient
      colors={[`${color}18`, `${color}06`]}
      style={styles.statsCardGradient}
    >
      <View style={styles.statsCardHeader}>
        <View style={[styles.statsIcon, { backgroundColor: `${color}22` }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        {loading && <ActivityIndicator size="small" color={color} />}
      </View>
      <Text style={styles.statsValue}>{loading ? '–' : value.toLocaleString()}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </LinearGradient>
  </View>
);

// ── Status colour mapping ──────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  received: '#2196F3',
  pending_classification: '#9C27B0',
  classified: '#673AB7',
  assigned_to_department: '#FF9800',
  assigned_to_officer: '#FF9800',
  acknowledged: '#00BCD4',
  in_progress: '#FF9800',
  pending_verification: '#FF5722',
  on_hold: '#9E9E9E',
  resolved: '#4CAF50',
  closed: '#66BB6A',
};

const STATUS_LABELS: Record<string, string> = {
  received: 'Received',
  pending_classification: 'Classifying',
  classified: 'Classified',
  assigned_to_department: 'Assigned',
  assigned_to_officer: 'Assigned',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  pending_verification: 'Under Review',
  on_hold: 'On Hold',
  resolved: 'Resolved',
  closed: 'Closed',
};

// ── Main component ─────────────────────────────────────────────────────────

export const EnhancedDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [isOnline, setIsOnline] = useState(networkService.isOnline());

  const { stats, isLoading, error, fetchDashboardData, refreshDashboard, lastRefresh } =
    useDashboardStore();
  const {
    myReports,
    unsyncedCount,
    queueStatus,
    fetchMyReports,
    preloadRecentReports,
    refreshAll,
  } = useEnhancedReportStore();
  const { user } = useAuthStore();

  // Network listener
  useEffect(() => {
    const unsubscribe = networkService.addListener((status) => {
      setIsOnline(status.isConnected && status.isInternetReachable !== false);
    });
    return unsubscribe;
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchDashboardData();
      fetchMyReports().catch(() => { });
      if (isOnline) {
        preloadRecentReports().catch(() => { });
      }
    };
    loadData();
  }, []);

  const handleRefresh = useCallback(async () => {
    if (isOnline) {
      await Promise.all([refreshAll(), refreshDashboard()]);
    } else {
      await Promise.all([fetchDashboardData(), fetchMyReports()]);
    }
  }, [isOnline, refreshAll, refreshDashboard, fetchDashboardData, fetchMyReports]);

  const isRefreshing =
    useDashboardStore((s) => s.isLoading) || useEnhancedReportStore((s) => s.refreshing);

  // 5 most recent reports for "Recent Activity"
  const recentReports = myReports.slice(0, 5);

  return (
    <View style={styles.container}>
      <TopNavbar
        title={`Welcome, ${user?.full_name?.split(' ')[0] || 'Citizen'}`}
        subtitle={isOnline ? `${APP_CONFIG.appName} Dashboard` : 'Offline Mode'}
        showBack={false}
        rightActions={<OfflineIndicator isOffline={!isOnline} lastSync={lastRefresh} />}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={getContentContainerStyle(insets)}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#1976D2']}
            tintColor="#1976D2"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#D32F2F" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── Your Impact (real stats) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsGrid}>
            <StatsCard
              title="Issues Raised"
              value={stats?.issuesRaised || 0}
              icon="flag"
              color="#1976D2"
              loading={isLoading && !stats}
            />
            <StatsCard
              title="In Progress"
              value={stats?.inProgress || 0}
              icon="time"
              color="#FF9800"
              loading={isLoading && !stats}
            />
            <StatsCard
              title="Resolved"
              value={stats?.resolved || 0}
              icon="checkmark-circle"
              color="#4CAF50"
              loading={isLoading && !stats}
            />
            <StatsCard
              title="Total Reports"
              value={stats?.total || 0}
              icon="bar-chart"
              color="#9C27B0"
              loading={isLoading && !stats}
            />
          </View>
        </View>

        {/* ── Quick Actions (all navigate properly) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('SubmitReport')}
              activeOpacity={0.75}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#1976D215' }]}>
                <Ionicons name="add-circle" size={28} color="#1976D2" />
              </View>
              <Text style={styles.quickActionTitle}>Submit{'\n'}Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() =>
                (navigation as any).navigate('Reports', { screen: 'ReportsList' })
              }
              activeOpacity={0.75}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF5015' }]}>
                <Ionicons name="list" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionTitle}>My{'\n'}Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() =>
                (navigation as any).navigate('Notifications')
              }
              activeOpacity={0.75}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF980015' }]}>
                <Ionicons name="notifications" size={28} color="#FF9800" />
              </View>
              <Text style={styles.quickActionTitle}>Notifica-{'\n'}tions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() =>
                (navigation as any).navigate('Profile', { screen: 'ProfileMain' })
              }
              activeOpacity={0.75}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#9C27B015' }]}>
                <Ionicons name="person-circle" size={28} color="#9C27B0" />
                {unsyncedCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unsyncedCount > 99 ? '99+' : unsyncedCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.quickActionTitle}>My{'\n'}Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Unsynced queue status ── */}
        {queueStatus && (queueStatus.pending > 0 || queueStatus.failed > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sync Status</Text>
            <View style={styles.queueCard}>
              <View style={styles.queueHeader}>
                <Ionicons name="cloud-upload" size={22} color="#1976D2" />
                <Text style={styles.queueTitle}>Offline Submissions</Text>
              </View>
              <View style={styles.queueStats}>
                {queueStatus.pending > 0 && (
                  <View style={styles.queueStat}>
                    <Text style={styles.queueStatNumber}>{queueStatus.pending}</Text>
                    <Text style={styles.queueStatLabel}>Pending</Text>
                  </View>
                )}
                {queueStatus.processing > 0 && (
                  <View style={styles.queueStat}>
                    <Text style={styles.queueStatNumber}>{queueStatus.processing}</Text>
                    <Text style={styles.queueStatLabel}>Processing</Text>
                  </View>
                )}
                {queueStatus.failed > 0 && (
                  <View style={styles.queueStat}>
                    <Text style={[styles.queueStatNumber, { color: '#F44336' }]}>
                      {queueStatus.failed}
                    </Text>
                    <Text style={styles.queueStatLabel}>Failed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.queueDescription}>
                {isOnline
                  ? 'Reports will sync automatically'
                  : "Reports will sync when you're back online"}
              </Text>
            </View>
          </View>
        )}

        {/* ── Recent Activity (real reports) ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {myReports.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  (navigation as any).navigate('Reports', { screen: 'ReportsList' })
                }
              >
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoading && recentReports.length === 0 ? (
            <View style={styles.placeholderCard}>
              <ActivityIndicator size="small" color="#1976D2" />
              <Text style={styles.placeholderText}>Loading activity...</Text>
            </View>
          ) : recentReports.length === 0 ? (
            <View style={styles.placeholderCard}>
              <Ionicons name="time-outline" size={44} color="#E0E0E0" />
              <Text style={styles.placeholderText}>No reports yet</Text>
              <Text style={styles.placeholderSubtext}>Submit a report to see it here</Text>
              <TouchableOpacity
                style={styles.submitFirstButton}
                onPress={() => navigation.navigate('SubmitReport')}
              >
                <Text style={styles.submitFirstText}>Submit First Report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activityList}>
              {recentReports.map((report, index) => {
                const statusKey = String(report.status).toLowerCase();
                const color = STATUS_COLORS[statusKey] || '#9E9E9E';
                const label = STATUS_LABELS[statusKey] || report.status;
                const createdAt = report.created_at
                  ? new Date(report.created_at)
                  : null;
                const timeAgo = createdAt
                  ? (() => {
                    const diff = Date.now() - createdAt.getTime();
                    const days = Math.floor(diff / 86400000);
                    const hours = Math.floor(diff / 3600000);
                    const mins = Math.floor(diff / 60000);
                    if (days > 0) return `${days}d ago`;
                    if (hours > 0) return `${hours}h ago`;
                    return `${mins}m ago`;
                  })()
                  : '';

                return (
                  <TouchableOpacity
                    key={report.id ?? `local-${index}`}
                    style={styles.activityCard}
                    onPress={() => {
                      if (report.id) {
                        (navigation as any).navigate('Reports', {
                          screen: 'ReportDetail',
                          params: { reportId: report.id },
                        });
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.activityDot, { backgroundColor: color }]} />
                    <View style={styles.activityBody}>
                      <Text style={styles.activityTitle} numberOfLines={1}>
                        {report.title || report.category}
                      </Text>
                      <Text style={styles.activityAddress} numberOfLines={1}>
                        {report.address}
                      </Text>
                    </View>
                    <View style={styles.activityRight}>
                      <View style={[styles.statusChip, { backgroundColor: `${color}18` }]}>
                        <Text style={[styles.statusChipText, { color }]}>{label}</Text>
                      </View>
                      <Text style={styles.activityTime}>{timeAgo}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: { flex: 1 },

  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineIndicatorRed: { backgroundColor: '#FFEBEE' },
  offlineText: { fontSize: 11, fontWeight: '600', color: '#4CAF50' },
  offlineTextRed: { color: '#F44336' },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: 13, color: '#D32F2F' },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
    marginHorizontal: 16,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 14,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  statsCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  statsCardGradient: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    borderRadius: 14,
  },
  statsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statsTitle: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Queue
  queueCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  queueTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  queueStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  queueStat: { alignItems: 'center' },
  queueStatNumber: { fontSize: 20, fontWeight: '700', color: '#1976D2' },
  queueStatLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  queueDescription: { fontSize: 13, color: '#64748B', textAlign: 'center' },

  // Placeholder card
  placeholderCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    padding: 28,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 10,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 4,
  },
  submitFirstButton: {
    marginTop: 16,
    backgroundColor: '#1976D2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitFirstText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Recent activity list
  activityList: {
    marginHorizontal: 16,
    gap: 8,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    gap: 10,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  activityBody: { flex: 1 },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  activityAddress: { fontSize: 12, color: '#64748B' },
  activityRight: { alignItems: 'flex-end', gap: 4 },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  activityTime: { fontSize: 11, color: '#94A3B8' },
});
