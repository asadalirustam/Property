import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// High-fidelity fallback mock properties for local demos
export const mockPropertiesFallback = [
  {
    _id: "mock_lh_1",
    title: "Modern 5 Marla Executive Villa in DHA",
    description: "Exquisite 5 Marla custom-built villa located in Sector C, DHA Phase 6, Lahore. Features Italian tile floors, double-height drawing and dining halls, modular kitchen with luxury fixtures, and a spacious terrace overlooking the park.",
    purpose: "sale",
    propertyType: "Villa",
    price: 18500000,
    city: "Lahore",
    area: "DHA Phase 6",
    address: "Sector C, House 145, DHA Phase 6",
    location: {
      type: "Point",
      coordinates: [74.4412, 31.4722] // Precise DHA 6 Lahore coordinates
    },
    bedrooms: 3,
    bathrooms: 4,
    kitchens: 2,
    garage: 1,
    areaSize: "5 Marla",
    yearBuilt: 2025,
    amenities: { parking: true, swimmingPool: false, garden: true, gym: false, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true,
    isVerified: true,
    approvalStatus: 'approved',
    views: 120,
    owner: {
      _id: "agent_demo_id",
      name: "Ali Real Estate Agency",
      email: "agent@property.com",
      phone: "+923007654321",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"
    }
  },
  {
    _id: "mock_isb_2",
    title: "Luxury 3 Bed Apartment in Centaurus",
    description: "Breathtaking 3-bedroom luxury apartment on the 8th floor of Tower B, Centaurus Mall, Sector F-8, Islamabad. Includes panoramic floor-to-ceiling views of the Margalla Hills, underground parking slots, central air conditioning, and premium membership to the residencies health club.",
    purpose: "rent",
    propertyType: "Apartment",
    price: 150000,
    city: "Islamabad",
    area: "Sector F-8",
    address: "Tower B, Apartment 802, Centaurus Mall, Sector F-8",
    location: {
      type: "Point",
      coordinates: [73.0505, 33.7077] // Centaurus F-8 Islamabad coordinates
    },
    bedrooms: 3,
    bathrooms: 3,
    kitchens: 1,
    garage: 2,
    areaSize: "1800 Sq. Ft.",
    yearBuilt: 2024,
    amenities: { parking: true, swimmingPool: true, garden: false, gym: true, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    isFeatured: true,
    isVerified: true,
    approvalStatus: 'approved',
    views: 245,
    owner: {
      _id: "agent_demo_id",
      name: "Ali Real Estate Agency",
      email: "agent@property.com",
      phone: "+923007654321",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"
    }
  },
  {
    _id: "mock_khi_3",
    title: "Beach Avenue Seaside Clifton Apartment",
    description: "Spectacular ocean-facing 2 bedroom apartment on Beach Avenue, Clifton Block 2, Karachi. Modern modular kitchen, marble flooring, private balcony overlooking the Arabian Sea, continuous water supply, and top-tier gated community security details.",
    purpose: "sale",
    propertyType: "Apartment",
    price: 26000000,
    city: "Karachi",
    area: "Clifton",
    address: "Seaside Heights, Block 2, Clifton",
    location: {
      type: "Point",
      coordinates: [67.0315, 24.8138] // Clifton Block 2 Karachi coordinates
    },
    bedrooms: 2,
    bathrooms: 2,
    kitchens: 1,
    garage: 1,
    areaSize: "1250 Sq. Ft.",
    yearBuilt: 2023,
    amenities: { parking: true, swimmingPool: false, garden: false, gym: false, electricityBackup: true, waterSupply: true, gas: true, internet: true, security: true },
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"],
    isFeatured: false,
    isVerified: true,
    approvalStatus: 'approved',
    views: 89,
    owner: {
      _id: "agent_demo_id",
      name: "Ali Real Estate Agency",
      email: "agent@property.com",
      phone: "+923007654321",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80"
    }
  }
];

// Async Thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
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
        state.compareList.shift();
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
        // Fall back to mock properties if backend returned empty array
        state.properties = action.payload.properties.length > 0 
          ? action.payload.properties 
          : mockPropertiesFallback;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        // Fallback on network/API failure
        state.properties = mockPropertiesFallback;
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
        // Fallback to match mock by ID if backend details load fails
        const mockMatch = mockPropertiesFallback.find((p) => p._id === action.meta.arg);
        if (mockMatch) {
          state.currentProperty = mockMatch;
        } else {
          state.error = action.payload;
        }
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
        state.myProperties = mockPropertiesFallback;
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
