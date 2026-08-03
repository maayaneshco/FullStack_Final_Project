import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import protocolService from "../../services/protocolService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchProtocols = createAsyncThunk(
    "protocols/fetchProtocols",
    async (filters, { rejectWithValue }) => {
        try {
            return await protocolService.getProtocols(filters);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load protocols")
            );
        }
    }
);

export const createProtocol = createAsyncThunk(
    "protocols/createProtocol",
    async (formData, { rejectWithValue }) => {
        try {
            return await protocolService.createProtocol(formData);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to upload protocol")
            );
        }
    }
);

export const updateProtocol = createAsyncThunk(
    "protocols/updateProtocol",
    async (payload, { rejectWithValue }) => {
        try {
            return await protocolService.updateProtocol(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update protocol")
            );
        }
    }
);

export const deleteProtocol = createAsyncThunk(
    "protocols/deleteProtocol",
    async (protocolId, { rejectWithValue }) => {
        try {
            return await protocolService.deleteProtocol(protocolId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to delete protocol")
            );
        }
    }
);

const initialState = {
    protocols: [],
    loading: false,
    actionLoading: false,
    error: "",
    actionError: "",
};

const protocolSlice = createSlice({
    name: "protocols",
    initialState,
    reducers: {
        clearProtocolErrors: (state) => {
            state.error = "";
            state.actionError = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProtocols.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchProtocols.fulfilled, (state, action) => {
                state.loading = false;
                state.protocols = action.payload;
            })
            .addCase(fetchProtocols.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createProtocol.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(createProtocol.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.protocols.unshift(action.payload);
            })
            .addCase(createProtocol.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(updateProtocol.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateProtocol.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.protocols = state.protocols.map((protocol) =>
                    protocol._id === action.payload._id ? action.payload : protocol
                );
            })
            .addCase(updateProtocol.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(deleteProtocol.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(deleteProtocol.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.protocols = state.protocols.filter(
                    (protocol) => protocol._id !== action.payload.protocolId
                );
            })
            .addCase(deleteProtocol.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearProtocolErrors } = protocolSlice.actions;

export default protocolSlice.reducer;
