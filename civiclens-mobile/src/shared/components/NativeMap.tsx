import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region, Callout, UrlTile } from 'react-native-maps';
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
        if (coordinates && coordinates.length > 0) {
          mapRef.current?.fitToCoordinates(coordinates, options);
        } else {
          mapRef.current?.fitToElements({ animated: true });
        }
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
        case 'resolved': return colors.success;
        case 'issue': return colors.error;
        default: return colors.primary;
      }
    };

    return (
      <View style={[styles.container, style]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT} 
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={showsUserLocation}
          showsMyLocationButton={false}
          showsCompass={false}
          onMapReady={() => setIsMapReady(true)}
          onRegionChangeComplete={onRegionChangeComplete}
          loadingEnabled={false}
          loadingIndicatorColor={colors.primary}
          loadingBackgroundColor={colors.backgroundSecondary}
          mapType={useOsmTiles ? "none" : "standard"}
          // @ts-ignore - showsZoomControls is Android specific but valid
          showsZoomControls={false}
          rotateEnabled={true}
          pitchEnabled={true}
        >
          {useOsmTiles && (
            <UrlTile
              /** 
               * CartoDB Voyager: Best free-forever map for production feel.
               * Based on OSM data but with a clean, Google-like aesthetic.
               */
              urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png"
              maximumZ={19}
              minimumZ={0}
              flipY={false}
              tileSize={256}
              offlineMode={false}
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
});

export default NativeMap;
