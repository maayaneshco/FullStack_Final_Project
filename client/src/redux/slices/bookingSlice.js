import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import bookingService from "../../services/bookingService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchBookings = createAsyncThunk(
    "bookings/fetchBookings",
    async (_, { rejectWithValue }) => {
        try {
            return await bookingService.getBookings();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load bookings")
            );
        }
    }
);

export const fetchMyBookings = createAsyncThunk(
    "bookings/fetchMyBookings",
    async (_, { rejectWithValue }) => {
        try {
            return await bookingService.getMyBookings();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load my bookings")
            );
        }
    }
);

export const fetchBookingEquipmentOptions = createAsyncThunk(
    "bookings/fetchBookingEquipmentOptions",
    async (_, { rejectWithValue }) => {
        try {
            return await bookingService.getEquipmentOptions();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load equipment options")
            );
        }
    }
);

export const createBooking = createAsyncThunk(
    "bookings/createBooking",
    async (bookingData, { rejectWithValue }) => {
        try {
            return await bookingService.createBooking(bookingData);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to create booking")
            );
        }
    }
);

export const updateBooking = createAsyncThunk(
    "bookings/updateBooking",
    async (payload, { rejectWithValue }) => {
        try {
            return await bookingService.updateBooking(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update booking")
            );
        }
    }
);

export const cancelBooking = createAsyncThunk(
    "bookings/cancelBooking",
    async (bookingId, { rejectWithValue }) => {
        try {
            return await bookingService.cancelBooking(bookingId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to cancel booking")
            );
        }
    }
);

const initialState = {
    bookings: [],
    myBookings: [],
    equipmentOptions: [],
    loading: false,
    myLoading: false,
    equipmentLoading: false,
    actionLoading: false,
    error: "",
    myError: "",
    equipmentError: "",
    actionError: "",
};

const bookingSlice = createSlice({
    name: "bookings",
    initialState,
    reducers: {
        clearBookingErrors: (state) => {
            state.error = "";
            state.myError = "";
            state.equipmentError = "";
            state.actionError = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyBookings.pending, (state) => {
                state.myLoading = true;
                state.myError = "";
            })
            .addCase(fetchMyBookings.fulfilled, (state, action) => {
                state.myLoading = false;
                state.myBookings = action.payload;
            })
            .addCase(fetchMyBookings.rejected, (state, action) => {
                state.myLoading = false;
                state.myError = action.payload;
            })
            .addCase(fetchBookingEquipmentOptions.pending, (state) => {
                state.equipmentLoading = true;
                state.equipmentError = "";
            })
            .addCase(fetchBookingEquipmentOptions.fulfilled, (state, action) => {
                state.equipmentLoading = false;
                state.equipmentOptions = action.payload;
            })
            .addCase(fetchBookingEquipmentOptions.rejected, (state, action) => {
                state.equipmentLoading = false;
                state.equipmentError = action.payload;
            })
            .addCase(createBooking.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.bookings.unshift(action.payload);
                state.myBookings.unshift(action.payload);
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(updateBooking.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateBooking.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.bookings = state.bookings.map((booking) =>
                    booking._id === action.payload._id ? action.payload : booking
                );
                state.myBookings = state.myBookings.map((booking) =>
                    booking._id === action.payload._id ? action.payload : booking
                );
            })
            .addCase(updateBooking.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(cancelBooking.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.bookings = state.bookings.map((booking) =>
                    booking._id === action.payload._id ? action.payload : booking
                );
                state.myBookings = state.myBookings.map((booking) =>
                    booking._id === action.payload._id ? action.payload : booking
                );
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearBookingErrors } = bookingSlice.actions;

export default bookingSlice.reducer;
