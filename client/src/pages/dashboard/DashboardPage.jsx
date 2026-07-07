import WelcomeSection from "../../components/dashboard/WelcomeSection";
import StatsCards from "../../components/dashboard/StatsCards";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentActivity from "../../components/dashboard/RecentActivity";

const DashboardPage = () => {
    return (
        <div className="space-y-8">
            <WelcomeSection />

            <StatsCards />

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <RecentActivity />
                </div>

                <QuickActions />
            </div>
        </div>
    );
};

export default DashboardPage;