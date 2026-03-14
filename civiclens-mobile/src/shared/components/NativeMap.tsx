import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
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

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
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
    const webViewRef = useRef<WebView>(null);

    // Initial HTML setup for Leaflet
    const INITIAL_ZOOM = 13; // Approximation based on standard delta
    
    // Make sure quotes, string interpolations, and newlines don't break JS syntax inside inject
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; }
    html, body, #map { height: 100%; width: 100%; border-radius: 12px; }
    .custom-marker { background: transparent; border: none; }
    .marker-inner {
      width: 24px; height: 24px; border-radius: 12px; border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${initialRegion.latitude}, ${initialRegion.longitude}], ${INITIAL_ZOOM});
    
    L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors © CARTO'
    }).addTo(map);

    var mapMarkers = {};

    function addMarkers(markerData) {
      for (var id in mapMarkers) { map.removeLayer(mapMarkers[id]); }
      mapMarkers = {};
      
      markerData.forEach(function(m) {
        var color = m.type === 'resolved' ? '${colors.success}' : (m.type === 'issue' ? '${colors.error}' : '${colors.primary}');
        var iconHtml = '<div class="marker-inner" style="background-color: ' + color + ';">' + 
           '<div style="width: 8px; height: 8px; background: white; border-radius: 4px;"></div></div>';

        var icon = L.divIcon({ className: 'custom-marker', html: iconHtml, iconSize: [24, 24], iconAnchor: [12, 12] });
        
        var popupContent = '<b>' + (m.title||'') + '</b><br/>' + (m.description||'');
        var marker = L.marker([m.latitude, m.longitude], {icon: icon})
          .bindPopup(popupContent)
          .on('click', function() { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: m.id })); })
          .addTo(map);

        mapMarkers[m.id] = marker;
      });
    }

    window.addMarkers = addMarkers;

    map.on('moveend', function() {
        var center = map.getCenter();
        var bounds = map.getBounds();
        var latDelta = bounds.getNorth() - bounds.getSouth();
        var lngDelta = bounds.getEast() - bounds.getWest();
        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'regionChange',
            region: { latitude: center.lat, longitude: center.lng, latitudeDelta: latDelta, longitudeDelta: lngDelta }
        }));
    });
  </script>
</body>
</html>
    `;

    useEffect(() => {
      // Send markers when they change
      if (webViewRef.current) {
        const injectedScript = `window.addMarkers(${JSON.stringify(markers)}); true;`;
        webViewRef.current.injectJavaScript(injectedScript);
      }
    }, [markers]);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, duration) => {
        const z = 13; // We can estimate zoom here or use map.getZoom()
        webViewRef.current?.injectJavaScript(`map.flyTo([${region.latitude}, ${region.longitude}], ${z}); true;`);
      },
      fitToCoordinates: (coordinates) => {
        if (coordinates && coordinates.length > 0) {
          webViewRef.current?.injectJavaScript(`
            var b = L.latLngBounds();
            ${JSON.stringify(coordinates)}.forEach(function(c) { b.extend([c.latitude, c.longitude]); });
            map.fitBounds(b, { padding: [50, 50] });
            true;
          `);
        }
      },
      zoomIn: () => { webViewRef.current?.injectJavaScript(`map.zoomIn(); true;`); },
      zoomOut: () => { webViewRef.current?.injectJavaScript(`map.zoomOut(); true;`); }
    }));

    const onMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'markerPress' && onMarkerPress) {
          const markerId = data.id;
          const foundMarker = markers.find(m => m.id === markerId);
          if (foundMarker) onMarkerPress(foundMarker);
        } else if (data.type === 'regionChange' && onRegionChangeComplete) {
          onRegionChangeComplete(data.region);
        }
      } catch (e) {}
    };

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.map}
          onMessage={onMessage}
          scrollEnabled={false} // Disable webview scrolling, leaflet handles map interactions
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  map: { flex: 1, backgroundColor: colors.backgroundSecondary }
});

export default NativeMap;
