import { configureStore } from "@reduxjs/toolkit";

import dashboardReducer from "./slices/dashboardSlice";
import projectReducer from "./slices/projectSlice";
import taskReducer from "./slices/taskSlice";
import responsibilityReducer from "./slices/responsibilitySlice";
import inventoryReducer from "./slices/inventorySlice";
import equipmentReducer from "./slices/equipmentSlice";
import bookingReducer from "./slices/bookingSlice";
import protocolReducer from "./slices/protocolSlice";

const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        projects: projectReducer,
        tasks: taskReducer,
        responsibilities: responsibilityReducer,
        inventory: inventoryReducer,
        equipment: equipmentReducer,
        bookings: bookingReducer,
        protocols: protocolReducer,
    },
});

export default store;