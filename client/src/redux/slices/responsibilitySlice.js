import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    responsibilities: [],
};

const responsibilitySlice = createSlice({
    name: "responsibilities",
    initialState,
    reducers: {},
});

export default responsibilitySlice.reducer;