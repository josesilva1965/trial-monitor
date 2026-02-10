import { useState, useEffect } from 'react';
import { Trial } from '@/types';

const STORAGE_KEY = 'trial-monitor-data';

export function useTrials() {
    const [trials, setTrials] = useState<Trial[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
    }, [trials]);

    const addTrial = (trial: Trial) => {
        setTrials(prev => [...prev, trial]);
    };

    const deleteTrial = (id: string) => {
        setTrials(prev => prev.filter(t => t.id !== id));
    };

    const updateTrial = (updatedTrial: Trial) => {
        setTrials(prev => prev.map(t => t.id === updatedTrial.id ? updatedTrial : t));
    };

    return { trials, addTrial, deleteTrial, updateTrial };
}
