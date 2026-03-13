/**
 * Heat map layer component for Leaflet
 * Displays report distribution as a heat map
 */
'use client';

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Dynamically import leaflet.heat for Next.js compatibility
if (typeof window !== 'undefined') {
  // @ts-ignore - leaflet.heat doesn't have TypeScript definitions
  require('leaflet.heat');
}

interface HeatmapLayerProps {
  points: Array<{ lat: number; lng: number; intensity?: number }>;
  radius?: number;
  blur?: number;
  maxZoom?: number;
  minOpacity?: number;
  max?: number;
  gradient?: { [key: number]: string };
}

/**
 * Heat map layer component
 * Converts report points to heat map visualization
 */
export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({
  points,
  radius = 30,
  blur = 20,
  maxZoom = 18,
  minOpacity = 0.4, // Increased from 0.05 for better visibility
  max = 1.0,
  gradient = {
    0.0: 'blue',
    0.2: 'cyan',
    0.4: 'lime',
    0.6: 'yellow',
    0.8: 'orange',
    1.0: 'red',
  },
}) => {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!points || points.length === 0) {
      // Remove existing layer if no points
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // Remove existing layer if it exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Function to initialize the heat layer
    const initHeatLayer = () => {
      // Check if map container has actual size, otherwise wait
      // This prevents the 'IndexSizeError' on getImageData when canvas width is 0
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) {
        // Schedule initialization when the map is resized
        map.once('resize', initHeatLayer);
        map.invalidateSize(); // Force recalculation
        return;
      }

      // Convert points to heat map format: [lat, lng, intensity]
      const heatPoints: Array<[number, number, number]> = points.map((point) => [
        point.lat,
        point.lng,
        point.intensity || 1.0,
      ]);

      try {
        // Create heat layer using leaflet.heat
        // @ts-ignore - leaflet.heat extends L but TypeScript doesn't know about it
        const heatLayer = (L as any).heatLayer(heatPoints, {
          radius,
          blur,
          maxZoom,
          minOpacity,
          max,
          gradient,
        });

        // Add to map
        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;
      } catch (err) {
        console.warn('Failed to initialize heat layer - canvas might not be ready', err);
        // Try again after a short delay
        setTimeout(initHeatLayer, 100);
      }
    };

    // Delay slightly to give React & DOM time to paint layout
    setTimeout(initHeatLayer, 50);

    // Cleanup on unmount
    return () => {
      map.off('resize', initHeatLayer);
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, points, radius, blur, maxZoom, minOpacity, max, gradient]);

  return null;
};

