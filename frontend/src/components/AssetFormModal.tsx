import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { assetService } from '../services/assetServices';
import { Asset, AssetHierarchyNode } from '../types/asset';

// ── ISO 14224 Asset Hierarchy Levels ──
// Defines the hierarchy: Installation → Plant → Section → Equipment → Subunit → Component
// Each level specifies which types are valid as parents.

export interface AssetLevelDef {
  label: string;
  group: string;
  placeholder: string; // placeholder for the name/tag input
  allowedParentTypes: string[];
}

export const ASSET_LEVELS: Record<string, AssetLevelDef> = {
  // ── Locations & Installations (ISO 14224 §6) ──
  installation:     { label: 'Installation',       group: 'Location & Installation', placeholder: 'e.g. Jakarta Refinery, Offshore Platform A', allowedParentTypes: [] },
  plant:            { label: 'Plant / Unit',        group: 'Location & Installation', placeholder: 'e.g. Crude Distillation Unit, Gas Treatment Plant', allowedParentTypes: ['installation'] },
  section:          { label: 'Section / System',    group: 'Location & Installation', placeholder: 'e.g. Cooling Water System, Fuel Gas System', allowedParentTypes: ['installation', 'plant'] },

  // ── Equipment Classes (ISO 14224 Table A.1 / Annex A) ──
  compressor:       { label: 'Compressor',          group: 'Rotating Equipment',      placeholder: 'e.g. K-101 Gas Compressor', allowedParentTypes: ['plant', 'section'] },
  pump:             { label: 'Pump',                group: 'Rotating Equipment',      placeholder: 'e.g. P-201A Centrifugal Pump', allowedParentTypes: ['plant', 'section'] },
  gas_turbine:      { label: 'Gas Turbine',         group: 'Rotating Equipment',      placeholder: 'e.g. GT-001 Power Turbine', allowedParentTypes: ['plant', 'section'] },
  steam_turbine:    { label: 'Steam Turbine',       group: 'Rotating Equipment',      placeholder: 'e.g. ST-101 HP Turbine', allowedParentTypes: ['plant', 'section'] },
  electric_motor:   { label: 'Electric Motor',      group: 'Rotating Equipment',      placeholder: 'e.g. M-201A Main Drive Motor', allowedParentTypes: ['plant', 'section'] },
  fan:              { label: 'Fan / Blower',        group: 'Rotating Equipment',      placeholder: 'e.g. FN-301 Air Blower', allowedParentTypes: ['plant', 'section'] },
  electric_generator: { label: 'Electric Generator', group: 'Rotating Equipment',     placeholder: 'e.g. G-001 Emergency Generator', allowedParentTypes: ['plant', 'section'] },
  turboexpander:    { label: 'Turbo Expander',      group: 'Rotating Equipment',      placeholder: 'e.g. TE-101 Expander', allowedParentTypes: ['plant', 'section'] },

  heat_exchanger:   { label: 'Heat Exchanger',      group: 'Mechanical Equipment',    placeholder: 'e.g. E-101 Shell & Tube Exchanger', allowedParentTypes: ['plant', 'section'] },
  vessel:           { label: 'Vessel / Separator',  group: 'Mechanical Equipment',    placeholder: 'e.g. V-201 HP Separator', allowedParentTypes: ['plant', 'section'] },
  tank:             { label: 'Tank',                group: 'Mechanical Equipment',     placeholder: 'e.g. T-301 Crude Storage Tank', allowedParentTypes: ['plant', 'section'] },
  boiler:           { label: 'Boiler / Heater',     group: 'Mechanical Equipment',     placeholder: 'e.g. H-101 Process Heater', allowedParentTypes: ['plant', 'section'] },
  reactor:          { label: 'Reactor',             group: 'Mechanical Equipment',     placeholder: 'e.g. R-101 Catalytic Reactor', allowedParentTypes: ['plant', 'section'] },
  filter:           { label: 'Filter / Strainer',   group: 'Mechanical Equipment',     placeholder: 'e.g. FL-101 Cartridge Filter', allowedParentTypes: ['plant', 'section'] },
  mixer:            { label: 'Mixer / Agitator',    group: 'Mechanical Equipment',     placeholder: 'e.g. MX-101 Static Mixer', allowedParentTypes: ['plant', 'section'] },
  conveyor:         { label: 'Conveyor',            group: 'Mechanical Equipment',     placeholder: 'e.g. CV-101 Belt Conveyor', allowedParentTypes: ['plant', 'section'] },
  crane:            { label: 'Crane / Lifting',     group: 'Mechanical Equipment',     placeholder: 'e.g. CR-001 Overhead Crane', allowedParentTypes: ['plant', 'section'] },
  piping:           { label: 'Piping',              group: 'Mechanical Equipment',     placeholder: 'e.g. 6"-CW-101-A1 Cooling Water Line', allowedParentTypes: ['plant', 'section'] },

  valve_control:    { label: 'Control Valve',       group: 'Valves',                   placeholder: 'e.g. FV-1001 Flow Control Valve', allowedParentTypes: ['plant', 'section'] },
  valve_safety:     { label: 'Safety / Relief Valve', group: 'Valves',                 placeholder: 'e.g. PSV-201 Pressure Safety Valve', allowedParentTypes: ['plant', 'section'] },
  valve_onoff:      { label: 'On/Off Valve',        group: 'Valves',                   placeholder: 'e.g. XV-301 Block Valve', allowedParentTypes: ['plant', 'section'] },
  valve_manual:     { label: 'Manual Valve',        group: 'Valves',                   placeholder: 'e.g. HV-401 Gate Valve', allowedParentTypes: ['plant', 'section'] },

  instrument:       { label: 'Instrument (General)', group: 'Instrumentation & Control', placeholder: 'e.g. PT-1001 Pressure Transmitter', allowedParentTypes: ['plant', 'section'] },
  fire_gas:         { label: 'Fire & Gas Detector',  group: 'Instrumentation & Control', placeholder: 'e.g. GD-101 Gas Detector', allowedParentTypes: ['plant', 'section'] },
  control_system:   { label: 'Control System (DCS/PLC)', group: 'Instrumentation & Control', placeholder: 'e.g. DCS-001 Main Control System', allowedParentTypes: ['plant', 'section'] },

  switchgear:       { label: 'Switchgear',          group: 'Electrical Equipment',     placeholder: 'e.g. SWG-001 11kV Switchgear', allowedParentTypes: ['plant', 'section'] },
  transformer:      { label: 'Transformer',         group: 'Electrical Equipment',     placeholder: 'e.g. TR-001 Main Transformer', allowedParentTypes: ['plant', 'section'] },
  ups:              { label: 'UPS / Battery System', group: 'Electrical Equipment',    placeholder: 'e.g. UPS-001 Emergency UPS', allowedParentTypes: ['plant', 'section'] },

  structure:        { label: 'Structure / Civil',   group: 'Other Equipment',          placeholder: 'e.g. Pipe Rack A, Building B', allowedParentTypes: ['installation', 'plant', 'section'] },
  subsea:           { label: 'Subsea Equipment',    group: 'Other Equipment',          placeholder: 'e.g. Subsea Tree XT-1', allowedParentTypes: ['installation', 'plant', 'section'] },

  // ── Sub-equipment levels (ISO 14224 §7) ──
  subunit:          { label: 'Subunit',             group: 'Sub-equipment',            placeholder: 'e.g. Lubrication System, Coupling Assembly',
                      allowedParentTypes: ['compressor','pump','gas_turbine','steam_turbine','electric_motor','fan','electric_generator','turboexpander','heat_exchanger','vessel','tank','boiler','reactor','filter','mixer','conveyor','crane','piping','valve_control','valve_safety','valve_onoff','valve_manual','instrument','fire_gas','control_system','switchgear','transformer','ups','structure','subsea'] },
  component:        { label: 'Component / Maintainable Part', group: 'Sub-equipment',  placeholder: 'e.g. Impeller, Bearing, Seal, Gasket',
                      allowedParentTypes: ['subunit','compressor','pump','gas_turbine','steam_turbine','electric_motor','fan','electric_generator','turboexpander','heat_exchanger','vessel','tank','boiler','reactor','filter','mixer','conveyor','crane','piping','valve_control','valve_safety','valve_onoff','valve_manual','instrument','fire_gas','control_system','switchgear','transformer','ups','structure','subsea'] },

  other:            { label: 'Other',               group: 'Other',                    placeholder: 'e.g. Custom asset description', allowedParentTypes: ['installation', 'plant', 'section'] },
};

