import { NavLink } from "react-router-dom";

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
    return (
        <aside className="flex h-screen w-72 flex-col bg-[var(--color-primary)] text-white">
            <div className="border-b border-white/10 p-8">
                <h2 className="text-2xl font-bold">
                    Kehat Lab
                </h2>

                <p className="mt-1 text-sm text-white/70">
                    Internal Portal
                </p>
            </div>

            <nav className="flex-1 px-4 py-6">
                <ul className="space-y-2">
                    {navigationItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `block rounded-xl px-4 py-3 transition ${isActive
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

            <div className="border-t border-white/10 p-6">
                <a
                    href="/"
                    className="block rounded-xl px-4 py-3 transition hover:bg-white/5"
                >
                    ← Back to Website
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;