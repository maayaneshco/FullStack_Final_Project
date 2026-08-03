import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Edit3, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import {
    cancelBooking,
    clearBookingErrors,
    fetchMyBookings,
    updateBooking,
} from "../../redux/slices/bookingSlice";

const emptyForm = {
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

const buildFormState = (booking) => ({
    startTime: toDateTimeInputValue(booking?.startTime),
    endTime: toDateTimeInputValue(booking?.endTime),
    purpose: booking?.purpose || "",
});

const MyBookingsPage = () => {
    const dispatch = useDispatch();
    const { myBookings, myLoading, myError, actionLoading, actionError } =
        useSelector((state) => state.bookings);

    const [editingBooking, setEditingBooking] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        dispatch(fetchMyBookings());

        return () => {
            dispatch(clearBookingErrors());
        };
    }, [dispatch]);

    const filteredBookings = useMemo(() => {
        if (statusFilter === "all") {
            return myBookings;
        }

        return myBookings.filter((booking) => booking.status === statusFilter);
    }, [myBookings, statusFilter]);

    const openEditForm = (booking) => {
        setEditingBooking(booking);
        setFormData(buildFormState(booking));
        setFormError("");
        dispatch(clearBookingErrors());
    };

    const closeForm = () => {
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.startTime || !formData.endTime) {
            setFormError("Start and end time are required.");
            return;
        }

        if (new Date(formData.startTime) >= new Date(formData.endTime)) {
            setFormError("Start time must be before end time.");
            return;
        }

        const result = await dispatch(
            updateBooking({
                bookingId: editingBooking._id,
                bookingData: {
                    startTime: new Date(formData.startTime).toISOString(),
                    endTime: new Date(formData.endTime).toISOString(),
                    purpose: formData.purpose.trim(),
                },
            })
        );

        if (updateBooking.fulfilled.match(result)) {
            closeForm();
            dispatch(fetchMyBookings());
        }
    };

    const handleCancel = async (booking) => {
        const confirmed = window.confirm(`Cancel booking for ${getEquipmentName(booking.equipment)}?`);

        if (!confirmed) {
            return;
        }

        const result = await dispatch(cancelBooking(booking._id));

        if (cancelBooking.fulfilled.match(result)) {
            dispatch(fetchMyBookings());
        }
    };

    return (
        <div className="space-y-6">
            <Link
                to="/bookings"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
            >
                <ArrowLeft size={16} />
                Back to bookings
            </Link>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        My schedule
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        My Bookings
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Equipment bookings created for your user account.
                    </p>
                </div>

                <Link
                    to="/bookings"
                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-primary)] hover:border-[var(--color-primary)]"
                >
                    Create Booking
                </Link>
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

            {editingBooking && (
                <Card>
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">Edit Booking</h2>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl p-2 text-[var(--color-text-secondary)] hover:bg-gray-100"
                            aria-label="Close booking form"
                        >
                            <XCircle size={18} />
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
                                {actionLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {myError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {myError}
                </div>
            )}

            {myLoading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading my bookings...
                    </p>
                </Card>
            ) : filteredBookings.length === 0 ? (
                <Card className="text-center">
                    <CalendarCheck
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No bookings found
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Your equipment bookings will appear here.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => {
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
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;
