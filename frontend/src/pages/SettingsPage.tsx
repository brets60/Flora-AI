import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Download,
  Trash2,
  Bell,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Save,
  Globe,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, theme, toggleTheme, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [language, setLanguage] = useState(user?.preferred_language || 'en');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [units, setUnits] = useState(user?.measurement_units || 'metric');
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [notifWatering, setNotifWatering] = useState(true);
  const [notifFertilizing, setNotifFertilizing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  // Account deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setAvatarUrl(user.avatar_url || '');
      setLanguage(user.preferred_language || 'en');
      setTimezone(user.timezone || 'UTC');
      setUnits(user.measurement_units || 'metric');
    }
    api.getHealth().then(setHealthStatus).catch(console.error);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || undefined,
        preferred_language: language,
        timezone,
        measurement_units: units,
        notification_preferences: {
          browser: notifBrowser,
          watering: notifWatering,
          fertilizing: notifFertilizing,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flora_ai_garden_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      logout();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-leaf-100 tracking-tight">
          Settings & Account
        </h2>
        <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted mt-1">
          Personalize your botanical experience, measurement tokens, and security preferences
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 sm:p-7 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-botanical-border/60">
            <UserIcon className="w-4 h-4 text-forest-700 dark:text-leaf-300" />
            <h3 className="text-sm font-bold text-forest-950 dark:text-leaf-200">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs outline-none focus:ring-2 focus:ring-forest-500/30"
              />
            </div>

            <div>
              <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-botanical-border/50 bg-gray-100 dark:bg-gray-800/50 text-xs text-botanical-muted cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 rounded-xl border border-botanical-border dark:border-botanical-darkBorder bg-botanical-bg/50 dark:bg-botanical-darkBg/50 text-xs outline-none focus:ring-2 focus:ring-forest-500/30"
              />
            </div>
          </div>
        </div>

        {/* Preferences & Measurement Tokens */}
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 sm:p-7 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-botanical-border/60">
            <Sliders className="w-4 h-4 text-forest-700 dark:text-leaf-300" />
            <h3 className="text-sm font-bold text-forest-950 dark:text-leaf-200">Botanical Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Measurement System</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card dark:bg-botanical-darkCard text-xs outline-none"
              >
                <option value="metric">Metric (cm, ml, °C)</option>
                <option value="imperial">Imperial (inches, cups, °F)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card dark:bg-botanical-darkCard text-xs outline-none"
              >
                <option value="en">English</option>
                <option value="es">Español (Spanish)</option>
                <option value="fr">Français (French)</option>
                <option value="de">Deutsch (German)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-forest-900 dark:text-leaf-300 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-botanical-border bg-botanical-card dark:bg-botanical-darkCard text-xs outline-none"
              >
                <option value="UTC">UTC (Universal)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & AI Engine */}
        <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-botanical-border dark:border-botanical-darkBorder p-6 sm:p-7 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-botanical-border/60">
            <Bell className="w-4 h-4 text-forest-700 dark:text-leaf-300" />
            <h3 className="text-sm font-bold text-forest-950 dark:text-leaf-200">Alert Preferences & AI Engine</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifWatering}
                onChange={(e) => setNotifWatering(e.target.checked)}
                className="w-4 h-4 text-forest-700 rounded border-botanical-border focus:ring-forest-500"
              />
              <span className="text-botanical-text dark:text-botanical-darkText font-medium">
                Watering Cadence Alerts (Notifies when topsoil drying window arrives)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifFertilizing}
                onChange={(e) => setNotifFertilizing(e.target.checked)}
                className="w-4 h-4 text-forest-700 rounded border-botanical-border focus:ring-forest-500"
              />
              <span className="text-botanical-text dark:text-botanical-darkText font-medium">
                Nutrient & Feeding Schedule Alerts
              </span>
            </label>
          </div>

          {/* AI Status box */}
          <div className="p-4 rounded-2xl bg-forest-50/60 dark:bg-forest-950/30 border border-forest-100 dark:border-forest-900/60 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-leaf-500" />
              <div>
                <p className="font-bold text-forest-900 dark:text-leaf-200">
                  AI Model Status: {healthStatus?.gemini_ai_configured ? 'Google Gemini 1.5 Flash Vision' : 'FloraAI Botanical Knowledge Engine'}
                </p>
                <p className="text-[11px] text-botanical-muted">
                  {healthStatus?.gemini_ai_configured
                    ? 'Connected to live Gemini Vision for multi-modal taxonomy and pathology'
                    : 'Operating in built-in offline mode. To activate live vision, set GEMINI_API_KEY in backend/.env.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          <div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved successfully!
              </span>
            )}
          </div>
          <Button type="submit" variant="primary" isLoading={isSaving} icon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone & Data Export */}
      <div className="bg-botanical-card dark:bg-botanical-darkCard rounded-3xl border border-rose-200 dark:border-rose-950 p-6 sm:p-7 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
          Data Export & Account Management
        </h3>
        <p className="text-xs text-botanical-muted leading-relaxed">
          You have full ownership of your botanical data. Download your complete garden registry or permanently erase your profile.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            icon={<Download className="w-4 h-4" />}
          >
            Export Garden JSON
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Permanently Delete Account?"
        subtitle="This action will permanently wipe your garden."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-botanical-muted leading-relaxed">
            Are you sure you want to delete your FloraAI account? All registered plants, care reminders, diagnosis history, and growth logs will be irreversibly erased.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
