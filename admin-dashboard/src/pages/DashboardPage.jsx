import Sidebar from '../components/Sidebar';

const DashboardPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Admin Analytics</h1>
          <p className="mt-2 text-slate-400">Overview of users, products, properties, and approvals.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {['Total Users', 'Total Sellers', 'Total Products', 'Total Properties', 'Total Orders', 'Revenue'].map((title) => (
              <div key={title} className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</p>
                <p className="mt-4 text-3xl font-semibold text-white">--</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default DashboardPage;
