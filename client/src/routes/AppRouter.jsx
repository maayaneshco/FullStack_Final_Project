import { Routes, Route } from "react-router-dom";

import {
    LoginPage,
    RegisterPage,
    DashboardPage,
    UsersPage,
    ProfilePage,
    ProjectsPage,
    ProjectDetailsPage,
    TasksPage,
    CompletedTasksPage,
    OverdueTasksPage,
    ResponsibilitiesPage,
    MyResponsibilitiesPage,
    InventoryPage,
    LowStockPage,
    ExpiredInventoryPage,
    EquipmentPage,
    EquipmentDetailsPage,
    BookingsPage,
    MyBookingsPage,
    ProtocolsPage,
    ChangePasswordPage,
    UnauthorizedPage,
    NotFoundPage,
} from "../pages";

const AppRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* User */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />

            {/* Projects */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />

            {/* Tasks */}
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/completed" element={<CompletedTasksPage />} />
            <Route path="/tasks/overdue" element={<OverdueTasksPage />} />

            {/* Responsibilities */}
            <Route
                path="/responsibilities"
                element={<ResponsibilitiesPage />}
            />
            <Route
                path="/responsibilities/my"
                element={<MyResponsibilitiesPage />}
            />

            {/* Inventory */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/low-stock" element={<LowStockPage />} />
            <Route
                path="/inventory/expired"
                element={<ExpiredInventoryPage />}
            />

            {/* Equipment */}
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route
                path="/equipment/:id"
                element={<EquipmentDetailsPage />}
            />

            {/* Bookings */}
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/bookings/my" element={<MyBookingsPage />} />

            {/* Protocols */}
            <Route path="/protocols" element={<ProtocolsPage />} />

            {/* Errors */}
            <Route path="/401" element={<UnauthorizedPage />} />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRouter;