import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import WelcomeSection from "../../components/dashboard/WelcomeSection";
import StatsCards from "../../components/dashboard/StatsCards";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";
import {
    clearDashboardError,
    fetchDashboard,
} from "../../redux/slices/dashboardSlice";

const DashboardPage = () => {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboard());

        return () => {
            dispatch(clearDashboardError());
        };
    }, [dispatch]);

    return (
        <div className="space-y-8">
            <WelcomeSection />

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            <StatsCards loading={loading && !data} summary={data?.summary} />

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <RecentActivity loading={loading && !data} recent={data?.recent} />
                </div>

                <QuickActions />
            </div>
        </div>
    );
};

export default DashboardPage;
