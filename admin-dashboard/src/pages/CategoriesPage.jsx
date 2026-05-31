import Sidebar from '../components/Sidebar';

const CategoriesPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Category Management</h1>
          <p className="mt-2 text-slate-400">Create, update, or delete marketplace categories.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white">Electronics</h2>
                <div className="space-x-2">
                  <button className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">Edit</button>
                  <button className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default CategoriesPage;
