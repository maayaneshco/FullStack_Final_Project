import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, Microscope, Plus, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    clearEquipmentErrors,
    createEquipment,
    deleteEquipment,
    fetchEquipment,
    updateEquipment,
} from "../../redux/slices/equipmentSlice";

const emptyForm = {
    name: "",
    description: "",
    category: "general",
    location: "",
    status: "available",
    isActive: true,
};

const categories = [
    "microscope",
    "centrifuge",
    "pcr_machine",
    "incubator",
    "freezer",
    "sequencer",
    "imaging",
    "general",
];

const statuses = ["available", "maintenance", "out_of_service"];

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

const buildFormState = (equipment) => ({
    name: equipment?.name || "",
    description: equipment?.description || "",
    category: equipment?.category || "general",
    location: equipment?.location || "",
    status: equipment?.status || "available",
    isActive: equipment?.isActive ?? true,
});

const EquipmentPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { equipment, loading, error, actionLoading, actionError } =
        useSelector((state) => state.equipment);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        dispatch(fetchEquipment());

        return () => {
            dispatch(clearEquipmentErrors());
        };
    }, [dispatch]);

    const filteredEquipment = useMemo(() => {
        return equipment.filter((item) => {
            const matchesCategory =
                categoryFilter === "all" || item.category === categoryFilter;
            const matchesStatus =
                statusFilter === "all" || item.status === statusFilter;

            return matchesCategory && matchesStatus;
        });
    }, [equipment, categoryFilter, statusFilter]);

    const openCreateForm = () => {
        setEditingEquipment(null);
        setFormData(emptyForm);
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearEquipmentErrors());
    };

    const openEditForm = (item) => {
        setEditingEquipment(item);
        setFormData(buildFormState(item));
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearEquipmentErrors());
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingEquipment(null);
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

    const buildPayload = () => ({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.trim(),
        status: formData.status,
        isActive: formData.isActive,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            setFormError("Name is required.");
            return;
        }

        const action = editingEquipment
            ? updateEquipment({
                  equipmentId: editingEquipment._id,
                  equipmentData: buildPayload(),
              })
            : createEquipment(buildPayload());

        const result = await dispatch(action);

        if (
            createEquipment.fulfilled.match(result) ||
            updateEquipment.fulfilled.match(result)
        ) {
            closeForm();
            dispatch(fetchEquipment());
        }
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Delete "${item.name}"? This will mark it inactive.`
        );

        if (!confirmed) {
            return;
        }

        await dispatch(deleteEquipment(item._id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Shared lab resources
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Equipment
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Manage active lab equipment, status, category, and
                        location.
                    </p>
                </div>

                {isAdmin && (
                    <Button onClick={openCreateForm} className="gap-2">
                        <Plus size={18} />
                        New Equipment
                    </Button>
                )}
            </div>

            <Card className="space-y-4">
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

                <div className="flex flex-wrap gap-2">
                    {["all", ...statuses].map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                                statusFilter === status
                                    ? "border-[var(--color-accent)] bg-amber-50 text-amber-800"
                                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
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
                            {editingEquipment ? "Edit Equipment" : "Create Equipment"}
                        </h2>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-gray-100"
                            aria-label="Close equipment form"
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
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Equipment name"
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
                                placeholder="Equipment notes or capabilities"
                                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <Input
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Room, bench, freezer area"
                            />

                            {editingEquipment && (
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
                                    : editingEquipment
                                      ? "Save Changes"
                                      : "Create Equipment"}
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
                        Loading equipment...
                    </p>
                </Card>
            ) : filteredEquipment.length === 0 ? (
                <Card className="text-center">
                    <Microscope
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No equipment found
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Add equipment or adjust the filters.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {filteredEquipment.map((item) => (
                        <Card key={item._id} className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Link
                                            to={`/equipment/${item._id}`}
                                            className="text-xl font-semibold hover:text-[var(--color-primary-light)]"
                                        >
                                            {item.name}
                                        </Link>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                            {formatLabel(item.category)}
                                        </span>
                                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                            {formatLabel(item.status)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                        {item.description || "No description."}
                                    </p>
                                </div>

                                {isAdmin && (
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditForm(item)}
                                            className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                            aria-label={`Edit ${item.name}`}
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item)}
                                            disabled={actionLoading}
                                            className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-danger)] hover:border-[var(--color-danger)] disabled:opacity-60"
                                            aria-label={`Delete ${item.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-3">
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Location
                                    </p>
                                    <p>{item.location || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Created
                                    </p>
                                    <p>{formatDate(item.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Updated
                                    </p>
                                    <p>{formatDate(item.updatedAt)}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EquipmentPage;
