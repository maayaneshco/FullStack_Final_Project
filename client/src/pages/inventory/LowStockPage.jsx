import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "../../components/ui";
import {
    clearInventoryErrors,
    fetchLowStockItems,
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

const LowStockPage = () => {
    const dispatch = useDispatch();
    const { lowStockItems, lowStockLoading, lowStockError } = useSelector(
        (state) => state.inventory
    );

    useEffect(() => {
        dispatch(fetchLowStockItems());

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
                    Quantity alert
                </p>
                <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                    Low Stock
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                    Active items where quantity is less than or equal to the
                    minimum quantity, exactly as returned by the backend.
                </p>
            </div>

            {lowStockError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {lowStockError}
                </div>
            )}

            {lowStockLoading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading low stock items...
                    </p>
                </Card>
            ) : lowStockItems.length === 0 ? (
                <Card className="text-center">
                    <AlertTriangle
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No low stock items
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Every active item is above its configured minimum
                        quantity.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {lowStockItems.map((item) => (
                        <Card key={item._id} className="space-y-5">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-semibold">
                                        {item.name}
                                    </h2>
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                                        Low stock
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

export default LowStockPage;
