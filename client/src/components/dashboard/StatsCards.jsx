const buildStats = (summary = {}) => [
    {
        label: "Total Projects",
        value: summary.totalProjects ?? 0,
        description: "Research projects in the lab",
    },
    {
        label: "Total Tasks",
        value: summary.totalTasks ?? 0,
        description: "Tracked project tasks",
    },
    {
        label: "Open Tasks",
        value: summary.openTasks ?? 0,
        description: "Tasks waiting for completion",
    },
    {
        label: "Completed Tasks",
        value: summary.completedTasks ?? 0,
        description: "Tasks marked completed",
    },
    {
        label: "Low Stock Items",
        value: summary.lowStockItems ?? 0,
        description: "Inventory at or below minimum",
    },
    {
        label: "Expired Inventory",
        value: summary.expiredInventory ?? 0,
        description: "Active items past expiration",
    },
    {
        label: "Available Equipment",
        value: summary.availableEquipment ?? 0,
        description: "Equipment ready for booking",
    },
    {
        label: "Active Bookings",
        value: summary.activeBookings ?? 0,
        description: "Current equipment reservations",
    },
    {
        label: "Protocols",
        value: summary.totalProtocols ?? 0,
        description: "Active protocol documents",
    },
];

const StatsCards = ({ loading = false, summary }) => {
    const stats = buildStats(summary);

    return (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <article
                    key={stat.label}
                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >
                    <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                    </p>

                    <p className="mt-4 text-3xl font-bold text-[#1A2F4D]">
                        {loading ? "..." : stat.value}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                        {stat.description}
                    </p>
                </article>
            ))}
        </section>
    );
};

export default StatsCards;
