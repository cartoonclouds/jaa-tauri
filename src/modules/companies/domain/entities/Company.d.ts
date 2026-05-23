/**
 * Company entity used for application tracking.
 */
export interface Company {
  /** Unique company identifier. */
  id: string;
  /** Company name. */
  name: string;
  /** Company website URL, when available. */
  websiteUrl: string | null;
  /** LinkedIn company URL, when available. */
  linkedinUrl: string | null;
  /** Industry classification, when available. */
  industry: string | null;
  /** Company size descriptor, when available. */
  size: string | null;
  /** Free-form location text. */
  locationText: string | null;
  /** Latitude for geocoded location data. */
  locationLat: number | null;
  /** Longitude for geocoded location data. */
  locationLng: number | null;
  /** Additional notes about the company. */
  notes: string | null;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a company.
 */
export interface CreateCompanyInput {
  /** Company name. */
  name: string;
  /** Free-form location text. */
  locationText?: string | null;
  /** Latitude for geocoded location data. */
  locationLat?: number | null;
  /** Longitude for geocoded location data. */
  locationLng?: number | null;
}



