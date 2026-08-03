import axiosInstance from "../api/axiosInstance";

const getProtocols = async (filters = {}) => {
    const response = await axiosInstance.get("/protocols", {
        params: filters,
    });
    return response.data;
};

const createProtocol = async (formData) => {
    const response = await axiosInstance.post("/protocols", formData);
    return response.data;
};

const updateProtocol = async ({ protocolId, protocolData }) => {
    const response = await axiosInstance.put(
        `/protocols/${protocolId}`,
        protocolData
    );
    return response.data;
};

const deleteProtocol = async (protocolId) => {
    const response = await axiosInstance.delete(`/protocols/${protocolId}`);

    return {
        protocolId,
        message: response.data.message,
    };
};

const downloadProtocol = async (protocol) => {
    const response = await axiosInstance.get(
        `/protocols/${protocol._id}/download`,
        {
            responseType: "blob",
        }
    );

    return {
        blob: response.data,
        fileName: protocol.originalFileName,
    };
};

const protocolService = {
    getProtocols,
    createProtocol,
    updateProtocol,
    deleteProtocol,
    downloadProtocol,
};

export default protocolService;
