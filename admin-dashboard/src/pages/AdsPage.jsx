import Sidebar from '../components/Sidebar';

const AdsPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Advertisement Management</h1>
          <p className="mt-2 text-slate-400">Manage homepage banners, featured listings, and promotional campaigns.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white">Spring Sale Banner</h2>
                  <p className="text-slate-400">Status: Active</p>
                </div>
                <button className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default AdsPage;
