import axiosInstance from "../api/axiosInstance";

const getInventoryItems = async () => {
    const response = await axiosInstance.get("/inventory");
    return response.data;
};

const getLowStockItems = async () => {
    const response = await axiosInstance.get("/inventory/low-stock");
    return response.data;
};

const getExpiredItems = async () => {
    const response = await axiosInstance.get("/inventory/expired");
    return response.data;
};

const createInventoryItem = async (itemData) => {
    const response = await axiosInstance.post("/inventory", itemData);
    return response.data;
};

const updateInventoryItem = async ({ itemId, itemData }) => {
    const response = await axiosInstance.put(`/inventory/${itemId}`, itemData);
    return response.data;
};

const deleteInventoryItem = async (itemId) => {
    const response = await axiosInstance.delete(`/inventory/${itemId}`);

    return {
        itemId,
        message: response.data.message,
    };
};

const inventoryService = {
    getInventoryItems,
    getLowStockItems,
    getExpiredItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
};

export default inventoryService;
