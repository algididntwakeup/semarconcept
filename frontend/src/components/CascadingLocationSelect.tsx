import React, { useState, useEffect } from 'react';
import { AssetHierarchyNode } from '../types/asset';
import { ChevronRight } from 'lucide-react';

interface CascadingLocationSelectProps {
  tree: AssetHierarchyNode[];
  value: string | '';
  onChange: (unitId: string | '') => void;
}

export const CascadingLocationSelect: React.FC<CascadingLocationSelectProps> = ({ tree, value, onChange }) => {
  const [selectedPathIds, setSelectedPathIds] = useState<string[]>([]);

  // Find the path to the current value if it changes
  useEffect(() => {
    if (!value) {
      setSelectedPathIds([]);
      return;
    }

    const findPath = (nodes: AssetHierarchyNode[], targetId: string, currentPath: string[]): string[] | null => {
      for (const node of nodes) {
        const newPath = [...currentPath, node.id];
        if (node.id === targetId) return newPath;
        if (node.children && node.children.length > 0) {
          const found = findPath(node.children, targetId, newPath);
          if (found) return found;
        }
      }
      return null;
    };

    const path = findPath(tree, value, []);
    if (path) {
      setSelectedPathIds(path);
    }
  }, [value, tree]);

  const handleSelectChange = (levelIndex: number, selectedId: string) => {
    if (!selectedId) {
      const newPath = selectedPathIds.slice(0, levelIndex);
      setSelectedPathIds(newPath);
      // We only care if they reach a 'unit' level, but we'll return whatever they selected
      // Actually, if we require unit_id, we can just pass the latest selection
      onChange(newPath.length > 0 ? newPath[newPath.length - 1] : '');
      return;
    }

    const newPath = [...selectedPathIds.slice(0, levelIndex), selectedId];
    setSelectedPathIds(newPath);
    onChange(selectedId);
  };

  const getLevelLabel = (levelIndex: number) => {
    switch(levelIndex) {
      case 0: return 'Site';
      case 1: return 'Area';
      case 2: return 'Unit';
      default: return `Level ${levelIndex + 1}`;
    }
  };

  const renderSelects = () => {
    const selects = [];
    let currentNodes = tree;

    for (let i = 0; i <= selectedPathIds.length; i++) {
      if (!currentNodes || currentNodes.length === 0) break;

      const selectedIdValue = i < selectedPathIds.length ? selectedPathIds[i] : '';

      selects.push(
        <div key={`level-${i}`} className="flex-1 min-w-[150px] mb-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Select {getLevelLabel(i)}
          </label>
          <select
            className="form-input w-full"
            value={selectedIdValue}
            onChange={(e) => handleSelectChange(i, e.target.value)}
          >
            <option value="">-- Choose {getLevelLabel(i)} --</option>
            {currentNodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </div>
      );

      if (selectedIdValue) {
        const selectedNode = currentNodes.find(n => n.id === selectedIdValue);
        currentNodes = selectedNode?.children || [];
      } else {
        break;
      }
    }

    return (
      <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        {selects.map((selectContent, idx) => (
          <React.Fragment key={`wrap-${idx}`}>
            {idx > 0 && (
              <div className="flex items-center justify-center mt-4">
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            )}
            {selectContent}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {tree.length === 0 ? (
        <div className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-100">No location hierarchy available.</div>
      ) : (
        renderSelects()
      )}
    </div>
  );
};
