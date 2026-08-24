/**
 * useQibla
 *
 * Qibla compass for Expo / React Native.
 *
 * Uses:
 * - expo-location for GPS
 * - expo-location watchHeadingAsync for device heading
 * - No expo-sensors
 * - No Magnetometer
 * - No Accelerometer
 *
 * Features:
 * - Current location
 * - Qibla bearing
 * - Distance to Kaaba
 * - Device heading
 * - Compass accuracy
 * - Circular heading smoothing
 * - Qibla alignment detection
 * - Haptic feedback
 * - Android / iOS support
 * - Safe lifecycle handling
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AppState,
  Platform,
  type AppStateStatus,
} from 'react-native';

import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import {
  getQiblaBearing,
  getDistanceToKaaba,
  angularDifference,
  normalizeAngle,
  type Coordinates,
} from '@/utils/qiblaUtils';

// ============================================================
// TYPES
// ============================================================

export type CompassAccuracy =
  | 'low'
  | 'medium'
  | 'high'
  | 'unavailable';

export interface QiblaState {
  /**
   * Current user coordinates.
   */
  location: Coordinates | null;

  /**
   * Qibla bearing from current location.
   *
   * 0   = North
   * 90  = East
   * 180 = South
   * 270 = West
   */
  qiblaBearing: number | null;

  /**
   * Distance to Kaaba in kilometers.
   */
  distanceToKaaba: number | null;

  /**
   * Current device heading.
   *
   * 0   = North
   * 90  = East
   * 180 = South
   * 270 = West
   */
  heading: number | null;

  /**
   * Compass calibration accuracy.
   */
  accuracy: CompassAccuracy;

  /**
   * Magnetic field.
   *
   * Not available in this implementation.
   */
  magneticField: number | null;

  /**
   * Whether the device is currently
   * aligned with Qibla.
   */
  isAligned: boolean;

  /**
   * Whether location is loading.
   */
  isLoadingLocation: boolean;

  /**
   * Error code.
   */
  error: string | null;

  /**
   * Whether location permission was denied.
   */
  permissionDenied: boolean;
}

export interface QiblaActions {
  refreshLocation: () => Promise<void>;
}

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Prevent unnecessary repeated GPS requests.
 */
const LOCATION_REFRESH_COOLDOWN_MS =
  60 * 1000;

/**
 * Heading smoothing.
 *
 * Higher = faster response.
 * Lower = smoother movement.
 */
const HEADING_SMOOTHING_FACTOR = 0.22;

/**
 * User is considered aligned when
 * heading difference is <= 5 degrees.
 */
const ALIGNED_THRESHOLD_DEG = 5;

/**
 * Hysteresis.
 *
 * Once aligned, the user must move
 * beyond 9 degrees before alignment
 * becomes false.
 */
const ALIGNED_HYSTERESIS_DEG = 9;

/**
 * Minimum time between haptic feedback.
 */
const HAPTIC_COOLDOWN_MS = 3000;

// ============================================================
// HELPERS
// ============================================================

/**
 * Convert Expo heading accuracy number
 * into application accuracy.
 *
 * Expo:
 *
 * 3 = high
 * 2 = medium
 * 1 = low
 * 0 = none
 */
function mapCompassAccuracy(
  accuracy: number
): CompassAccuracy {
  switch (accuracy) {
    case 3:
      return 'high';

    case 2:
      return 'medium';

    case 1:
      return 'low';

    default:
      return 'unavailable';
  }
}

/**
 * Circular angle smoothing.
 *
 * Correctly handles:
 *
 * 359° → 0°
 *
 * instead of rotating backwards
 * through 180°.
 */
function smoothAngle(
  current: number,
  target: number,
  factor: number
): number {
  const difference = angularDifference(
    target,
    current
  );

  return normalizeAngle(
    current + difference * factor
  );
}

// ============================================================
// HOOK
// ============================================================

