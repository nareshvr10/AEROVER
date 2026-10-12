import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoPoint, SearchSector, Waypoint, SARTeam } from '../../types';
import { Layers, Crosshair, ZoomIn, ZoomOut, Compass, MapPin } from 'lucide-react';

interface TacticalMapProps {
  center?: GeoPoint;
  zoom?: number;
  sectors?: SearchSector[];
  waypoints?: Waypoint[];
  teams?: SARTeam[];
  dronePosition?: GeoPoint;
  lastKnownPosition?: GeoPoint;
  isDrawingSector?: boolean;
  drawnPoints?: GeoPoint[];
  onMapClick?: (point: GeoPoint) => void;
  onSectorClick?: (sector: SearchSector) => void;
  className?: string;
  showControls?: boolean;
  interactive?: boolean;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  center = { lat: 46.8540, lng: -121.7450 },
  zoom = 13,
  sectors = [],
  waypoints = [],
  teams = [],
  dronePosition,
  lastKnownPosition,
  isDrawingSector = false,
  drawnPoints = [],
  onMapClick,
  onSectorClick,
  className = 'h-[500px] w-full',
  showControls = true,
  interactive = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'tactical' | 'osm' | 'topo'>('tactical');
  const [currentCoords, setCurrentCoords] = useState<string>('46.8540° N, 121.7450° W');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Default tactical tile layer
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    tileLayerRef.current = tiles;
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Mouse move coordinate display
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat.toFixed(4);
      const lng = e.latlng.lng.toFixed(4);
      setCurrentCoords(`${lat}° N, ${Math.abs(Number(lng)).toFixed(4)}° W`);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const clickHandler = (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.off('click');
    if (interactive) {
      map.on('click', clickHandler);
    }

    return () => {
      map.off('click', clickHandler);
    };
  }, [onMapClick, interactive]);

  // Update Layers & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Draw Sectors
    sectors.forEach((sector) => {
      if (sector.polygon && sector.polygon.length >= 3) {
        const latLngs = sector.polygon.map(p => [p.lat, p.lng] as [number, number]);
        
        let color = '#4CAF50'; // Nominal green
        if (sector.priority === 'critical') color = '#FF4B4B';
        else if (sector.status === 'in_progress') color = '#F59E0B';
        else if (sector.status === 'completed') color = '#3B82F6';

        const poly = L.polygon(latLngs, {
          color,
          weight: 2,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: 0.18,
          dashArray: sector.status === 'pending' ? '4, 4' : undefined
        }).addTo(group);

        poly.bindTooltip(
          `<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 2px 4px;">
            <strong>${sector.name}</strong><br/>
            Status: ${sector.status.replace('_', ' ').toUpperCase()}<br/>
            Area: ${sector.areaSquareKm ? sector.areaSquareKm + ' km²' : 'N/A'}
           </div>`,
          { permanent: false, direction: 'center', className: 'tactical-tooltip' }
        );

        if (onSectorClick) {
          poly.on('click', () => onSectorClick(sector));
        }
      }
    });

    // 2. Draw Currently Being Drawn Polygon
    if (isDrawingSector && drawnPoints.length > 0) {
      drawnPoints.forEach((pt, idx) => {
        const marker = L.circleMarker([pt.lat, pt.lng], {
          radius: 5,
          color: '#10B981',
          fillColor: '#FFFFFF',
          fillOpacity: 1,
          weight: 2
        }).addTo(group);
        marker.bindTooltip(`P${idx + 1}`, { permanent: true, direction: 'top' });
      });

      if (drawnPoints.length >= 2) {
        const linePts = drawnPoints.map(p => [p.lat, p.lng] as [number, number]);
        L.polyline(linePts, {
          color: '#10B981',
          weight: 2,
          dashArray: '5, 5'
        }).addTo(group);
      }
    }

    // 3. Draw Waypoints
    waypoints.forEach((wp) => {
      const wpIcon = L.divIcon({
        className: 'custom-wp-pin',
        html: `
          <div style="background-color: ${wp.reached ? '#3B82F6' : '#22262E'}; 
                      border: 2px solid ${wp.reached ? '#60A5FA' : '#4CAF50'}; 
                      color: #FFFFFF; 
                      font-family: 'JetBrains Mono', monospace;
                      font-size: 10px; 
                      font-weight: 700;
                      width: 24px; 
                      height: 24px; 
                      border-radius: 4px; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center;
                      box-shadow: 0 2px 6px rgba(0,0,0,0.6);">
            ${wp.order}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([wp.coordinates.lat, wp.coordinates.lng], { icon: wpIcon }).addTo(group);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #111;">
          <h4 style="margin: 0 0 4px 0; font-weight: 700;">WP ${wp.order}: ${wp.name}</h4>
          <p style="margin: 0 0 2px 0; font-family: monospace; font-size: 11px;">
            ${wp.coordinates.lat.toFixed(4)}, ${wp.coordinates.lng.toFixed(4)}
          </p>
          <p style="margin: 0; color: #555;">${wp.notes || 'No waypoint notes'}</p>
        </div>
      `);
    });

    // 4. Draw Waypoints connecting route
    if (waypoints.length > 1) {
      const sortedWp = [...waypoints].sort((a, b) => a.order - b.order);
      const routePts = sortedWp.map(w => [w.coordinates.lat, w.coordinates.lng] as [number, number]);
      L.polyline(routePts, {
        color: '#60A5FA',
        weight: 1.5,
        dashArray: '3, 4',
        opacity: 0.7
      }).addTo(group);
    }

    // 5. Draw Ground SAR Teams
    teams.forEach((tm) => {
      if (tm.sharedLocation) {
        const teamIcon = L.divIcon({
          className: 'custom-team-pin',
          html: `
            <div style="background-color: #182A1F; border: 1.5px solid #4CAF50; color: #F2F5F7; border-radius: 9999px; padding: 2px 6px; font-family: 'JetBrains Mono', monospace; font-size: 10px; display: flex; align-items: center; gap: 4px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.8);">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #4CAF50;"></span>
              ${tm.callsign}
            </div>
          `,
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        });

        const marker = L.marker([tm.sharedLocation.lat, tm.sharedLocation.lng], { icon: teamIcon }).addTo(group);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #111;">
            <strong style="color: #182A1F;">${tm.name} (${tm.callsign})</strong><br/>
            Task: ${tm.currentTask}<br/>
            Lead: ${tm.leaderName}<br/>
            Status: ${tm.checkInStatus.toUpperCase()}
          </div>
        `);
      }
    });

    // 6. Draw Last Known Position (LKP) Pin
    if (lastKnownPosition) {
      const lkpIcon = L.divIcon({
        className: 'custom-lkp-pin',
        html: `
          <div style="background-color: #7F1D1D; border: 2px solid #EF4444; color: #FEE2E2; border-radius: 4px; padding: 2px 6px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.8);">
            ⚠ LKP
          </div>
        `,
        iconSize: [44, 20],
        iconAnchor: [22, 10]
      });

      L.marker([lastKnownPosition.lat, lastKnownPosition.lng], { icon: lkpIcon })
        .addTo(group)
        .bindPopup('<strong>Last Known Position (LKP)</strong><br/>Reported hiker last location ping');
    }

    // 7. Draw Drone Position Pin
    if (dronePosition) {
      const droneIcon = L.divIcon({
        className: 'custom-drone-pin',
        html: `
          <div style="background-color: #064E3B; border: 2px solid #34D399; color: #ECFDF5; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);">
            ✈
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([dronePosition.lat, dronePosition.lng], { icon: droneIcon })
        .addTo(group)
        .bindPopup('<strong>AEROVER Recon Drone</strong><br/>Current GPS fix (Simulation Adapter)');
    }
  }, [sectors, waypoints, teams, dronePosition, lastKnownPosition, isDrawingSector, drawnPoints, onSectorClick]);

  // Fit to mission bounds
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const allPoints: GeoPoint[] = [];
    sectors.forEach(s => s.polygon.forEach(p => allPoints.push(p)));
    waypoints.forEach(w => allPoints.push(w.coordinates));
    if (dronePosition) allPoints.push(dronePosition);
    if (lastKnownPosition) allPoints.push(lastKnownPosition);

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([center.lat, center.lng], zoom);
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleToggleMapStyle = () => {
    const next = mapStyle === 'tactical' ? 'osm' : 'tactical';
    setMapStyle(next);
  };

  return (
    <div className={`relative overflow-hidden rounded-md border border-[#22262E] bg-[#0B1420] ${className}`}>
      <div
        ref={mapContainerRef}
        className={`w-full h-full ${mapStyle === 'tactical' ? 'tactical-map-dark' : ''}`}
      />

      {/* Floating Tactical Coordinate Bar */}
      <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-2 bg-[#0B1420]/90 backdrop-blur-sm border border-[#22262E] px-2.5 py-1 text-xs text-[#8A9AA5] font-mono">
        <Compass className="w-3.5 h-3.5 text-[#4CAF50]" />
        <span>{currentCoords}</span>
        <span className="text-[#22262E]">|</span>
        <span className="text-[#4CAF50]">{mapStyle === 'tactical' ? 'TACTICAL GRID' : 'STREET MAP'}</span>
      </div>

      {/* Map Control Buttons */}
      {showControls && (
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleFitBounds}
            title="Fit to Mission Bounds"
            className="flex items-center justify-center w-8 h-8 rounded bg-[#111B25]/90 hover:bg-[#182A1F] text-[#F2F5F7] border border-[#22262E] hover:border-[#4CAF50] transition-colors shadow-sm"
          >
            <Crosshair className="w-4 h-4 text-[#4CAF50]" />
          </button>
          <button
            type="button"
            onClick={handleToggleMapStyle}
            title="Toggle Tactical / Standard Map"
            className="flex items-center justify-center w-8 h-8 rounded bg-[#111B25]/90 hover:bg-[#182A1F] text-[#F2F5F7] border border-[#22262E] hover:border-[#4CAF50] transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4 text-[#8A9AA5]" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex items-center justify-center w-8 h-8 rounded bg-[#111B25]/90 hover:bg-[#182A1F] text-[#F2F5F7] border border-[#22262E] hover:border-[#4CAF50] transition-colors shadow-sm"
          >
            <ZoomIn className="w-4 h-4 text-[#8A9AA5]" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex items-center justify-center w-8 h-8 rounded bg-[#111B25]/90 hover:bg-[#182A1F] text-[#F2F5F7] border border-[#22262E] hover:border-[#4CAF50] transition-colors shadow-sm"
          >
            <ZoomOut className="w-4 h-4 text-[#8A9AA5]" />
          </button>
        </div>
      )}

      {/* Drawing mode banner */}
      {isDrawingSector && (
        <div className="absolute top-3 left-3 z-[400] bg-[#182A1F]/95 border border-[#4CAF50] px-3 py-1.5 text-xs text-[#F2F5F7] shadow-lg flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#4CAF50] animate-pulse" />
          <span>Click on map to add sector boundary vertices ({drawnPoints.length} added)</span>
        </div>
      )}
    </div>
  );
};
