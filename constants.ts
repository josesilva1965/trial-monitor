import { AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  reminderDaysBefore: 3,
  enableBrowserNotifications: false,
  enableEmailAlerts: true,
  emailAddress: '',
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
];

export const STORAGE_KEYS = {
  TRIALS: 'trialguard_trials',
  SETTINGS: 'trialguard_settings',
  NOTIFICATION_LOG: 'trialguard_notification_log',
};