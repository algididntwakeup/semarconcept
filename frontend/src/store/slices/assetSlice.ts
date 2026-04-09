// platform/frontend-mui/src/store/slices/assetSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Asset, 
  AssetSearchParams, 
  AssetListResponse, 
  AssetFormData,
  AssetStatistics
} from '../../types/asset';
import { assetService } from '../../services/assetServices';

/**
 * Asset state interface
 */
interface AssetState {
  // Asset lists
  assetsList: Asset[];
  selectedAssets: string[];
  
  // Search and pagination
  searchParams: AssetSearchParams;
  totalAssets: number;
  currentPage: number;
  totalPages: number;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  validationErrors: Record<string, string>;
  
  // Statistics
  statistics: AssetStatistics | null;
  
  // UI state
  viewMode: 'grid' | 'list' | 'table';
  filters: Record<string, any>;
}

/**
 * Initial state
 */
const initialState: AssetState = {
  assetsList: [],
  selectedAssets: [],
  searchParams: {
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  },
  totalAssets: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: {},
  statistics: null,
  viewMode: 'grid',
  filters: {},
};

/**
 * Async thunks
 */

// Fetch assets
export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (params: AssetSearchParams, { rejectWithValue }) => {
    try {
      const response = await assetService.getAssets(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch assets');
    }
  }
);

// Create asset
export const createAsset = createAsyncThunk(
  'assets/createAsset',
  async (assetData: AssetFormData, { rejectWithValue }) => {
    try {
      const asset = await assetService.createAsset(assetData);
      return asset;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create asset');
    }
  }
);

// Update asset
export const updateAsset = createAsyncThunk(
  'assets/updateAsset',
  async ({ id, data }: { id: string; data: Partial<AssetFormData> }, { rejectWithValue }) => {
    try {
      const asset = await assetService.updateAsset(id, data);
      return asset;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update asset');
    }
  }
);

// Delete asset
export const deleteAsset = createAsyncThunk(
  'assets/deleteAsset',
  async (assetId: string, { rejectWithValue }) => {
    try {
      await assetService.deleteAsset(assetId);
      return assetId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete asset');
    }
  }
);

// Bulk delete assets
export const bulkDeleteAssets = createAsyncThunk(
  'assets/bulkDeleteAssets',
  async (assetIds: string[], { rejectWithValue }) => {
    try {
      await assetService.bulkDeleteAssets(assetIds);
      return assetIds;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete assets');
    }
  }
);

