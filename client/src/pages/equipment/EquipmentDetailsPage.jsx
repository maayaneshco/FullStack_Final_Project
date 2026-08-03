import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    clearSelectedEquipment,
    deleteEquipment,
    fetchEquipmentById,
    updateEquipment,
} from "../../redux/slices/equipmentSlice";

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

const getUserName = (user) => {
    if (!user || typeof user === "string") {
        return user || "Unknown user";
    }

    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
};

const buildFormState = (equipment) => ({
    name: equipment?.name || "",
    description: equipment?.description || "",
    category: equipment?.category || "general",
    location: equipment?.location || "",
    status: equipment?.status || "available",
    isActive: equipment?.isActive ?? true,
});

const EquipmentDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useAuth();

    const {
        selectedEquipment,
        detailLoading,
        detailError,
        actionLoading,
        actionError,
    } = useSelector((state) => state.equipment);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(buildFormState(null));
    const [formError, setFormError] = useState("");

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        dispatch(fetchEquipmentById(id));

        return () => {
            dispatch(clearSelectedEquipment());
        };
    }, [dispatch, id]);

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

    const handleSave = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            setFormError("Name is required.");
            return;
        }

        const result = await dispatch(
            updateEquipment({
                equipmentId: id,
                equipmentData: buildPayload(),
            })
        );

        if (updateEquipment.fulfilled.match(result)) {
            setIsEditing(false);
            setFormError("");
            dispatch(fetchEquipmentById(id));
        }
    };

    const handleStatusChange = async (status) => {
        if (!selectedEquipment) {
            return;
        }

        await dispatch(
            updateEquipment({
                equipmentId: id,
                equipmentData: {
                    name: selectedEquipment.name,
                    description: selectedEquipment.description || "",
                    category: selectedEquipment.category,
                    location: selectedEquipment.location || "",
                    status,
                    isActive: selectedEquipment.isActive,
                },
            })
        );
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            `Delete "${selectedEquipment.name}"? This will mark it inactive.`
        );

        if (!confirmed) {
            return;
        }

        const result = await dispatch(deleteEquipment(id));

        if (deleteEquipment.fulfilled.match(result)) {
            navigate("/equipment");
        }
    };

    const startEditing = () => {
        setFormData(buildFormState(selectedEquipment));
        setFormError("");
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setFormData(buildFormState(selectedEquipment));
        setFormError("");
        setIsEditing(false);
    };

    if (detailLoading && !selectedEquipment) {
        return (
            <Card>
                <p className="text-sm text-[var(--color-text-secondary)]">
                    Loading equipment...
                </p>
            </Card>
        );
    }

    if (detailError) {
        return (
            <div className="space-y-4">
                <Link
                    to="/equipment"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
                >
                    <ArrowLeft size={16} />
                    Back to equipment
                </Link>

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {detailError}
                </div>
            </div>
        );
    }

    if (!selectedEquipment) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Link
                to="/equipment"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
            >
                <ArrowLeft size={16} />
                Back to equipment
            </Link>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Equipment details
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        {selectedEquipment.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                            {formatLabel(selectedEquipment.category)}
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                            {formatLabel(selectedEquipment.status)}
                        </span>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex flex-wrap gap-2">
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
                                onClick={startEditing}
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
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                                    <Input
                                        label="Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
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
                                                <option
                                                    key={category}
                                                    value={category}
                                                >
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
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
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
                                        rows="4"
                                        className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    <Input
                                        label="Location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />

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
                                        {selectedEquipment.description ||
                                            "No description."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-5 sm:grid-cols-3">
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            Location
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                            {selectedEquipment.location ||
                                                "Not set"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            Active
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                            {selectedEquipment.isActive
                                                ? "Yes"
                                                : "No"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                            Created By
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                            {getUserName(
                                                selectedEquipment.createdBy
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    {isAdmin && (
                        <Card>
                            <h2 className="text-lg font-semibold">Status</h2>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                Equipment availability is controlled by the
                                backend status field.
                            </p>

                            <div className="mt-5 space-y-2">
                                {statuses.map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() =>
                                            handleStatusChange(status)
                                        }
                                        disabled={
                                            actionLoading ||
                                            selectedEquipment.status === status
                                        }
                                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium capitalize transition disabled:cursor-not-allowed disabled:opacity-70 ${
                                            selectedEquipment.status === status
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                                : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                                        }`}
                                    >
                                        {formatLabel(status)}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card>
                        <h2 className="text-lg font-semibold">Timeline</h2>
                        <div className="mt-4 space-y-4 text-sm">
                            <div>
                                <p className="font-medium">Created</p>
                                <p className="text-[var(--color-text-secondary)]">
                                    {formatDate(selectedEquipment.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Updated</p>
                                <p className="text-[var(--color-text-secondary)]">
                                    {formatDate(selectedEquipment.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetailsPage;
