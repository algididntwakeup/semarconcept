// platform/frontend-mui/src/types/tenant.ts
/**
 * Multi-Tenant Branding Type Definitions
 * Based on Reksolindo Enterprise Asset Management System UI/UX Design Guide v2.0
 */

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Supported languages for internationalization
 */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ar' | 'pt' | 'zh' | 'ko' | 'hi';

/**
 * Text direction for RTL languages
 */
export type TextDirection = 'ltr' | 'rtl';

/**
 * Social media link interface
 */
export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'website';
  url: string;
  label?: string;
}

/**
 * Font family configuration
 */
export interface FontConfiguration {
  primary: string; // Main body text font
  heading: string; // Headers and titles font
  monospace: string; // Code and technical data font
  weights?: {
    light?: number;
    regular?: number;
    medium?: number;
    semibold?: number;
    bold?: number;
  };
}

/**
 * Color palette configuration
 */
export interface ColorPalette {
  primary: string; // Main brand color
  secondary: string; // Secondary brand color
  accent: string; // Accent color for highlights
  success: string; // Success state color
  warning: string; // Warning state color
  error: string; // Error state color
  info: string; // Information state color
  background: {
    default: string; // Default background
    paper: string; // Card/paper background
    dark: string; // Dark mode background
  };
  text: {
    primary: string; // Primary text color
    secondary: string; // Secondary text color
    disabled: string; // Disabled text color
  };
  // Optional: Custom color variations
  custom?: {
    [key: string]: string;
  };
}

/**
 * Email template configuration
 */
export interface EmailTemplateConfig {
  headerColor: string;
  headerTextColor: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  footerText: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  socialLinks: SocialLink[];
  logoPosition: 'left' | 'center' | 'right';
  includeUnsubscribe: boolean;
  companyAddress?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

/**
 * Component theme overrides
 */
export interface ComponentThemeOverrides {
  buttons?: {
    borderRadius?: number;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    fontWeight?: number;
    padding?: string;
  };
  cards?: {
    borderRadius?: number;
    elevation?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  inputs?: {
    borderRadius?: number;
    focusColor?: string;
    backgroundColor?: string;
  };
  navigation?: {
    backgroundColor?: string;
    textColor?: string;
    activeColor?: string;
    hoverColor?: string;
  };
  dashboard?: {
    widgetSpacing?: number;
    widgetBorderRadius?: number;
    chartColors?: string[];
  };
}

/**
 * Dashboard customization options
 */
export interface DashboardCustomization {
  defaultLayout: 'grid' | 'list' | 'cards';
  widgetSizes: {
    small: { width: number; height: number };
    medium: { width: number; height: number };
    large: { width: number; height: number };
  };
  defaultWidgets: string[]; // Widget IDs to show by default
  allowUserCustomization: boolean;
  maxWidgetsPerDashboard: number;
  refreshInterval: number; // milliseconds
  chartColors: string[];
  showBrandingOnExports: boolean;
}

/**
 * Navigation customization
 */
export interface NavigationCustomization {
  logoPosition: 'left' | 'center';
  showCompanyName: boolean;
  collapsible: boolean;
  defaultCollapsed: boolean;
  showUserAvatar: boolean;
  showNotifications: boolean;
  customMenuItems?: CustomMenuItem[];
  footerText?: string;
  helpUrl?: string;
  supportEmail?: string;
}

/**
 * Custom menu item
 */
export interface CustomMenuItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  position: 'top' | 'bottom';
  external?: boolean;
  newTab?: boolean;
  roles?: string[]; // User roles that can see this item
}

/**
 * Security customization
 */
export interface SecurityCustomization {
  sessionTimeout: number; // minutes
  sessionTimeoutWarning: number; // minutes before timeout
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number; // Number of previous passwords to check
  };
  mfaRequired: boolean;
  ipWhitelist?: string[];
  allowedDomains?: string[];
}

/**
 * Localization configuration
 */
export interface LocalizationConfig {
  defaultLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  direction: TextDirection;
  dateFormat: string;
  timeFormat: string;
  currencyCode: string;
  currencySymbol: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
  timezone: string;
  customTranslations?: {
    [key: string]: { [language in SupportedLanguage]?: string };
  };
}

/**
 * Feature flags for tenant customization
 */
export interface TenantFeatureFlags {
  assetManagement: boolean;
  inspectionManagement: boolean;
  riskManagement: boolean;
  maintenanceManagement: boolean;
  complianceManagement: boolean;
  analytics: boolean;
  reports: boolean;
  documentManagement: boolean;
  mobileApp: boolean;
  api: boolean;
  integrations: boolean;
  audit: boolean;
  backup: boolean;
  customFields: boolean;
  workflow: boolean;
  notifications: boolean;
  multiLanguage: boolean;
  whiteLabel: boolean;
  customBranding: boolean;
  advancedSecurity: boolean;
}

/**
 * Main tenant branding configuration
 */
export interface TenantBranding {
  id: string;
  tenantId: string;
  companyName: string;
  displayName?: string; // Alternative display name
  subdomain?: string; // Custom subdomain
  
