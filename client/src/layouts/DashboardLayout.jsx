import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-[var(--color-background)]">
            <Sidebar />

            <main className="flex-1 overflow-auto p-10">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;