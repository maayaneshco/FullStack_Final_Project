import axiosInstance from "../api/axiosInstance";

const getProjects = async () => {
    const response = await axiosInstance.get("/projects");
    return response.data;
};

const getProjectById = async (projectId) => {
    const response = await axiosInstance.get(`/projects/${projectId}`);
    return response.data;
};

const createProject = async (projectData) => {
    const response = await axiosInstance.post("/projects", projectData);
    return response.data;
};

const updateProject = async ({ projectId, projectData }) => {
    const response = await axiosInstance.put(
        `/projects/${projectId}`,
        projectData
    );
    return response.data;
};

const deleteProject = async (projectId) => {
    const response = await axiosInstance.delete(`/projects/${projectId}`);
    return {
        projectId,
        message: response.data.message,
    };
};

const addMember = async ({ projectId, userId }) => {
    const response = await axiosInstance.post(`/projects/${projectId}/members`, {
        userId,
    });
    return response.data;
};

const removeMember = async ({ projectId, userId }) => {
    const response = await axiosInstance.delete(
        `/projects/${projectId}/members/${userId}`
    );
    return response.data;
};

const getProjectTasks = async (projectId) => {
    const response = await axiosInstance.get(`/projects/${projectId}/tasks`);
    return response.data;
};

const projectService = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    getProjectTasks,
};

export default projectService;