// Group the asset levels for <optgroup> rendering
const groupedLevels = (): { group: string; items: { value: string; label: string }[] }[] => {
  const groups: Record<string, { value: string; label: string }[]> = {};
  for (const [value, def] of Object.entries(ASSET_LEVELS)) {
    if (!groups[def.group]) groups[def.group] = [];
    groups[def.group].push({ value, label: def.label });
  }
  return Object.entries(groups).map(([group, items]) => ({ group, items }));
};

// ── Component Props ──
export interface AssetFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  editingAsset?: AssetHierarchyNode | Asset | null;
  defaultParentId?: string;
  /** Flat map of all assets for parent picking */
  allAssets: Record<string, { id: string; name: string; type: string }>;
  onClose: () => void;
  onSaved: () => void;
}

const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen, mode, editingAsset, defaultParentId, allAssets, onClose, onSaved
}) => {
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('installation');
  const [formParentId, setFormParentId] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialise form when modal opens or asset changes
  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'edit' && editingAsset) {
      setFormName(editingAsset.name || '');
      setFormType((editingAsset as any).type?.toLowerCase() || 'other');
      setFormParentId((editingAsset as any).parentId ? String((editingAsset as any).parentId) : '');
      setFormStatus((editingAsset as any).status || 'active');
      setFormDescription('');
    } else {
      setFormName('');
      setFormType('installation');
      setFormParentId(defaultParentId || '');
      setFormStatus('active');
      setFormDescription('');
    }
  }, [isOpen, mode, editingAsset, defaultParentId]);

  // Filter parents based on selected asset type
  const filteredParents = useMemo(() => {
    const level = ASSET_LEVELS[formType];
    if (!level || level.allowedParentTypes.length === 0) return [];
    return Object.values(allAssets).filter(a => {
      const aType = a.type?.toLowerCase() || '';
      return level.allowedParentTypes.includes(aType);
    });
  }, [formType, allAssets]);

  const currentLevelDef = ASSET_LEVELS[formType] || ASSET_LEVELS['other'];

  const handleSave = async () => {
    if (!formName.trim()) return;
    setIsSaving(true);
    try {
      const generatedTag = formName.replace(/\s+/g, '-').toUpperCase().substring(0, 20);
      
      const isSite = ['installation'].includes(formType);
      const isUnit = ['plant', 'section'].includes(formType);

      const parseId = (idStr: string) => {
          if (!idStr) return undefined;
          const parts = String(idStr).split('-');
          return parts.length > 1 ? Number(parts[1]) : Number(idStr);
      };

      if (mode === 'create') {
        if (isSite) {
            await assetService.createSite({
                name: formName,
                code: generatedTag,
                site_type: formType,
                status: formStatus
            });
        } else if (isUnit) {
            const siteId = parseId(formParentId) || 0;
            await assetService.createUnit({
                site_id: siteId,
                name: formName,
                code: generatedTag,
                unit_type: formType,
                status: formStatus
            });
        } else {
           const mappedParentId = parseId(formParentId);
           const isParentUnit = String(formParentId).startsWith('unit-');
           
           await assetService.createAsset({
               name: formName,
               tag_number: generatedTag,
               asset_type: formType,
               status: formStatus,
               criticality: 3,
               unit_id: isParentUnit ? mappedParentId : undefined,
               parent_id: !isParentUnit ? mappedParentId : undefined,
               safety_critical: false,
               environmentally_critical: false
           } as any);
        }
      } else if (editingAsset) {
        const targetIdStr = String(editingAsset.id);
        const numId = parseId(targetIdStr)?.toString() || '';
        
        if (targetIdStr.startsWith('site-')) {
            await assetService.updateSite(numId, {
                name: formName,
                code: generatedTag,
                site_type: formType,
                status: formStatus
            });
        } else if (targetIdStr.startsWith('unit-')) {
            await assetService.updateUnit(numId, {
                name: formName,
                code: generatedTag,
                unit_type: formType,
                status: formStatus
            });
        } else {
            await assetService.updateAsset(numId, {
               name: formName,
               tag_number: generatedTag,
               asset_type: formType,
               status: formStatus,
               criticality: 3
            } as any);
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save asset', err);
      alert('Failed to save asset. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const optGroups = groupedLevels();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="modal-glass w-full max-w-xl relative z-10 flex flex-col">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {mode === 'create' ? 'Register Asset' : 'Edit Asset'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {mode === 'create' ? 'Add a new asset to the hierarchy' : `Editing: ${editingAsset?.name}`}
              </p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
             <X size={20} className="text-slate-400" />
           </button>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[70vh] space-y-5">
           {/* Asset Type */}
           <div className="space-y-2">
              <label className="form-label">Asset Type *</label>
              <select className="form-input" value={formType} onChange={(e) => { setFormType(e.target.value); setFormParentId(''); }}>
                 {optGroups.map(g => (
                   <optgroup key={g.group} label={g.group}>
                     {g.items.map(item => (
                       <option key={item.value} value={item.value}>{item.label}</option>
                     ))}
                   </optgroup>
                 ))}
              </select>
           </div>

           {/* Asset Name / Tag — single field, placeholder adapts to type */}
           <div className="space-y-2">
              <label className="form-label">
                {['installation','plant','section'].includes(formType) ? 'Asset Name *' : 'Tag / Name *'}
              </label>
              <input 
                type="text" className="form-input" required
                placeholder={currentLevelDef.placeholder}
                value={formName} onChange={(e) => setFormName(e.target.value)} 
              />
              <p className="text-[10px] text-slate-400">
                {['installation','plant','section'].includes(formType)
                  ? 'Enter the name of this structural location.'
                  : 'Enter the tag number or descriptive name (e.g. P-201A or "Main Feed Pump").'}
              </p>
           </div>

           {/* Parent Asset */}
           <div className="space-y-2">
              <label className="form-label">
                Parent Asset
                {currentLevelDef.allowedParentTypes.length === 0 && (
                  <span className="text-[10px] text-slate-400 font-normal ml-2">(Top-level, no parent needed)</span>
                )}
              </label>
              <select className="form-input" value={formParentId} onChange={(e) => setFormParentId(e.target.value)}
                disabled={currentLevelDef.allowedParentTypes.length === 0}>
                 <option value="">
                   {currentLevelDef.allowedParentTypes.length === 0 ? 'None (Top-level Asset)' : 'Select Parent Asset...'}
                 </option>
                 {filteredParents
                   .filter(a => !editingAsset || a.id !== editingAsset.id)
                   .map(a => (
                   <option key={a.id} value={a.id}>
                     {a.name} ({ASSET_LEVELS[a.type?.toLowerCase()]?.label || a.type})
                   </option>
                 ))}
              </select>
              {currentLevelDef.allowedParentTypes.length > 0 && filteredParents.length === 0 && (
                <p className="text-[10px] text-amber-500 font-bold">
                  No eligible parent assets found. Create a {currentLevelDef.allowedParentTypes.slice(0, 3).map(t => ASSET_LEVELS[t]?.label).filter(Boolean).join(' or ')} first.
                </p>
              )}
           </div>

           {/* Status */}
           <div className="space-y-2">
              <label className="form-label">Status</label>
              <select className="form-input" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                 <option value="active">Active / In Service</option>
                 <option value="inactive">Inactive</option>
                 <option value="maintenance">Under Maintenance</option>
                 <option value="planned">Planned / Not yet installed</option>
                 <option value="decommissioned">Decommissioned</option>
              </select>
           </div>

           {/* Description */}
           <div className="space-y-2">
              <label className="form-label">Description <span className="text-[10px] text-slate-400 font-normal">(optional)</span></label>
              <textarea className="form-input min-h-[70px]" placeholder="Brief functional description of this asset..."
                value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
           </div>
        </div>

        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
           <button type="button" onClick={onClose} className="btn-secondary-premium">Cancel</button>
           <button 
             onClick={handleSave}
             disabled={!formName.trim() || isSaving}
             className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
           >
             {isSaving ? 'Saving...' : (mode === 'create' ? 'Create Asset' : 'Save Changes')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AssetFormModal;
