import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import responsibilityService from "../../services/responsibilityService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchResponsibilities = createAsyncThunk(
    "responsibilities/fetchResponsibilities",
    async (_, { rejectWithValue }) => {
        try {
            return await responsibilityService.getResponsibilities();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load responsibilities")
            );
        }
    }
);

export const fetchMyResponsibilities = createAsyncThunk(
    "responsibilities/fetchMyResponsibilities",
    async (_, { rejectWithValue }) => {
        try {
            return await responsibilityService.getMyResponsibilities();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load my responsibilities")
            );
        }
    }
);

export const createResponsibility = createAsyncThunk(
    "responsibilities/createResponsibility",
    async (responsibilityData, { rejectWithValue }) => {
        try {
            return await responsibilityService.createResponsibility(
                responsibilityData
            );
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to create responsibility")
            );
        }
    }
);

export const updateResponsibility = createAsyncThunk(
    "responsibilities/updateResponsibility",
    async (payload, { rejectWithValue }) => {
        try {
            return await responsibilityService.updateResponsibility(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update responsibility")
            );
        }
    }
);

export const deleteResponsibility = createAsyncThunk(
    "responsibilities/deleteResponsibility",
    async (responsibilityId, { rejectWithValue }) => {
        try {
            return await responsibilityService.deleteResponsibility(
                responsibilityId
            );
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to delete responsibility")
            );
        }
    }
);

const initialState = {
    responsibilities: [],
    myResponsibilities: [],
    loading: false,
    myLoading: false,
    actionLoading: false,
    error: "",
    myError: "",
    actionError: "",
};

const responsibilitySlice = createSlice({
    name: "responsibilities",
    initialState,
    reducers: {
        clearResponsibilityErrors: (state) => {
            state.error = "";
            state.myError = "";
            state.actionError = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchResponsibilities.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchResponsibilities.fulfilled, (state, action) => {
                state.loading = false;
                state.responsibilities = action.payload;
            })
            .addCase(fetchResponsibilities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyResponsibilities.pending, (state) => {
                state.myLoading = true;
                state.myError = "";
            })
            .addCase(fetchMyResponsibilities.fulfilled, (state, action) => {
                state.myLoading = false;
                state.myResponsibilities = action.payload;
            })
            .addCase(fetchMyResponsibilities.rejected, (state, action) => {
                state.myLoading = false;
                state.myError = action.payload;
            })
            .addCase(createResponsibility.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(createResponsibility.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.responsibilities.unshift(action.payload);
            })
            .addCase(createResponsibility.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(updateResponsibility.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateResponsibility.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.responsibilities = state.responsibilities.map(
                    (responsibility) =>
                        responsibility._id === action.payload._id
                            ? action.payload
                            : responsibility
                );
                state.myResponsibilities = state.myResponsibilities.map(
                    (responsibility) =>
                        responsibility._id === action.payload._id
                            ? action.payload
                            : responsibility
                );
            })
            .addCase(updateResponsibility.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(deleteResponsibility.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(deleteResponsibility.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.responsibilities = state.responsibilities.filter(
                    (responsibility) =>
                        responsibility._id !== action.payload.responsibilityId
                );
                state.myResponsibilities = state.myResponsibilities.filter(
                    (responsibility) =>
                        responsibility._id !== action.payload.responsibilityId
                );
            })
            .addCase(deleteResponsibility.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearResponsibilityErrors } = responsibilitySlice.actions;

export default responsibilitySlice.reducer;
