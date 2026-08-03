import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Edit3, Plus, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    clearInventoryErrors,
    createInventoryItem,
    deleteInventoryItem,
    fetchInventoryItems,
    updateInventoryItem,
} from "../../redux/slices/inventorySlice";

const emptyForm = {
    name: "",
    description: "",
    category: "general",
    unit: "units",
    quantity: "0",
    minimumQuantity: "0",
    location: "",
    supplier: "",
    catalogNumber: "",
    expirationDate: "",
    responsibleUser: "",
    notes: "",
    isActive: true,
};

const categories = [
    "reagent",
    "chemical",
    "consumable",
    "biological_sample",
    "antibody",
    "primer",
    "kit",
    "buffer",
    "medium",
    "equipment_part",
    "general",
];

const units = [
    "units",
    "boxes",
    "bottles",
    "tubes",
    "plates",
    "packs",
    "ml",
    "l",
    "mg",
    "g",
    "kg",
];

const formatLabel = (value) => {
    if (!value) {
        return "Not set";
    }

    return value.replaceAll("_", " ");
};

const formatDate = (value) => {
    if (!value) {
        return "No expiration";
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

const isLowStock = (item) => {
    return Number(item.quantity) <= Number(item.minimumQuantity);
};

const isExpired = (item) => {
    return item.expirationDate && new Date(item.expirationDate) < new Date();
};

const buildFormState = (item) => ({
    name: item?.name || "",
    description: item?.description || "",
    category: item?.category || "general",
    unit: item?.unit || "units",
    quantity: String(item?.quantity ?? 0),
    minimumQuantity: String(item?.minimumQuantity ?? 0),
    location: item?.location || "",
    supplier: item?.supplier || "",
    catalogNumber: item?.catalogNumber || "",
    expirationDate: toDateInputValue(item?.expirationDate),
    responsibleUser: getEntityId(item?.responsibleUser),
    notes: item?.notes || "",
    isActive: item?.isActive ?? true,
});

const InventoryPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { items, loading, error, actionLoading, actionError } = useSelector(
        (state) => state.inventory
    );

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");

    const isAdmin = user?.role === "admin";

    useEffect(() => {
        dispatch(fetchInventoryItems());

        return () => {
            dispatch(clearInventoryErrors());
        };
    }, [dispatch]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesCategory =
                categoryFilter === "all" || item.category === categoryFilter;
            const matchesStock =
                stockFilter === "all" ||
                (stockFilter === "low" && isLowStock(item)) ||
                (stockFilter === "expired" && isExpired(item));

            return matchesCategory && matchesStock;
        });
    }, [items, categoryFilter, stockFilter]);

    const openCreateForm = () => {
        setEditingItem(null);
        setFormData(emptyForm);
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearInventoryErrors());
    };

    const openEditForm = (item) => {
        setEditingItem(item);
        setFormData(buildFormState(item));
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearInventoryErrors());
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
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
        unit: formData.unit,
        quantity: Number(formData.quantity),
        minimumQuantity: Number(formData.minimumQuantity),
        location: formData.location.trim(),
        supplier: formData.supplier.trim(),
        catalogNumber: formData.catalogNumber.trim(),
        expirationDate: formData.expirationDate || null,
        responsibleUser: formData.responsibleUser.trim() || null,
        notes: formData.notes.trim(),
        isActive: formData.isActive,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name.trim()) {
            setFormError("Name is required.");
            return;
        }

        if (Number(formData.quantity) < 0 || Number(formData.minimumQuantity) < 0) {
            setFormError("Quantity values cannot be negative.");
            return;
        }

        const action = editingItem
            ? updateInventoryItem({
                  itemId: editingItem._id,
                  itemData: buildPayload(),
              })
            : createInventoryItem(buildPayload());

        const result = await dispatch(action);

        if (
            createInventoryItem.fulfilled.match(result) ||
            updateInventoryItem.fulfilled.match(result)
        ) {
            closeForm();
            dispatch(fetchInventoryItems());
        }
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Delete "${item.name}"? This will mark it inactive.`
        );

        if (!confirmed) {
            return;
        }

        await dispatch(deleteInventoryItem(item._id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Lab supplies
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Inventory
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Track active inventory items, quantities, minimum stock,
                        locations, suppliers, and expiration dates.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/inventory/low-stock"
                        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                    >
                        Low Stock
                    </Link>
                    <Link
                        to="/inventory/expired"
                        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                    >
                        Expired
                    </Link>
                    {isAdmin && (
                        <Button onClick={openCreateForm} className="gap-2">
                            <Plus size={18} />
                            New Item
                        </Button>
                    )}
                </div>
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
                    {[
                        { label: "All stock", value: "all" },
                        { label: "Low stock", value: "low" },
                        { label: "Expired", value: "expired" },
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => setStockFilter(filter.value)}
                            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                                stockFilter === filter.value
                                    ? "border-[var(--color-accent)] bg-amber-50 text-amber-800"
                                    : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </Card>

            {isFormOpen && (
                <Card>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">
                            {editingItem ? "Edit Inventory Item" : "Create Inventory Item"}
                        </h2>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-gray-100"
                            aria-label="Close inventory form"
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
                                placeholder="Item name"
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
                                    Unit
                                </label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    {units.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
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
                                placeholder="Item details"
                                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                            <Input
                                label="Quantity"
                                name="quantity"
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                            <Input
                                label="Minimum Quantity"
                                name="minimumQuantity"
                                type="number"
                                min="0"
                                value={formData.minimumQuantity}
                                onChange={handleChange}
                            />
                            <Input
                                label="Expiration Date"
                                name="expirationDate"
                                type="date"
                                value={formData.expirationDate}
                                onChange={handleChange}
                            />
                            {editingItem && (
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

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                            <Input
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Freezer, shelf, room"
                            />
                            <Input
                                label="Supplier"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                placeholder="Supplier"
                            />
                            <Input
                                label="Catalog Number"
                                name="catalogNumber"
                                value={formData.catalogNumber}
                                onChange={handleChange}
                                placeholder="Catalog number"
                            />
                            <Input
                                label="Responsible User ID"
                                name="responsibleUser"
                                value={formData.responsibleUser}
                                onChange={handleChange}
                                placeholder="Optional user ID"
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
                                placeholder="Storage or ordering notes"
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
                                    : editingItem
                                      ? "Save Changes"
                                      : "Create Item"}
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
                        Loading inventory...
                    </p>
                </Card>
            ) : filteredItems.length === 0 ? (
                <Card className="text-center">
                    <Boxes
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No inventory items found
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Add an item or adjust the filters.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {filteredItems.map((item) => (
                        <Card key={item._id} className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-xl font-semibold">
                                            {item.name}
                                        </h2>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                            {formatLabel(item.category)}
                                        </span>
                                        {isLowStock(item) && (
                                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                                Low stock
                                            </span>
                                        )}
                                        {isExpired(item) && (
                                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                                                Expired
                                            </span>
                                        )}
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

                            <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Quantity
                                    </p>
                                    <p>
                                        {item.quantity} {item.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Minimum
                                    </p>
                                    <p>
                                        {item.minimumQuantity} {item.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Location
                                    </p>
                                    <p>{item.location || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Expires
                                    </p>
                                    <p>{formatDate(item.expirationDate)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-3">
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Supplier
                                    </p>
                                    <p>{item.supplier || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Catalog
                                    </p>
                                    <p>{item.catalogNumber || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Responsible
                                    </p>
                                    <p>{getUserName(item.responsibleUser)}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
