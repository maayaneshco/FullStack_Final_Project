import axiosInstance from "../api/axiosInstance";

const login = async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);

    const { token, ...user } = response.data;

    return {
        user,
        token,
    };
};

const register = async (registrationData) => {
    const response = await axiosInstance.post(
        "/auth/register",
        registrationData
    );

    const { token, ...user } = response.data;

    return {
        user,
        token,
    };
};

const authService = {
    login,
    register,
};

export default authService;
