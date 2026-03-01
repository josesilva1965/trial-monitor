import { Trial, AppSettings } from '../types';
import { calculateDaysRemaining, getEndDate } from './notificationService';

/**
 * Email Service — sends real emails via Formsubmit.co
 * No signup, no API keys. Just POST to their endpoint with the user's email.
 * First-time use: the user receives a confirmation email from Formsubmit to activate.
 * After that, all notifications are delivered automatically.
 */

const FORMSUBMIT_BASE = 'https://formsubmit.co/ajax';

export interface EmailResult {
    success: boolean;
    message: string;
}

/**
 * Send a trial expiry alert email for a specific trial.
 */
export const sendTrialExpiryEmail = async (
    trial: Trial,
    settings: AppSettings
): Promise<EmailResult> => {
    const { emailAddress } = settings;

    if (!emailAddress) {
        return { success: false, message: 'No notification email address configured.' };
    }

    const daysLeft = calculateDaysRemaining(trial.startDate, trial.lengthDays);
    const endDate = getEndDate(trial.startDate, trial.lengthDays);
    const formattedEndDate = endDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    try {
        const response = await fetch(`${FORMSUBMIT_BASE}/${emailAddress}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                _subject: `⏰ TrialGuard Alert: ${trial.serviceName} expires in ${Math.max(0, daysLeft)} day(s)`,
                'Service Name': trial.serviceName,
                'Days Remaining': Math.max(0, daysLeft).toString(),
                'End Date': formattedEndDate,
                'Monthly Cost': `${trial.currency} ${trial.cost.toFixed(2)}`,
                'Message': `Your free trial for ${trial.serviceName} expires on ${formattedEndDate}. Don't forget to cancel if you don't want to be charged!`,
                _template: 'table',
            }),
        });

        const data = await response.json();

        if (data.success === 'true' || data.success === true) {
            return { success: true, message: `Email sent to ${emailAddress}` };
        }
        return { success: false, message: data.message || 'Email delivery failed.' };
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('Formsubmit send failed:', error);
        return { success: false, message: `Failed to send email: ${errMsg}` };
    }
};

/**
 * Send a test email to verify email delivery.
 */
export const sendTestEmail = async (settings: AppSettings): Promise<EmailResult> => {
    const { emailAddress } = settings;

    if (!emailAddress) {
        return { success: false, message: 'Please enter a notification email address first.' };
    }

    try {
        const response = await fetch(`${FORMSUBMIT_BASE}/${emailAddress}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                _subject: '🧪 TrialGuard Test Notification',
                'Service Name': 'TrialGuard Test',
                'Days Remaining': '3',
                'End Date': new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                'Message': 'This is a test email from TrialGuard. If you received this, your email notifications are working!',
                _template: 'table',
            }),
        });

        const data = await response.json();

        if (data.success === 'true' || data.success === true) {
            return { success: true, message: `Test email sent to ${emailAddress}! Check your inbox.` };
        }
        return { success: false, message: data.message || 'Test email delivery failed. If this is your first time, check your inbox for a confirmation email from Formsubmit.' };
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('Formsubmit test failed:', error);
        return { success: false, message: `Test failed: ${errMsg}` };
    }
};
