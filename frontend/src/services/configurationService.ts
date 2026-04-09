// import apiClient from './apiClient'; // Assuming a configured Axios instance

export interface ConfigurationItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  isEncrypted: boolean;
}

export interface NewConfigurationItemData {
  key: string;
  value: string;
  category: string;
  description?: string;
  isEncrypted: boolean;
}

// Mock data store
let mockConfigurations: ConfigurationItem[] = [
  {
    id: '1',
    key: 'site.name',
    value: 'Reksolindo App',
    category: 'General',
    isEncrypted: false,
    description: 'The public name of the application.',
  },
  {
    id: '2',
    key: 'api.key',
    value: 'secret123',
    category: 'API',
    isEncrypted: true,
    description: 'API Key for external service X.',
  },
  { id: '3', key: 'pagination.limit', value: '25', category: 'UI', isEncrypted: false },
];

let nextId = 4;
const MOCK_API_DELAY = 500; // ms

export const configurationService = {
  async getAllConfigurations(): Promise<ConfigurationItem[]> {
    console.log('[Mock API - Config] Fetching all configurations...');
    // return apiClient.get('/system-configurations'); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Mock API - Config] Fetched configurations:', mockConfigurations);
        resolve([...mockConfigurations]);
      }, MOCK_API_DELAY);
    });
  },

  async getConfigurationById(id: string): Promise<ConfigurationItem | undefined> {
    console.log(`[Mock API - Config] Fetching configuration by ID: ${id}...`);
    // return apiClient.get(`/system-configurations/${id}`); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const config = mockConfigurations.find((c) => c.id === id);
        console.log(`[Mock API - Config] Fetched configuration by ID ${id}:`, config);
        resolve(config);
      }, MOCK_API_DELAY);
    });
  },

  async createConfiguration(configData: NewConfigurationItemData): Promise<ConfigurationItem> {
    console.log('[Mock API - Config] Creating new configuration:', configData);
    // return apiClient.post('/system-configurations', configData); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newConfig: ConfigurationItem = {
          id: (nextId++).toString(),
          ...configData,
        };
        mockConfigurations.push(newConfig);
        console.log('[Mock API - Config] Created configuration:', newConfig);
        resolve(newConfig);
      }, MOCK_API_DELAY);
    });
  },

  async updateConfiguration(
    id: string,
    configData: Partial<NewConfigurationItemData>
  ): Promise<ConfigurationItem | undefined> {
    console.log(`[Mock API - Config] Updating configuration ${id}:`, configData);
    // return apiClient.put(`/system-configurations/${id}`, configData); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockConfigurations.findIndex((c) => c.id === id);
        if (index !== -1) {
          mockConfigurations[index] = {
            ...mockConfigurations[index],
            ...configData,
          } as ConfigurationItem;
          console.log('[Mock API - Config] Updated configuration:', mockConfigurations[index]);
          resolve(mockConfigurations[index]);
        } else {
          console.log(`[Mock API - Config] Configuration with ID ${id} not found for update.`);
          resolve(undefined);
        }
      }, MOCK_API_DELAY);
    });
  },

  async deleteConfiguration(id: string): Promise<void> {
    console.log(`[Mock API - Config] Deleting configuration by ID: ${id}...`);
    // return apiClient.delete(`/system-configurations/${id}`); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        mockConfigurations = mockConfigurations.filter((c) => c.id !== id);
        console.log(
          `[Mock API - Config] Deleted configuration with ID: ${id}. Remaining:`,
          mockConfigurations
        );
        resolve();
      }, MOCK_API_DELAY);
    });
  },
};
