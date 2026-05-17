/**
 * Update domain entities and result models.
 */

export interface AvailableUpdate {
  version: string;
  currentVersion?: string;
  date?: string;
  notes?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  update?: AvailableUpdate;
  error?: string;
}
