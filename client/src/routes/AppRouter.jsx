import { Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

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
            <Route element={<AuthLayout />}>
                <Route index element={<LoginPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Dashboard Routes */}
            <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />

                <Route path="users" element={<UsersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route
                    path="change-password"
                    element={<ChangePasswordPage />}
                />

                <Route path="projects" element={<ProjectsPage />} />
                <Route
                    path="projects/:id"
                    element={<ProjectDetailsPage />}
                />

                <Route path="tasks" element={<TasksPage />} />
                <Route
                    path="tasks/completed"
                    element={<CompletedTasksPage />}
                />
                <Route
                    path="tasks/overdue"
                    element={<OverdueTasksPage />}
                />

                <Route
                    path="responsibilities"
                    element={<ResponsibilitiesPage />}
                />
                <Route
                    path="responsibilities/my"
                    element={<MyResponsibilitiesPage />}
                />

                <Route path="inventory" element={<InventoryPage />} />
                <Route
                    path="inventory/low-stock"
                    element={<LowStockPage />}
                />
                <Route
                    path="inventory/expired"
                    element={<ExpiredInventoryPage />}
                />

                <Route path="equipment" element={<EquipmentPage />} />
                <Route
                    path="equipment/:id"
                    element={<EquipmentDetailsPage />}
                />

                <Route path="bookings" element={<BookingsPage />} />
                <Route
                    path="bookings/my"
                    element={<MyBookingsPage />}
                />

                <Route path="protocols" element={<ProtocolsPage />} />
            </Route>

            {/* Error Pages */}
            <Route path="401" element={<UnauthorizedPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRouter;