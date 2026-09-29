import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Activity, ClipboardList, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEquipmentAssetStats } from '../../features/assets/api/assetQueries';
import type { RootState } from '../../store';

const normalizeStatus = (status: string) => status.trim().toLowerCase().replace(/_/g, ' ');

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user?.first_name || (user as any)?.firstName || (user as any)?.username || 'Asset Manager';
  const statsQuery = useEquipmentAssetStats();
  const summary = useMemo(() => {
    const counts = new Map<string, number>();
    let total = 0;

    for (const item of statsQuery.data ?? []) {
      const count = Number(item.count) || 0;
      total += count;
      const status = normalizeStatus(item.lifecycle_status || 'Unknown');
      counts.set(status, (counts.get(status) ?? 0) + count);
    }

    return {
      total,
      installed: counts.get('installed') ?? 0,
      repair: counts.get('sent to repair') ?? 0,
      retired: counts.get('retired') ?? 0,
      condemned: counts.get('condemned') ?? 0,
    };
  }, [statsQuery.data]);

  const metrics = [
    { label: 'Total Equipment', value: summary.total, accent: 'bg-slate-900', detail: 'All lifecycle statuses' },
    { label: 'Installed', value: summary.installed, accent: 'bg-emerald-500', detail: 'Ready for operation' },
    { label: 'Sent to Repair', value: summary.repair, accent: 'bg-amber-500', detail: 'Under repair' },
    { label: 'Retired', value: summary.retired, accent: 'bg-slate-400', detail: 'Retired equipment' },
    { label: 'Condemned', value: summary.condemned, accent: 'bg-rose-500', detail: 'Condemned equipment' },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 pb-12 sm:px-6 lg:px-8" aria-labelledby="dashboard-title">
      <header className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700">
            <ShieldAlert size={15} aria-hidden="true" /> Risk Based Inspection
          </div>
          <h1 id="dashboard-title" className="text-3xl font-bold tracking-tight text-slate-900">
            Equipment Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome, {userName}. Current lifecycle summary for registered equipment.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/risk/equipment-master')}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <ClipboardList size={17} aria-hidden="true" />
          Open Equipment Master
        </button>
      </header>

      {statsQuery.isError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
          <span>Unable to load Equipment Master overview.</span>
          <button
            type="button"
            onClick={() => void statsQuery.refetch()}
            className="inline-flex items-center gap-2 self-start font-semibold hover:text-rose-950 sm:self-auto"
          >
            <RefreshCw size={15} aria-hidden="true" /> Retry
          </button>
        </div>
      )}

      <section aria-label="Equipment lifecycle summary">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={18} className="text-rose-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-900">Equipment Summary</h2>
          {statsQuery.isFetching && !statsQuery.isLoading && (
            <span className="text-xs text-slate-400" role="status">Refreshing…</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <article key={metric.label} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className={`h-1.5 ${metric.accent}`} />
              <div className="p-5">
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                {statsQuery.isLoading ? (
                  <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-slate-100" aria-label={`Loading ${metric.label}`} />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900" data-testid={`equipment-count-${metric.label.toLowerCase().replace(/ /g, '-')}`}>
                    {metric.value.toLocaleString()}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">{metric.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Manage equipment lifecycle</h2>
          <p className="mt-1 text-sm text-slate-500">Search equipment by tag, review details, and update lifecycle status.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/risk/equipment-master')}
          className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
        >
          Go to Equipment Master
        </button>
      </section>
    </main>
  );
};

export default DashboardPage;
