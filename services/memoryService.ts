import { NotificationRecord } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * Memory Retention Service
 * Persists notification history to localStorage to prevent duplicate alerts
 * across page reloads and sessions.
 */

export const getNotificationLog = (): NotificationRecord[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_LOG);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading notification log', error);
        return [];
    }
};

const saveNotificationLog = (log: NotificationRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_LOG, JSON.stringify(log));
};

/**
 * Log a sent notification — appends to persistent memory.
 */
export const logNotification = (record: NotificationRecord): void => {
    const log = getNotificationLog();
    log.push(record);
    saveNotificationLog(log);
};

/**
 * Dedup check: has this trial already been notified via `type` within the last `windowHours`?
 * Prevents spamming the user with the same alert on every page load.
 */
export const hasBeenNotifiedRecently = (
    trialId: string,
    type: 'email' | 'browser',
    windowHours: number = 24
): boolean => {
    const log = getNotificationLog();
    const cutoff = Date.now() - windowHours * 60 * 60 * 1000;

    return log.some(
        (record) =>
            record.trialId === trialId &&
            record.type === type &&
            new Date(record.sentAt).getTime() > cutoff
    );
};

/**
 * Housekeeping: remove records older than `retentionDays` to prevent localStorage bloat.
 */
export const clearOldRecords = (retentionDays: number = 30): void => {
    const log = getNotificationLog();
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    const filtered = log.filter(
        (record) => new Date(record.sentAt).getTime() > cutoff
    );

    saveNotificationLog(filtered);
};
