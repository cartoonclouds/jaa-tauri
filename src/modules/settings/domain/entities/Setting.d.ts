export interface Setting {
  id: string;
  theme: "system" | "light" | "dark";
  locale: string;
  notificationsEnabled: boolean;
  developerMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertSettingInput {
  id?: string;
  theme?: Setting["theme"];
  locale?: string;
  notificationsEnabled?: boolean;
  developerMode?: boolean;
}
