import Sidebar from '../components/Sidebar';

const SettingsPage = () => (
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
              <input className="mt-2 w-full p-3" placeholder="support@boltmarket.com" />
            </div>
            <div className="rounded-3xl bg-slate-950 p-4">
              <label className="block text-sm text-slate-300">Notification Settings</label>
              <select className="mt-2 w-full p-3">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default SettingsPage;
