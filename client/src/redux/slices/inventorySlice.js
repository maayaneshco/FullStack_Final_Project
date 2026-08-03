import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import inventoryService from "../../services/inventoryService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchInventoryItems = createAsyncThunk(
    "inventory/fetchInventoryItems",
    async (_, { rejectWithValue }) => {
        try {
            return await inventoryService.getInventoryItems();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load inventory")
            );
        }
    }
);

export const fetchLowStockItems = createAsyncThunk(
    "inventory/fetchLowStockItems",
    async (_, { rejectWithValue }) => {
        try {
            return await inventoryService.getLowStockItems();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load low stock items")
            );
        }
    }
);

export const fetchExpiredItems = createAsyncThunk(
    "inventory/fetchExpiredItems",
    async (_, { rejectWithValue }) => {
        try {
            return await inventoryService.getExpiredItems();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load expired inventory")
            );
        }
    }
);

export const createInventoryItem = createAsyncThunk(
    "inventory/createInventoryItem",
    async (itemData, { rejectWithValue }) => {
        try {
            return await inventoryService.createInventoryItem(itemData);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to create inventory item")
            );
        }
    }
);

export const updateInventoryItem = createAsyncThunk(
    "inventory/updateInventoryItem",
    async (payload, { rejectWithValue }) => {
        try {
            return await inventoryService.updateInventoryItem(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update inventory item")
            );
        }
    }
);

export const deleteInventoryItem = createAsyncThunk(
    "inventory/deleteInventoryItem",
    async (itemId, { rejectWithValue }) => {
        try {
            return await inventoryService.deleteInventoryItem(itemId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to delete inventory item")
            );
        }
    }
);

const initialState = {
    items: [],
    lowStockItems: [],
    expiredItems: [],
    loading: false,
    lowStockLoading: false,
    expiredLoading: false,
    actionLoading: false,
    error: "",
    lowStockError: "",
    expiredError: "",
    actionError: "",
};

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        clearInventoryErrors: (state) => {
            state.error = "";
            state.lowStockError = "";
            state.expiredError = "";
            state.actionError = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInventoryItems.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchInventoryItems.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchInventoryItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchLowStockItems.pending, (state) => {
                state.lowStockLoading = true;
                state.lowStockError = "";
            })
            .addCase(fetchLowStockItems.fulfilled, (state, action) => {
                state.lowStockLoading = false;
                state.lowStockItems = action.payload;
            })
            .addCase(fetchLowStockItems.rejected, (state, action) => {
                state.lowStockLoading = false;
                state.lowStockError = action.payload;
            })
            .addCase(fetchExpiredItems.pending, (state) => {
                state.expiredLoading = true;
                state.expiredError = "";
            })
            .addCase(fetchExpiredItems.fulfilled, (state, action) => {
                state.expiredLoading = false;
                state.expiredItems = action.payload;
            })
            .addCase(fetchExpiredItems.rejected, (state, action) => {
                state.expiredLoading = false;
                state.expiredError = action.payload;
            })
            .addCase(createInventoryItem.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(createInventoryItem.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.items.unshift(action.payload);
            })
            .addCase(createInventoryItem.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(updateInventoryItem.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateInventoryItem.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.items = state.items.map((item) =>
                    item._id === action.payload._id ? action.payload : item
                );
                state.lowStockItems = state.lowStockItems.map((item) =>
                    item._id === action.payload._id ? action.payload : item
                );
                state.expiredItems = state.expiredItems.map((item) =>
                    item._id === action.payload._id ? action.payload : item
                );
            })
            .addCase(updateInventoryItem.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(deleteInventoryItem.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(deleteInventoryItem.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.items = state.items.filter(
                    (item) => item._id !== action.payload.itemId
                );
                state.lowStockItems = state.lowStockItems.filter(
                    (item) => item._id !== action.payload.itemId
                );
                state.expiredItems = state.expiredItems.filter(
                    (item) => item._id !== action.payload.itemId
                );
            })
            .addCase(deleteInventoryItem.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearInventoryErrors } = inventorySlice.actions;

export default inventorySlice.reducer;
