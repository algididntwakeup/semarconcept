// platform/frontend-mui/src/config/icon-mapping.ts
import React from 'react';

// 🔥 FIXED: Import ALL icons without duplicates
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DescriptionIcon from '@mui/icons-material/Description';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PaletteIcon from '@mui/icons-material/Palette';
import PeopleIcon from '@mui/icons-material/People';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SettingsIcon from '@mui/icons-material/Settings';
import BackupIcon from '@mui/icons-material/Backup';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import MenuIcon from '@mui/icons-material/Menu';
import ExtensionIcon from '@mui/icons-material/Extension';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CategoryIcon from '@mui/icons-material/Category';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GridViewIcon from '@mui/icons-material/GridView';
import AppsIcon from '@mui/icons-material/Apps';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import StarIcon from '@mui/icons-material/Star';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TableChartIcon from '@mui/icons-material/TableChart';
import MapIcon from '@mui/icons-material/Map';
import LoginIcon from '@mui/icons-material/Login';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpIcon from '@mui/icons-material/Help';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; // ✅ FIXED: Use BusinessCenterIcon
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import PaymentIcon from '@mui/icons-material/Payment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SearchIcon from '@mui/icons-material/Search';
import PolicyIcon from '@mui/icons-material/Policy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SpeedIcon from '@mui/icons-material/Speed';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FolderIcon from '@mui/icons-material/Folder';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ChatIcon from '@mui/icons-material/Chat';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export type IconName = string;
export type IconComponent = React.ComponentType<any>;

export const iconMapping: Record<IconName, IconComponent> = {
  // Dashboard & Analytics
  DashboardIcon,
  BarChartIcon,
  GridViewIcon,
  AnalyticsIcon,
  SpeedIcon,
  VisibilityIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  AssessmentIcon,

  // Asset Management
  InventoryIcon,
  CategoryIcon,
  InsertDriveFileIcon,
  PermMediaIcon,
  LocalOfferIcon,
  BusinessCenterIcon, // ✅ FIXED: Maps to BusinessCenterIcon
  BusinessIcon: BusinessCenterIcon, // ✅ ADDED: BusinessIcon alias for backward compatibility
  AccountTreeIcon,
  EngineeringIcon,
  FolderIcon,
  ImportExportIcon,
  PhotoLibraryIcon,

  // Operations
  AssignmentIcon,
  WarningIcon,
  BuildIcon,
  VerifiedUserIcon,
  SearchIcon,
  PolicyIcon,
  ChecklistIcon,
  CalendarTodayIcon,
  SecurityIcon,
  GavelIcon,

  // Content Management
  DescriptionIcon,
  TextFieldsIcon,
  FormatPaintIcon,
  ContentCopyIcon,

  // Administration
  AdminPanelSettingsIcon,
  PeopleIcon,
  LockOpenIcon,
  SettingsIcon,
  BackupIcon,
  IntegrationInstructionsIcon,
  MenuIcon,
  ExtensionIcon,
  VpnKeyIcon,

  // Templates & UI
  PaletteIcon,
  AppsIcon,
  DesktopWindowsIcon,
  StarIcon,
  CardMembershipIcon,
  ViewModuleIcon,
  EditNoteIcon,
  TableChartIcon,
  MapIcon,

  // Pages & Auth
  LoginIcon,
  WorkIcon,
  AccountCircleIcon,
  HelpIcon,

  // Tenant Management
  BrandingWatermarkIcon,
  PaymentIcon,
  QueryStatsIcon,
  ChatIcon,
  PlaylistAddCheckIcon,
  CalendarMonthIcon,
};

export const getIconByName = (iconName: string): IconComponent | null => {
  const icon = iconMapping[iconName];
  if (!icon) {
    console.warn(`🚨 Icon "${iconName}" not found in icon mapping. Available icons:`, Object.keys(iconMapping));
    return null;
  }
  return icon;
};

export const getAvailableIconNames = (): string[] => {
  return Object.keys(iconMapping);
};

export const iconExists = (iconName: string): boolean => {
  return iconName in iconMapping;
};

export default iconMapping;