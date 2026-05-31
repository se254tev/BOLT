import Sidebar from '../components/Sidebar';

const PropertiesPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Property Moderation</h1>
          <p className="mt-2 text-slate-400">Review property listings to approve, reject, or remove listings.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Lake House</h2>
                  <p className="text-slate-400">seller@example.com</p>
                </div>
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950">Pending</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Approve</button>
                <button className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white">Reject</button>
                <button className="rounded-2xl bg-slate-700 px-4 py-2 text-sm text-slate-200">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default PropertiesPage;