// Fetch asset statistics
export const fetchAssetStatistics = createAsyncThunk(
  'assets/fetchStatistics',
  async (filters?: AssetSearchParams, { rejectWithValue }) => {
    try {
      const statistics = await assetService.getAssetStatistics(filters);
      return statistics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

/**
 * Asset slice
 */
const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    // Search params
    updateSearchParams: (state, action: PayloadAction<Partial<AssetSearchParams>>) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    
    resetSearchParams: (state) => {
      state.searchParams = initialState.searchParams;
    },
    
    // Asset selection
    toggleAssetSelection: (state, action: PayloadAction<string>) => {
      const assetId = action.payload;
      const index = state.selectedAssets.indexOf(assetId);
      
      if (index >= 0) {
        state.selectedAssets.splice(index, 1);
      } else {
        state.selectedAssets.push(assetId);
      }
    },
    
    selectAllAssets: (state) => {
      state.selectedAssets = state.assetsList.map(asset => asset.id);
    },
    
    clearAssetSelection: (state) => {
      state.selectedAssets = [];
    },
    
    setAssetSelection: (state, action: PayloadAction<string[]>) => {
      state.selectedAssets = action.payload;
    },
    
    // View mode
    setViewMode: (state, action: PayloadAction<'grid' | 'list' | 'table'>) => {
      state.viewMode = action.payload;
    },
    
    // Filters
    updateFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // Error handling
    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    
    setValidationErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.validationErrors = action.payload;
    },
    
    // Asset list management
    addAssetToList: (state, action: PayloadAction<Asset>) => {
      state.assetsList.unshift(action.payload);
      state.totalAssets += 1;
    },
    
    updateAssetInList: (state, action: PayloadAction<Asset>) => {
      const index = state.assetsList.findIndex(asset => asset.id === action.payload.id);
      if (index >= 0) {
        state.assetsList[index] = action.payload;
      }
    },
    
    removeAssetFromList: (state, action: PayloadAction<string>) => {
      state.assetsList = state.assetsList.filter(asset => asset.id !== action.payload);
      state.selectedAssets = state.selectedAssets.filter(id => id !== action.payload);
      state.totalAssets = Math.max(0, state.totalAssets - 1);
    },
    
    removeAssetsFromList: (state, action: PayloadAction<string[]>) => {
      const assetIds = action.payload;
      state.assetsList = state.assetsList.filter(asset => !assetIds.includes(asset.id));
      state.selectedAssets = state.selectedAssets.filter(id => !assetIds.includes(id));
      state.totalAssets = Math.max(0, state.totalAssets - assetIds.length);
    },
  },
  
  extraReducers: (builder) => {
    // Fetch assets
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action: PayloadAction<AssetListResponse>) => {
        state.isLoading = false;
        state.assetsList = action.payload.assets;
        state.totalAssets = action.payload.total;
        state.currentPage = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Create asset
    builder
      .addCase(createAsset.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(createAsset.fulfilled, (state, action: PayloadAction<Asset>) => {
        state.isCreating = false;
        state.assetsList.unshift(action.payload);
        state.totalAssets += 1;
        state.error = null;
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });
    
    // Update asset
    builder
      .addCase(updateAsset.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(updateAsset.fulfilled, (state, action: PayloadAction<Asset>) => {
        state.isUpdating = false;
        const index = state.assetsList.findIndex(asset => asset.id === action.payload.id);
        if (index >= 0) {
          state.assetsList[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
    
    // Delete asset
    builder
      .addCase(deleteAsset.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.assetsList = state.assetsList.filter(asset => asset.id !== action.payload);
        state.selectedAssets = state.selectedAssets.filter(id => id !== action.payload);
        state.totalAssets = Math.max(0, state.totalAssets - 1);
        state.error = null;
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
    
    // Bulk delete assets
    builder
      .addCase(bulkDeleteAssets.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(bulkDeleteAssets.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.isDeleting = false;
        const assetIds = action.payload;
        state.assetsList = state.assetsList.filter(asset => !assetIds.includes(asset.id));
        state.selectedAssets = state.selectedAssets.filter(id => !assetIds.includes(id));
        state.totalAssets = Math.max(0, state.totalAssets - assetIds.length);
        state.error = null;
      })
      .addCase(bulkDeleteAssets.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
    
    // Fetch statistics
    builder
      .addCase(fetchAssetStatistics.fulfilled, (state, action: PayloadAction<AssetStatistics>) => {
        state.statistics = action.payload;
      })
      .addCase(fetchAssetStatistics.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

/**
 * Action exports
 */
export const {
  updateSearchParams,
  resetSearchParams,
  toggleAssetSelection,
  selectAllAssets,
  clearAssetSelection,
  setAssetSelection,
  setViewMode,
  updateFilters,
  clearFilters,
  clearErrors,
  setValidationErrors,
  addAssetToList,
  updateAssetInList,
  removeAssetFromList,
  removeAssetsFromList,
} = assetSlice.actions;

/**
 * Selectors
 */
export const selectAllAssetsFromState = (state: { assets: AssetState }) => state.assets.assetsList;
export const selectSelectedAssets = (state: { assets: AssetState }) => state.assets.selectedAssets;
export const selectAssetStatistics = (state: { assets: AssetState }) => state.assets.statistics;
export const selectIsLoading = (state: { assets: AssetState }) => state.assets.isLoading;
export const selectError = (state: { assets: AssetState }) => state.assets.error;
export const selectSearchParams = (state: { assets: AssetState }) => state.assets.searchParams;
export const selectViewMode = (state: { assets: AssetState }) => state.assets.viewMode;
export const selectFilters = (state: { assets: AssetState }) => state.assets.filters;
export const selectValidationErrors = (state: { assets: AssetState }) => state.assets.validationErrors;

// Computed selectors
export const selectAssetById = (state: { assets: AssetState }, assetId: string) =>
  state.assets.assetsList.find(asset => asset.id === assetId);

export const selectAssetsByType = (state: { assets: AssetState }, assetType: string) =>
  state.assets.assetsList.filter(asset => asset.type === assetType);

export const selectCriticalAssets = (state: { assets: AssetState }) =>
  state.assets.assetsList.filter(asset => asset.criticality >= 4);

export const selectAssetsByStatus = (state: { assets: AssetState }, status: string) =>
  state.assets.assetsList.filter(asset => asset.status === status);

/**
 * Export reducer
 */
export default assetSlice.reducer;