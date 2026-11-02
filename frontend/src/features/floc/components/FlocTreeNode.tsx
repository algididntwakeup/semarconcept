// platform/frontend-mui/src/features/floc/components/FlocTreeNode.tsx
import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Compass,
  Factory,
  Layers,
  Network,
  Folder,
  FolderOpen,
  Wrench,
  Cpu,
  PackageCheck,
} from 'lucide-react';
import type { FlocNode } from '../../../types/floc';

export interface FlocTreeNodeProps {
  node: FlocNode;
  selectedId: number | null;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  onSelect: (node: FlocNode) => void;
  depth?: number;
}

/**
 * Returns distinct level badge styles based on ISO 14224 depth (L1 - L8)
 */
export const getLevelBadgeClass = (level: number): string => {
  switch (level) {
    case 1:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 2:
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 3:
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 4:
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 5:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 6:
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 7:
      return 'bg-orange-50 text-orange-800 border-orange-200';
    case 8:
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

/**
 * Returns descriptive ISO 14224 category name for a level
 */
export const getLevelCategoryName = (level: number): string => {
  switch (level) {
    case 1:
      return 'Industry / Company';
    case 2:
      return 'Business Category / Region';
    case 3:
      return 'Installation / Site';
    case 4:
      return 'Plant / Unit / Area';
    case 5:
      return 'Section / System';
    case 6:
      return 'Equipment Unit / Package';
    case 7:
      return 'Maintainable Item';
    case 8:
      return 'Part / Component';
    default:
      return `Level ${level}`;
  }
};

/**
 * Returns intuitive icon for node based on its level
 */
const getNodeIcon = (level: number, isExpanded: boolean, hasChildren: boolean) => {
  const iconSize = 15;
  const iconClass = 'shrink-0';

  switch (level) {
    case 1:
      return <Building2 size={iconSize} className={`${iconClass} text-indigo-600`} aria-hidden="true" />;
    case 2:
      return <Compass size={iconSize} className={`${iconClass} text-blue-600`} aria-hidden="true" />;
    case 3:
      return <Factory size={iconSize} className={`${iconClass} text-cyan-700`} aria-hidden="true" />;
    case 4:
      return <Layers size={iconSize} className={`${iconClass} text-teal-600`} aria-hidden="true" />;
    case 5:
      return <Network size={iconSize} className={`${iconClass} text-emerald-600`} aria-hidden="true" />;
    case 6:
      return isExpanded ? (
        <FolderOpen size={iconSize} className={`${iconClass} text-amber-600`} aria-hidden="true" />
      ) : (
        <Folder size={iconSize} className={`${iconClass} text-amber-600`} aria-hidden="true" />
      );
    case 7:
      return <Wrench size={iconSize} className={`${iconClass} text-orange-600`} aria-hidden="true" />;
    case 8:
      return <Cpu size={iconSize} className={`${iconClass} text-purple-600`} aria-hidden="true" />;
    default:
      return hasChildren && isExpanded ? (
        <FolderOpen size={iconSize} className={`${iconClass} text-slate-500`} aria-hidden="true" />
      ) : (
        <Folder size={iconSize} className={`${iconClass} text-slate-500`} aria-hidden="true" />
      );
  }
};

export const FlocTreeNode: React.FC<FlocTreeNodeProps> = ({
  node,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
  depth = 0,
}) => {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const equipmentCount = node.installed_equipment_count ?? node.equipments?.length ?? 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  const handleClick = () => {
    onSelect(node);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(node);
    } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    } else if (e.key === 'ArrowLeft' && hasChildren && isExpanded) {
      e.preventDefault();
      onToggle(node.id);
    }
  };

  return (
    <div className="select-none text-slate-800" role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isSelected
            ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-600 font-medium shadow-xs'
            : 'hover:bg-slate-100/80 text-slate-700'
        }`}
        style={{ paddingLeft: `${Math.max(depth * 12, 6)}px` }}
      >
        {/* Expand / Collapse Chevron Button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={`Toggle ${node.code}`}
            className="p-0.5 rounded hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 focus:outline-hidden transition-transform"
          >
            {isExpanded ? (
              <ChevronDown size={14} className="shrink-0" />
            ) : (
              <ChevronRight size={14} className="shrink-0" />
            )}
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0 inline-flex items-center justify-center text-slate-300">
            •
          </span>
        )}

        {/* Node Icon */}
        <span className="inline-flex items-center justify-center">
          {getNodeIcon(node.level, isExpanded, hasChildren)}
        </span>

        {/* FLOC Code and Description */}
        <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
          <span className="text-xs font-semibold tracking-tight text-slate-900 truncate" title={node.code}>
            {node.code}
          </span>
          {node.description && (
            <span className="text-[11px] text-slate-500 truncate hidden sm:inline" title={node.description}>
              {node.description}
            </span>
          )}
        </div>

        {/* Level Badge (L1 - L8) */}
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getLevelBadgeClass(
            node.level
          )}`}
          title={`ISO 14224 Level ${node.level}: ${getLevelCategoryName(node.level)}`}
        >
          L{node.level}
        </span>

        {/* Installed Equipment Count Pill */}
        {equipmentCount > 0 && (
          <span
            className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
            title={`${equipmentCount} peralatan terpasang`}
          >
            <PackageCheck size={11} className="text-emerald-600" aria-hidden="true" />
            {equipmentCount}
          </span>
        )}
      </div>

      {/* Recursive Children Branch */}
      {isExpanded && hasChildren && (
        <div className="ml-2 pl-2 border-l border-slate-200/80 space-y-0.5 mt-0.5" role="group">
          {node.children!.map((child) => (
            <FlocTreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

