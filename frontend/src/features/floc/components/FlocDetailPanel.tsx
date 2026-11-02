// platform/frontend-mui/src/features/floc/components/FlocDetailPanel.tsx
import React, { useMemo, useState } from 'react';
import {
  FolderTree,
  ChevronRight,
  Home,
  CheckCircle2,
  Package,
  Layers,
  MapPin,
  Search,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import type { FlocNode, InstalledEquipment } from '../../../types/floc';
import { getLevelBadgeClass, getLevelCategoryName } from './FlocTreeNode';

export interface FlocDetailPanelProps {
  selectedNode: FlocNode | null;
  onSelectNodeByCode?: (code: string) => void;
}

export const FlocDetailPanel: React.FC<FlocDetailPanelProps> = ({
  selectedNode,
  onSelectNodeByCode,
}) => {
  const [equipmentSearch, setEquipmentSearch] = useState('');

  // Extract equipment list from node
  const equipments = useMemo((): InstalledEquipment[] => {
    if (!selectedNode) return [];
    return (
      selectedNode.equipments ??
      selectedNode.installed_equipments ??
      []
    );
  }, [selectedNode]);

  // Filter equipment by search term
  const filteredEquipments = useMemo(() => {
    const q = equipmentSearch.trim().toLowerCase();
    if (!q) return equipments;
    return equipments.filter(
      (eq) =>
        eq.tag_number.toLowerCase().includes(q) ||
        eq.name.toLowerCase().includes(q) ||
        eq.asset_class.toLowerCase().includes(q) ||
        eq.asset_type.toLowerCase().includes(q)
    );
  }, [equipments, equipmentSearch]);

  // Parse path breadcrumbs
  const breadcrumbItems = useMemo(() => {
    if (!selectedNode) return [];
    if (selectedNode.path) {
      return selectedNode.path.split(' > ').map((p) => p.trim());
    }
    return [selectedNode.description || selectedNode.code];
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
          <FolderTree size={32} />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Pilih Functional Location</h3>
        <p className="mt-1 text-xs max-w-sm text-slate-500">
          Klik salah satu node pohon hierarki di panel sebelah kiri untuk melihat rincian lokasi,
          jalur navigasi (breadcrumbs), dan daftar peralatan yang terpasang.
        </p>
      </div>
    );
  }

  const equipmentCount = selectedNode.installed_equipment_count ?? equipments.length;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* 1. Header & Quick Status */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold border ${getLevelBadgeClass(
                  selectedNode.level
                )}`}
              >
                Level {selectedNode.level} • L{selectedNode.level}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {getLevelCategoryName(selectedNode.level)}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={12} className="text-emerald-600" />
                {selectedNode.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{selectedNode.code}</span>
              {selectedNode.description && (
                <span className="text-base font-normal text-slate-600">
                  — {selectedNode.description}
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Peralatan Terpasang</div>
              <div className="text-xl font-bold text-slate-900">{equipmentCount}</div>
            </div>
          </div>
        </div>

        {/* 2. Full Hierarchy Path (Breadcrumbs) */}
        <div className="mt-4 pt-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin size={13} className="text-blue-600" />
            Path Hierarki Lengkap (Hierarchy Path)
          </div>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
          >
            <span className="text-slate-400 inline-flex items-center">
              <Home size={14} className="text-slate-400" />
            </span>
            {breadcrumbItems.map((item, idx) => {
              const isLast = idx === breadcrumbItems.length - 1;
              return (
                <React.Fragment key={idx}>
                  <ChevronRight size={12} className="text-slate-400 shrink-0" />
                  <span
                    onClick={() => onSelectNodeByCode?.(item)}
                    className={`font-medium ${
                      isLast
                        ? 'text-blue-700 font-semibold bg-blue-100/60 px-2 py-0.5 rounded'
                        : 'text-slate-600 hover:text-blue-600 cursor-pointer hover:underline'
                    }`}
                  >
                    {item}
                  </span>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. Location KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Kode FLOC</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block font-mono">
            {selectedNode.code}
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Tingkat Kedalaman</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block">
            L{selectedNode.level} (Kedalaman {selectedNode.level})
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Sub-Lokasi (Children)</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block">
            {selectedNode.children?.length ?? 0} Lokasi
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block">Status Terpasang</span>
          <span className="text-sm font-bold text-emerald-700 mt-1 block flex items-center gap-1">
            <Package size={14} />
            {equipmentCount} Unit
          </span>
        </div>
      </div>

      {/* 4. Installed Equipment Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              Daftar Equipment Terpasang (Installed)
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {equipments.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Peralatan industri yang aktif dan terpasang pada lokasi fungsional ini
            </p>
          </div>

          {equipments.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari tag, nama, kelas..."
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          {equipments.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-48 text-slate-500">
              <AlertCircle size={28} className="text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-600">
                Tidak ada peralatan yang terpasang di lokasi fungsional ini.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan modul Equipment Master atau Lifecycle Action (Install) untuk memasang aset ke lokasi ini.
              </p>
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Tidak ada peralatan yang cocok dengan filter pencarian "{equipmentSearch}".
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Tag Number</th>
                  <th className="py-2.5 px-4">Equipment Name</th>
                  <th className="py-2.5 px-4">Asset Class</th>
                  <th className="py-2.5 px-4">Asset Type</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Criticality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipments.map((eq) => (
                  <tr
                    key={eq.id}
                    className="hover:bg-slate-50/80 transition-colors group text-slate-700"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 flex items-center gap-1.5">
                      {eq.tag_number || '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {eq.name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                        {eq.asset_class || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {eq.asset_type || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        {eq.status || 'Installed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {eq.criticality ? (
                        <span
                          className={`inline-block w-6 h-6 rounded-full text-[11px] font-bold leading-6 text-center ${
                            eq.criticality >= 4
                              ? 'bg-rose-100 text-rose-800'
                              : eq.criticality === 3
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                          title={`Criticality: ${eq.criticality}`}
                        >
                          {eq.criticality}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

