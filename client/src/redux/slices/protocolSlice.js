import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    protocols: [],
};

const protocolSlice = createSlice({
    name: "protocols",
    initialState,
    reducers: {},
});

export default protocolSlice.reducer;