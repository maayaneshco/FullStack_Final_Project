import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import userService from "../services/userService";
import {
    getToken,
    setToken as saveToken,
    removeToken,
} from "../utils/tokenStorage";
import AuthContext from "./authContextValue";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => getToken());
    const [loading, setLoading] = useState(() => Boolean(getToken()));

    useEffect(() => {
        const savedToken = getToken();

        if (!savedToken) {
            return;
        }

        let isMounted = true;

        const restoreSession = async () => {
            try {
                const restoredUser = await userService.getProfile();

                if (isMounted) {
                    setUser(restoredUser);
                    setToken(savedToken);
                }
            } catch {
                removeToken();

                if (isMounted) {
                    setUser(null);
                    setToken(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        restoreSession();

        return () => {
            isMounted = false;
        };
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
