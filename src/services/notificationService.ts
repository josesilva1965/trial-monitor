import { Trial } from "@/types";

export const NotificationService = {
    requestPermission: async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        }

        return false;
    },

    sendTrialAlert: (trial: Trial, daysLeft: number) => {
        if (Notification.permission === "granted") {
            const title = `Trial Expiring: ${trial.serviceName}`;
            const body = daysLeft <= 0
                ? `Your ${trial.serviceName} trial has expired!`
                : `Only ${daysLeft} days left for ${trial.serviceName}. Cancel now if needed.`;

            new Notification(title, {
                body,
                icon: "/vite.svg", // Using default vite icon for now
                tag: `trial-${trial.id}` // Prevents duplicate notifications
            });
        }
    }
};
