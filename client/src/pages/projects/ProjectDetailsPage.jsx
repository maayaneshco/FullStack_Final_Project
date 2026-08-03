import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Edit3,
    Plus,
    Save,
    Trash2,
    UserMinus,
    Users,
    X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    addProjectMember,
    clearSelectedProject,
    deleteProject,
    fetchProjectById,
    fetchProjectTasks,
    removeProjectMember,
    updateProject,
} from "../../redux/slices/projectSlice";

const statusOptions = ["planning", "active", "completed", "archived"];
const priorityOptions = ["low", "medium", "high"];

const formatLabel = (value) => {
    if (!value) {
        return "Not set";
    }

    return value.replaceAll("_", " ");
};

const formatDate = (value) => {
    if (!value) {
        return "No date";
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
        return user || "Unknown user";
    }

    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
};

const buildFormState = (project) => ({
    title: project?.title || "",
    description: project?.description || "",
    status: project?.status || "planning",
    priority: project?.priority || "medium",
    startDate: toDateInputValue(project?.startDate),
    endDate: toDateInputValue(project?.endDate),
    notes: project?.notes || "",
});

const ProjectDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useAuth();

    const {
        selectedProject,
        projectTasks,
        detailLoading,
        tasksLoading,
        actionLoading,
        detailError,
        tasksError,
        actionError,
    } = useSelector((state) => state.projects);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(buildFormState(null));
    const [formError, setFormError] = useState("");
    const [memberId, setMemberId] = useState("");

    useEffect(() => {
        dispatch(fetchProjectById(id));
        dispatch(fetchProjectTasks(id));

        return () => {
            dispatch(clearSelectedProject());
        };
    }, [dispatch, id]);

    const canManageProject = useMemo(() => {
        if (!selectedProject || !user) {
            return false;
        }

        return (
            user.role === "admin" ||
            getEntityId(selectedProject.owner) === user._id
        );
    }, [selectedProject, user]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        if (!formData.title.trim() || !formData.description.trim()) {
            setFormError("Title and description are required.");
            return;
        }

        const result = await dispatch(
            updateProject({
                projectId: id,
                projectData: {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    status: formData.status,
                    priority: formData.priority,
                    startDate: formData.startDate || undefined,
                    endDate: formData.endDate || undefined,
                    notes: formData.notes.trim(),
                },
            })
        );

        if (updateProject.fulfilled.match(result)) {
            setIsEditing(false);
            setFormError("");
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete "${selectedProject.title}"? This cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        const result = await dispatch(deleteProject(id));

        if (deleteProject.fulfilled.match(result)) {
            navigate("/projects");
        }
    };

    const handleAddMember = async (event) => {
        event.preventDefault();

        if (!memberId.trim()) {
            return;
        }

        const result = await dispatch(
            addProjectMember({
                projectId: id,
                userId: memberId.trim(),
            })
        );

        if (addProjectMember.fulfilled.match(result)) {
            setMemberId("");
        }
    };

    const handleRemoveMember = async (userId) => {
        await dispatch(
            removeProjectMember({
                projectId: id,
                userId,
            })
        );
    };

    const cancelEditing = () => {
        setFormData(buildFormState(selectedProject));
        setFormError("");
        setIsEditing(false);
    };

    if (detailLoading && !selectedProject) {
        return (
            <Card>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    Loading project...
                </p>
            </Card>
        );
    }

    if (detailError) {
        return (
            <div className="space-y-4">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
                >
                    <ArrowLeft size={16} />
                    Back to projects
                </Link>

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {detailError}
                </div>
            </div>
        );
    }

    if (!selectedProject) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Link
                to="/projects"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
            >
                <ArrowLeft size={16} />
                Back to projects
            </Link>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Project details
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        {selectedProject.title}
                    </h1>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                            {formatLabel(selectedProject.status)}
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                            {formatLabel(selectedProject.priority)}
                        </span>
                    </div>
                </div>

                {canManageProject && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={cancelEditing}
                                className="gap-2"
                            >
                                <X size={16} />
                                Cancel
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setFormData(buildFormState(selectedProject));
                                    setIsEditing(true);
                                }}
                                className="gap-2"
                            >
                                <Edit3 size={16} />
                                Edit
                            </Button>
                        )}

                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={actionLoading}
                            className="gap-2 bg-[var(--color-danger)]"
                        >
                            <Trash2 size={16} />
                            Delete
                        </Button>
                    </div>
                )}
            </div>

            {(formError || actionError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError || actionError}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <Card>
                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    <Input
                                        label="Title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                    />

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
                                            {priorityOptions.map((priority) => (
                                                <option
                                                    key={priority}
                                                    value={priority}
                                                >
                                                    {formatLabel(priority)}
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
                                        rows="5"
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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
                                            {statusOptions.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {formatLabel(status)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Input
                                        label="Start Date"
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                    />

                                    <Input
                                        label="End Date"
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex w-full flex-col gap-2">
                                    <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="gap-2"
                                    >
                                        <Save size={16} />
                                        {actionLoading
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Description
                                    </h2>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--color-text-secondary)]">
                                        {selectedProject.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-5 sm:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            Start Date
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                            {formatDate(
                                                selectedProject.startDate
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            End Date
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                            {formatDate(selectedProject.endDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            Owner
                                        </p>
                                        <p className="mt-1 break-all text-sm text-[var(--color-text-secondary)]">
                                            {getUserName(
                                                selectedProject.owner
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Notes
                                    </h2>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--color-text-secondary)]">
                                        {selectedProject.notes ||
                                            "No notes were added."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Project Tasks
                                </h2>
                                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                    Tasks linked to this project from the backend.
                                </p>
                            </div>
                        </div>

                        {tasksError && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {tasksError}
                            </div>
                        )}

                        {tasksLoading ? (
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                Loading tasks...
                            </p>
                        ) : projectTasks.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                                No tasks are linked to this project yet.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {projectTasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className="rounded-xl border border-[var(--color-border)] p-4"
                                    >
                                        <div className="flex flex-col justify-between gap-3 md:flex-row">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {task.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                                    {task.description ||
                                                        "No description."}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                                                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                                    {formatLabel(task.status)}
                                                </span>
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                                                    {formatLabel(task.priority)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                                            Due: {formatDate(task.dueDate)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                                <Users size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Members
                                </h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    {selectedProject.members?.length || 0} total
                                </p>
                            </div>
                        </div>

                        {canManageProject && (
                            <form
                                onSubmit={handleAddMember}
                                className="mt-5 space-y-3"
                            >
                                <Input
                                    label="Add member by user ID"
                                    value={memberId}
                                    onChange={(event) =>
                                        setMemberId(event.target.value)
                                    }
                                    placeholder="MongoDB user ID"
                                />
                                <Button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full gap-2"
                                >
                                    <Plus size={16} />
                                    Add Member
                                </Button>
                            </form>
                        )}

                        <div className="mt-5 space-y-3">
                            {selectedProject.members?.length ? (
                                selectedProject.members.map((member) => {
                                    const userId = getEntityId(member);
                                    const isOwner =
                                        userId ===
                                        getEntityId(selectedProject.owner);

                                    return (
                                        <div
                                            key={userId}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-3 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {getUserName(member)}
                                                </p>
                                                <p className="truncate text-xs text-[var(--color-text-secondary)]">
                                                    {isOwner
                                                        ? "Project owner"
                                                        : userId}
                                                </p>
                                            </div>

                                            {canManageProject && !isOwner && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveMember(
                                                            userId
                                                        )
                                                    }
                                                    disabled={actionLoading}
                                                    className="shrink-0 rounded-xl p-2 text-[var(--color-danger)] hover:bg-red-50 disabled:opacity-60"
                                                    aria-label="Remove project member"
                                                >
                                                    <UserMinus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="rounded-xl border border-dashed border-[var(--color-border)] px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                                    No members are assigned.
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-lg font-semibold">Timeline</h2>
                        <div className="mt-4 space-y-4 text-sm">
                            <div>
                                <p className="font-medium">Created</p>
                                <p className="text-[var(--color-text-secondary)]">
                                    {formatDate(selectedProject.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Updated</p>
                                <p className="text-[var(--color-text-secondary)]">
                                    {formatDate(selectedProject.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;
