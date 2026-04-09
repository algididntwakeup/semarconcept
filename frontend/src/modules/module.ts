import React from 'react';
import { EnhancedStore } from '@reduxjs/toolkit'; // For accessing Redux store
// import { Router } from 'react-router-dom'; // Type might be needed depending on router integration

// Define the structure for information about a module
export interface ModuleInfo {
  name: string;
  version: string;
  description?: string;
}

// Define the interface that all React modules must implement
export interface ReactModule {
  // Returns metadata about the module
  getModuleInfo(): ModuleInfo;

  // Function called during app initialization.
  // Allows the module to register Redux slices, routes, etc.
  // It might return components to be rendered in specific extension points.
  initialize(store: EnhancedStore, config?: unknown): Promise<void> | void; // Use unknown instead of any

  // Optional: Function called when the module is activated (if dynamic activation is supported)
  // This might involve re-registering routes, reducers, or components if they were removed on deactivation.
  activate?(): Promise<void> | void;

  // Optional: Function called when the module is deactivated
  // This might involve removing routes, unregistering reducers, etc. (can be complex).
  deactivate?(): Promise<void> | void;

  // Optional: Function to get components provided by the module for specific slots/extension points
  // Key could be the slot name (e.g., 'dashboardWidget', 'settingsPageSection')
  getComponents?(): Record<string, React.ComponentType>;

  // Optional: Function to get routes provided by the module
  getRoutes?(): React.ReactNode; // e.g., JSX defining <Route> elements

  // Optional: Function to get menu items provided by the module
  // Define a specific structure for menu items
  getMenuItems?(): {
    path: string;
    title: string;
    icon?: React.ReactNode;
    requiredPermission?: string;
  }[];

  // Optional: Function to get Redux reducers provided by the module
  // Key should be the slice name
  getReducers?(): Record<string, unknown>; // Use unknown instead of any
}

// Example Base Module (Optional)
export class BaseReactModule implements ReactModule {
  info: ModuleInfo;

  constructor(info: ModuleInfo) {
    this.info = info;
  }

  getModuleInfo(): ModuleInfo {
    return this.info;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialize(store: EnhancedStore, config?: unknown): void {
    // Use unknown, disable unused vars
    console.log(`Module ${this.info.name} initialized (default implementation).`);
  }

  // Default implementations for optional methods
  getComponents?(): Record<string, React.ComponentType> {
    return {};
  }
  getRoutes?(): React.ReactNode {
    return null;
  }
  getReducers?(): Record<string, unknown> {
    // Use unknown instead of any
    return {};
  }
  getMenuItems?(): {
    path: string;
    title: string;
    icon?: React.ReactNode;
    requiredPermission?: string;
  }[] {
    return [];
  }
}

// --- Module Manager Concept (Conceptual - would live in app setup) ---

// interface ModuleManager {
//   modules: Map<string, ReactModule>;
//   registerModule(module: ReactModule): void;
//   initializeModules(store: EnhancedStore): Promise<void>;
//   getModuleComponents(slotName: string): React.ComponentType[];
//   getModuleRoutes(): React.ReactNode[];
//   getModuleMenuItems(): any[]; // Collect menu items
//   getModuleReducers(): Record<string, any>; // To combine reducers - Use any here for combineReducers compatibility
//   activateModule(moduleName: string): Promise<void>; // Calls module.activate?()
//   deactivateModule(moduleName: string): Promise<void>; // Calls module.deactivate?()
//   getEnabledModules(): ReactModule[];
// }

// Example Usage (Conceptual)
// const moduleManager: ModuleManager = /* Initialize */;
// // Register modules
// // moduleManager.registerModule(new ExampleReactModule());
//
// // In store setup:
// const rootReducer = combineReducers({
//   coreSlice: coreReducer,
//   ...moduleManager.getModuleReducers(),
// });
// const store = configureStore({ reducer: rootReducer });
//
// // Initialize modules after store creation
// await moduleManager.initializeModules(store);
//
// // In router setup:
// // <Routes>
// //   {/* Core Routes */}
// //   {moduleManager.getModuleRoutes()}
// // </Routes>
//
// // In specific components (e.g., Dashboard):
// // const widgets = moduleManager.getModuleComponents('dashboardWidget');
// // {widgets.map((Widget, index) => <Widget key={index} />)}
