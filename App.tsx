import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Trial, ViewState, AppSettings } from './types';
import { getTrials, saveTrial, deleteTrial, getSettings, saveSettings, seedInitialData } from './services/storage';
import { getExpiringTrials, requestNotificationPermission, sendBrowserNotification, calculateDaysRemaining } from './services/notificationService';
import { hasBeenNotifiedRecently, logNotification, clearOldRecords } from './services/memoryService';
import { sendTrialExpiryEmail, sendTestEmail } from './services/emailService';
import { syncTrials, syncSettings, fetchTrials, fetchSettings } from './services/supabaseSync';
import { LayoutDashboard, Plus, Settings as SettingsIcon, Bell, X, CheckCircle, Clock, CreditCard, Send, Mail, AlertTriangle } from 'lucide-react';
import { CURRENCIES, STORAGE_KEYS } from './constants';
import Button from './components/Button';
import TrialCard from './components/TrialCard';
import Banner from './components/Banner';
import StatsChart from './components/StatsChart';
import DatePicker from './components/DatePicker';

// Helper for generating IDs
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper for local date string YYYY-MM-DD
const getTodayString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Sub-components defined here to keep file structure simple as requested ---

// --- Header ---
const Header: React.FC<{
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}> = ({ currentView, onChangeView }) => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center cursor-pointer" onClick={() => onChangeView('DASHBOARD')}>
          <div className="flex-shrink-0 flex items-center text-teal-600">
            <Clock className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl text-slate-900 tracking-tight">TrialGuard</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden sm:flex sm:items-center sm:space-x-8">
          <button
            onClick={() => onChangeView('DASHBOARD')}
            className={`${currentView === 'DASHBOARD' ? 'border-teal-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-all`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => onChangeView('SETTINGS')}
            className={`${currentView === 'SETTINGS' ? 'border-teal-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-all`}
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </button>
          <div className="ml-4">
            <Button onClick={() => onChangeView('ADD_TRIAL')} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Trial
            </Button>
          </div>
        </div>

        {/* Mobile menu button (Simplified for demo) */}
        <div className="flex items-center sm:hidden">
          <Button variant="ghost" size="sm" onClick={() => onChangeView(currentView === 'ADD_TRIAL' ? 'DASHBOARD' : 'ADD_TRIAL')}>
            {currentView === 'ADD_TRIAL' ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </div>
  </header>
);