export function useQibla(): QiblaState & QiblaActions {
  // ==========================================================
  // STATE
  // ==========================================================

  const [location, setLocation] =
    useState<Coordinates | null>(null);

  const [qiblaBearing, setQiblaBearing] =
    useState<number | null>(null);

  const [distanceToKaaba, setDistanceToKaaba] =
    useState<number | null>(null);

  const [heading, setHeading] =
    useState<number | null>(null);

  const [accuracy, setAccuracy] =
    useState<CompassAccuracy>('unavailable');

  const [isAligned, setIsAligned] =
    useState(false);

  const [isLoadingLocation, setIsLoadingLocation] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [permissionDenied, setPermissionDenied] =
    useState(false);

  // ==========================================================
  // REFS
  // ==========================================================

  const qiblaBearingRef =
    useRef<number | null>(null);

  const smoothedHeadingRef =
    useRef<number | null>(null);

  const isAlignedRef =
    useRef(false);

  const lastHapticTimeRef =
    useRef(0);

  const lastLocationRefreshRef =
    useRef(0);

  const headingSubscriptionRef =
    useRef<Location.LocationSubscription | null>(
      null
    );

  // ==========================================================
  // LOCATION
  // ==========================================================

  const refreshLocation =
    useCallback(async () => {
      const now = Date.now();

      /**
       * Prevent repeated GPS requests.
       *
       * The first request is always allowed
       * because the ref initially contains 0.
       */
      if (
        now -
          lastLocationRefreshRef.current <
        LOCATION_REFRESH_COOLDOWN_MS
      ) {
        return;
      }

      lastLocationRefreshRef.current =
        now;

      setIsLoadingLocation(true);
      setError(null);
      setPermissionDenied(false);

      try {
        // ------------------------------------------------------
        // LOCATION PERMISSION
        // ------------------------------------------------------

        const {
          status,
        } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setPermissionDenied(true);
          setError('permission');

          return;
        }

        // ------------------------------------------------------
        // CURRENT LOCATION
        // ------------------------------------------------------

        const position =
          await Location.getCurrentPositionAsync({
            accuracy:
              Location.Accuracy.Balanced,
          });

        const coords: Coordinates = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        };

        // ------------------------------------------------------
        // QIBLA
        // ------------------------------------------------------

        const bearing =
          getQiblaBearing(coords);

        const distance =
          getDistanceToKaaba(coords);

        // ------------------------------------------------------
        // UPDATE QIBLA REF
        // ------------------------------------------------------

        qiblaBearingRef.current =
          bearing;

        // ------------------------------------------------------
        // UPDATE STATE
        // ------------------------------------------------------

        setLocation(coords);

        setQiblaBearing(
          bearing
        );

        setDistanceToKaaba(
          distance
        );
      } catch (e) {
        console.log(
          '[Qibla] Location error:',
          e
        );

        setError('location');
      } finally {
        setIsLoadingLocation(false);
      }
    }, []);

  // ==========================================================
  // LOCATION LIFECYCLE
  // ==========================================================

  useEffect(() => {
    /**
     * Web does not support the native
     * compass functionality used here.
     */
    if (Platform.OS === 'web') {
      setIsLoadingLocation(false);
      setAccuracy('unavailable');

      return;
    }

    /**
     * Allow initial request.
     */
    lastLocationRefreshRef.current = 0;

    void refreshLocation();

    // --------------------------------------------------------
    // APP STATE
    // --------------------------------------------------------

    const handleAppStateChange = (
      nextState: AppStateStatus
    ) => {
      if (
        nextState === 'active'
      ) {
        void refreshLocation();
      }
    };

    const subscription =
      AppState.addEventListener(
        'change',
        handleAppStateChange
      );

    // --------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------

    return () => {
      subscription.remove();
    };
  }, [refreshLocation]);

  // ==========================================================
  // DEVICE HEADING
  // ==========================================================

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let cancelled = false;

    const startHeading =
      async () => {
        /**
         * Make sure previous subscription
         * does not remain active.
         */
        if (
          headingSubscriptionRef.current
        ) {
          try {
            headingSubscriptionRef.current.remove();
          } catch {}

          headingSubscriptionRef.current =
            null;
        }

        try {
          /**
           * Expo Location provides the device
           * compass heading directly.
           */
          const subscription =
            await Location.watchHeadingAsync(
              (headingData) => {
                if (cancelled) {
                  return;
                }

                /**
                 * trueHeading is preferred when
                 * available.
                 *
                 * It requires location permission.
                 *
                 * If unavailable (-1), use
                 * magnetic heading.
                 */
                let newHeading =
                  headingData.trueHeading;

                if (
                  !Number.isFinite(
                    newHeading
                  ) ||
                  newHeading < 0
                ) {
                  newHeading =
                    headingData.magHeading;
                }

                if (
                  !Number.isFinite(
                    newHeading
                  ) ||
                  newHeading < 0
                ) {
                  setAccuracy(
                    'unavailable'
                  );

                  return;
                }

                newHeading =
                  normalizeAngle(
                    newHeading
                  );

                // ----------------------------------------------
                // ACCURACY
                // ----------------------------------------------

                const newAccuracy =
                  mapCompassAccuracy(
                    headingData.accuracy
                  );

                setAccuracy(
                  newAccuracy
                );

                // ----------------------------------------------
                // SMOOTH HEADING
                // ----------------------------------------------

                let smoothHeading =
                  newHeading;

                if (
                  smoothedHeadingRef.current ===
                  null
                ) {
                  smoothedHeadingRef.current =
                    newHeading;
                } else {
                  smoothHeading =
                    smoothAngle(
                      smoothedHeadingRef.current,
                      newHeading,
                      HEADING_SMOOTHING_FACTOR
                    );

                  smoothedHeadingRef.current =
                    smoothHeading;
                }

                setHeading(
                  smoothHeading
                );

                // ----------------------------------------------
                // QIBLA ALIGNMENT
                // ----------------------------------------------

                const bearing =
                  qiblaBearingRef.current;

                if (
                  bearing === null
                ) {
                  return;
                }

                const difference =
                  Math.abs(
                    angularDifference(
                      smoothHeading,
                      bearing
                    )
                  );

                // ----------------------------------------------
                // ENTER ALIGNED
                // ----------------------------------------------

                if (
                  !isAlignedRef.current &&
                  difference <=
                    ALIGNED_THRESHOLD_DEG
                ) {
                  isAlignedRef.current =
                    true;

                  setIsAligned(true);

                  // --------------------------------------------
                  // HAPTIC
                  // --------------------------------------------

                  const now =
                    Date.now();

                  if (
                    now -
                      lastHapticTimeRef.current >=
                    HAPTIC_COOLDOWN_MS
                  ) {
                    lastHapticTimeRef.current =
                      now;

                    void Haptics
                      .notificationAsync(
                        Haptics
                          .NotificationFeedbackType
                          .Success
                      )
                      .catch(() => {});
                  }
                }

                // ----------------------------------------------
                // EXIT ALIGNED
                // ----------------------------------------------

                else if (
                  isAlignedRef.current &&
                  difference >
                    ALIGNED_HYSTERESIS_DEG
                ) {
                  isAlignedRef.current =
                    false;

                  setIsAligned(false);
                }
              },
              (reason) => {
                if (cancelled) {
                  return;
                }

                console.log(
                  '[Qibla] Heading error:',
                  reason
                );

                setAccuracy(
                  'unavailable'
                );
              }
            );

          if (cancelled) {
            subscription.remove();
            return;
          }

          headingSubscriptionRef.current =
            subscription;
        } catch (e) {
          if (cancelled) {
            return;
          }

          console.log(
            '[Qibla] Failed to start heading:',
            e
          );

          setAccuracy(
            'unavailable'
          );

          setHeading(null);
        }
      };

    void startHeading();

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      cancelled = true;

      if (
        headingSubscriptionRef.current
      ) {
        try {
          headingSubscriptionRef.current.remove();
        } catch {}

        headingSubscriptionRef.current =
          null;
      }

      smoothedHeadingRef.current =
        null;

      isAlignedRef.current =
        false;

      setIsAligned(false);
    };
  }, []);

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    location,

    qiblaBearing,

    distanceToKaaba,

    heading,

    accuracy,

    /**
     * We deliberately do not expose
     * raw magnetic-field information.
     */
    magneticField: null,

    isAligned,

    isLoadingLocation,

    error,

    permissionDenied,

    refreshLocation,
  };
}