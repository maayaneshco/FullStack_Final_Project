import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
    return (
        <main className="min-h-screen">
            <Outlet />
        </main>
    );
};

export default DashboardLayout;