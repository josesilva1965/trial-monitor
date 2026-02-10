import { useEffect } from 'react';
import { Trial } from "@/types";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { NotificationService } from "@/services/notificationService";
import { EmailService } from "@/services/emailService";

const NOTIFICATION_HISTORY_KEY = 'trial-monitor-notification-history';

interface NotificationHistory {
    [trialId: string]: string; // date string 'YYYY-MM-DD'
}

export function useNotificationScheduler(trials: Trial[]) {
    useEffect(() => {
        const checkNotifications = async () => {
            // 1. Request browser permission on load
            await NotificationService.requestPermission();

            // 2. Load history to prevent spam
            const history: NotificationHistory = JSON.parse(localStorage.getItem(NOTIFICATION_HISTORY_KEY) || '{}');
            const today = new Date().toISOString().split('T')[0];
            let historyUpdated = false;

            // 3. Check each trial
            for (const trial of trials) {
                if (!trial.isActive) continue;

                const daysLeft = differenceInCalendarDays(parseISO(trial.endDate), new Date());

                // Notify if expiring within 3 days (and not expired more than 1 day ago)
                if (daysLeft <= 3 && daysLeft >= -1) {

                    // Check if already notified TODAY
                    if (history[trial.id] === today) continue;

                    // Send Browser Notification
                    NotificationService.sendTrialAlert(trial, daysLeft);

                    // Send Email (if configured)
                    const emailConfig = EmailService.getConfig();
                    if (emailConfig.enabled) {
                        await EmailService.sendTrialAlert(trial, daysLeft);
                    }

                    // Update history
                    history[trial.id] = today;
                    historyUpdated = true;
                }
            }

            // 4. Save history
            if (historyUpdated) {
                localStorage.setItem(NOTIFICATION_HISTORY_KEY, JSON.stringify(history));
            }
        };

        checkNotifications();

        // Run check every hour (just in case app is left open)
        const interval = setInterval(checkNotifications, 60 * 60 * 1000);
        return () => clearInterval(interval);

    }, [trials]);
}
