import { supabase } from './supabaseClient';
import { Trial, AppSettings } from '../types';

/**
 * Sync all trials to Supabase.
 * Upserts every trial and removes any that no longer exist locally.
 */
export const syncTrials = async (trials: Trial[]): Promise<void> => {
    try {
        // Map to DB schema
        const rows = trials.map((t) => ({
            id: t.id,
            service_name: t.serviceName,
            email: t.email,
            start_date: t.startDate,
            length_days: t.lengthDays,
            cost: t.cost,
            currency: t.currency,
            notes: t.notes,
            status: t.status,
            updated_at: new Date().toISOString(),
        }));

        if (rows.length > 0) {
            const { error } = await supabase
                .from('tg_trials')
                .upsert(rows, { onConflict: 'id' });

            if (error) {
                console.error('Supabase trial sync failed:', error.message);
                return;
            }
        }

        // Remove trials from Supabase that were deleted locally
        const localIds = trials.map((t) => t.id);
        const { data: remoteTrials } = await supabase
            .from('tg_trials')
            .select('id');

        if (remoteTrials) {
            const toDelete = remoteTrials
                .filter((r: { id: string }) => !localIds.includes(r.id))
                .map((r: { id: string }) => r.id);

            if (toDelete.length > 0) {
                await supabase.from('tg_trials').delete().in('id', toDelete);
            }
        }

        console.log(`[TrialGuard] Synced ${rows.length} trial(s) to Supabase`);
    } catch (err) {
        console.error('Trial sync error:', err);
    }
};

/**
 * Sync settings to Supabase (single-row upsert).
 */
export const syncSettings = async (settings: AppSettings): Promise<void> => {
    try {
        const { error } = await supabase
            .from('tg_settings')
            .upsert({
                id: 1,
                email_address: settings.emailAddress,
                enable_email_alerts: settings.enableEmailAlerts,
                reminder_days_before: settings.reminderDaysBefore,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });

        if (error) {
            console.error('Supabase settings sync failed:', error.message);
            return;
        }

        console.log('[TrialGuard] Settings synced to Supabase');
    } catch (err) {
        console.error('Settings sync error:', err);
    }
};

/**
 * Fetch all trials from Supabase.
 */
export const fetchTrials = async (): Promise<Trial[] | null> => {
    try {
        const { data, error } = await supabase
            .from('tg_trials')
            .select('*');

        if (error) {
            console.error('Supabase fetch trials failed:', error.message);
            return null;
        }

        if (!data) return [];

        return data.map((row: any) => ({
            id: row.id,
            serviceName: row.service_name,
            email: row.email,
            startDate: row.start_date,
            lengthDays: row.length_days,
            cost: row.cost,
            currency: row.currency,
            notes: row.notes,
            status: row.status,
        }));
    } catch (err) {
        console.error('Fetch trials error:', err);
        return null;
    }
};

/**
 * Fetch settings from Supabase.
 */
export const fetchSettings = async (): Promise<AppSettings | null> => {
    try {
        const { data, error } = await supabase
            .from('tg_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "no rows returned"
            console.error('Supabase fetch settings failed:', error.message);
            return null;
        }

        if (!data) return null;

        return {
            emailAddress: data.email_address,
            enableEmailAlerts: data.enable_email_alerts,
            reminderDaysBefore: data.reminder_days_before,
            enableBrowserNotifications: false, // Not synced, local preference
        };
    } catch (err) {
        console.error('Fetch settings error:', err);
        return null;
    }
};
