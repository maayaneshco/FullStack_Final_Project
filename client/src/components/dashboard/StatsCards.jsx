const stats = [
    {
        label: "Active Projects",
        value: "8",
        description: "Research projects in progress",
    },
    {
        label: "Open Tasks",
        value: "24",
        description: "Tasks waiting for completion",
    },
    {
        label: "Inventory Items",
        value: "126",
        description: "Tracked lab materials",
    },
    {
        label: "Equipment Bookings",
        value: "12",
        description: "Upcoming reservations",
    },
];

const StatsCards = () => {
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
                        {stat.value}
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