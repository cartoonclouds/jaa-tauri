/**
 * Update domain entities and result models.
 */

export interface AvailableUpdate {
  version: string;
  currentVersion?: string;
  date?: string;
  notes?: string;
}

export interface UpdateInstallProgress {
  downloadedBytes: number;
  contentLength: number | null;
}

export interface UpdateInstallResult {
  success: boolean;
  error?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  update?: AvailableUpdate;
  error?: string;
}
