import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    equipment: [],
};

const equipmentSlice = createSlice({
    name: "equipment",
    initialState,
    reducers: {},
});

export default equipmentSlice.reducer;