import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, FolderKanban, Plus, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    clearProjectErrors,
    createProject,
    deleteProject,
    fetchProjects,
    updateProject,
} from "../../redux/slices/projectSlice";

const emptyForm = {
    title: "",
    description: "",
    status: "planning",
    priority: "medium",
    startDate: "",
    endDate: "",
    notes: "",
};

const statusOptions = ["planning", "active", "completed", "archived"];
const priorityOptions = ["low", "medium", "high"];

const formatLabel = (value) => {
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

const ProjectsPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();

    const { projects, loading, error, actionLoading, actionError } =
        useSelector((state) => state.projects);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        dispatch(fetchProjects());

        return () => {
            dispatch(clearProjectErrors());
        };
    }, [dispatch]);

    const filteredProjects = useMemo(() => {
        if (statusFilter === "all") {
            return projects;
        }

        return projects.filter((project) => project.status === statusFilter);
    }, [projects, statusFilter]);

    const canManageProject = (project) => {
        return user?.role === "admin" || getEntityId(project.owner) === user?._id;
    };

    const openCreateForm = () => {
        setEditingProject(null);
        setFormData(emptyForm);
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearProjectErrors());
    };

    const openEditForm = (project) => {
        setEditingProject(project);
        setFormData({
            title: project.title || "",
            description: project.description || "",
            status: project.status || "planning",
            priority: project.priority || "medium",
            startDate: toDateInputValue(project.startDate),
            endDate: toDateInputValue(project.endDate),
            notes: project.notes || "",
        });
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearProjectErrors());
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingProject(null);
        setFormData(emptyForm);
        setFormError("");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const buildPayload = () => ({
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        notes: formData.notes.trim(),
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim() || !formData.description.trim()) {
            setFormError("Title and description are required.");
            return;
        }

        const payload = buildPayload();

        const action = editingProject
            ? updateProject({
                  projectId: editingProject._id,
                  projectData: payload,
              })
            : createProject(payload);

        const result = await dispatch(action);

        if (
            createProject.fulfilled.match(result) ||
            updateProject.fulfilled.match(result)
        ) {
            closeForm();
        }
    };

    const handleDelete = async (project) => {
        const confirmed = window.confirm(
            `Delete "${project.title}"? This cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        await dispatch(deleteProject(project._id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Research portfolio
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Projects
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Manage lab research projects, timelines, status, and
                        project membership.
                    </p>
                </div>

                <Button onClick={openCreateForm} className="gap-2">
                    <Plus size={18} />
                    New Project
                </Button>
            </div>

            <Card className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {["all", ...statusOptions].map((status) => (
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
            </Card>

            {isFormOpen && (
                <Card>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">
                            {editingProject ? "Edit Project" : "Create Project"}
                        </h2>

                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-gray-100"
                            aria-label="Close project form"
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
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <Input
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Project title"
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
                                rows="4"
                                placeholder="Describe the research goal and scope"
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
                                        <option key={status} value={status}>
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
                                placeholder="Internal notes"
                                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
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
                                    : editingProject
                                      ? "Save Changes"
                                      : "Create Project"}
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
                        Loading projects...
                    </p>
                </Card>
            ) : filteredProjects.length === 0 ? (
                <Card className="text-center">
                    <FolderKanban
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No projects found
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {statusFilter === "all"
                            ? "Create the first project to start organizing lab work."
                            : "No projects match this status filter."}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {filteredProjects.map((project) => (
                        <Card key={project._id} className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <Link
                                        to={`/projects/${project._id}`}
                                        className="text-xl font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary-light)]"
                                    >
                                        {project.title}
                                    </Link>
                                    <p className="mt-2 line-clamp-3 text-sm text-[var(--color-text-secondary)]">
                                        {project.description}
                                    </p>
                                </div>

                                {canManageProject(project) && (
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(project)}
                                            className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                            aria-label={`Edit ${project.title}`}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(project)}
                                            disabled={actionLoading}
                                            className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-danger)] hover:border-[var(--color-danger)] disabled:opacity-60"
                                            aria-label={`Delete ${project.title}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                                    {formatLabel(project.status)}
                                </span>
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                                    {formatLabel(project.priority)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-3">
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Start
                                    </p>
                                    <p>{formatDate(project.startDate)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        End
                                    </p>
                                    <p>{formatDate(project.endDate)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Members
                                    </p>
                                    <p>{project.members?.length || 0}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
