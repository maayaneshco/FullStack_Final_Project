import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, UserCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "../../components/ui";
import {
    clearResponsibilityErrors,
    fetchMyResponsibilities,
} from "../../redux/slices/responsibilitySlice";

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

const MyResponsibilitiesPage = () => {
    const dispatch = useDispatch();
    const { myResponsibilities, myLoading, myError } = useSelector(
        (state) => state.responsibilities
    );

    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        dispatch(fetchMyResponsibilities());

        return () => {
            dispatch(clearResponsibilityErrors());
        };
    }, [dispatch]);

    const filteredResponsibilities = useMemo(() => {
        if (categoryFilter === "all") {
            return myResponsibilities;
        }

        return myResponsibilities.filter(
            (responsibility) => responsibility.category === categoryFilter
        );
    }, [myResponsibilities, categoryFilter]);

    return (
        <div className="space-y-6">
            <Link
                to="/responsibilities"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
            >
                <ArrowLeft size={16} />
                Back to responsibilities
            </Link>

            <div>
                <p className="text-sm font-medium text-[var(--color-accent)]">
                    Assigned to me
                </p>
                <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                    My Responsibilities
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                    Active responsibilities where you are the primary or backup
                    owner.
                </p>
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

            {myError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {myError}
                </div>
            )}

            {myLoading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading my responsibilities...
                    </p>
                </Card>
            ) : filteredResponsibilities.length === 0 ? (
                <Card className="text-center">
                    <UserCheck
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No assigned responsibilities
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        {categoryFilter === "all"
                            ? "Responsibilities assigned to you will appear here."
                            : "No assigned responsibilities match this category."}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {filteredResponsibilities.map((responsibility) => {
                        const assignedId = getEntityId(
                            responsibility.assignedTo
                        );
                        const backupId = getEntityId(responsibility.backupUser);

                        return (
                            <Card key={responsibility._id} className="space-y-5">
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

                                <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
                                    <div>
                                        <p className="font-medium text-[var(--color-text-primary)]">
                                            Primary
                                        </p>
                                        <p>{getUserName(responsibility.assignedTo)}</p>
                                        <p className="mt-1 break-all text-xs">
                                            {assignedId}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--color-text-primary)]">
                                            Backup
                                        </p>
                                        <p>{getUserName(responsibility.backupUser)}</p>
                                        {backupId && (
                                            <p className="mt-1 break-all text-xs">
                                                {backupId}
                                            </p>
                                        )}
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
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyResponsibilitiesPage;
