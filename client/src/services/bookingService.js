import axiosInstance from "../api/axiosInstance";

const getBookings = async () => {
    const response = await axiosInstance.get("/bookings");
    return response.data;
};

const getMyBookings = async () => {
    const response = await axiosInstance.get("/bookings/my-bookings");
    return response.data;
};

const getEquipmentOptions = async () => {
    const response = await axiosInstance.get("/equipment");
    return response.data;
};

const createBooking = async (bookingData) => {
    const response = await axiosInstance.post("/bookings", bookingData);
    return response.data;
};

const updateBooking = async ({ bookingId, bookingData }) => {
    const response = await axiosInstance.put(
        `/bookings/${bookingId}`,
        bookingData
    );
    return response.data;
};

const cancelBooking = async (bookingId) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
    return response.data;
};

const bookingService = {
    getBookings,
    getMyBookings,
    getEquipmentOptions,
    createBooking,
    updateBooking,
    cancelBooking,
};

export default bookingService;
