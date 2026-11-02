// platform/frontend-mui/src/pages/floc/FunctionalLocationsPage.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FolderTree,
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Database,
  ArrowUpDown,
} from 'lucide-react';
import { useFlocTree } from '../../features/floc/api/flocQueries';
import { FlocTreeNode } from '../../features/floc/components/FlocTreeNode';
import { FlocDetailPanel } from '../../features/floc/components/FlocDetailPanel';
import type { FlocNode } from '../../types/floc';

export const FunctionalLocationsPage: React.FC = () => {
  const { data: treeData = [], isLoading, isError, refetch } = useFlocTree();

  const [selectedNode, setSelectedNode] = useState<FlocNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');

  // Index all nodes by ID and Code for fast in-memory lookups
  const { nodeMap, codeMap, totalCount, allNodeIds } = useMemo(() => {
    const nMap = new Map<number, FlocNode>();
    const cMap = new Map<string, FlocNode>();
    const ids: number[] = [];
    let count = 0;

    const traverse = (nodes: FlocNode[]) => {
      for (const node of nodes) {
        nMap.set(node.id, node);
        cMap.set(node.code.toLowerCase(), node);
        if (node.description) {
          cMap.set(node.description.toLowerCase(), node);
        }
        ids.push(node.id);
        count++;
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      }
    };

    traverse(treeData);
    return { nodeMap: nMap, codeMap: cMap, totalCount: count, allNodeIds: ids };
  }, [treeData]);

  // Initial expand: expand root nodes and level <= 4 by default on load
  useEffect(() => {
    if (treeData.length > 0 && expandedIds.size === 0) {
      const initialExpanded = new Set<number>();
      const expandShallow = (nodes: FlocNode[]) => {
        for (const node of nodes) {
          if (node.level <= 4) {
            initialExpanded.add(node.id);
          }
          if (node.children) {
            expandShallow(node.children);
          }
        }
      };
      expandShallow(treeData);
      setExpandedIds(initialExpanded);

      // Auto-select first node with installed equipment or first root
      if (!selectedNode) {
        let preferredNode: FlocNode | null = null;
        const findFirstWithEq = (nodes: FlocNode[]) => {
          for (const n of nodes) {
            if (n.installed_equipment_count > 0 && !preferredNode) {
              preferredNode = n;
              return;
            }
            if (n.children) findFirstWithEq(n.children);
          }
        };
        findFirstWithEq(treeData);
        setSelectedNode(preferredNode ?? treeData[0]);
      }
    }
  }, [treeData]);

  // Handle expand/collapse toggle
  const handleToggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Expand all nodes
  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(allNodeIds));
  }, [allNodeIds]);

  // Collapse all nodes
  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Filter tree recursively when search or level filter is applied
  const filteredTree = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q && levelFilter === 'all') {
      return treeData;
    }

    const filterNode = (node: FlocNode): FlocNode | null => {
      const matchesSearch =
        !q ||
        node.code.toLowerCase().includes(q) ||
        node.description?.toLowerCase().includes(q) ||
        `l${node.level}` === q ||
        `level ${node.level}` === q;

      const matchesLevel = levelFilter === 'all' || node.level === levelFilter;

      let filteredChildren: FlocNode[] = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = node.children
          .map(filterNode)
          .filter((child): child is FlocNode => child !== null);
      }

      if ((matchesSearch && matchesLevel) || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    };

    return treeData
      .map(filterNode)
      .filter((node): node is FlocNode => node !== null);
  }, [treeData, searchQuery, levelFilter]);

  // Auto-expand search matches
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingIds = new Set<number>();
      const collectParents = (nodes: FlocNode[]) => {
        for (const n of nodes) {
          matchingIds.add(n.id);
          if (n.children) collectParents(n.children);
        }
      };
      collectParents(filteredTree);
      setExpandedIds((prev) => new Set([...prev, ...matchingIds]));
    }
  }, [searchQuery, filteredTree]);

  // Quick jump from breadcrumbs in DetailPanel
  const handleSelectByCode = useCallback(
    (codeOrDesc: string) => {
      const target = codeMap.get(codeOrDesc.toLowerCase());
      if (target) {
        setSelectedNode(target);
      }
    },
    [codeMap]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FolderTree size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Visual FLOC Tree (ISO 14224)
              </h1>
              <p className="text-xs text-slate-500">
                Eksplorasi struktur hierarki lokasi fungsional (Level 1 - Level 8) dan peralatan terpasang
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExpandAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Buka semua cabang hierarki"
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">Expand All</span>
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Tutup semua cabang hierarki"
          >
            <Minimize2 size={13} />
            <span className="hidden sm:inline">Collapse All</span>
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50"
            title="Muat ulang data dari server"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Main Layout: Left 30%, Right 70% */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Kolom Kiri (30% layar) - Tree View */}
        <section
          aria-label="Tree View Functional Location"
          className="w-full lg:w-[32%] xl:w-[30%] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden shrink-0"
        >
          {/* Tree Header & Search */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari FLOC code, nama, level..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
              <span className="font-medium">
                {isLoading ? 'Memuat hierarki...' : `${totalCount} Node FLOC`}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Level:</span>
                <select
                  value={levelFilter}
                  onChange={(e) =>
                    setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-700 focus:outline-hidden"
                >
                  <option value="all">Semua L1-L8</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      L{lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tree Container */}
          <div
            className="flex-1 overflow-y-auto p-2.5 space-y-0.5 focus:outline-hidden"
            role="tree"
            tabIndex={0}
          >
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-blue-500" />
                Mengunduh data hierarki pohon...
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada node FLOC yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              filteredTree.map((rootNode) => (
                <FlocTreeNode
                  key={rootNode.id}
                  node={rootNode}
                  selectedId={selectedNode?.id ?? null}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  onSelect={setSelectedNode}
                  depth={0}
                />
              ))
            )}
          </div>
        </section>

        {/* Kolom Kanan (70% layar) - Detail Panel */}
        <section
          aria-label="Detail Panel Functional Location"
          className="flex-1 bg-slate-50/40 rounded-xl border border-slate-200 shadow-xs overflow-y-auto p-4 sm:p-5"
        >
          <FlocDetailPanel
            selectedNode={selectedNode}
            onSelectNodeByCode={handleSelectByCode}
          />
        </section>
      </div>
    </div>
  );
};

export default FunctionalLocationsPage;

