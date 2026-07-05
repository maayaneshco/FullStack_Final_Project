import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    projects: [],
};

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {},
});

export default projectSlice.reducer;