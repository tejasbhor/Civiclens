/**
 * Officer Dashboard Screen - Production Ready
 * Main dashboard with interactive map and collapsible bottom sheet for officers
 * Mirrors citizen dashboard structure with officer-specific functionality
 */

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOfficerDashboard } from '../../../shared/hooks/useOfficerDashboard';
import { useOfficerTasks } from '../../../shared/hooks/useOfficerTasks';
import { OfflineIndicator, SyncStatusIndicator, TopNavbar, NativeMap, NativeMapRef } from '../../../shared/components';
import { RoleGuard } from '../../../shared/components/RoleGuard';
import { networkService } from '../../../shared/services/network/networkService';
import { colors } from '../../../shared/theme/colors';
import { UserRole } from '../../../shared/types/user';
import type { OfficerStackParamList } from '../../../navigation/OfficerTabNavigator';
import { getTabBarHeight } from '../../../shared/utils/screenPadding';

const { height } = Dimensions.get('window');

type OfficerDashboardNavigationProp = NativeStackNavigationProp<OfficerStackParamList, 'Dashboard'>;

export const OfficerDashboardScreen: React.FC = () => {
  return (
    <RoleGuard allowedRoles={[UserRole.NODAL_OFFICER, UserRole.ADMIN, UserRole.AUDITOR]}>
      <OfficerDashboardContent />
    </RoleGuard>
  );
};

