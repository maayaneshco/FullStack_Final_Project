import { STORAGE_KEYS } from "./storageKeys";

export const getToken = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

export const setToken = (token) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

export const removeToken = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
};