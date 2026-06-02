import {
  geocodeLocation,
  resolveLocationFields,
} from "@shared/utils/geocoding";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("geocoding", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns coordinates when geocoding response has lat/lon", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ lat: "10.5", lon: "106.7" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await geocodeLocation("Ho Chi Minh City");

    expect(result).toEqual({ latitude: 10.5, longitude: 106.7 });
  });

  it("returns null for empty location input", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await geocodeLocation("   ");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("falls back to current coordinates when geocoding fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));

    const result = await resolveLocationFields({
      locationText: "New York",
      currentLatitude: 1.23,
      currentLongitude: 4.56,
    });

    expect(result).toEqual({
      locationText: "New York",
      locationLat: 1.23,
      locationLng: 4.56,
    });
  });

  it("clears coordinates when location text is empty", async () => {
    const result = await resolveLocationFields({
      locationText: "",
      currentLatitude: 1,
      currentLongitude: 2,
    });

    expect(result).toEqual({
      locationText: null,
      locationLat: null,
      locationLng: null,
    });
  });
});
