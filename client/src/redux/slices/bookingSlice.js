import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    bookings: [],
};

const bookingSlice = createSlice({
    name: "bookings",
    initialState,
    reducers: {},
});

export default bookingSlice.reducer;