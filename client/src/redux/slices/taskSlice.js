import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tasks: [],
};

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {},
});

export default taskSlice.reducer;