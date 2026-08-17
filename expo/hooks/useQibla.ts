/**
 * useQibla — combines device location, magnetometer (compass), and
 * Qibla bearing calculations to provide a real-time compass direction
 * toward the Kaaba in Makkah.
 *
 * - Requests foreground location permission and fetches current position.
 * - Subscribes to the magnetometer sensor for real-time heading.
 * - Computes compass heading from magnetometer X/Y readings.
 * - Estimates accuracy from magnetic field strength.
 * - Triggers haptic feedback when the phone is aligned with the Qibla.
 *
 * No-op (returns null state) on platforms where sensors are unavailable.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, type AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import {
  getQiblaBearing,
  getDistanceToKaaba,
  angularDifference,
  normalizeAngle,
  type Coordinates,
} from '@/utils/qiblaUtils';

export type CompassAccuracy = 'low' | 'medium' | 'high' | 'unavailable';

export interface QiblaState {
  /** User's current coordinates, or null if unknown. */
  location: Coordinates | null;
  /** Bearing from user to Kaaba in degrees [0, 360). */
  qiblaBearing: number | null;
  /** Great-circle distance to Kaaba in km. */
  distanceToKaaba: number | null;
  /** Current compass heading of the device in degrees [0, 360). */
  heading: number | null;
  /** Estimated accuracy of the compass reading. */
  accuracy: CompassAccuracy;
  /** True when the phone is aligned with the Qibla direction. */
  isAligned: boolean;
  /** True while fetching the user's location. */
  isLoadingLocation: boolean;
  /** Error message for the user, or null. */
  error: string | null;
  /** Whether location permission was denied. */
  permissionDenied: boolean;
}

export interface QiblaActions {
  /** Re-request permission and re-fetch location. */
  refreshLocation: () => Promise<void>;
}

// Magnetometer sensor types — loaded dynamically to avoid crashes on platforms
// where the native module is not available.
interface MagnetometerSubscription { remove: () => void }
interface MagnetometerReading { x: number; y: number; z: number }
interface MagnetometerModule {
  addListener: (cb: (r: MagnetometerReading) => void) => MagnetometerSubscription;
  setUpdateInterval: (ms: number) => void;
}

let magnetometerMod: MagnetometerModule | null = null;
let magnetLoadPromise: Promise<MagnetometerModule | null> | null = null;

async function loadMagnetometer(): Promise<MagnetometerModule | null> {
  if (magnetometerMod) return magnetometerMod;
  if (magnetLoadPromise) return magnetLoadPromise;
  magnetLoadPromise = (async () => {
    try {
      const mod = await import('expo-sensors');
      const sensor = (mod as any).Magnetometer;
      if (!sensor) {
        console.log('[Qibla] Magnetometer sensor not found in expo-sensors');
        return null;
      }
      magnetometerMod = {
        addListener: sensor.addListener.bind(sensor),
        setUpdateInterval: sensor.setUpdateInterval.bind(sensor),
      };
      return magnetometerMod;
    } catch (e) {
      console.log('[Qibla] expo-sensors not available:', e);
      return null;
    }
  })();
  return magnetLoadPromise;
}

const SENSOR_INTERVAL_MS = 100;
const ALIGNED_THRESHOLD_DEG = 3;
const ALIGNED_HYSTERESIS_DEG = 6;
const LOW_ACCURACY_THRESHOLD = 25;
const HIGH_ACCURACY_THRESHOLD = 15;

export function useQibla(): QiblaState & QiblaActions {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [distanceToKaaba, setDistanceToKaaba] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<CompassAccuracy>('unavailable');
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  const isAlignedRef = useRef<boolean>(false);
  const headingRef = useRef<number | null>(null);
  const qiblaBearingRef = useRef<number | null>(null);
  const magnetSubRef = useRef<MagnetometerSubscription | null>(null);

  const refreshLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setError('permission');
        setIsLoadingLocation(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coordinates = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      setLocation(coords);
      const bearing = getQiblaBearing(coords);
      const distance = getDistanceToKaaba(coords);
      qiblaBearingRef.current = bearing;
      setQiblaBearing(bearing);
      setDistanceToKaaba(distance);
    } catch (e) {
      console.log('[Qibla] Location error:', e);
      setError('location');
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  // Fetch location on mount and when app returns to foreground.
  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoadingLocation(false);
      setAccuracy('unavailable');
      return;
    }

    void refreshLocation();

    const handleAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        void refreshLocation();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [refreshLocation]);

  // Subscribe to magnetometer for compass heading.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;

    const setupMagnetometer = async () => {
      const mod = await loadMagnetometer();
      if (!mod || cancelled) return;

      try {
        mod.setUpdateInterval(SENSOR_INTERVAL_MS);
      } catch {}

      if (magnetSubRef.current) {
        try { magnetSubRef.current.remove(); } catch {}
        magnetSubRef.current = null;
      }

      const sub = mod.addListener((reading: MagnetometerReading) => {
        if (cancelled) return;

        // Compute heading from magnetometer X/Y.
        // The formula atan2(y, x) gives the angle relative to magnetic north.
        // We negate and adjust for the device coordinate system so that
        // 0 = North, 90 = East, 180 = South, 270 = West.
        let rawHeading = Math.atan2(reading.y, reading.x) * (180 / Math.PI);
        rawHeading = normalizeAngle(rawHeading);

        // Estimate accuracy from total magnetic field magnitude.
        const magnitude = Math.sqrt(
          reading.x * reading.x +
          reading.y * reading.y +
          reading.z * reading.z
        );

        // Typical Earth magnetic field: 25–65 µT. Values far outside
        // this range indicate interference.
        let newAccuracy: CompassAccuracy;
        if (magnitude < 10 || magnitude > 120) {
          newAccuracy = 'low';
        } else {
          const deviation = Math.abs(magnitude - 45);
          if (deviation <= HIGH_ACCURACY_THRESHOLD) {
            newAccuracy = 'high';
          } else if (deviation <= LOW_ACCURACY_THRESHOLD) {
            newAccuracy = 'medium';
          } else {
            newAccuracy = 'low';
          }
        }

        headingRef.current = rawHeading;
        setHeading(rawHeading);
        setAccuracy(newAccuracy);

        // Check alignment with Qibla using hysteresis to prevent flapping.
        const bearing = qiblaBearingRef.current;
        if (bearing !== null) {
          const diff = Math.abs(angularDifference(rawHeading, bearing));

          if (!isAlignedRef.current && diff <= ALIGNED_THRESHOLD_DEG) {
            isAlignedRef.current = true;
            setIsAligned(true);
            // Haptic feedback when aligned.
            if (Platform.OS !== 'web') {
              void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            }
          } else if (isAlignedRef.current && diff > ALIGNED_HYSTERESIS_DEG) {
            isAlignedRef.current = false;
            setIsAligned(false);
          }
        }
      });

      magnetSubRef.current = sub;
    };

    void setupMagnetometer();

    return () => {
      cancelled = true;
      if (magnetSubRef.current) {
        try { magnetSubRef.current.remove(); } catch {}
        magnetSubRef.current = null;
      }
    };
  }, []);

  return {
    location,
    qiblaBearing,
    distanceToKaaba,
    heading,
    accuracy,
    isAligned,
    isLoadingLocation,
    error,
    permissionDenied,
    refreshLocation,
  };
}
