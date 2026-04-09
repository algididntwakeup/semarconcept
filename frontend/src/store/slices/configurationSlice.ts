import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  configurationService,
  ConfigurationItem,
  NewConfigurationItemData,
} from '../../services/configurationService';
// import { RootState } from '../store';

export interface ConfigurationState {
  configurations: ConfigurationItem[];
  currentConfiguration: ConfigurationItem | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: ConfigurationState = {
  configurations: [],
  currentConfiguration: null,
  loading: 'idle',
  error: null,
};

// Async Thunks
export const fetchConfigurations = createAsyncThunk('configurations/fetchAll', async () => {
  const response = await configurationService.getAllConfigurations();
  return response;
});

export const fetchConfigurationById = createAsyncThunk(
  'configurations/fetchById',
  async (id: string) => {
    const response = await configurationService.getConfigurationById(id);
    return response;
  }
);

export const addNewConfiguration = createAsyncThunk(
  'configurations/addNew',
  async (newConfig: NewConfigurationItemData) => {
    const response = await configurationService.createConfiguration(newConfig);
    return response;
  }
);

export const updateExistingConfiguration = createAsyncThunk(
  'configurations/updateExisting',
  async ({ id, configData }: { id: string; configData: Partial<NewConfigurationItemData> }) => {
    const response = await configurationService.updateConfiguration(id, configData);
    return response;
  }
);

export const deleteExistingConfiguration = createAsyncThunk(
  'configurations/deleteExisting',
  async (id: string) => {
    await configurationService.deleteConfiguration(id);
    return id; // Return id to remove from state
  }
);

const configurationSlice = createSlice({
  name: 'configurations',
  initialState,
  reducers: {
    clearCurrentConfiguration: (state) => {
      state.currentConfiguration = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConfigurations
      .addCase(fetchConfigurations.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(
        fetchConfigurations.fulfilled,
        (state, action: PayloadAction<ConfigurationItem[]>) => {
          state.loading = 'succeeded';
          state.configurations = action.payload;
        }
      )
      .addCase(fetchConfigurations.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      // fetchConfigurationById
      .addCase(fetchConfigurationById.pending, (state) => {
        state.loading = 'pending';
        state.currentConfiguration = null;
        state.error = null;
      })
      .addCase(
        fetchConfigurationById.fulfilled,
        (state, action: PayloadAction<ConfigurationItem | undefined>) => {
          state.loading = 'succeeded';
          state.currentConfiguration = action.payload || null;
        }
      )
      .addCase(fetchConfigurationById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      // addNewConfiguration
      .addCase(addNewConfiguration.fulfilled, (state, action: PayloadAction<ConfigurationItem>) => {
        state.configurations.push(action.payload);
      })
      // updateExistingConfiguration
      .addCase(
        updateExistingConfiguration.fulfilled,
        (state, action: PayloadAction<ConfigurationItem | undefined>) => {
          if (action.payload) {
            const index = state.configurations.findIndex(
              (config) => config.id === action.payload!.id
            );
            if (index !== -1) {
              state.configurations[index] = action.payload;
            }
            if (state.currentConfiguration && state.currentConfiguration.id === action.payload.id) {
              state.currentConfiguration = action.payload;
            }
          }
        }
      )
      // deleteExistingConfiguration
      .addCase(deleteExistingConfiguration.fulfilled, (state, action: PayloadAction<string>) => {
        state.configurations = state.configurations.filter(
          (config) => config.id !== action.payload
        );
        if (state.currentConfiguration && state.currentConfiguration.id === action.payload) {
          state.currentConfiguration = null;
        }
      });
  },
});

export const { clearCurrentConfiguration } = configurationSlice.actions;

// Selectors
// export const selectAllConfigurations = (state: RootState) => state.configurations.configurations;
// export const selectCurrentConfiguration = (state: RootState) => state.configurations.currentConfiguration;
// export const selectConfigurationsLoading = (state: RootState) => state.configurations.loading;
// export const selectConfigurationsError = (state: RootState) => state.configurations.error;

export default configurationSlice.reducer;
