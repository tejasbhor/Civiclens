import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT, Region, Callout, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@shared/theme/colors';

export interface MapMarker {
  id: string | number;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  type?: 'issue' | 'resolved' | 'user';
  metadata?: any;
}

interface NativeMapProps {
  initialRegion: Region;
  markers?: MapMarker[];
  showsUserLocation?: boolean;
  onMarkerPress?: (marker: MapMarker) => void;
  onRegionChangeComplete?: (region: Region) => void;
  style?: any;
  useOsmTiles?: boolean;
}

export interface NativeMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
  fitToCoordinates: (coordinates: { latitude: number; longitude: number }[], options?: any) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const NativeMap = forwardRef<NativeMapRef, NativeMapProps>(
  ({ initialRegion, markers = [], showsUserLocation = true, onMarkerPress, onRegionChangeComplete, style, useOsmTiles = true }, ref) => {
    const mapRef = useRef<MapView>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, duration = 1000) => {
        mapRef.current?.animateToRegion(region, duration);
      },
      fitToCoordinates: (coordinates, options = { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }) => {
        mapRef.current?.fitToElements(true);
      },
      zoomIn: () => {
        mapRef.current?.getCamera().then(camera => {
          mapRef.current?.setCamera({
            ...camera,
            zoom: (camera.zoom || 13) + 1
          });
        });
      },
      zoomOut: () => {
        mapRef.current?.getCamera().then(camera => {
          mapRef.current?.setCamera({
            ...camera,
            zoom: (camera.zoom || 13) - 1
          });
        });
      }
    }));

    const getMarkerColor = (type?: string) => {
      switch (type) {
        case 'resolved': return colors.status.resolved;
        case 'issue': return colors.status.pending;
        default: return colors.primary.main;
      }
    };

    return (
      <View style={[styles.container, style]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT} // Use default to avoid Google Maps specific errors if key is missing
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={false}
          showsCompass={false}
          onMapReady={() => setIsMapReady(true)}
          onRegionChangeComplete={onRegionChangeComplete}
          loadingEnabled={true}
          loadingIndicatorColor={colors.primary.main}
          loadingBackgroundColor="#f5f5f5"
          mapType={useOsmTiles ? "none" : "standard"} // If using OSM, set mapType to none
        >
          {useOsmTiles && (
            <UrlTile
              urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
          )}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              onPress={() => onMarkerPress?.(marker)}
              tracksViewChanges={false}
            >
              <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(marker.type) }]}>
                <Ionicons 
                  name={marker.type === 'resolved' ? "checkmark-circle" : "alert-circle"} 
                  size={16} 
                  color="#fff" 
                />
              </View>
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{marker.title}</Text>
                  {marker.description && (
                    <Text style={styles.calloutDesc} numberOfLines={2}>{marker.description}</Text>
                  )}
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        
        {!isMapReady && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              // Custom zoom in logic if needed, or rely on native
            }}
          >
            <Ionicons name="add" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              // Custom zoom out logic
            }}
          >
            <Ionicons name="remove" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  callout: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutDesc: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 60,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButton: {
    padding: 8,
  }
});

export default NativeMap;
