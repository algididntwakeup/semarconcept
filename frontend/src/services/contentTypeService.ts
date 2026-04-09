// import apiClient from './apiClient'; // Assuming a configured Axios instance

export interface ContentType {
  id: string;
  name: string;
  apiKey: string; // e.g., 'posts', 'products'
  description?: string;
  // fieldCount: number; // Example, might be derived or part of a more detailed fetch
}

export interface NewContentTypeData {
  name: string;
  apiKey: string;
  description?: string;
}

// Mock data store
let mockContentTypes: ContentType[] = [
  { id: '1', name: 'Blog Post', apiKey: 'blog_posts', description: 'Standard blog articles' },
  { id: '2', name: 'Product', apiKey: 'products', description: 'E-commerce products' },
  { id: '3', name: 'Page', apiKey: 'pages', description: 'Static content pages' },
];

let nextId = 4;
const MOCK_API_DELAY = 500; // ms

export const contentTypeService = {
  async getAllContentTypes(): Promise<ContentType[]> {
    console.log('[Mock API - ContentType] Fetching all content types...');
    // return apiClient.get('/content-types');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Mock API - ContentType] Fetched content types:', mockContentTypes);
        resolve([...mockContentTypes]);
      }, MOCK_API_DELAY);
    });
  },

  async getContentTypeById(id: string): Promise<ContentType | undefined> {
    console.log(`[Mock API - ContentType] Fetching content type by ID: ${id}...`);
    // return apiClient.get(`/content-types/${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const contentType = mockContentTypes.find((ct) => ct.id === id);
        console.log(`[Mock API - ContentType] Fetched content type by ID ${id}:`, contentType);
        resolve(contentType);
      }, MOCK_API_DELAY);
    });
  },

  async createContentType(contentTypeData: NewContentTypeData): Promise<ContentType> {
    console.log('[Mock API - ContentType] Creating new content type:', contentTypeData);
    // return apiClient.post('/content-types', contentTypeData);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newContentType: ContentType = {
          id: (nextId++).toString(),
          ...contentTypeData,
        };
        mockContentTypes.push(newContentType);
        console.log('[Mock API - ContentType] Created content type:', newContentType);
        resolve(newContentType);
      }, MOCK_API_DELAY);
    });
  },

  async updateContentType(
    id: string,
    contentTypeData: Partial<NewContentTypeData>
  ): Promise<ContentType | undefined> {
    console.log(`[Mock API - ContentType] Updating content type ${id}:`, contentTypeData);
    // return apiClient.put(`/content-types/${id}`, contentTypeData);
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockContentTypes.findIndex((ct) => ct.id === id);
        if (index !== -1) {
          mockContentTypes[index] = {
            ...mockContentTypes[index],
            ...contentTypeData,
          } as ContentType;
          console.log('[Mock API - ContentType] Updated content type:', mockContentTypes[index]);
          resolve(mockContentTypes[index]);
        } else {
          console.log(`[Mock API - ContentType] Content type with ID ${id} not found for update.`);
          resolve(undefined);
        }
      }, MOCK_API_DELAY);
    });
  },

  async deleteContentType(id: string): Promise<void> {
    console.log(`[Mock API - ContentType] Deleting content type by ID: ${id}...`);
    // return apiClient.delete(`/content-types/${id}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        mockContentTypes = mockContentTypes.filter((ct) => ct.id !== id);
        console.log(
          `[Mock API - ContentType] Deleted content type with ID: ${id}. Remaining:`,
          mockContentTypes
        );
        resolve();
      }, MOCK_API_DELAY);
    });
  },
};
