import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { notifyToast } from '../utils/toast';

const SettingsPage = () => {
  const [supportEmail, setSupportEmail] = useState('support@boltmarket.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', {
        supportEmail,
        notificationsEnabled,
      });
      notifyToast('Settings saved successfully');
    } catch (err) {
      notifyToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
            <h1 className="text-3xl font-semibold text-white">Platform Settings</h1>
            <p className="mt-2 text-slate-400">Update contact information, notification preferences, and platform wide settings.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-950 p-4">
                <label className="block text-sm text-slate-300">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 p-3 text-white"
                  placeholder="support@boltmarket.com"
                />
              </div>
              <div className="rounded-3xl bg-slate-950 p-4">
                <label className="block text-sm text-slate-300">Notifications</label>
                <select
                  value={notificationsEnabled ? 'enabled' : 'disabled'}
                  onChange={(e) => setNotificationsEnabled(e.target.value === 'enabled')}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 p-3 text-white"
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
