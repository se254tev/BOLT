import Sidebar from '../components/Sidebar';

const UsersPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">User Management</h1>
          <p className="mt-2 text-slate-400">Suspend, activate, or inspect seller profiles and buyers.</p>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-slate-400">Name</th>
                  <th className="px-4 py-3 text-slate-400">Email</th>
                  <th className="px-4 py-3 text-slate-400">Role</th>
                  <th className="px-4 py-3 text-slate-400">Status</th>
                  <th className="px-4 py-3 text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="px-4 py-4">Alex Seller</td>
                  <td className="px-4 py-4">alex@boltmarket.com</td>
                  <td className="px-4 py-4">seller</td>
                  <td className="px-4 py-4">Active</td>
                  <td className="px-4 py-4 space-x-2">
                    <button className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950">Suspend</button>
                    <button className="rounded-full bg-slate-700 px-3 py-1 text-xs text-slate-200">View</button>
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

export default UsersPage;
