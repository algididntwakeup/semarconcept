// import apiClient from './apiClient'; // Assuming a configured Axios instance

export interface Category {
  id: string;
  name: string;
  description: string;
  // Add other relevant fields like parentId, order, etc.
}

export interface NewCategory {
  name: string;
  description: string;
  // Add other relevant fields
}

// Mock data store
let mockCategories: Category[] = [
  { id: '1', name: 'General', description: 'General system settings' },
  { id: '2', name: 'Appearance', description: 'UI theme and layout settings' },
  { id: '3', name: 'Security', description: 'Security-related configurations' },
];

let nextId = 4;

const MOCK_API_DELAY = 500; // ms

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    console.log('[Mock API] Fetching all categories...');
    // return apiClient.get('/system-configuration/categories'); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Mock API] Fetched categories:', mockCategories);
        resolve([...mockCategories]); // Return a copy
      }, MOCK_API_DELAY);
    });
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    console.log(`[Mock API] Fetching category by ID: ${id}...`);
    // return apiClient.get(`/system-configuration/categories/${id}`); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const category = mockCategories.find((cat) => cat.id === id);
        console.log(`[Mock API] Fetched category by ID ${id}:`, category);
        resolve(category);
      }, MOCK_API_DELAY);
    });
  },

  async createCategory(categoryData: NewCategory): Promise<Category> {
    console.log('[Mock API] Creating new category:', categoryData);
    // return apiClient.post('/system-configuration/categories', categoryData); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCategory: Category = {
          id: (nextId++).toString(),
          ...categoryData,
        };
        mockCategories.push(newCategory);
        console.log('[Mock API] Created category:', newCategory);
        resolve(newCategory);
      }, MOCK_API_DELAY);
    });
  },

  async updateCategory(
    id: string,
    categoryData: Partial<NewCategory>
  ): Promise<Category | undefined> {
    console.log(`[Mock API] Updating category ${id}:`, categoryData);
    // return apiClient.put(`/system-configuration/categories/${id}`, categoryData); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockCategories.findIndex((cat) => cat.id === id);
        if (index !== -1) {
          mockCategories[index] = { ...mockCategories[index], ...categoryData };
          console.log('[Mock API] Updated category:', mockCategories[index]);
          resolve(mockCategories[index]);
        } else {
          console.log(`[Mock API] Category with ID ${id} not found for update.`);
          resolve(undefined);
        }
      }, MOCK_API_DELAY);
    });
  },

  async deleteCategory(id: string): Promise<void> {
    console.log(`[Mock API] Deleting category by ID: ${id}...`);
    // return apiClient.delete(`/system-configuration/categories/${id}`); // Real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        mockCategories = mockCategories.filter((cat) => cat.id !== id);
        console.log(`[Mock API] Deleted category with ID: ${id}. Remaining:`, mockCategories);
        resolve();
      }, MOCK_API_DELAY);
    });
  },
};

// Example of how to use it (can be removed or kept for testing)
// async function testService() {
//   console.log('--- Testing Category Service ---');
//   let categories = await categoryService.getAllCategories();
//   console.log('All categories:', categories);

//   const newCat = await categoryService.createCategory({ name: 'New Test Category', description: 'A test desc' });
//   console.log('Created category:', newCat);

//   categories = await categoryService.getAllCategories();
//   console.log('All categories after create:', categories);

//   if (newCat) {
//     const updatedCat = await categoryService.updateCategory(newCat.id, { name: 'Updated Test Category Name' });
//     console.log('Updated category:', updatedCat);

//     const singleCat = await categoryService.getCategoryById(newCat.id);
//     console.log('Single category after update:', singleCat);

//     await categoryService.deleteCategory(newCat.id);
//     console.log(`Category ${newCat.id} deleted.`);
//   }

//   categories = await categoryService.getAllCategories();
//   console.log('All categories after delete:', categories);
//   console.log('--- End Test ---');
// }

// testService();
