import axiosInstance from "../api/axiosInstance";

const getResponsibilities = async () => {
    const response = await axiosInstance.get("/responsibilities");
    return response.data;
};

const getMyResponsibilities = async () => {
    const response = await axiosInstance.get("/responsibilities/my");
    return response.data;
};

const createResponsibility = async (responsibilityData) => {
    const response = await axiosInstance.post(
        "/responsibilities",
        responsibilityData
    );
    return response.data;
};

const updateResponsibility = async ({ responsibilityId, responsibilityData }) => {
    const response = await axiosInstance.put(
        `/responsibilities/${responsibilityId}`,
        responsibilityData
    );
    return response.data;
};

const deleteResponsibility = async (responsibilityId) => {
    const response = await axiosInstance.delete(
        `/responsibilities/${responsibilityId}`
    );

    return {
        responsibilityId,
        message: response.data.message,
    };
};

const responsibilityService = {
    getResponsibilities,
    getMyResponsibilities,
    createResponsibility,
    updateResponsibility,
    deleteResponsibility,
};

export default responsibilityService;
