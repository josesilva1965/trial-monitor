export type TrialStatus = 'Active' | 'Expiring Soon' | 'Expired';

export interface Trial {
    id: string;
    serviceName: string;
    email: string;
    startDate: string; // ISO Date String
    endDate: string; // ISO Date String
    durationLabel: '7 Days' | '14 Days' | '30 Days' | 'Custom';
    isActive: boolean;
    price?: number;
    currency?: string;
}
