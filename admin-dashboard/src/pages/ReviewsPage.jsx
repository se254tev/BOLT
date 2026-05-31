import Sidebar from '../components/Sidebar';

const ReviewsPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100">
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold text-white">Review Moderation</h1>
          <p className="mt-2 text-slate-400">Delete inappropriate reviews and protect buyer trust.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Great product but delivery delay</p>
                  <p className="mt-1 text-slate-400 text-sm">by user@example.com on Product A</p>
                </div>
                <button className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default ReviewsPage;
