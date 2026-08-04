import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context";

const RoleRoute = ({ allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
                <div className="rounded-xl bg-white px-6 py-4 text-sm text-[var(--color-text-secondary)] shadow-[var(--shadow-card)]">
                    Checking access...
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/401" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
