import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoryService, Category, NewCategory } from '../../services/categoryService';
// import { RootState } from '../store'; // Assuming a RootState type is defined in your store config

export interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  loading: 'idle',
  error: null,
};

// Async Thunks
export const fetchCategories = createAsyncThunk('categories/fetchAll', async () => {
  const response = await categoryService.getAllCategories();
  return response;
});

export const fetchCategoryById = createAsyncThunk('categories/fetchById', async (id: string) => {
  const response = await categoryService.getCategoryById(id);
  return response;
});

export const addNewCategory = createAsyncThunk(
  'categories/addNew',
  async (newCategory: NewCategory) => {
    const response = await categoryService.createCategory(newCategory);
    return response;
  }
);

export const updateExistingCategory = createAsyncThunk(
  'categories/updateExisting',
  async ({ id, categoryData }: { id: string; categoryData: Partial<NewCategory> }) => {
    const response = await categoryService.updateCategory(id, categoryData);
    return response;
  }
);

export const deleteExistingCategory = createAsyncThunk(
  'categories/deleteExisting',
  async (id: string) => {
    await categoryService.deleteCategory(id);
    return id; // Return id to remove from state
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    // Add other synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      // fetchCategoryById
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = 'pending';
        state.currentCategory = null;
        state.error = null;
      })
      .addCase(
        fetchCategoryById.fulfilled,
        (state, action: PayloadAction<Category | undefined>) => {
          state.loading = 'succeeded';
          state.currentCategory = action.payload || null;
        }
      )
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      // addNewCategory
      .addCase(addNewCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
        // Optionally set as current or clear form, etc.
      })
      // updateExistingCategory
      .addCase(
        updateExistingCategory.fulfilled,
        (state, action: PayloadAction<Category | undefined>) => {
          if (action.payload) {
            const index = state.categories.findIndex((cat) => cat.id === action.payload!.id);
            if (index !== -1) {
              state.categories[index] = action.payload;
            }
            if (state.currentCategory && state.currentCategory.id === action.payload.id) {
              state.currentCategory = action.payload;
            }
          }
        }
      )
      // deleteExistingCategory
      .addCase(deleteExistingCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((cat) => cat.id !== action.payload);
        if (state.currentCategory && state.currentCategory.id === action.payload) {
          state.currentCategory = null;
        }
      });
  },
});

export const { clearCurrentCategory } = categorySlice.actions;

// Selectors (optional, can be defined elsewhere or inline)
// export const selectAllCategories = (state: RootState) => state.categories.categories;
// export const selectCurrentCategory = (state: RootState) => state.categories.currentCategory;
// export const selectCategoriesLoading = (state: RootState) => state.categories.loading;
// export const selectCategoriesError = (state: RootState) => state.categories.error;

export default categorySlice.reducer;
