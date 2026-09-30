import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Activity, ClipboardList, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEquipmentAssetStats } from '../../features/assets/api/assetQueries';
import StatCard from '../../features/assets/components/StatCard';
import StatDetailModal from '../../features/assets/components/StatDetailModal';
import type { RootState } from '../../store';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user?.first_name || (user as any)?.firstName || (user as any)?.username || 'Asset Manager';
  const statsQuery = useEquipmentAssetStats();
  const [selectedClass, setSelectedClass] = useState<{ class: string; count: number } | null>(null);
  const stats = useMemo(
    () => (statsQuery.data ?? []).filter((item) => item.count > 0),
    [statsQuery.data]
  );

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 pb-12 sm:px-6 lg:px-8" aria-labelledby="dashboard-title">
      <header className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700">
            <ShieldAlert size={15} aria-hidden="true" /> Risk Based Inspection
          </div>
          <h1 id="dashboard-title" className="text-3xl font-bold tracking-tight text-slate-900">Equipment Overview</h1>
          <p className="mt-2 text-sm text-slate-500">Welcome, {userName}. Equipment counts grouped by imported class.</p>
        </div>
        <button type="button" onClick={() => navigate('/risk/equipment-master')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
          <ClipboardList size={17} aria-hidden="true" /> Open Equipment Master
        </button>
      </header>

      {statsQuery.isError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
          <span>Unable to load Equipment Master overview.</span>
          <button type="button" onClick={() => void statsQuery.refetch()} className="inline-flex items-center gap-2 self-start font-semibold hover:text-rose-950 sm:self-auto">
            <RefreshCw size={15} aria-hidden="true" /> Retry
          </button>
        </div>
      )}

      <section aria-label="Equipment class summary">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-rose-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900">Equipment Summary</h2>
          {statsQuery.isFetching && !statsQuery.isLoading && <span className="text-xs text-slate-400" role="status">Refreshing…</span>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.class} title={item.class} count={item.count} isLoading={statsQuery.isLoading}
              isActive={selectedClass?.class === item.class} description="Equipment class · click to view assets"
              onClick={() => setSelectedClass(item)} />
          ))}
          {statsQuery.isLoading && <StatCard title="Equipment class" count={0} isLoading onClick={() => undefined} />}
          {!statsQuery.isLoading && !statsQuery.isError && stats.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">No equipment classes have been imported yet.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-semibold text-slate-900">Manage equipment lifecycle</h2><p className="mt-1 text-sm text-slate-500">Search equipment by tag, review details, and update lifecycle status.</p></div>
        <button type="button" onClick={() => navigate('/risk/equipment-master')} className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100">Go to Equipment Master</button>
      </section>

      {selectedClass && <StatDetailModal key={selectedClass.class} open title={selectedClass.class} count={selectedClass.count} equipmentClass={selectedClass.class} onClose={() => setSelectedClass(null)} />}
    </main>
  );
};

export default DashboardPage;
