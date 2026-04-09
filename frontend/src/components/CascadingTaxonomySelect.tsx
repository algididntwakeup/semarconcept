import React, { useState, useEffect } from 'react';
import { TaxonomyCategory } from '../services/taxonomy.service';
import { ChevronRight } from 'lucide-react';

interface CascadingTaxonomySelectProps {
  tree: TaxonomyCategory[];
  value: number | '';
  onChange: (categoryId: number | '') => void;
}

export const CascadingTaxonomySelect: React.FC<CascadingTaxonomySelectProps> = ({ tree, value, onChange }) => {
  const [selectedPathIds, setSelectedPathIds] = useState<number[]>([]);

  // Find the path to the current value if it changes externally (e.g., when editing an asset)
  useEffect(() => {
    if (!value) {
      setSelectedPathIds([]);
      return;
    }

    const findPath = (nodes: TaxonomyCategory[], targetId: number, currentPath: number[]): number[] | null => {
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

    const path = findPath(tree, value as number, []);
    if (path) {
      setSelectedPathIds(path);
    }
  }, [value, tree]);

  const handleSelectChange = (levelIndex: number, selectedId: string) => {
    if (!selectedId) {
      // User selected the empty placeholder at this level
      // The new path should be truncated up to the PREVIOUS level
      const newPath = selectedPathIds.slice(0, levelIndex);
      setSelectedPathIds(newPath);
      onChange(newPath.length > 0 ? newPath[newPath.length - 1] : '');
      return;
    }

    const id = parseInt(selectedId, 10);
    const newPath = [...selectedPathIds.slice(0, levelIndex), id];
    setSelectedPathIds(newPath);
    onChange(id);
  };

  // Build the list of select elements to render
  const renderSelects = () => {
    const selects = [];
    let currentNodes = tree;

    for (let i = 0; i <= selectedPathIds.length; i++) {
      if (!currentNodes || currentNodes.length === 0) break;

      const selectedIdValue = i < selectedPathIds.length ? selectedPathIds[i] : '';

      selects.push(
        <div key={`level-${i}`} className="flex-1 min-w-[200px] mb-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Level {i + 1} Selection
          </label>
          <select
            className="form-input w-full"
            value={selectedIdValue}
            onChange={(e) => handleSelectChange(i, e.target.value)}
          >
            <option value="">-- {i === 0 ? 'Select Industry' : 'Select Sub-Category'} --</option>
            {currentNodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.name} {node.code ? `(${node.code})` : ''}
              </option>
            ))}
          </select>
        </div>
      );

      // Find the children of the selected node to populate the next level
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
        <div className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg">Loading taxonomy structure...</div>
      ) : (
        renderSelects()
      )}
    </div>
  );
};
