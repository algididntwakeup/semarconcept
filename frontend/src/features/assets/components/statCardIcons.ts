import {
  Boxes,
  Cable,
  Cog,
  Layers3,
  MapPin,
  PackageCheck,
  Route,
  type LucideIcon,
} from 'lucide-react';

// Static title → icon lookup for the Equipment Master summary and class cards.
// Titles come from the stats API after case normalisation (for example
// "Piping" and "Piping Line"); anything not listed falls back to Boxes.
const ICON_BY_TITLE: Record<string, LucideIcon> = {
  Total: Layers3,
  Equipment: Cog,
  Piping: Cable,
  'Piping Line': Route,
  Installed: PackageCheck,
  'Has Funcloc': MapPin,
};

/** Returns the icon component for an equipment stat card title. */
export const equipmentStatIcon = (title: string): LucideIcon =>
  ICON_BY_TITLE[title] ?? Boxes;
