import apiClient from './apiClient';

export interface TaxonomyCategory {
  id: number;
  tenant_id?: number;
  parent_id?: number | null;
  level: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  children?: TaxonomyCategory[];
  created_at?: string;
  updated_at?: string;
}

export interface TaxonomyAttribute {
  id: number;
  tenant_id?: number;
  category_id: number;
  attribute_name: string;
  attribute_key: string;
  data_type: string;
  is_required: boolean;
  unit_of_measure?: string;
  default_value?: string;
  options?: any;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const TAXONOMY_PREFIX = '/taxonomy';

export const taxonomyService = {
  // Category Operations
  getCategoriesTree: async () => {
    const response = await apiClient.get(`${TAXONOMY_PREFIX}/categories/tree`);
    return response.data;
  },

  listCategories: async (parentId?: number) => {
    const params = parentId ? { parent_id: parentId } : {};
    const response = await apiClient.get(`${TAXONOMY_PREFIX}/categories`, { params });
    return response.data;
  },

  getCategory: async (id: number) => {
    const response = await apiClient.get(`${TAXONOMY_PREFIX}/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: Partial<TaxonomyCategory>) => {
    const response = await apiClient.post(`${TAXONOMY_PREFIX}/categories`, data);
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<TaxonomyCategory>) => {
    const response = await apiClient.put(`${TAXONOMY_PREFIX}/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await apiClient.delete(`${TAXONOMY_PREFIX}/categories/${id}`);
    return response.data;
  },

  // Attribute Operations
  getInheritedAttributes: async (categoryId: number) => {
    const response = await apiClient.get(`${TAXONOMY_PREFIX}/categories/${categoryId}/attributes/inherited`);
    return response.data;
  },

  createAttribute: async (data: Partial<TaxonomyAttribute>) => {
    const response = await apiClient.post(`${TAXONOMY_PREFIX}/attributes`, data);
    return response.data;
  },

  updateAttribute: async (id: number, data: Partial<TaxonomyAttribute>) => {
    const response = await apiClient.put(`${TAXONOMY_PREFIX}/attributes/${id}`, data);
    return response.data;
  },

  deleteAttribute: async (id: number) => {
    const response = await apiClient.delete(`${TAXONOMY_PREFIX}/attributes/${id}`);
    return response.data;
  }
};
