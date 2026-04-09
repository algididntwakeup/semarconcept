import { describe, it, expect, vi, beforeEach } from 'vitest';
import configurationReducer, {
  fetchConfigurations,
  addNewConfiguration,
  updateExistingConfiguration,
  deleteExistingConfiguration,
  clearCurrentConfiguration,
  ConfigurationState,
  // Assuming ConfigurationItem is exported or defined similarly here for tests
} from './configurationSlice';
// import { configurationService } from '../../services/configurationService'; // Not needed when mocked

// Mock the service
vi.mock('../../services/configurationService', () => ({
  configurationService: {
    getAllConfigurations: vi.fn(),
    createConfiguration: vi.fn(),
    updateConfiguration: vi.fn(),
    deleteConfiguration: vi.fn(),
  },
}));

// Define a sample ConfigurationItem type for tests if not easily importable
interface TestConfigurationItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  isEncrypted: boolean;
}


const initialState: ConfigurationState = {
  configurations: [],
  currentConfiguration: null,
  loading: 'idle',
  error: null,
};

describe('configurationSlice reducers', () => {
  it('should handle initial state', () => {
    expect(configurationReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearCurrentConfiguration', () => {
    const stateWithCurrent: ConfigurationState = {
      ...initialState,
      currentConfiguration: {
        id: '1',
        key: 'test',
        value: 'val',
        category: 'cat',
        isEncrypted: false,
      },
    };
    expect(configurationReducer(stateWithCurrent, clearCurrentConfiguration())).toEqual({
      ...stateWithCurrent,
      currentConfiguration: null,
    });
  });
});

describe('configurationSlice async thunks', () => {
  let state: ConfigurationState;

  beforeEach(() => {
    state = { ...initialState }; // Reset state before each test
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  // --- fetchConfigurations ---
  it('should handle fetchConfigurations.pending', () => {
    const action = { type: fetchConfigurations.pending.type };
    const nextState = configurationReducer(state, action);
    expect(nextState.loading).toBe('pending');
    expect(nextState.error).toBeNull();
  });

  it('should handle fetchConfigurations.fulfilled', () => {
    const mockPayload: TestConfigurationItem[] = [
      { id: '1', key: 'site.name', value: 'Test Site', category: 'General', isEncrypted: false },
    ];
    const action = { type: fetchConfigurations.fulfilled.type, payload: mockPayload };
    const nextState = configurationReducer(state, action);
    expect(nextState.loading).toBe('succeeded');
    expect(nextState.configurations).toEqual(mockPayload);
  });

  it('should handle fetchConfigurations.rejected', () => {
    const mockError = 'Failed to fetch';
    const action = { type: fetchConfigurations.rejected.type, error: { message: mockError } };
    const nextState = configurationReducer(state, action);
    expect(nextState.loading).toBe('failed');
    expect(nextState.error).toBe(mockError);
  });

  // --- addNewConfiguration ---
  it('should handle addNewConfiguration.fulfilled', () => {
    const newConfig: TestConfigurationItem = {
      id: '2',
      key: 'new.key',
      value: 'new_value',
      category: 'API',
      isEncrypted: true,
    };
    const action = { type: addNewConfiguration.fulfilled.type, payload: newConfig };
    const nextState = configurationReducer(state, action);
    expect(nextState.configurations).toContainEqual(newConfig);
    expect(nextState.configurations.length).toBe(1);
  });

  // --- updateExistingConfiguration ---
  it('should handle updateExistingConfiguration.fulfilled', () => {
    const initialConfigs: TestConfigurationItem[] = [
      { id: '1', key: 'site.name', value: 'Old Name', category: 'General', isEncrypted: false },
      { id: '2', key: 'api.key', value: 'old_key', category: 'API', isEncrypted: true },
    ];
    const updatedConfig: TestConfigurationItem = {
      id: '1',
      key: 'site.name',
      value: 'New Name',
      category: 'General',
      isEncrypted: false,
    };
    const action = { type: updateExistingConfiguration.fulfilled.type, payload: updatedConfig };
    const initialStateWithItems: ConfigurationState = {
      ...initialState,
      configurations: initialConfigs,
    };
    const nextState = configurationReducer(initialStateWithItems, action);

    expect(nextState.configurations.length).toBe(2);
    const updatedItem = nextState.configurations.find((c) => c.id === '1');
    expect(updatedItem).toEqual(updatedConfig);
    const otherItem = nextState.configurations.find((c) => c.id === '2');
    expect(otherItem).toEqual(initialConfigs[1]); // Ensure other items are unchanged
  });

  // --- deleteExistingConfiguration ---
  it('should handle deleteExistingConfiguration.fulfilled', () => {
    const initialConfigs: TestConfigurationItem[] = [
      { id: '1', key: 'site.name', value: 'Old Name', category: 'General', isEncrypted: false },
      { id: '2', key: 'api.key', value: 'old_key', category: 'API', isEncrypted: true },
    ];
    const idToDelete = '1';
    const action = { type: deleteExistingConfiguration.fulfilled.type, payload: idToDelete };
    const initialStateWithItems: ConfigurationState = {
      ...initialState,
      configurations: initialConfigs,
    };
    const nextState = configurationReducer(initialStateWithItems, action);

    expect(nextState.configurations.length).toBe(1);
    expect(nextState.configurations.find((c) => c.id === idToDelete)).toBeUndefined();
    expect(nextState.configurations[0].id).toBe('2');
  });

  // TODO: Add tests for rejected states of add, update, delete thunks
  // TODO: Add tests for fetchConfigurationById states if needed
});

