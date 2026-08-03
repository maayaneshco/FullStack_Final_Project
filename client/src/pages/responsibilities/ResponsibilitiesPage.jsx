import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Edit3, Plus, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    clearResponsibilityErrors,
    createResponsibility,
    deleteResponsibility,
    fetchResponsibilities,
    updateResponsibility,
} from "../../redux/slices/responsibilitySlice";

const emptyForm = {
    title: "",
    description: "",
    category: "general",
    assignedTo: "",
    backupUser: "",
    startDate: "",
    endDate: "",
    isActive: true,
};

const categories = [
    "animal_care",
    "chemical_inventory",
    "cell_culture",
    "equipment",
    "freezer_monitoring",
    "protocols",
    "safety",
    "general",
];

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
        return user || "Not assigned";
    }

    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
};

const buildFormState = (responsibility) => ({
    title: responsibility?.title || "",
    description: responsibility?.description || "",
    category: responsibility?.category || "general",
    assignedTo: getEntityId(responsibility?.assignedTo),
    backupUser: getEntityId(responsibility?.backupUser),
    startDate: toDateInputValue(responsibility?.startDate),
    endDate: toDateInputValue(responsibility?.endDate),
    isActive: responsibility?.isActive ?? true,
});

const ResponsibilitiesPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const {
        responsibilities,
        loading,
        error,
        actionLoading,
        actionError,
    } = useSelector((state) => state.responsibilities);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingResponsibility, setEditingResponsibility] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        dispatch(fetchResponsibilities());

        return () => {
            dispatch(clearResponsibilityErrors());
        };
    }, [dispatch]);

    const filteredResponsibilities = useMemo(() => {
        if (categoryFilter === "all") {
            return responsibilities;
        }

        return responsibilities.filter(
            (responsibility) => responsibility.category === categoryFilter
        );
    }, [responsibilities, categoryFilter]);

    const openCreateForm = () => {
        setEditingResponsibility(null);
        setFormData(emptyForm);
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearResponsibilityErrors());
    };

    const openEditForm = (responsibility) => {
        setEditingResponsibility(responsibility);
        setFormData(buildFormState(responsibility));
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearResponsibilityErrors());
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingResponsibility(null);
        setFormData(emptyForm);
        setFormError("");
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const buildPayload = () => {
        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            assignedTo: formData.assignedTo.trim(),
            backupUser: formData.backupUser.trim() || null,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || null,
        };

        if (editingResponsibility) {
            payload.isActive = formData.isActive;
        }

        return payload;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim() || !formData.assignedTo.trim()) {
            setFormError("Title and assigned user ID are required.");
            return;
        }

        const action = editingResponsibility
            ? updateResponsibility({
                  responsibilityId: editingResponsibility._id,
                  responsibilityData: buildPayload(),
              })
            : createResponsibility(buildPayload());

        const result = await dispatch(action);

        if (
            createResponsibility.fulfilled.match(result) ||
            updateResponsibility.fulfilled.match(result)
        ) {
            closeForm();
            dispatch(fetchResponsibilities());
        }
    };

    const handleDelete = async (responsibility) => {
        const confirmed = window.confirm(
            `Delete "${responsibility.title}"? This will mark it inactive.`
        );

        if (!confirmed) {
            return;
        }

        await dispatch(deleteResponsibility(responsibility._id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Lab ownership
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Responsibilities
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Active lab responsibilities assigned to primary and
                        backup users.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/responsibilities/my"
                        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                    >
                        My Responsibilities
                    </Link>

                    {isAdmin && (
                        <Button onClick={openCreateForm} className="gap-2">
                            <Plus size={18} />
                            New Responsibility
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <div className="flex flex-wrap gap-2">
                    {["all", ...categories].map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setCategoryFilter(category)}
                            className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                                categoryFilter === category
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                            }`}
                        >
                            {formatLabel(category)}
                        </button>
                    ))}
                </div>
            </Card>

            {isFormOpen && (
                <Card>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">
                            {editingResponsibility
                                ? "Edit Responsibility"
                                : "Create Responsibility"}
                        </h2>

                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-gray-100"
                            aria-label="Close responsibility form"
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
                                placeholder="Responsibility title"
                            />

                            <div className="flex w-full flex-col gap-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    {categories.map((category) => (
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
                                placeholder="Scope, routine, or handoff notes"
                                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <Input
                                label="Assigned User ID"
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                placeholder="MongoDB user ID"
                            />

                            <Input
                                label="Backup User ID"
                                name="backupUser"
                                value={formData.backupUser}
                                onChange={handleChange}
                                placeholder="Optional MongoDB user ID"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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

                            {editingResponsibility && (
                                <label className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text-primary)]">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="h-4 w-4"
                                    />
                                    Active
                                </label>
                            )}
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
                                    : editingResponsibility
                                      ? "Save Changes"
                                      : "Create Responsibility"}
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
                        Loading responsibilities...
                    </p>
                </Card>
            ) : filteredResponsibilities.length === 0 ? (
                <Card className="text-center">
                    <ClipboardList
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No responsibilities found
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {categoryFilter === "all"
                            ? "Active responsibilities will appear here."
                            : "No active responsibilities match this category."}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {filteredResponsibilities.map((responsibility) => (
                        <Card key={responsibility._id} className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-xl font-semibold">
                                            {responsibility.title}
                                        </h2>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                            {formatLabel(
                                                responsibility.category
                                            )}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                        {responsibility.description ||
                                            "No description."}
                                    </p>
                                </div>

                                {isAdmin && (
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditForm(responsibility)
                                            }
                                            className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                            aria-label={`Edit ${responsibility.title}`}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(responsibility)
                                            }
                                            disabled={actionLoading}
                                            className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-danger)] hover:border-[var(--color-danger)] disabled:opacity-60"
                                            aria-label={`Delete ${responsibility.title}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Assigned
                                    </p>
                                    <p>{getUserName(responsibility.assignedTo)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Backup
                                    </p>
                                    <p>{getUserName(responsibility.backupUser)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Start
                                    </p>
                                    <p>{formatDate(responsibility.startDate)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        End
                                    </p>
                                    <p>{formatDate(responsibility.endDate)}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResponsibilitiesPage;
