import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import equipmentService from "../../services/equipmentService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchEquipment = createAsyncThunk(
    "equipment/fetchEquipment",
    async (_, { rejectWithValue }) => {
        try {
            return await equipmentService.getEquipment();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load equipment")
            );
        }
    }
);

export const fetchEquipmentById = createAsyncThunk(
    "equipment/fetchEquipmentById",
    async (equipmentId, { rejectWithValue }) => {
        try {
            return await equipmentService.getEquipmentById(equipmentId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load equipment details")
            );
        }
    }
);

export const createEquipment = createAsyncThunk(
    "equipment/createEquipment",
    async (equipmentData, { rejectWithValue }) => {
        try {
            return await equipmentService.createEquipment(equipmentData);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to create equipment")
            );
        }
    }
);

export const updateEquipment = createAsyncThunk(
    "equipment/updateEquipment",
    async (payload, { rejectWithValue }) => {
        try {
            return await equipmentService.updateEquipment(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update equipment")
            );
        }
    }
);

export const deleteEquipment = createAsyncThunk(
    "equipment/deleteEquipment",
    async (equipmentId, { rejectWithValue }) => {
        try {
            return await equipmentService.deleteEquipment(equipmentId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to delete equipment")
            );
        }
    }
);

const initialState = {
    equipment: [],
    selectedEquipment: null,
    loading: false,
    detailLoading: false,
    actionLoading: false,
    error: "",
    detailError: "",
    actionError: "",
};

const equipmentSlice = createSlice({
    name: "equipment",
    initialState,
    reducers: {
        clearEquipmentErrors: (state) => {
            state.error = "";
            state.detailError = "";
            state.actionError = "";
        },
        clearSelectedEquipment: (state) => {
            state.selectedEquipment = null;
            state.detailError = "";
            state.actionError = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEquipment.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchEquipment.fulfilled, (state, action) => {
                state.loading = false;
                state.equipment = action.payload;
            })
            .addCase(fetchEquipment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchEquipmentById.pending, (state) => {
                state.detailLoading = true;
                state.detailError = "";
            })
            .addCase(fetchEquipmentById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedEquipment = action.payload;
            })
            .addCase(fetchEquipmentById.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            })
            .addCase(createEquipment.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(createEquipment.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.equipment.unshift(action.payload);
            })
            .addCase(createEquipment.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(updateEquipment.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateEquipment.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.equipment = state.equipment.map((item) =>
                    item._id === action.payload._id ? action.payload : item
                );
                state.selectedEquipment = action.payload;
            })
            .addCase(updateEquipment.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(deleteEquipment.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(deleteEquipment.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.equipment = state.equipment.filter(
                    (item) => item._id !== action.payload.equipmentId
                );
                if (state.selectedEquipment?._id === action.payload.equipmentId) {
                    state.selectedEquipment = null;
                }
            })
            .addCase(deleteEquipment.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearEquipmentErrors, clearSelectedEquipment } =
    equipmentSlice.actions;

export default equipmentSlice.reducer;
