import Sidebar from '../components/Sidebar';

const ProductsPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Product Moderation</h1>
              <p className="mt-2 text-slate-400">Approve, reject, or delete marketplace product listings.</p>
            </div>
            <button className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Refresh</button>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-slate-400">Product</th>
                  <th className="px-4 py-3 text-slate-400">Seller</th>
                  <th className="px-4 py-3 text-slate-400">Status</th>
                  <th className="px-4 py-3 text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="px-4 py-4">Sample Product</td>
                  <td className="px-4 py-4">seller@example.com</td>
                  <td className="px-4 py-4">Pending</td>
                  <td className="px-4 py-4 space-x-2">
                    <button className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">Approve</button>
                    <button className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Reject</button>
                    <button className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default ProductsPage;
