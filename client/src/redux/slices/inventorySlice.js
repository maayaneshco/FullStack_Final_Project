import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
};

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {},
});

export default inventorySlice.reducer;