const OfficerDashboardContent: React.FC = () => {
  const navigation = useNavigation<OfficerDashboardNavigationProp>();
  const insets = useSafeAreaInsets();

  const {
    stats,
    userLocation,
    isLoading,
    isHydrating,
    error,
    refreshDashboard,
    clearError,
    hasData,
  } = useOfficerDashboard();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActionsModal, setShowQuickActionsModal] = useState(false);
  const [isOnline, setIsOnline] = useState(networkService.isOnline());
  const [displayLocation, setDisplayLocation] = useState('Detecting zone...');
  const mapRef = useRef<NativeMapRef>(null);

  let hookResult;
  try {
    hookResult = useOfficerTasks();
  } catch (e) {
    console.warn('Failed to hook tasks', e);
  }
  const { tasks = [] } = hookResult || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setDisplayLocation('Navi Mumbai, Kharghar'); // fallback
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });

        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const area = place.district || place.city || place.subregion || 'Navi Mumbai';
          const locality = place.name || place.street || place.region || 'Kharghar';
          const locString = `${area}, ${locality}`;
          setDisplayLocation(locString);

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.003,
              longitudeDelta: 0.003,
            });
          }
        } else {
          setDisplayLocation('Navi Mumbai, Kharghar'); // fallback
        }
      } catch (error) {
        console.error('Auto location error:', error);
        setDisplayLocation('Navi Mumbai, Kharghar'); // fallback
      }
    };
    fetchCurrentLocation();
  }, []);

  // Calculate dynamic heights based on safe area
  const tabBarHeight = getTabBarHeight(insets);
  const bottomSheetGap = 8;
  const bottomSheetBottom = tabBarHeight + bottomSheetGap;

  useEffect(() => {
    const unsubscribe = networkService.addListener((status) => {
      setIsOnline(status.isConnected && status.isInternetReachable !== false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, clearError]);

  // Quick actions handler
  const handleQuickActions = () => {
    setShowQuickActionsModal(true);
  };

  const navigateToAction = (action: string) => {
    setShowQuickActionsModal(false);
    switch (action) {
      case 'tasks':
        navigation.navigate('Tasks');
        break;
      case 'stats':
        navigation.navigate('Stats');
        break;
      case 'profile':
        navigation.navigate('Profile');
        break;
      case 'emergency':
        Alert.alert('Emergency', 'Contact supervisor or emergency services');
        break;
    }
  };

  const handleLocateMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to find your position.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      });
      console.log('Officer located:', location.coords);
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Location Error', 'Could not fetch your location.');
    }
  };

  const handleZoom = async (type: 'in' | 'out') => {
    if (type === 'in') {
      mapRef.current?.zoomIn();
    } else {
      mapRef.current?.zoomOut();
    }
  };

  const totalTasks = stats?.total ?? 0;

  const taskBreakdown = useMemo(
    () => {
      if (!stats) {
        return [
          { label: 'Assigned', value: 0, color: '#2196F3' },
          { label: 'In Progress', value: 0, color: '#FF9800' },
          { label: 'Completed', value: 0, color: '#4CAF50' },
        ];
      }
      return [
        { label: 'Assigned', value: stats.assigned, color: '#2196F3' },
        { label: 'In Progress', value: stats.inProgress, color: '#FF9800' },
        { label: 'Completed', value: stats.completed, color: '#4CAF50' },
      ];
    },
    [stats]
  );

  const renderLegendValue = (value: number) => {
    if (isLoading && !stats) {
      return <View style={styles.skeletonValue} />;
    }
    return <Text style={styles.legendNumber}>{value}</Text>;
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Top Navbar - Officer Dashboard Style */}
      <TopNavbar
        title="Officer Dashboard"
        subtitle={displayLocation}
        showLocation={true}
        location={displayLocation}
        showNotifications={true}
        showSearch={true}
        onLocationPress={() => console.log('Location picker')}
        isSearching={isSearching}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchPress={() => {
          setIsSearching(!isSearching);
          if (isSearching) setSearchQuery(''); // clear when closing
        }}
      />

      {/* Status Indicators */}
      <OfflineIndicator />
      <SyncStatusIndicator />

      {/* Interactive Map */}
      <NativeMap
        ref={mapRef}
        initialRegion={{
          latitude: userLocation?.latitude || 19.0263,
          longitude: userLocation?.longitude || 73.0645,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }}
        markers={tasks
          .filter((t: any) => !searchQuery || (t.report && t.report.title.toLowerCase().includes(searchQuery.toLowerCase())))
          .map((task: any) => ({
            id: task.id || Math.random(),
            latitude: task.report?.latitude || 0,
            longitude: task.report?.longitude || 0,
            title: task.report?.title || task.title,
            description: task.report?.description || task.description,
            type: task.status === 'COMPLETED' ? 'resolved' : 'issue'
          })) as any}
      />

      {/* Map Controls (Zoom & Locate) */}
      <View style={[styles.mapControls, { bottom: bottomSheetBottom + 160 }]}>
        <View style={styles.zoomGroup}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => handleZoom('in')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#1976D2" />
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => handleZoom('out')}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={24} color="#1976D2" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.mapControlButton, styles.locateMeButton]}
          onPress={handleLocateMe}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { bottom: bottomSheetBottom }]}>
        <TouchableOpacity
          style={styles.handleContainer}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        {/* COLLAPSED VIEW - Quick Actions Button */}
        {!isExpanded && (
          <View style={styles.collapsedView}>
            <TouchableOpacity
              style={styles.quickActionsButton}
              activeOpacity={0.9}
              onPress={handleQuickActions}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.quickActionsButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={24} color="#FFF" />
                <Text style={styles.quickActionsButtonText}>Officer Tools</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* EXPANDED VIEW - Full Content */}
        {isExpanded && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && !isHydrating}
                onRefresh={refreshDashboard}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {hasData && stats ? (
              <>
                {/* Task Statistics Card */}
                <View style={styles.statsCard}>
                  <View style={styles.statsRow}>
                    {/* Left: Segmented Circle */}
                    <View style={styles.chartSection}>
                      <View style={styles.segmentedCircle}>
                        <Svg width={140} height={140}>
                          <Circle cx={70} cy={70} r={55} stroke="#E0E0E0" strokeWidth={12} fill="none" />

                          {(() => {
                            const total = stats.total || 1;
                            const circumference = 2 * Math.PI * 55;

                            const completedPercent = ((stats?.completed || 0) / total) * 100;
                            const progressPercent = ((stats?.inProgress || 0) / total) * 100;
                            const assignedPercent = ((stats?.assigned || 0) / total) * 100;

                            const completedDash = (completedPercent / 100) * circumference;
                            const progressDash = (progressPercent / 100) * circumference;
                            const assignedDash = (assignedPercent / 100) * circumference;

                            return (
                              <>
                                <Circle
                                  cx={70} cy={70} r={55}
                                  stroke="#4CAF50"
                                  strokeWidth={12}
                                  fill="none"
                                  strokeDasharray={`${completedDash} ${circumference}`}
                                  strokeDashoffset={0}
                                  rotation="-90"
                                  origin="70, 70"
                                  strokeLinecap="round"
                                />

                                <Circle
                                  cx={70} cy={70} r={55}
                                  stroke="#FF9800"
                                  strokeWidth={12}
                                  fill="none"
                                  strokeDasharray={`${progressDash} ${circumference}`}
                                  strokeDashoffset={-completedDash}
                                  rotation="-90"
                                  origin="70, 70"
                                  strokeLinecap="round"
                                />

                                <Circle
                                  cx={70} cy={70} r={55}
                                  stroke="#2196F3"
                                  strokeWidth={12}
                                  fill="none"
                                  strokeDasharray={`${assignedDash} ${circumference}`}
                                  strokeDashoffset={-(completedDash + progressDash)}
                                  rotation="-90"
                                  origin="70, 70"
                                  strokeLinecap="round"
                                />
                              </>
                            );
                          })()}
                        </Svg>

                        <View style={styles.circleCenter}>
                          {isLoading && !stats ? (
                            <View style={styles.skeletonCircle} />
                          ) : (
                            <>
                              <Text style={styles.circleTotalNumber}>{totalTasks}</Text>
                              <Text style={styles.circleTotalLabel}>Tasks</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Right: Stats Legend */}
                    <View style={styles.statsLegend}>
                      {taskBreakdown.map((item) => (
                        <View style={styles.legendItem} key={item.label}>
                          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                          {renderLegendValue(item.value)}
                          <Text style={styles.legendLabel}>{item.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Quick Actions Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.9}
                  onPress={handleQuickActions}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.primaryButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="add-circle" size={24} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Officer Tools</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Officer Tools Grid */}
                <View style={styles.toolsGrid}>
                  <TouchableOpacity
                    style={styles.toolCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Tasks')}
                  >
                    <View style={[styles.toolIcon, { backgroundColor: '#2196F3' }]}>
                      <Ionicons name="list" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.toolTitle}>My Tasks</Text>
                    <Text style={styles.toolSubtitle}>View & Update</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toolCard}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Stats')}
                  >
                    <View style={[styles.toolIcon, { backgroundColor: '#FF9800' }]}>
                      <Ionicons name="analytics" size={28} color="#FFF" />
                    </View>
                    <Text style={styles.toolTitle}>Performance</Text>
                    <Text style={styles.toolSubtitle}>Stats & Analytics</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>
                  {isHydrating ? 'Hydrating from cache...' :
                    isLoading ? 'Loading dashboard...' :
                      'No task data available offline yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {isHydrating ? 'Restoring cached data' :
                    isOnline ? 'Try again in a moment' : 'Connect to sync the latest tasks'}
                </Text>
                {!isHydrating && (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={refreshDashboard}
                    disabled={isLoading}
                  >
                    <Text style={styles.retryButtonText}>{isLoading ? 'Refreshing...' : 'Retry'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
                {!isOnline && <Text style={styles.errorHint}>Showing cached data</Text>}
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>

      {/* Quick Actions Modal */}
      <Modal
        visible={showQuickActionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuickActionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="add-circle" size={32} color="#2196F3" />
              </View>
              <Text style={styles.modalTitle}>Officer Tools</Text>
              <Text style={styles.modalSubtitle}>Select an action to perform</Text>
            </View>

            {/* Actions List */}
            <View style={styles.actionsContainer}>
              {/* View Tasks */}
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigateToAction('tasks')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#2196F3' }]}>
                  <Ionicons name="list" size={28} color="#FFF" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionName}>My Tasks</Text>
                  <Text style={styles.actionDescription}>View and manage assigned tasks</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#64748B" />
              </TouchableOpacity>

              {/* Performance Stats */}
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigateToAction('stats')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="analytics" size={28} color="#FFF" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionName}>Performance</Text>
                  <Text style={styles.actionDescription}>View stats and analytics</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#64748B" />
              </TouchableOpacity>

              {/* Profile */}
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigateToAction('profile')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#9C27B0' }]}>
                  <Ionicons name="person" size={28} color="#FFF" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionName}>Profile</Text>
                  <Text style={styles.actionDescription}>Update profile and settings</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#64748B" />
              </TouchableOpacity>

              {/* Emergency Contact */}
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.7}
                onPress={() => navigateToAction('emergency')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#F44336' }]}>
                  <Ionicons name="call" size={28} color="#FFF" />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionName}>Emergency</Text>
                  <Text style={styles.actionDescription}>Contact supervisor or emergency</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={() => setShowQuickActionsModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Component content is above in the main OfficerDashboardContent component

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },

  // Map
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    zIndex: 1, // Lower than bottomSheet
    gap: 12,
  },
  zoomGroup: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  mapControlButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  locateMeButton: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  // Top Navbar
  topNavbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navbarGradient: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  navbarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationInfo: {
    marginLeft: 4,
  },
  locationLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  locationCity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  navbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navbarIconButton: {
    position: 'relative',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Notification badge styles removed - using NotificationBell component
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: '#64748B',
    flex: 1,
    fontWeight: '500',
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    left: 8,
    right: 8,
    maxHeight: height * 0.65,
    backgroundColor: '#FFF',
    zIndex: 10, // Higher than mapControls
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },

  // Collapsed View
  collapsedView: {
    padding: 16,
  },
  quickActionsButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  quickActionsButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },

  // Expanded View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartSection: {
    marginRight: 20,
  },
  segmentedCircle: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleTotalNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
  },
  circleTotalLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  statsLegend: {
    flex: 1,
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 30,
  },
  legendLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  skeletonValue: {
    width: 32,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  skeletonCircle: {
    width: 40,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },

  // Primary Button
  primaryButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },

  // Tools Grid
  toolsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#1976D2',
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
  },
  errorHint: {
    marginLeft: 28,
    marginTop: 4,
    color: '#9C27B0',
    fontSize: 12,
  },

  // Quick Actions Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  cancelButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
});
