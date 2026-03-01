export interface Trial {
  id: string;
  serviceName: string;
  email: string;
  password?: string;
  startDate: string; // ISO String
  lengthDays: number;
  cost: number;
  currency: string;
  notes: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export interface NotificationRecord {
  trialId: string;
  trialName: string;
  sentAt: string; // ISO timestamp
  type: 'email' | 'browser';
  emailAddress?: string;
}

export interface AppSettings {
  reminderDaysBefore: number;
  enableBrowserNotifications: boolean;
  enableEmailAlerts: boolean;
  emailAddress: string;
}

export type ViewState = 'DASHBOARD' | 'ADD_TRIAL' | 'SETTINGS' | 'EDIT_TRIAL';

export interface TrialStats {
  activeCount: number;
  monthlyPotentialCost: number;
  expiringSoonCount: number;
}