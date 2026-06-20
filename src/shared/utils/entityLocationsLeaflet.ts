import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type * as LeafletNamespace from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

/**
 * Defines mappable entity.
 */
export interface MappableEntity {
  id: string;
  name: string;
  locationText: string | null;
  locationLat: number | null;
  locationLng: number | null;
  subtitle: string;
  openHref: string;
  openLabel: string;
}

/**
 * Defines leaflet map manager options.
 */
interface LeafletMapManagerOptions {
  onError?: (message: string) => void;
}

/**
 * Type alias for leaflet marker cluster group.
 */
type LeafletMarkerClusterGroup = LeafletNamespace.MarkerClusterGroup;

/**
 * Defines leaflet map manager.
 */
export interface LeafletMapManager {
  initialize(container: HTMLDivElement): Promise<void>;
  render(
    entities: MappableEntity[],
    onMarkerClick: (entityId: string) => void,
  ): void;
  focusSelectedEntity(entityId: string | null, openPopup: boolean): void;
  destroy(): void;
}

/**
 * Builds popup content.
 */
function buildPopupContent(entity: MappableEntity): HTMLDivElement {
  const root = document.createElement("div");
  root.className = "app-map-popup";

  const title = document.createElement("strong");
  title.className = "app-map-popup-title";
  title.textContent = entity.name;

  const subtitle = document.createElement("div");
  subtitle.className = "app-map-popup-subtitle";
  subtitle.textContent = entity.subtitle;

  const location = document.createElement("div");
  location.className = "app-map-popup-location";
  location.textContent = entity.locationText ?? "No location label";

  const action = document.createElement("a");
  action.className = "app-map-popup-link";
  action.href = entity.openHref;
  action.textContent = entity.openLabel;

  root.append(title, subtitle, location, action);
  return root;
}

/**
 * Creates entity locations leaflet manager.
 */
export function createEntityLocationsLeafletManager(
  options: LeafletMapManagerOptions = {},
): LeafletMapManager {
  let leaflet: typeof LeafletNamespace | null = null;
  let leafletMap: LeafletMap | null = null;
  let markerClusterLayer: LeafletMarkerClusterGroup | null = null;
  let mapInitializationPromise: Promise<void> | null = null;
  let mapContainer: HTMLDivElement | null = null;
  const markerByEntityId = new Map<string, LeafletMarker>();

  const reportError = (message: string): void => {
    options.onError?.(message);
  };

  const initializeLeafletMapInternal = async (): Promise<void> => {
    if (!import.meta.client || !mapContainer) {
      return;
    }

    const leafletModule = await import("leaflet");
    const leafletRuntime =
      "default" in leafletModule && leafletModule.default
        ? leafletModule.default
        : { ...leafletModule };

    const leafletGlobal = globalThis as typeof globalThis & {
      L?: typeof LeafletNamespace;
    };
    leafletGlobal.L = leafletRuntime;
    await import("leaflet.markercluster");

    leaflet = leafletRuntime;

    const markerClusterFactory = (
      leaflet as typeof LeafletNamespace & {
        markerClusterGroup?: (
          options?: Record<string, unknown>,
        ) => LeafletMarkerClusterGroup;
      }
    ).markerClusterGroup;

    if (typeof markerClusterFactory !== "function") {
      reportError(
        "Map clustering plugin failed to initialize in this environment.",
      );
      return;
    }

    if ((mapContainer as { _leaflet_id?: number })._leaflet_id) {
      (mapContainer as { _leaflet_id?: number })._leaflet_id = undefined;
    }

    const map = leaflet.map(mapContainer, {
      preferCanvas: true,
      zoomControl: true,
    });

    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })
      .addTo(map);

    const clusterLayer = markerClusterFactory({
      chunkedLoading: true,
      iconCreateFunction(cluster) {
        const count = cluster.getChildCount();
        return leafletRuntime.divIcon({
          className: "app-map-cluster-icon",
          html: `<span>${count.toString()}</span>`,
          iconSize: [40, 40],
        });
      },
      maxClusterRadius: 60,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
    });

    leafletMap = map;
    markerClusterLayer = clusterLayer;
    map.addLayer(clusterLayer);
  };

  return {
    async initialize(container: HTMLDivElement): Promise<void> {
      mapContainer = container;

      if (!import.meta.client) {
        return;
      }

      if (leafletMap && markerClusterLayer) {
        return;
      }

      if (mapInitializationPromise) {
        await mapInitializationPromise;
        return;
      }

      mapInitializationPromise = initializeLeafletMapInternal();
      try {
        await mapInitializationPromise;
      } finally {
        mapInitializationPromise = null;
      }
    },

    render(
      entities: MappableEntity[],
      onMarkerClick: (entityId: string) => void,
    ): void {
      if (!leaflet || !leafletMap || !markerClusterLayer) {
        return;
      }

      markerByEntityId.clear();
      markerClusterLayer.clearLayers();

      if (!entities.length) {
        leafletMap.setView([20, 0], 2);
        return;
      }

      const bounds = leaflet.latLngBounds([]);

      for (const entity of entities) {
        if (entity.locationLat === null || entity.locationLng === null) {
          continue;
        }

        const marker = leaflet.marker(
          [entity.locationLat, entity.locationLng],
          {
            icon: leaflet.divIcon({
              className: "app-map-pin-icon",
              html: '<span class="app-map-pin-dot"></span>',
              iconSize: [22, 22],
              iconAnchor: [11, 11],
              popupAnchor: [0, -10],
            }),
          },
        );

        marker.bindPopup(buildPopupContent(entity));
        marker.on("click", () => {
          onMarkerClick(entity.id);
        });

        markerByEntityId.set(entity.id, marker);
        markerClusterLayer.addLayer(marker);
        bounds.extend([entity.locationLat, entity.locationLng]);
      }

      if (bounds.isValid()) {
        leafletMap.fitBounds(bounds, { maxZoom: 13, padding: [24, 24] });
      }

      leafletMap.invalidateSize();
    },

    focusSelectedEntity(entityId: string | null, openPopup: boolean): void {
      if (!leafletMap || !markerClusterLayer || !entityId) {
        return;
      }

      const marker = markerByEntityId.get(entityId);
      if (!marker) {
        return;
      }

      markerClusterLayer.zoomToShowLayer(marker, () => {
        if (!leafletMap) {
          return;
        }

        leafletMap.panTo(marker.getLatLng(), { animate: true });
        if (openPopup) {
          marker.openPopup();
        }
      });
    },

    destroy(): void {
      markerByEntityId.clear();
      markerClusterLayer = null;
      mapInitializationPromise = null;
      mapContainer = null;

      if (leafletMap) {
        leafletMap.remove();
        leafletMap = null;
      }
    },
  };
}
