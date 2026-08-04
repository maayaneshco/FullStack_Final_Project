import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import userService from "../../services/userService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchUsers = createAsyncThunk(
    "userManagement/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            return await userService.getUsers();
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to load users"));
        }
    }
);

export const updateManagedUserRole = createAsyncThunk(
    "userManagement/updateManagedUserRole",
    async (payload, { rejectWithValue }) => {
        try {
            return await userService.updateUserRole(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update user role")
            );
        }
    }
);

const initialState = {
    users: [],
    loading: false,
    error: "",
    actionLoading: false,
    actionError: "",
};

const userManagementSlice = createSlice({
    name: "userManagement",
    initialState,
    reducers: {
        clearUserManagementErrors: (state) => {
            state.error = "";
            state.actionError = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateManagedUserRole.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateManagedUserRole.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.users = state.users.map((user) =>
                    user._id === action.payload._id ? action.payload : user
                );
            })
            .addCase(updateManagedUserRole.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearUserManagementErrors } = userManagementSlice.actions;

export default userManagementSlice.reducer;
