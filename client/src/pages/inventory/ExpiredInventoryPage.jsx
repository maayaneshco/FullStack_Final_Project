import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarX } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "../../components/ui";
import {
    clearInventoryErrors,
    fetchExpiredItems,
} from "../../redux/slices/inventorySlice";

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

const getUserName = (user) => {
    if (!user || typeof user === "string") {
        return user || "Not assigned";
    }

    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
};

const ExpiredInventoryPage = () => {
    const dispatch = useDispatch();
    const { expiredItems, expiredLoading, expiredError } = useSelector(
        (state) => state.inventory
    );

    useEffect(() => {
        dispatch(fetchExpiredItems());

        return () => {
            dispatch(clearInventoryErrors());
        };
    }, [dispatch]);

    return (
        <div className="space-y-6">
            <Link
                to="/inventory"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
            >
                <ArrowLeft size={16} />
                Back to inventory
            </Link>

            <div>
                <p className="text-sm font-medium text-[var(--color-accent)]">
                    Expiration review
                </p>
                <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                    Expired Inventory
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                    Active items with an expiration date earlier than today, as
                    returned by the backend.
                </p>
            </div>

            {expiredError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {expiredError}
                </div>
            )}

            {expiredLoading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading expired inventory...
                    </p>
                </Card>
            ) : expiredItems.length === 0 ? (
                <Card className="text-center">
                    <CalendarX
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No expired inventory
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        No active items are currently past their expiration date.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {expiredItems.map((item) => (
                        <Card key={item._id} className="space-y-5">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-semibold">
                                        {item.name}
                                    </h2>
                                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                                        Expired
                                    </span>
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                        {formatLabel(item.category)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                                    {item.description || "No description."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Expired On
                                    </p>
                                    <p>{formatDate(item.expirationDate)}</p>
                                </div>
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
                                        Location
                                    </p>
                                    <p>{item.location || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--color-text-primary)]">
                                        Supplier
                                    </p>
                                    <p>{item.supplier || "Not set"}</p>
                                </div>
                            </div>

                            <div className="text-sm text-[var(--color-text-secondary)]">
                                <p className="font-medium text-[var(--color-text-primary)]">
                                    Responsible
                                </p>
                                <p>{getUserName(item.responsibleUser)}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExpiredInventoryPage;
