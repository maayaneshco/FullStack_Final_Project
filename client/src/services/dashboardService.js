import axiosInstance from "../api/axiosInstance";

const getDashboard = async () => {
    const response = await axiosInstance.get("/dashboard");
    return response.data;
};

const dashboardService = {
    getDashboard,
};

export default dashboardService;
