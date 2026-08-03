import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import taskService from "../../services/taskService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchTasks = createAsyncThunk(
    "tasks/fetchTasks",
    async (_, { rejectWithValue }) => {
        try {
            return await taskService.getTasks();
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, "Failed to load tasks"));
        }
    }
);

export const fetchCompletedTasks = createAsyncThunk(
    "tasks/fetchCompletedTasks",
    async (_, { rejectWithValue }) => {
        try {
            return await taskService.getCompletedTasks();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load completed tasks")
            );
        }
    }
);

export const fetchOverdueTasks = createAsyncThunk(
    "tasks/fetchOverdueTasks",
    async (_, { rejectWithValue }) => {
        try {
            return await taskService.getOverdueTasks();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load overdue tasks")
            );
        }
    }
);

export const createTask = createAsyncThunk(
    "tasks/createTask",
    async (taskData, { rejectWithValue }) => {
        try {
            return await taskService.createTask(taskData);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to create task")
            );
        }
    }
);

export const updateTask = createAsyncThunk(
    "tasks/updateTask",
    async (payload, { rejectWithValue }) => {
        try {
            return await taskService.updateTask(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update task")
            );
        }
    }
);

export const updateTaskStatus = createAsyncThunk(
    "tasks/updateTaskStatus",
    async (payload, { rejectWithValue }) => {
        try {
            return await taskService.updateTaskStatus(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update task status")
            );
        }
    }
);

export const deleteTask = createAsyncThunk(
    "tasks/deleteTask",
    async (taskId, { rejectWithValue }) => {
        try {
            return await taskService.deleteTask(taskId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to delete task")
            );
        }
    }
);

const initialState = {
    tasks: [],
    completedTasks: [],
    overdueTasks: [],
    loading: false,
    completedLoading: false,
    overdueLoading: false,
    actionLoading: false,
    error: "",
    completedError: "",
    overdueError: "",
    actionError: "",
};

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        clearTaskErrors: (state) => {
            state.error = "";
            state.completedError = "";
            state.overdueError = "";
            state.actionError = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCompletedTasks.pending, (state) => {
                state.completedLoading = true;
                state.completedError = "";
            })
            .addCase(fetchCompletedTasks.fulfilled, (state, action) => {
                state.completedLoading = false;
                state.completedTasks = action.payload;
            })
            .addCase(fetchCompletedTasks.rejected, (state, action) => {
                state.completedLoading = false;
                state.completedError = action.payload;
            })
            .addCase(fetchOverdueTasks.pending, (state) => {
                state.overdueLoading = true;
                state.overdueError = "";
            })
            .addCase(fetchOverdueTasks.fulfilled, (state, action) => {
                state.overdueLoading = false;
                state.overdueTasks = action.payload;
            })
            .addCase(fetchOverdueTasks.rejected, (state, action) => {
                state.overdueLoading = false;
                state.overdueError = action.payload;
            })
            .addCase(createTask.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.tasks.unshift(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(updateTask.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.tasks = state.tasks.map((task) =>
                    task._id === action.payload._id ? action.payload : task
                );
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(updateTaskStatus.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.tasks = state.tasks.map((task) =>
                    task._id === action.payload._id ? action.payload : task
                );
                state.completedTasks = state.completedTasks.map((task) =>
                    task._id === action.payload._id ? action.payload : task
                );
                state.overdueTasks = state.overdueTasks.map((task) =>
                    task._id === action.payload._id ? action.payload : task
                );
            })
            .addCase(updateTaskStatus.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(deleteTask.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.tasks = state.tasks.filter(
                    (task) => task._id !== action.payload.taskId
                );
                state.completedTasks = state.completedTasks.filter(
                    (task) => task._id !== action.payload.taskId
                );
                state.overdueTasks = state.overdueTasks.filter(
                    (task) => task._id !== action.payload.taskId
                );
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearTaskErrors } = taskSlice.actions;

export default taskSlice.reducer;
