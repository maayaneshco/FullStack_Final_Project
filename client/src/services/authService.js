import axiosInstance from "../api/axiosInstance";

const login = async (credentials) => {
    const response = await axiosInstance.post(
        "/auth/login",
        credentials
    );

    return response.data;
};

const register = async (userData) => {
    const response = await axiosInstance.post(
        "/auth/register",
        userData
    );

    return response.data;
};

const getCurrentUser = async () => {
    const response = await axiosInstance.get("/auth/me");

    return response.data;
};

const authService = {
    login,
    register,
    getCurrentUser,
};

export default authService;