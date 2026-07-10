import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async Thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      // Build query string from filters object
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, val);
        }
      });
      const response = await api.get(`/properties?${params.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property details');
    }
  }
);

export const fetchMyProperties = createAsyncThunk(
  'properties/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/properties/my-listings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your properties');
    }
  }
);

export const createNewProperty = createAsyncThunk(
  'properties/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to list property');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/properties/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'properties/toggleFavorite',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/properties/${id}/favorite`);
      return response.data; // contains list of favorite ids
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle favorite');
    }
  }
);

const initialState = {
  properties: [],
  myProperties: [],
  currentProperty: null,
  compareList: [],
  loading: false,
  error: null,
};

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    addToCompare: (state, action) => {
      const exists = state.compareList.find((p) => p._id === action.payload._id);
      if (exists) return;
      if (state.compareList.length >= 3) {
        state.compareList.shift(); // keep maximum of 3 properties
      }
      state.compareList.push(action.payload);
    },
    removeFromCompare: (state, action) => {
      state.compareList = state.compareList.filter((p) => p._id !== action.payload);
    },
    clearCompareList: (state) => {
      state.compareList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProperty = action.payload.property;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My List
      .addCase(fetchMyProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.myProperties = action.payload.properties;
      })
      .addCase(fetchMyProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.myProperties = state.myProperties.filter((p) => p._id !== action.payload.id);
        state.properties = state.properties.filter((p) => p._id !== action.payload.id);
      });
  },
});

export const {
  clearCurrentProperty,
  addToCompare,
  removeFromCompare,
  clearCompareList,
} = propertySlice.actions;

export default propertySlice.reducer;
