import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  contentTypeService,
  ContentType,
  NewContentTypeData,
} from '../../services/contentTypeService';
// import { RootState } from '../store';

export interface ContentTypeState {
  contentTypes: ContentType[];
  currentContentType: ContentType | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: ContentTypeState = {
  contentTypes: [],
  currentContentType: null,
  loading: 'idle',
  error: null,
};

// Async Thunks
export const fetchContentTypes = createAsyncThunk('contentTypes/fetchAll', async () => {
  const response = await contentTypeService.getAllContentTypes();
  return response;
});

export const fetchContentTypeById = createAsyncThunk(
  'contentTypes/fetchById',
  async (id: string) => {
    const response = await contentTypeService.getContentTypeById(id);
    return response;
  }
);

export const addNewContentType = createAsyncThunk(
  'contentTypes/addNew',
  async (newContentType: NewContentTypeData) => {
    const response = await contentTypeService.createContentType(newContentType);
    return response;
  }
);

export const updateExistingContentType = createAsyncThunk(
  'contentTypes/updateExisting',
  async ({ id, contentTypeData }: { id: string; contentTypeData: Partial<NewContentTypeData> }) => {
    const response = await contentTypeService.updateContentType(id, contentTypeData);
    return response;
  }
);

export const deleteExistingContentType = createAsyncThunk(
  'contentTypes/deleteExisting',
  async (id: string) => {
    await contentTypeService.deleteContentType(id);
    return id; // Return id to remove from state
  }
);

const contentTypeSlice = createSlice({
  name: 'contentTypes',
  initialState,
  reducers: {
    clearCurrentContentType: (state) => {
      state.currentContentType = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchContentTypes
      .addCase(fetchContentTypes.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchContentTypes.fulfilled, (state, action: PayloadAction<ContentType[]>) => {
        state.loading = 'succeeded';
        state.contentTypes = action.payload;
      })
      .addCase(fetchContentTypes.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      // fetchContentTypeById
      .addCase(fetchContentTypeById.pending, (state) => {
        state.loading = 'pending';
        state.currentContentType = null;
        state.error = null;
      })
      .addCase(
        fetchContentTypeById.fulfilled,
        (state, action: PayloadAction<ContentType | undefined>) => {
          state.loading = 'succeeded';
          state.currentContentType = action.payload || null;
        }
      )
      .addCase(fetchContentTypeById.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message;
      })
      // addNewContentType
      .addCase(addNewContentType.fulfilled, (state, action: PayloadAction<ContentType>) => {
        state.contentTypes.push(action.payload);
      })
      // updateExistingContentType
      .addCase(
        updateExistingContentType.fulfilled,
        (state, action: PayloadAction<ContentType | undefined>) => {
          if (action.payload) {
            const index = state.contentTypes.findIndex((ct) => ct.id === action.payload!.id);
            if (index !== -1) {
              state.contentTypes[index] = action.payload;
            }
            if (state.currentContentType && state.currentContentType.id === action.payload.id) {
              state.currentContentType = action.payload;
            }
          }
        }
      )
      // deleteExistingContentType
      .addCase(deleteExistingContentType.fulfilled, (state, action: PayloadAction<string>) => {
        state.contentTypes = state.contentTypes.filter((ct) => ct.id !== action.payload);
        if (state.currentContentType && state.currentContentType.id === action.payload) {
          state.currentContentType = null;
        }
      });
  },
});

export const { clearCurrentContentType } = contentTypeSlice.actions;

// Selectors
// export const selectAllContentTypes = (state: RootState) => state.contentTypes.contentTypes;
// export const selectCurrentContentType = (state: RootState) => state.contentTypes.currentContentType;
// export const selectContentTypesLoading = (state: RootState) => state.contentTypes.loading;
// export const selectContentTypesError = (state: RootState) => state.contentTypes.error;

export default contentTypeSlice.reducer;
