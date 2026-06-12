import type {
  LocationCoordinates,
  LocationFields,
  LocationFieldsInput,
} from "@shared/types/location";

/**
 * Geographic coordinates resolved from a location query.
 */
type GeocodingCoordinates = LocationCoordinates;

/**
 * Input used when resolving location coordinates before persistence.
 */
export interface ResolveCoordinatesInput {
  locationText: LocationFieldsInput["locationText"];
  currentLatitude: LocationFieldsInput["locationLat"];
  currentLongitude: LocationFieldsInput["locationLng"];
}

/**
 * Output payload for location persistence fields.
 */
export type ResolvedLocationFields = LocationFields;

/**
 * Resolve location text into latitude/longitude using a public geocoding endpoint.
 */
async function geocodeLocation(
  locationText: string,
): Promise<GeocodingCoordinates | null> {
  const query = locationText.trim();
  if (!query) {
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || payload.length === 0) {
      return null;
    }

    const first = payload[0] as { lat?: unknown; lon?: unknown };
    const parseCoordinate = (value: unknown): number => {
      if (typeof value === "number") {
        return value;
      }

      if (typeof value === "string") {
        return Number.parseFloat(value);
      }

      return Number.NaN;
    };

    const latitude = parseCoordinate(first.lat);
    const longitude = parseCoordinate(first.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  }
}

/**
 * Resolve normalized location fields for persistence.
 */
export async function resolveLocationFields(
  input: ResolveCoordinatesInput,
): Promise<ResolvedLocationFields> {
  const normalizedLocationText = input.locationText?.trim() ?? "";
  if (!normalizedLocationText) {
    return {
      locationText: null,
      locationLat: null,
      locationLng: null,
    };
  }

  const geocoded = await geocodeLocation(normalizedLocationText);
  if (!geocoded) {
    return {
      locationText: normalizedLocationText,
      locationLat: input.currentLatitude ?? null,
      locationLng: input.currentLongitude ?? null,
    };
  }

  return {
    locationText: normalizedLocationText,
    locationLat: geocoded.latitude,
    locationLng: geocoded.longitude,
  };
}
