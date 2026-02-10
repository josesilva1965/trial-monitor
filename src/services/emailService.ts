import emailjs from '@emailjs/browser';
import { Trial } from "@/types";

const STORAGE_KEYS = {
    SERVICE_ID: 'emailjs_service_id',
    TEMPLATE_ID: 'emailjs_template_id',
    PUBLIC_KEY: 'emailjs_public_key',
    ENABLED: 'email_notifications_enabled'
};

export const EmailService = {
    // Configuration Management
    getConfig: () => ({
        serviceId: localStorage.getItem(STORAGE_KEYS.SERVICE_ID) || '',
        templateId: localStorage.getItem(STORAGE_KEYS.TEMPLATE_ID) || '',
        publicKey: localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY) || '',
        enabled: localStorage.getItem(STORAGE_KEYS.ENABLED) === 'true'
    }),

    saveConfig: (serviceId: string, templateId: string, publicKey: string, enabled: boolean) => {
        localStorage.setItem(STORAGE_KEYS.SERVICE_ID, serviceId);
        localStorage.setItem(STORAGE_KEYS.TEMPLATE_ID, templateId);
        localStorage.setItem(STORAGE_KEYS.PUBLIC_KEY, publicKey);
        localStorage.setItem(STORAGE_KEYS.ENABLED, String(enabled));
    },

    // Sending Logic
    sendTrialAlert: async (trial: Trial, daysLeft: number) => {
        const config = EmailService.getConfig();
        if (!config.enabled || !config.serviceId || !config.templateId || !config.publicKey) {
            return { success: false, error: 'Email service not configured or disabled' };
        }

        // Initialize with public key
        emailjs.init(config.publicKey);

        const templateParams = {
            to_email: trial.email, // Assuming the trial has an email field, or user's email
            service_name: trial.serviceName,
            days_left: daysLeft,
            expiry_date: trial.endDate,
            message: daysLeft <= 0
                ? `Your ${trial.serviceName} trial has expired!`
                : `Your ${trial.serviceName} trial expires in ${daysLeft} days.`
        };

        try {
            const response = await emailjs.send(
                config.serviceId,
                config.templateId,
                templateParams
            );
            return { success: true, status: response.status };
        } catch (error) {
            console.error('Email sending failed:', error);
            return { success: false, error };
        }
    },

    testConnection: async (email: string) => {
        const config = EmailService.getConfig();
        if (!config.serviceId || !config.templateId || !config.publicKey) {
            throw new Error('Missing configuration');
        }

        emailjs.init(config.publicKey);

        return emailjs.send(
            config.serviceId,
            config.templateId,
            {
                to_email: email,
                service_name: "Test Service",
                days_left: 3,
                expiry_date: new Date().toISOString().split('T')[0],
                message: "This is a test notification from Trial Monitor."
            }
        );
    }
};
