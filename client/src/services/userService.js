import axiosInstance from "../api/axiosInstance";

const getProfile = async () => {
    const response = await axiosInstance.get("/users/profile");
    return response.data;
};

const updateProfile = async (profileData) => {
    const response = await axiosInstance.put("/users/profile", profileData);
    return response.data;
};

const changePassword = async (passwordData) => {
    const response = await axiosInstance.put(
        "/users/change-password",
        passwordData
    );
    return response.data;
};

const userService = {
    getProfile,
    updateProfile,
    changePassword,
};

export default userService;
