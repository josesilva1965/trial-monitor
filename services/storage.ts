import { Trial, AppSettings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';

export const getTrials = (): Trial[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRIALS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading trials', error);
    return [];
  }
};

export const saveTrial = (trial: Trial): void => {
  const trials = getTrials();
  const existingIndex = trials.findIndex(t => t.id === trial.id);
  
  if (existingIndex >= 0) {
    trials[existingIndex] = trial;
  } else {
    trials.push(trial);
  }
  
  localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(trials));
};

export const deleteTrial = (id: string): void => {
  const trials = getTrials().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(trials));
};

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Seed initial data for demo if empty
export const seedInitialData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TRIALS)) {
    const today = new Date();
    const mockTrials: Trial[] = [
      {
        id: '1',
        serviceName: 'Netflix Premium',
        email: 'user@example.com',
        startDate: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        lengthDays: 30,
        cost: 19.99,
        currency: 'USD',
        notes: 'Cancel if I dont watch enough movies',
        status: 'ACTIVE'
      },
      {
        id: '2',
        serviceName: 'Adobe Creative Cloud',
        email: 'design@work.com',
        startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lengthDays: 7,
        cost: 54.99,
        currency: 'USD',
        notes: 'Testing Photoshop new AI features',
        status: 'ACTIVE'
      },
      {
        id: '3',
        serviceName: 'Spotify Duo',
        email: 'music@life.com',
        startDate: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lengthDays: 90,
        cost: 12.99,
        currency: 'USD',
        notes: '3 months free promo',
        status: 'ACTIVE'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(mockTrials));
  }
};