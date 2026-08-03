import axiosInstance from "../api/axiosInstance";

const mergeTasks = (taskGroups) => {
    const taskMap = new Map();

    taskGroups.flat().forEach((task) => {
        taskMap.set(task._id, task);
    });

    return Array.from(taskMap.values());
};

const getTasks = async () => {
    const [labResponse, projectResponse] = await Promise.all([
        axiosInstance.get("/tasks/lab"),
        axiosInstance.get("/tasks/my-project-tasks"),
    ]);

    return mergeTasks([labResponse.data, projectResponse.data]);
};

const getCompletedTasks = async () => {
    const response = await axiosInstance.get("/tasks/completed");
    return response.data;
};

const getOverdueTasks = async () => {
    const response = await axiosInstance.get("/tasks/overdue");
    return response.data;
};

const createTask = async (taskData) => {
    const response = await axiosInstance.post("/tasks", taskData);
    return response.data;
};

const updateTask = async ({ taskId, taskData }) => {
    const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
    return response.data;
};

const updateTaskStatus = async ({ taskId, status }) => {
    const response = await axiosInstance.put(`/tasks/${taskId}/status`, {
        status,
    });
    return response.data;
};

const deleteTask = async (taskId) => {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);

    return {
        taskId,
        message: response.data.message,
    };
};

const taskService = {
    getTasks,
    getCompletedTasks,
    getOverdueTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
};

export default taskService;
