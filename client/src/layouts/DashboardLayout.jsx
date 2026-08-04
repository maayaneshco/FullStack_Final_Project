import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen flex-col overflow-hidden bg-[var(--color-background)] lg:h-screen lg:flex-row">
            <Sidebar />

            <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
