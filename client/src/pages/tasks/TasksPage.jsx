import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Edit3, Plus, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import {
    clearTaskErrors,
    createTask,
    deleteTask,
    fetchTasks,
    updateTask,
    updateTaskStatus,
} from "../../redux/slices/taskSlice";

const emptyForm = {
    title: "",
    description: "",
    taskType: "lab",
    taskCategory: "general",
    status: "todo",
    priority: "medium",
    assignedTo: "",
    project: "",
    dueDate: "",
    recurrence: "none",
};

const taskTypes = ["lab", "project"];
const taskCategories = [
    "experiment",
    "analysis",
    "publication",
    "animal_care",
    "reagent_preparation",
    "maintenance",
    "cleaning",
    "general",
];
const statuses = ["todo", "in_progress", "completed", "cancelled"];
const priorities = ["low", "medium", "high", "urgent"];
const recurrences = ["none", "daily", "weekly", "monthly"];

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

const toDateInputValue = (value) => {
    if (!value) {
        return "";
    }

    return new Date(value).toISOString().slice(0, 10);
};

const getEntityId = (entity) => {
    if (!entity) {
        return "";
    }

    return typeof entity === "string" ? entity : entity._id;
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

const parseAssignedTo = (value) => {
    return value
        .split(",")
        .map((userId) => userId.trim())
        .filter(Boolean);
};

const buildFormState = (task) => ({
    title: task?.title || "",
    description: task?.description || "",
    taskType: task?.taskType || "lab",
    taskCategory: task?.taskCategory || "general",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    assignedTo: task?.assignedTo?.map(getEntityId).filter(Boolean).join(", ") || "",
    project: getEntityId(task?.project),
    dueDate: toDateInputValue(task?.dueDate),
    recurrence: task?.recurrence || "none",
});

const TasksPage = () => {
    const dispatch = useDispatch();
    const { tasks, loading, error, actionLoading, actionError } = useSelector(
        (state) => state.tasks
    );

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        dispatch(fetchTasks());

        return () => {
            dispatch(clearTaskErrors());
        };
    }, [dispatch]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesStatus =
                statusFilter === "all" || task.status === statusFilter;
            const matchesType = typeFilter === "all" || task.taskType === typeFilter;

            return matchesStatus && matchesType;
        });
    }, [tasks, statusFilter, typeFilter]);

    const openCreateForm = () => {
        setEditingTask(null);
        setFormData(emptyForm);
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearTaskErrors());
    };

    const openEditForm = (task) => {
        setEditingTask(task);
        setFormData(buildFormState(task));
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearTaskErrors());
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingTask(null);
        setFormData(emptyForm);
        setFormError("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => {
            const next = {
                ...current,
                [name]: value,
            };

            if (name === "taskType" && value === "lab") {
                next.project = "";
            }

            return next;
        });
    };

    const buildPayload = () => {
        const assignedTo = parseAssignedTo(formData.assignedTo);

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            taskCategory: formData.taskCategory,
            priority: formData.priority,
            assignedTo,
            dueDate: formData.dueDate || undefined,
            recurrence: formData.recurrence,
        };

        if (!editingTask) {
            payload.taskType = formData.taskType;
            payload.project =
                formData.taskType === "project" ? formData.project.trim() : undefined;
        }

        return payload;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim()) {
            setFormError("Title is required.");
            return;
        }

        if (!editingTask && formData.taskType === "project" && !formData.project.trim()) {
            setFormError("Project ID is required for project tasks.");
            return;
        }

        const payload = buildPayload();
        const action = editingTask
            ? updateTask({
                  taskId: editingTask._id,
                  taskData: payload,
              })
            : createTask(payload);

        const result = await dispatch(action);

        if (createTask.fulfilled.match(result) || updateTask.fulfilled.match(result)) {
            if (editingTask && formData.status !== editingTask.status) {
                const statusResult = await dispatch(
                    updateTaskStatus({
                        taskId: editingTask._id,
                        status: formData.status,
                    })
                );

                if (updateTaskStatus.rejected.match(statusResult)) {
                    return;
                }
            }

            closeForm();
            dispatch(fetchTasks());
        }
    };

    const handleStatusChange = async (taskId, status) => {
        const result = await dispatch(updateTaskStatus({ taskId, status }));

        if (updateTaskStatus.fulfilled.match(result)) {
            dispatch(fetchTasks());
        }
    };

    const handleDelete = async (task) => {
        const confirmed = window.confirm(
            `Delete "${task.title}"? This cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        await dispatch(deleteTask(task._id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Lab workflow
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Tasks
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Manage lab tasks and project tasks available through the
                        backend permissions.
                    </p>
                </div>

                <Button onClick={openCreateForm} className="gap-2">
                    <Plus size={18} />
                    New Task
                </Button>
            </div>

            <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {["all", ...statuses].map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                                statusFilter === status
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                            }`}
                        >
                            {formatLabel(status)}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {["all", ...taskTypes].map((taskType) => (
                        <button
                            key={taskType}
                            type="button"
                            onClick={() => setTypeFilter(taskType)}
                            className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                                typeFilter === taskType
                                    ? "border-[var(--color-accent)] bg-amber-50 text-amber-800"
                                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
                            }`}
                        >
                            {formatLabel(taskType)}
                        </button>
                    ))}
                </div>
            </Card>

            <div className="flex flex-wrap gap-3">
                <Link
                    to="/tasks/completed"
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                >
                    Completed Tasks
                </Link>
                <Link
                    to="/tasks/overdue"
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                >
                    Overdue Tasks
                </Link>
            </div>

            {isFormOpen && (
                <Card>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">
                            {editingTask ? "Edit Task" : "Create Task"}
                        </h2>

                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-gray-100"
                            aria-label="Close task form"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {(formError || actionError) && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {formError || actionError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Task title"
                            />

                            <div className="flex w-full flex-col gap-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Type
                                </label>
                                <select
                                    name="taskType"
                                    value={formData.taskType}
                                    onChange={handleChange}
                                    disabled={Boolean(editingTask)}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition disabled:bg-gray-50 disabled:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    {taskTypes.map((taskType) => (
                                        <option key={taskType} value={taskType}>
                                            {formatLabel(taskType)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex w-full flex-col gap-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Category
                                </label>
                                <select
                                    name="taskCategory"
                                    value={formData.taskCategory}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    {taskCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {formatLabel(category)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-2">
                            <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Task details"
                                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                            {editingTask ? (
                                <div className="flex w-full flex-col gap-2">
                                    <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {formatLabel(status)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="flex w-full flex-col gap-2">
                                    <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                        Status
                                    </label>
                                    <div className="rounded-xl border border-[var(--color-border)] bg-gray-50 px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                                        New tasks start as todo
                                    </div>
                                </div>
                            )}

                            <div className="flex w-full flex-col gap-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Priority
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    {priorities.map((priority) => (
                                        <option key={priority} value={priority}>
                                            {formatLabel(priority)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Due Date"
                                name="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />

                            <div className="flex w-full flex-col gap-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Recurrence
                                </label>
                                <select
                                    name="recurrence"
                                    value={formData.recurrence}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    {recurrences.map((recurrence) => (
                                        <option
                                            key={recurrence}
                                            value={recurrence}
                                        >
                                            {formatLabel(recurrence)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <Input
                                label="Assigned User IDs"
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                placeholder="Comma-separated user IDs"
                            />

                            <Input
                                label="Project ID"
                                name="project"
                                value={formData.project}
                                onChange={handleChange}
                                disabled={formData.taskType === "lab" || Boolean(editingTask)}
                                placeholder="Required for project tasks"
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={closeForm}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading
                                    ? "Saving..."
                                    : editingTask
                                      ? "Save Changes"
                                      : "Create Task"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading tasks...
                    </p>
                </Card>
            ) : filteredTasks.length === 0 ? (
                <Card className="text-center">
                    <CheckCircle2
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">No tasks found</h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Create a task or adjust the filters.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <Card key={task._id}>
                            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-semibold">
                                            {task.title}
                                        </h2>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                            {formatLabel(task.taskType)}
                                        </span>
                                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                            {formatLabel(task.priority)}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                        {task.description || "No description."}
                                    </p>

                                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-[var(--color-text-secondary)] md:grid-cols-4">
                                        <div>
                                            <p className="font-medium text-[var(--color-text-primary)]">
                                                Category
                                            </p>
                                            <p>{formatLabel(task.taskCategory)}</p>
                                        </div>
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

                                <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
                                    <select
                                        value={task.status}
                                        onChange={(event) =>
                                            handleStatusChange(
                                                task._id,
                                                event.target.value
                                            )
                                        }
                                        disabled={actionLoading}
                                        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm capitalize outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {formatLabel(status)}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(task)}
                                            className="rounded-xl border border-[var(--color-border)] p-3 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                            aria-label={`Edit ${task.title}`}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(task)}
                                            disabled={actionLoading}
                                            className="rounded-xl border border-[var(--color-border)] p-3 text-[var(--color-danger)] hover:border-[var(--color-danger)] disabled:opacity-60"
                                            aria-label={`Delete ${task.title}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
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

export default TasksPage;
