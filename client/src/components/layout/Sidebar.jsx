import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context";

const navigationItems = [
    {
        label: "Dashboard",
        path: "/dashboard",
    },
    {
        label: "Projects",
        path: "/projects",
    },
    {
        label: "Tasks",
        path: "/tasks",
    },
    {
        label: "Responsibilities",
        path: "/responsibilities",
    },
    {
        label: "Inventory",
        path: "/inventory",
    },
    {
        label: "Equipment",
        path: "/equipment",
    },
    {
        label: "Protocols",
        path: "/protocols",
    },
    {
        label: "Bookings",
        path: "/bookings",
    },
    {
        label: "Profile",
        path: "/profile",
    },
];

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <aside className="flex h-screen w-72 shrink-0 flex-col overflow-hidden bg-[var(--color-primary)] text-white">
            <div className="shrink-0 border-b border-white/10 p-8">
                <h2 className="text-2xl font-bold">
                    Kehat Lab
                </h2>

                <p className="mt-1 text-sm text-white/70">
                    Internal Portal
                </p>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                <ul className="space-y-2">
                    {navigationItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `block rounded-xl px-4 py-3 transition ${
                                        isActive
                                            ? "bg-white/10"
                                            : "hover:bg-white/5"
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mt-auto shrink-0 border-t border-white/10 p-6">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-4 py-3 text-left transition hover:bg-white/5"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
