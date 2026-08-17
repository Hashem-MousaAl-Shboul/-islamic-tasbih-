/**
 * Qibla utility functions — bearing & distance calculations to the Kaaba.
 * Kaaba coordinates: 21.4225°N, 39.8262°E
 */

export const KAABA_LATITUDE = 21.4225;
export const KAABA_LONGITUDE = 39.8262;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate the initial bearing (great circle) from point A to point B.
 * Returns bearing in degrees [0, 360) where 0 = North, 90 = East.
 *
 * Uses the standard spherical trigonometry formula:
 *   θ = atan2(sin(Δλ)·cos(φ₂),
 *             cos(φ₁)·sin(φ₂) − sin(φ₁)·cos(φ₂)·cos(Δλ))
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const φ1 = toRadians(from.latitude);
  const φ2 = toRadians(to.latitude);
  const Δλ = toRadians(to.longitude - from.longitude);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Calculate the Qibla bearing from a given location to the Kaaba.
 */
export function getQiblaBearing(location: Coordinates): number {
  return calculateBearing(location, {
    latitude: KAABA_LATITUDE,
    longitude: KAABA_LONGITUDE,
  });
}

/**
 * Haversine distance between two points in kilometers.
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371; // Earth radius in km
  const φ1 = toRadians(from.latitude);
  const φ2 = toRadians(to.latitude);
  const Δφ = toRadians(to.latitude - from.latitude);
  const Δλ = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Distance from a location to the Kaaba in kilometers.
 */
export function getDistanceToKaaba(location: Coordinates): number {
  return calculateDistance(location, {
    latitude: KAABA_LATITUDE,
    longitude: KAABA_LONGITUDE,
  });
}

/**
 * Compute the angular difference between two bearings.
 * Returns a value in [-180, 180].
 */
export function angularDifference(bearingA: number, bearingB: number): number {
  let diff = bearingA - bearingB;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

/**
 * Normalize an angle to [0, 360).
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
