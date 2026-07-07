import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getToken,
    setToken as saveToken,
    removeToken,
} from "../utils/tokenStorage";

export const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = getToken();

        if (savedToken) {
            setToken(savedToken);
        }

        setLoading(false);
    }, []);

    const login = useCallback((userData, accessToken) => {
        setUser(userData);
        setToken(accessToken);

        saveToken(accessToken);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);

        removeToken();
    }, []);

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            login,
            logout,
        }),
        [user, token, loading, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;