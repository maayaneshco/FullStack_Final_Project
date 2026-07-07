const activities = [
    {
        title: "Inventory item updated",
        description: "PCR Kit quantity was updated in the lab inventory.",
        time: "Today",
    },
    {
        title: "New equipment booking",
        description: "Microscope was reserved for an upcoming experiment.",
        time: "Yesterday",
    },
    {
        title: "Task completed",
        description: "Sample preparation task was marked as completed.",
        time: "This week",
    },
];

const RecentActivity = () => {
    return (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#1A2F4D]">
                    Recent Activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Latest updates from the lab workspace.
                </p>
            </div>

            <div className="space-y-4">
                {activities.map((activity) => (
                    <div
                        key={activity.title}
                        className="rounded-xl border border-slate-200 p-4"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-medium text-slate-800">
                                    {activity.title}
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {activity.description}
                                </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-medium text-[#1A2F4D]">
                                {activity.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecentActivity;