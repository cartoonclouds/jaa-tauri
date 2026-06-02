/**
 * Geographic coordinate pair.
 */
export interface LocationCoordinates {
  /** Latitude in decimal degrees. */
  latitude: number;
  /** Longitude in decimal degrees. */
  longitude: number;
}

/**
 * Normalized persisted location fields.
 */
export interface LocationFields {
  /** Free-form location text. */
  locationText: string | null;
  /** Latitude for geocoded location data. */
  locationLat: number | null;
  /** Longitude for geocoded location data. */
  locationLng: number | null;
}

/**
 * Optional location fields used by payloads and form data.
 */
export interface LocationFieldsInput {
  /** Free-form location text. */
  locationText?: string | null;
  /** Latitude for geocoded location data. */
  locationLat?: number | null;
  /** Longitude for geocoded location data. */
  locationLng?: number | null;
}
