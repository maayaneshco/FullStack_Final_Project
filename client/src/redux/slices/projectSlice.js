import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import projectService from "../../services/projectService";

const getErrorMessage = (error, fallback) => {
    return error.response?.data?.message || error.message || fallback;
};

export const fetchProjects = createAsyncThunk(
    "projects/fetchProjects",
    async (_, { rejectWithValue }) => {
        try {
            return await projectService.getProjects();
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load projects")
            );
        }
    }
);

export const fetchProjectById = createAsyncThunk(
    "projects/fetchProjectById",
    async (projectId, { rejectWithValue }) => {
        try {
            return await projectService.getProjectById(projectId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load project")
            );
        }
    }
);

export const createProject = createAsyncThunk(
    "projects/createProject",
    async (projectData, { rejectWithValue }) => {
        try {
            return await projectService.createProject(projectData);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to create project")
            );
        }
    }
);

export const updateProject = createAsyncThunk(
    "projects/updateProject",
    async (payload, { rejectWithValue }) => {
        try {
            return await projectService.updateProject(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to update project")
            );
        }
    }
);

export const deleteProject = createAsyncThunk(
    "projects/deleteProject",
    async (projectId, { rejectWithValue }) => {
        try {
            return await projectService.deleteProject(projectId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to delete project")
            );
        }
    }
);

export const addProjectMember = createAsyncThunk(
    "projects/addProjectMember",
    async (payload, { rejectWithValue }) => {
        try {
            return await projectService.addMember(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to add project member")
            );
        }
    }
);

export const removeProjectMember = createAsyncThunk(
    "projects/removeProjectMember",
    async (payload, { rejectWithValue }) => {
        try {
            return await projectService.removeMember(payload);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to remove project member")
            );
        }
    }
);

export const fetchProjectTasks = createAsyncThunk(
    "projects/fetchProjectTasks",
    async (projectId, { rejectWithValue }) => {
        try {
            return await projectService.getProjectTasks(projectId);
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error, "Failed to load project tasks")
            );
        }
    }
);

const initialState = {
    projects: [],
    selectedProject: null,
    projectTasks: [],
    loading: false,
    detailLoading: false,
    tasksLoading: false,
    actionLoading: false,
    error: "",
    detailError: "",
    tasksError: "",
    actionError: "",
};

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        clearProjectErrors: (state) => {
            state.error = "";
            state.detailError = "";
            state.tasksError = "";
            state.actionError = "";
        },
        clearSelectedProject: (state) => {
            state.selectedProject = null;
            state.projectTasks = [];
            state.detailError = "";
            state.tasksError = "";
            state.actionError = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = "";
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchProjectById.pending, (state) => {
                state.detailLoading = true;
                state.detailError = "";
            })
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedProject = action.payload;
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
            })
            .addCase(fetchProjectTasks.pending, (state) => {
                state.tasksLoading = true;
                state.tasksError = "";
            })
            .addCase(fetchProjectTasks.fulfilled, (state, action) => {
                state.tasksLoading = false;
                state.projectTasks = action.payload;
            })
            .addCase(fetchProjectTasks.rejected, (state, action) => {
                state.tasksLoading = false;
                state.tasksError = action.payload;
            })
            .addCase(createProject.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.projects.unshift(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(updateProject.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.projects = state.projects.map((project) =>
                    project._id === action.payload._id ? action.payload : project
                );
                state.selectedProject = action.payload;
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(deleteProject.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.projects = state.projects.filter(
                    (project) => project._id !== action.payload.projectId
                );
                if (state.selectedProject?._id === action.payload.projectId) {
                    state.selectedProject = null;
                    state.projectTasks = [];
                }
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(addProjectMember.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(addProjectMember.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.selectedProject = action.payload;
                state.projects = state.projects.map((project) =>
                    project._id === action.payload._id ? action.payload : project
                );
            })
            .addCase(addProjectMember.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            })
            .addCase(removeProjectMember.pending, (state) => {
                state.actionLoading = true;
                state.actionError = "";
            })
            .addCase(removeProjectMember.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.selectedProject = action.payload;
                state.projects = state.projects.map((project) =>
                    project._id === action.payload._id ? action.payload : project
                );
            })
            .addCase(removeProjectMember.rejected, (state, action) => {
                state.actionLoading = false;
                state.actionError = action.payload;
            });
    },
});

export const { clearProjectErrors, clearSelectedProject } =
    projectSlice.actions;

export default projectSlice.reducer;
