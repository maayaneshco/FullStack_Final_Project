import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context";

const ProtectedRoute = () => {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
                <div className="rounded-xl bg-white px-6 py-4 text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-card)]">
                    Restoring session...
                </div>
            </div>
        );
    }

    if (!user || !token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
