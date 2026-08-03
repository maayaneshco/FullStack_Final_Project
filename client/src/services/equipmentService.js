import axiosInstance from "../api/axiosInstance";

const getEquipment = async () => {
    const response = await axiosInstance.get("/equipment");
    return response.data;
};

const getEquipmentById = async (equipmentId) => {
    const response = await axiosInstance.get(`/equipment/${equipmentId}`);
    return response.data;
};

const createEquipment = async (equipmentData) => {
    const response = await axiosInstance.post("/equipment", equipmentData);
    return response.data;
};

const updateEquipment = async ({ equipmentId, equipmentData }) => {
    const response = await axiosInstance.put(
        `/equipment/${equipmentId}`,
        equipmentData
    );
    return response.data;
};

const deleteEquipment = async (equipmentId) => {
    const response = await axiosInstance.delete(`/equipment/${equipmentId}`);

    return {
        equipmentId,
        message: response.data.message,
    };
};

const equipmentService = {
    getEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
};

export default equipmentService;
