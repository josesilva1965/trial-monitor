import { Trial } from '../types';

export const calculateDaysRemaining = (startDate: string, lengthDays: number): number => {
  const start = new Date(startDate).getTime();
  const end = start + (lengthDays * 24 * 60 * 60 * 1000);
  const now = new Date().getTime();
  
  const diffTime = end - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

export const getEndDate = (startDate: string, lengthDays: number): Date => {
  const start = new Date(startDate);
  return new Date(start.getTime() + (lengthDays * 24 * 60 * 60 * 1000));
};

export const getExpiringTrials = (trials: Trial[], daysThreshold: number): Trial[] => {
  return trials.filter(trial => {
    if (trial.status !== 'ACTIVE') return false;
    const daysLeft = calculateDaysRemaining(trial.startDate, trial.lengthDays);
    return daysLeft <= daysThreshold && daysLeft >= 0;
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendBrowserNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png' });
  }
};