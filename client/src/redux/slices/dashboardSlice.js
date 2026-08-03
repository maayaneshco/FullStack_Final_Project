import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import dashboardService from "../../services/dashboardService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchDashboard = createAsyncThunk(
    "dashboard/fetchDashboard",
    async (_, { rejectWithValue }) => {
        try {
            return await dashboardService.getDashboard();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load dashboard")
            );
        }
    }
);

const initialState = {
    data: null,
    loading: false,
    error: "",
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