// --- Add/Edit Trial Form ---
const AddTrialView: React.FC<{
  onSave: (trial: Trial) => void,
  onCancel: () => void,
  initialData?: Trial | null
}> = ({ onSave, onCancel, initialData }) => {
  const [durationMode, setDurationMode] = useState<'length' | 'endDate'>('length');
  const [formData, setFormData] = useState({
    serviceName: initialData?.serviceName || '',
    email: initialData?.email || '',
    password: initialData?.password || '',
    startDate: initialData?.startDate ? (initialData.startDate.includes('T') ? initialData.startDate.split('T')[0] : initialData.startDate) : getTodayString(),
    lengthDays: initialData?.lengthDays || 14,
    cost: initialData?.cost || 0,
    currency: initialData?.currency || 'USD',
    notes: initialData?.notes || '',
  });

  // Derive endDate from startDate + lengthDays
  const computedEndDate = useMemo(() => {
    const start = new Date(formData.startDate + 'T00:00:00');
    const end = new Date(start.getTime() + formData.lengthDays * 24 * 60 * 60 * 1000);
    const y = end.getFullYear();
    const m = String(end.getMonth() + 1).padStart(2, '0');
    const d = String(end.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [formData.startDate, formData.lengthDays]);

  const [endDateInput, setEndDateInput] = useState(computedEndDate);

  // When switching to endDate mode, sync the input
  useEffect(() => {
    if (durationMode === 'endDate') {
      setEndDateInput(computedEndDate);
    }
  }, [durationMode, computedEndDate]);

  const handleEndDateChange = (date: string) => {
    setEndDateInput(date);
    const start = new Date(formData.startDate + 'T00:00:00');
    const end = new Date(date + 'T00:00:00');
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    setFormData({ ...formData, lengthDays: diffDays });
  };

  const handleStartDateChange = (date: string) => {
    if (durationMode === 'endDate') {
      // Keep end date fixed, recalculate length
      const start = new Date(date + 'T00:00:00');
      const end = new Date(endDateInput + 'T00:00:00');
      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      setFormData({ ...formData, startDate: date, lengthDays: diffDays });
    } else {
      setFormData({ ...formData, startDate: date });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrial: Trial = {
      id: initialData?.id || generateId(),
      serviceName: formData.serviceName,
      email: formData.email,
      password: formData.password,
      startDate: formData.startDate,
      lengthDays: Number(formData.lengthDays),
      cost: Number(formData.cost),
      currency: formData.currency,
      notes: formData.notes,
      status: initialData?.status || 'ACTIVE'
    };
    onSave(newTrial);
  };

  const selectedSymbol = CURRENCIES.find(c => c.code === formData.currency)?.symbol || '$';
  const title = initialData ? 'Edit Subscription Trial' : 'Add New Subscription Trial';
  const saveLabel = initialData ? 'Update Trial' : 'Save Trial';

  const LENGTH_PRESETS = [7, 14, 30];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700">Service Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Netflix, Adobe, AWS"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border text-slate-900 bg-white"
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700">Associated Email</label>
              <input
                required
                type="email"
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border text-slate-900 bg-white"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700">Password (Optional)</label>
              <input
                type="text"
                placeholder="Password"
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border text-slate-900 bg-white"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={handleStartDateChange}
                required
              />
            </div>

            {/* Duration Mode Toggle + Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Trial Duration</label>
              {/* Segmented toggle */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden mb-3">
                <button
                  type="button"
                  onClick={() => setDurationMode('length')}
                  className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${durationMode === 'length'
                    ? 'bg-teal-600 text-white shadow-inner'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  Days
                </button>
                <button
                  type="button"
                  onClick={() => setDurationMode('endDate')}
                  className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-all duration-200 border-l border-slate-200 ${durationMode === 'endDate'
                    ? 'bg-teal-600 text-white shadow-inner'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  End Date
                </button>
              </div>

              {durationMode === 'length' ? (
                <>
                  <div className="flex space-x-2 mb-2">
                    {LENGTH_PRESETS.map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFormData({ ...formData, lengthDays: days })}
                        className={`
                          px-3 py-1 text-xs font-medium rounded-full border transition-all duration-200
                          ${formData.lengthDays === days
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600'}
                        `}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                  <input
                    required
                    type="number"
                    min="1"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border text-slate-900 bg-white"
                    value={formData.lengthDays}
                    onChange={(e) => setFormData({ ...formData, lengthDays: Number(e.target.value) })}
                  />
                </>
              ) : (
                <>
                  <DatePicker
                    label=""
                    value={endDateInput}
                    onChange={handleEndDateChange}
                    required
                    min={formData.startDate}
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    {formData.lengthDays} day{formData.lengthDays !== 1 ? 's' : ''} from start
                  </p>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Monthly Cost (After Trial)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 sm:text-sm">{selectedSymbol}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-7 pr-20 sm:text-sm border-slate-300 rounded-md p-2 border text-slate-900 bg-white"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <label htmlFor="currency" className="sr-only">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    className="focus:ring-teal-500 focus:border-teal-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-slate-500 sm:text-sm rounded-md cursor-pointer"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border text-slate-900 bg-white"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{saveLabel}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Settings View ---
const SettingsView: React.FC<{ settings: AppSettings, onSave: (s: AppSettings) => void }> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = () => {
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);

    if (localSettings.enableBrowserNotifications && !settings.enableBrowserNotifications) {
      requestNotificationPermission().then(granted => {
        if (granted) sendBrowserNotification("Notifications Enabled", "You will now receive alerts for expiring trials.");
      });
    }
  };

  const handleTestEmail = async () => {
    if (!localSettings.emailAddress) return;
    setIsSendingTest(true);
    setTestResult(null);

    const result = await sendTestEmail(localSettings);
    setTestResult(result);
    setIsSendingTest(false);
    setTimeout(() => setTestResult(null), 6000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2 text-slate-500" />
            Settings
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Notifications */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">Browser Notifications</span>
                  <span className="text-sm text-slate-500">Receive push alerts on desktop and mobile.</span>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, enableBrowserNotifications: !localSettings.enableBrowserNotifications })}
                  className={`${localSettings.enableBrowserNotifications ? 'bg-teal-600' : 'bg-slate-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                >
                  <span className={`${localSettings.enableBrowserNotifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">Email Alerts</span>
                  <span className="text-sm text-slate-500">Receive email when trials are about to expire. Powered by Formsubmit.</span>
                </div>
                <button
                  onClick={() => setLocalSettings({ ...localSettings, enableEmailAlerts: !localSettings.enableEmailAlerts })}
                  className={`${localSettings.enableEmailAlerts ? 'bg-teal-600' : 'bg-slate-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                >
                  <span className={`${localSettings.enableEmailAlerts ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Preferences</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-slate-700">
                  Default Reminder (Days Before)
                </label>
                <div className="mt-1">
                  <select
                    value={localSettings.reminderDaysBefore}
                    onChange={(e) => setLocalSettings({ ...localSettings, reminderDaysBefore: Number(e.target.value) })}
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border text-slate-900 bg-white"
                  >
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">7 Days</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-slate-700">
                  Notification Email
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="email"
                    value={localSettings.emailAddress}
                    onChange={(e) => setLocalSettings({ ...localSettings, emailAddress: e.target.value })}
                    placeholder="Enter your email"
                    className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border text-slate-900 bg-white"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTestEmail}
                    disabled={!localSettings.emailAddress}
                    isLoading={isSendingTest}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Test
                  </Button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  First time? You'll receive a confirmation email from Formsubmit to activate.
                </p>
                {testResult && (
                  <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-sm ${testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                    {testResult.success
                      ? <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-5 flex justify-end">
            <Button onClick={handleSave} disabled={isSaved}>
              {isSaved ? 'Saved!' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [showBanner, setShowBanner] = useState(true);
  const [editingTrial, setEditingTrial] = useState<Trial | null>(null);

  useEffect(() => {
    const initData = async () => {
      seedInitialData();
      const loadedTrials = getTrials();
      const loadedSettings = getSettings();
      setTrials(loadedTrials);
      setSettings(loadedSettings);
      clearOldRecords();

      // Fetch remote data
      const [remoteTrials, remoteSettings] = await Promise.all([
        fetchTrials(),
        fetchSettings()
      ]);

      // Sync Trials
      if (remoteTrials && remoteTrials.length > 0) {
        setTrials(remoteTrials);
        localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(remoteTrials));
      } else {
        syncTrials(loadedTrials);
      }

      // Sync Settings
      if (remoteSettings) {
        // Keep local-only prefs (browser notifications)
        const merged = {
          ...loadedSettings,
          ...remoteSettings,
          enableBrowserNotifications: loadedSettings.enableBrowserNotifications
        };
        setSettings(merged);
        saveSettings(merged);
      } else {
        syncSettings(loadedSettings);
      }
    };
    initData();
  }, []);

  // --- Notification engine: runs when trials or settings change ---
  const processNotifications = useCallback(async () => {
    const expiring = getExpiringTrials(trials, settings.reminderDaysBefore);
    if (expiring.length === 0) return;

    for (const trial of expiring) {
      const daysLeft = calculateDaysRemaining(trial.startDate, trial.lengthDays);

      // Browser notification (deduplicated)
      if (settings.enableBrowserNotifications && !hasBeenNotifiedRecently(trial.id, 'browser', 24)) {
        sendBrowserNotification(
          `${trial.serviceName} expires in ${daysLeft} day(s)`,
          `Don't forget to cancel before you get charged ${trial.currency} ${trial.cost.toFixed(2)}/mo.`
        );
        logNotification({ trialId: trial.id, trialName: trial.serviceName, sentAt: new Date().toISOString(), type: 'browser' });
      }

      // Email notification (deduplicated)
      if (settings.enableEmailAlerts && settings.emailAddress && !hasBeenNotifiedRecently(trial.id, 'email', 24)) {
        const result = await sendTrialExpiryEmail(trial, settings);
        if (result.success) {
          logNotification({ trialId: trial.id, trialName: trial.serviceName, sentAt: new Date().toISOString(), type: 'email', emailAddress: settings.emailAddress });
        }
      }
    }
  }, [trials, settings]);

  useEffect(() => {
    processNotifications();
  }, [processNotifications]);

  const handleSaveTrial = (trial: Trial) => {
    saveTrial(trial);
    const updatedTrials = getTrials();
    setTrials(updatedTrials);
    setView('DASHBOARD');
    setEditingTrial(null);
    syncTrials(updatedTrials);
  };

  const handleEditTrial = (trial: Trial) => {
    setEditingTrial(trial);
    setView('EDIT_TRIAL');
  };

  const handleDeleteTrial = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trial?')) {
      deleteTrial(id);
      const updatedTrials = getTrials();
      setTrials(updatedTrials);
      syncTrials(updatedTrials);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    syncSettings(newSettings);
  };

  const activeTrials = useMemo(() => trials.filter(t => t.status === 'ACTIVE'), [trials]);
  const expiringTrials = useMemo(() => getExpiringTrials(trials, settings.reminderDaysBefore), [trials, settings]);
  // Per-currency cost totals
  const costByCurrency = useMemo(() => {
    const map: Record<string, number> = {};
    activeTrials.forEach(t => {
      map[t.currency] = (map[t.currency] || 0) + t.cost;
    });
    return Object.entries(map).map(([code, total]) => ({
      code,
      symbol: CURRENCIES.find(c => c.code === code)?.symbol || code,
      total,
    }));
  }, [activeTrials]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header currentView={view} onChangeView={(v) => {
        if (v !== 'EDIT_TRIAL') setEditingTrial(null);
        setView(v);
      }} />

      {showBanner && <Banner expiringTrials={expiringTrials} onDismiss={() => setShowBanner(false)} />}

      <main className="flex-grow">
        {view === 'DASHBOARD' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-100 p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
                    <CheckCircle className="h-6 w-6 text-teal-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Active Trials</dt>
                      <dd className="text-2xl font-bold text-slate-900">{activeTrials.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-100 p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                    <Bell className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Expiring Soon</dt>
                      <dd className="text-2xl font-bold text-slate-900">{expiringTrials.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-100 p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                    <CreditCard className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Potential Monthly Cost</dt>
                      {costByCurrency.length === 0 ? (
                        <dd className="text-2xl font-bold text-slate-900">$0.00</dd>
                      ) : costByCurrency.length === 1 ? (
                        <dd className="text-2xl font-bold text-slate-900">{costByCurrency[0].symbol}{costByCurrency[0].total.toFixed(2)}</dd>
                      ) : (
                        <dd className="mt-1 space-y-0.5">
                          {costByCurrency.map(c => (
                            <div key={c.code} className="text-lg font-bold text-slate-900">
                              {c.symbol}{c.total.toFixed(2)} <span className="text-xs font-medium text-slate-400">{c.code}</span>
                            </div>
                          ))}
                        </dd>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Your Subscriptions</h2>
                  {/* Filter placeholder could go here */}
                </div>

                {activeTrials.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200 border-dashed">
                    <LayoutDashboard className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No active trials</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by adding a new subscription trial.</p>
                    <div className="mt-6">
                      <Button onClick={() => setView('ADD_TRIAL')}>
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Trial
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTrials.map(trial => (
                      <TrialCard
                        key={trial.id}
                        trial={trial}
                        onDelete={handleDeleteTrial}
                        onEdit={handleEditTrial}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar / Chart */}
              <div className="lg:col-span-1">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Cost Breakdown</h2>
                <StatsChart trials={trials} />

                <div className="mt-6 bg-navy-900 rounded-xl p-6 text-white bg-slate-900">
                  <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Most services charge automatically if you don't cancel 24h before the trial ends. We'll remind you 3 days early!
                  </p>
                  <Button size="sm" variant="secondary" onClick={() => setView('SETTINGS')}>Configure Alerts</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'ADD_TRIAL' && (
          <AddTrialView onSave={handleSaveTrial} onCancel={() => setView('DASHBOARD')} />
        )}

        {view === 'EDIT_TRIAL' && (
          <AddTrialView
            onSave={handleSaveTrial}
            onCancel={() => {
              setView('DASHBOARD');
              setEditingTrial(null);
            }}
            initialData={editingTrial}
          />
        )}

        {view === 'SETTINGS' && (
          <SettingsView settings={settings} onSave={handleSaveSettings} />
        )}
      </main>
    </div>
  );
}