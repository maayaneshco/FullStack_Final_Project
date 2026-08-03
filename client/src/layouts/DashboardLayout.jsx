import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
            <Sidebar />

            <main className="min-w-0 flex-1 overflow-y-auto p-10">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
