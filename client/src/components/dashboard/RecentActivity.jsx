const formatUser = (user) => {
    if (!user) {
        return "Unknown user";
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return fullName || user.email || "Unknown user";
};

const formatDate = (value) => {
    if (!value) {
        return "";
    }

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
    }).format(new Date(value));
};

const buildActivities = (recent = {}) => {
    const projects = (recent.projects || []).map((project) => ({
        id: `project-${project._id}`,
        title: `Project: ${project.title}`,
        description: `Created by ${formatUser(project.createdBy)}`,
        time: formatDate(project.createdAt),
        createdAt: project.createdAt,
    }));

    const tasks = (recent.tasks || []).map((task) => ({
        id: `task-${task._id}`,
        title: `Task: ${task.title}`,
        description: [
            task.project?.title ? `Project: ${task.project.title}` : "",
            task.status ? `Status: ${task.status.replace("_", " ")}` : "",
        ]
            .filter(Boolean)
            .join(" | "),
        time: formatDate(task.createdAt),
        createdAt: task.createdAt,
    }));

    const bookings = (recent.bookings || []).map((booking) => ({
        id: `booking-${booking._id}`,
        title: `Booking: ${booking.equipment?.name || "Equipment"}`,
        description: `Booked by ${formatUser(booking.bookedBy)}`,
        time: formatDate(booking.createdAt),
        createdAt: booking.createdAt,
    }));

    const protocols = (recent.protocols || []).map((protocol) => ({
        id: `protocol-${protocol._id}`,
        title: `Protocol: ${protocol.title}`,
        description: `Uploaded by ${formatUser(protocol.uploadedBy)}`,
        time: formatDate(protocol.createdAt),
        createdAt: protocol.createdAt,
    }));

    return [...projects, ...tasks, ...bookings, ...protocols]
        .sort((first, second) => {
            return new Date(second.createdAt) - new Date(first.createdAt);
        })
        .slice(0, 10);
};

const RecentActivity = ({ loading = false, recent }) => {
    const activities = buildActivities(recent);

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
                {loading && (
                    <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                        Loading recent activity...
                    </div>
                )}

                {!loading && activities.length === 0 && (
                    <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                        No recent dashboard activity yet.
                    </div>
                )}

                {!loading && activities.map((activity) => (
                    <div
                        key={activity.id}
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
                                {activity.time || "Recent"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecentActivity;
