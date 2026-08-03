import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "../../components/ui";
import {
    clearTaskErrors,
    fetchOverdueTasks,
} from "../../redux/slices/taskSlice";

const formatLabel = (value) => {
    if (!value) {
        return "Not set";
    }

    return value.replaceAll("_", " ");
};

const formatDate = (value) => {
    if (!value) {
        return "No due date";
    }

    return new Date(value).toLocaleDateString();
};

const getUserName = (user) => {
    if (!user || typeof user === "string") {
        return user || "Unassigned";
    }

    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
};

const getProjectName = (project) => {
    if (!project) {
        return "Lab task";
    }

    return typeof project === "string" ? project : project.title;
};

const OverdueTasksPage = () => {
    const dispatch = useDispatch();
    const { overdueTasks, overdueLoading, overdueError } = useSelector(
        (state) => state.tasks
    );

    useEffect(() => {
        dispatch(fetchOverdueTasks());

        return () => {
            dispatch(clearTaskErrors());
        };
    }, [dispatch]);

    return (
        <div className="space-y-6">
            <Link
                to="/tasks"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
            >
                <ArrowLeft size={16} />
                Back to tasks
            </Link>

            <div>
                <p className="text-sm font-medium text-[var(--color-accent)]">
                    Needs attention
                </p>
                <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                    Overdue Tasks
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                    Backend-filtered overdue tasks. Completed and cancelled
                    tasks are excluded by the API.
                </p>
            </div>

            {overdueError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {overdueError}
                </div>
            )}

            {overdueLoading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading overdue tasks...
                    </p>
                </Card>
            ) : overdueTasks.length === 0 ? (
                <Card className="text-center">
                    <AlertTriangle
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No overdue tasks
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Nothing is currently past its due date according to the
                        backend.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {overdueTasks.map((task) => (
                        <Card key={task._id}>
                            <div className="flex flex-col justify-between gap-4 lg:flex-row">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold">
                                            {task.title}
                                        </h2>
                                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                                            {formatLabel(task.status)}
                                        </span>
                                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                            {formatLabel(task.priority)}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                        {task.description || "No description."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-sm text-[var(--color-text-secondary)] sm:grid-cols-3 lg:min-w-96">
                                    <div>
                                        <p className="font-medium text-[var(--color-text-primary)]">
                                            Due
                                        </p>
                                        <p>{formatDate(task.dueDate)}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--color-text-primary)]">
                                            Project
                                        </p>
                                        <p className="break-all">
                                            {getProjectName(task.project)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--color-text-primary)]">
                                            Assigned
                                        </p>
                                        <p>
                                            {task.assignedTo?.length
                                                ? task.assignedTo
                                                      .map(getUserName)
                                                      .join(", ")
                                                : "Unassigned"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OverdueTasksPage;
