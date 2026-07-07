import { Link } from "react-router-dom";

const actions = [
    {
        label: "Create Project",
        path: "/dashboard/projects",
    },
    {
        label: "Add Task",
        path: "/dashboard/tasks",
    },
    {
        label: "Update Inventory",
        path: "/dashboard/inventory",
    },
    {
        label: "Book Equipment",
        path: "/dashboard/equipment-bookings",
    },
];

const QuickActions = () => {
    return (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#1A2F4D]">
                    Quick Actions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Common lab management shortcuts.
                </p>
            </div>

            <div className="space-y-3">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        to={action.path}
                        className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#D4A574] hover:bg-[#F7F1E8]"
                    >
                        {action.label}
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default QuickActions;