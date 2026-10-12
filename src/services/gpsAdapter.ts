import { GeoPoint } from '../types';

export interface GpsReading {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracyMeters?: number;
  source: 'browser_geolocation' | 'manual_entry' | 'atgm336h_serial' | 'simulation_adapter';
  timestamp: string;
  isValid: boolean;
  satellitesInView?: number;
  rawSentence?: string;
}

export class GpsAdapter {
  /**
   * Formats decimal degrees to degrees, minutes, seconds format:
   * e.g. 46° 51' 08.3" N, 121° 45' 37.1" W
   */
  static formatDMS(lat: number, lng: number): string {
    const toDMS = (val: number, isLat: boolean) => {
      const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
      const absVal = Math.abs(val);
      const deg = Math.floor(absVal);
      const minFloat = (absVal - deg) * 60;
      const min = Math.floor(minFloat);
      const sec = ((minFloat - min) * 60).toFixed(1);
      return `${deg}° ${min}' ${sec}" ${dir}`;
    };

    return `${toDMS(lat, true)}, ${toDMS(lng, false)}`;
  }

  /**
   * Request live browser position with high accuracy
   */
  static requestBrowserPosition(): Promise<GpsReading> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser environment.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude || undefined,
            accuracyMeters: pos.coords.accuracy,
            source: 'browser_geolocation',
            timestamp: new Date(pos.timestamp).toISOString(),
            isValid: true
          });
        },
        (err) => {
          reject(new Error(`Browser geolocation error (${err.code}): ${err.message}`));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  /**
   * Validate and record operator manual coordinate input
   */
  static parseManualCoordinate(latInput: string | number, lngInput: string | number, altInput?: string | number): GpsReading {
    const lat = typeof latInput === 'number' ? latInput : parseFloat(latInput.trim());
    const lng = typeof lngInput === 'number' ? lngInput : parseFloat(lngInput.trim());
    const alt = altInput !== undefined ? (typeof altInput === 'number' ? altInput : parseFloat(altInput.toString().trim())) : undefined;

    const isValid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

    return {
      latitude: isValid ? lat : 0,
      longitude: isValid ? lng : 0,
      altitude: alt && !isNaN(alt) ? alt : undefined,
      accuracyMeters: 1.0, // Manual exact pin
      source: 'manual_entry',
      timestamp: new Date().toISOString(),
      isValid
    };
  }

  /**
   * Parses NMEA 0183 $GPRMC or $GNGGA sentences for future ATGM336H serial UART adapter
   */
  static parseNmeaGgaSentence(nmeaString: string): GpsReading | null {
    if (!nmeaString.startsWith('$GPGGA') && !nmeaString.startsWith('$GNGGA')) {
      return null;
    }

    const parts = nmeaString.split('*')[0].split(',');
    if (parts.length < 10) return null;

    const fixQuality = parseInt(parts[6] || '0', 10);
    const numSats = parseInt(parts[7] || '0', 10);
    const isValid = fixQuality > 0;

    if (!isValid || !parts[2] || !parts[4]) {
      return {
        latitude: 0,
        longitude: 0,
        source: 'atgm336h_serial',
        timestamp: new Date().toISOString(),
        isValid: false,
        satellitesInView: numSats,
        rawSentence: nmeaString
      };
    }

    // Convert NMEA DDMM.MMMM to decimal degrees
    const rawLat = parseFloat(parts[2]);
    const latDeg = Math.floor(rawLat / 100);
    const latMin = rawLat - (latDeg * 100);
    let lat = latDeg + (latMin / 60);
    if (parts[3] === 'S') lat = -lat;

    const rawLng = parseFloat(parts[4]);
    const lngDeg = Math.floor(rawLng / 100);
    const lngMin = rawLng - (lngDeg * 100);
    let lng = lngDeg + (lngMin / 60);
    if (parts[5] === 'W') lng = -lng;

    const altitude = parts[9] ? parseFloat(parts[9]) : undefined;

    return {
      latitude: lat,
      longitude: lng,
      altitude,
      accuracyMeters: fixQuality === 2 ? 1.5 : 3.0,
      source: 'atgm336h_serial',
      timestamp: new Date().toISOString(),
      isValid: true,
      satellitesInView: numSats,
      rawSentence: nmeaString
    };
  }

  /**
   * Calculates distance in meters between two coordinates via Haversine formula
   */
  static calculateDistanceMeters(p1: GeoPoint, p2: GeoPoint): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
    const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
