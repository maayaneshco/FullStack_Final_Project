import axios from "axios";

import { getToken } from "../utils/tokenStorage";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token to every authenticated request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (
            typeof FormData !== "undefined" &&
            config.data instanceof FormData
        ) {
            if (typeof config.headers.delete === "function") {
                config.headers.delete("Content-Type");
            } else {
                delete config.headers["Content-Type"];
                delete config.headers["content-type"];
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