  // Logos and branding
  logoUrl: string;
  logoUrlDark?: string; // Dark mode logo
  faviconUrl: string;
  splashScreenUrl?: string;
  loginBackgroundUrl?: string;
  
  // Colors and theme
  colors: ColorPalette;
  theme: ThemeMode;
  componentOverrides?: ComponentThemeOverrides;
  
  // Typography
  fonts: FontConfiguration;
  
  // Localization
  localization: LocalizationConfig;
  
  // Email templates
  emailTemplate?: EmailTemplateConfig;
  
  // Dashboard customization
  dashboard: DashboardCustomization;
  
  // Navigation customization
  navigation: NavigationCustomization;
  
  // Security settings
  security: SecurityCustomization;
  
  // Feature flags
  features: TenantFeatureFlags;
  
  // Custom CSS for advanced customization
  customCSS?: string;
  customJS?: string;
  
  // SEO and metadata
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Contact information
  contactInfo?: {
    supportEmail: string;
    supportPhone?: string;
    website?: string;
    address?: string;
  };
  
  // Terms and policies
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  
  // Integration settings
  integrations?: {
    googleAnalytics?: string;
    hotjar?: string;
    intercom?: string;
    zendesk?: string;
    slack?: string;
    [key: string]: any;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
  isActive: boolean;
  
  // White-label options
  whiteLabel: {
    hidePoweredBy: boolean;
    customLoginMessage?: string;
    customFooter?: string;
    customLoadingMessage?: string;
  };
}

/**
 * Tenant branding template
 */
export interface TenantBrandingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'industrial' | 'corporate' | 'modern' | 'classic' | 'custom';
  preview: {
    thumbnail: string;
    colors: string[];
    fonts: string[];
  };
  config: Partial<TenantBranding>;
  isPublic: boolean;
  createdAt: string;
  createdBy: string;
  usageCount: number;
  rating?: number;
  tags: string[];
}

/**
 * Tenant branding update payload
 */
export interface TenantBrandingUpdate {
  companyName?: string;
  displayName?: string;
  logoUrl?: string;
  logoUrlDark?: string;
  faviconUrl?: string;
  colors?: Partial<ColorPalette>;
  theme?: ThemeMode;
  fonts?: Partial<FontConfiguration>;
  localization?: Partial<LocalizationConfig>;
  dashboard?: Partial<DashboardCustomization>;
  navigation?: Partial<NavigationCustomization>;
  security?: Partial<SecurityCustomization>;
  features?: Partial<TenantFeatureFlags>;
  customCSS?: string;
  customJS?: string;
  metaTitle?: string;
  metaDescription?: string;
  whiteLabel?: Partial<TenantBranding['whiteLabel']>;
  [key: string]: any;
}

/**
 * Theme generation options
 */
export interface ThemeGenerationOptions {
  primaryColor: string;
  mode: ThemeMode;
  fontFamily?: string;
  borderRadius?: number;
  spacing?: number;
  generatePalette?: boolean;
  generateTypography?: boolean;
  generateComponents?: boolean;
}

/**
 * Generated MUI theme configuration
 */
export interface GeneratedTheme {
  palette: {
    mode: 'light' | 'dark';
    primary: { main: string; [key: string]: string };
    secondary: { main: string; [key: string]: string };
    error: { main: string; [key: string]: string };
    warning: { main: string; [key: string]: string };
    info: { main: string; [key: string]: string };
    success: { main: string; [key: string]: string };
    background: { default: string; paper: string };
    text: { primary: string; secondary: string };
  };
  typography: {
    fontFamily: string;
    [key: string]: any;
  };
  shape: {
    borderRadius: number;
  };
  spacing: number;
  components?: {
    [key: string]: any;
  };
}

/**
 * Tenant context for React components
 */
export interface TenantContextValue {
  tenant: TenantBranding | null;
  isLoading: boolean;
  error: string | null;
  updateBranding: (updates: TenantBrandingUpdate) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  applyTemplate: (templateId: string) => Promise<void>;
  generateTheme: (options: ThemeGenerationOptions) => GeneratedTheme;
  previewChanges: (updates: TenantBrandingUpdate) => void;
  discardPreview: () => void;
  savePreview: () => Promise<void>;
}

/**
 * Branding validation result
 */
export interface BrandingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Color accessibility check result
 */
export interface ColorAccessibilityResult {
  contrastRatio: number;
  isAccessible: boolean;
  level: 'AA' | 'AAA' | 'fail';
  suggestions: string[];
}

/**
 * Brand asset upload interface
 */
export interface BrandAssetUpload {
  file: File;
  type: 'logo' | 'favicon' | 'background' | 'splash';
  optimize?: boolean;
  generateVariants?: boolean;
}

/**
 * Brand asset response
 */
export interface BrandAssetResponse {
  original: string;
  optimized?: string;
  variants?: {
    dark?: string;
    light?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
  metadata: {
    size: number;
    dimensions: { width: number; height: number };
    format: string;
    colorProfile?: string;
  };
}