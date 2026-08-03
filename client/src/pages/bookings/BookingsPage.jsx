import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Edit3, Plus, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    cancelBooking,
    clearBookingErrors,
    createBooking,
    fetchBookingEquipmentOptions,
    fetchBookings,
    updateBooking,
} from "../../redux/slices/bookingSlice";

const emptyForm = {
    equipment: "",
    startTime: "",
    endTime: "",
    purpose: "",
};

const statuses = ["active", "cancelled", "completed"];

const formatLabel = (value) => {
    if (!value) {
        return "Not set";
    }

    return value.replaceAll("_", " ");
};

const formatDateTime = (value) => {
    if (!value) {
        return "No time";
    }

    return new Date(value).toLocaleString();
};

const toDateTimeInputValue = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
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

const getEquipmentName = (equipment) => {
    if (!equipment || typeof equipment === "string") {
        return equipment || "Unknown equipment";
    }

    return equipment.name;
};

const getEquipmentMeta = (equipment) => {
    if (!equipment || typeof equipment === "string") {
        return "";
    }

    return [formatLabel(equipment.category), equipment.location, equipment.status]
        .filter(Boolean)
        .join(" | ");
};

const canManageBooking = (booking, user) => {
    if (!booking || !user) {
        return false;
    }

    return user.role === "admin" || getEntityId(booking.bookedBy) === user._id;
};

const buildFormState = (booking) => ({
    equipment: getEntityId(booking?.equipment),
    startTime: toDateTimeInputValue(booking?.startTime),
    endTime: toDateTimeInputValue(booking?.endTime),
    purpose: booking?.purpose || "",
});

const BookingsPage = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const {
        bookings,
        equipmentOptions,
        loading,
        equipmentLoading,
        error,
        equipmentError,
        actionLoading,
        actionError,
    } = useSelector((state) => state.bookings);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        dispatch(fetchBookings());
        dispatch(fetchBookingEquipmentOptions());

        return () => {
            dispatch(clearBookingErrors());
        };
    }, [dispatch]);

    const filteredBookings = useMemo(() => {
        if (statusFilter === "all") {
            return bookings;
        }

        return bookings.filter((booking) => booking.status === statusFilter);
    }, [bookings, statusFilter]);

    const openCreateForm = () => {
        setEditingBooking(null);
        setFormData(emptyForm);
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearBookingErrors());
    };

    const openEditForm = (booking) => {
        setEditingBooking(booking);
        setFormData(buildFormState(booking));
        setFormError("");
        setIsFormOpen(true);
        dispatch(clearBookingErrors());
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingBooking(null);
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
        equipment: formData.equipment,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        purpose: formData.purpose.trim(),
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!editingBooking && !formData.equipment) {
            setFormError("Equipment is required.");
            return;
        }

        if (!formData.startTime || !formData.endTime) {
            setFormError("Start and end time are required.");
            return;
        }

        if (new Date(formData.startTime) >= new Date(formData.endTime)) {
            setFormError("Start time must be before end time.");
            return;
        }

        const payload = buildPayload();
        const action = editingBooking
            ? updateBooking({
                  bookingId: editingBooking._id,
                  bookingData: {
                      startTime: payload.startTime,
                      endTime: payload.endTime,
                      purpose: payload.purpose,
                  },
              })
            : createBooking(payload);

        const result = await dispatch(action);

        if (
            createBooking.fulfilled.match(result) ||
            updateBooking.fulfilled.match(result)
        ) {
            closeForm();
            dispatch(fetchBookings());
        }
    };

    const handleCancel = async (booking) => {
        const confirmed = window.confirm(`Cancel booking for ${getEquipmentName(booking.equipment)}?`);

        if (!confirmed) {
            return;
        }

        const result = await dispatch(cancelBooking(booking._id));

        if (cancelBooking.fulfilled.match(result)) {
            dispatch(fetchBookings());
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Equipment schedule
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Bookings
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Reserve available equipment and review booking activity.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/bookings/my"
                        className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                    >
                        My Bookings
                    </Link>
                    <Button onClick={openCreateForm} className="gap-2">
                        <Plus size={18} />
                        New Booking
                    </Button>
                </div>
            </div>

            <Card>
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
            </Card>

            {isFormOpen && (
                <Card>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">
                            {editingBooking ? "Edit Booking" : "Create Booking"}
                        </h2>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-gray-100"
                            aria-label="Close booking form"
                        >
                            <XCircle size={18} />
                        </button>
                    </div>

                    {(formError || actionError || equipmentError) && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {formError || actionError || equipmentError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            <div className="flex w-full flex-col gap-2">
                                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                    Equipment
                                </label>
                                <select
                                    name="equipment"
                                    value={formData.equipment}
                                    onChange={handleChange}
                                    disabled={Boolean(editingBooking) || equipmentLoading}
                                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition disabled:bg-gray-50 disabled:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                >
                                    <option value="">
                                        {equipmentLoading
                                            ? "Loading equipment..."
                                            : "Select equipment"}
                                    </option>
                                    {equipmentOptions.map((equipment) => (
                                        <option
                                            key={equipment._id}
                                            value={equipment._id}
                                        >
                                            {equipment.name} -{" "}
                                            {formatLabel(equipment.status)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Start Time"
                                name="startTime"
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={handleChange}
                            />

                            <Input
                                label="End Time"
                                name="endTime"
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex w-full flex-col gap-2">
                            <label className="text-sm font-medium text-[var(--color-text-primary)]">
                                Purpose
                            </label>
                            <textarea
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Purpose of the equipment booking"
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
                                    : editingBooking
                                      ? "Save Changes"
                                      : "Create Booking"}
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
                        Loading bookings...
                    </p>
                </Card>
            ) : filteredBookings.length === 0 ? (
                <Card className="text-center">
                    <CalendarClock
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No bookings found
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Create a booking or adjust the status filter.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                        const canManage = canManageBooking(booking, user);
                        const isCancelled = booking.status === "cancelled";

                        return (
                            <Card key={booking._id}>
                                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg font-semibold">
                                                {getEquipmentName(booking.equipment)}
                                            </h2>
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                {formatLabel(booking.status)}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                                            {getEquipmentMeta(booking.equipment)}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                            {booking.purpose || "No purpose provided."}
                                        </p>

                                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-[var(--color-text-secondary)] md:grid-cols-4">
                                            <div>
                                                <p className="font-medium text-[var(--color-text-primary)]">
                                                    Start
                                                </p>
                                                <p>{formatDateTime(booking.startTime)}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--color-text-primary)]">
                                                    End
                                                </p>
                                                <p>{formatDateTime(booking.endTime)}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--color-text-primary)]">
                                                    Booked By
                                                </p>
                                                <p>{getUserName(booking.bookedBy)}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--color-text-primary)]">
                                                    Created
                                                </p>
                                                <p>{formatDateTime(booking.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {canManage && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditForm(booking)}
                                                disabled={actionLoading || isCancelled}
                                                className="rounded-xl border border-[var(--color-border)] p-3 text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-60"
                                                aria-label="Edit booking"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCancel(booking)}
                                                disabled={actionLoading || isCancelled}
                                                className="rounded-xl border border-[var(--color-border)] p-3 text-[var(--color-danger)] hover:border-[var(--color-danger)] disabled:opacity-60"
                                                aria-label="Cancel booking"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
