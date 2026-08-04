import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import {
    clearUserManagementErrors,
    fetchUsers,
    updateManagedUserRole,
} from "../../redux/slices/userManagementSlice";

const roles = ["researcher", "admin"];

const formatLabel = (value) => {
    if (!value) {
        return "Not set";
    }

    return value.replaceAll("_", " ");
};

const getFullName = (user) => {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
};

const UsersPage = () => {
    const dispatch = useDispatch();
    const { user: currentUser } = useAuth();
    const { users, loading, error, actionLoading, actionError } = useSelector(
        (state) => state.userManagement
    );

    const [roleFilter, setRoleFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        dispatch(fetchUsers());

        return () => {
            dispatch(clearUserManagementErrors());
        };
    }, [dispatch]);

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const matchesRole =
                roleFilter === "all" || user.role === roleFilter;

            const searchableText = [
                user.firstName,
                user.lastName,
                user.email,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return matchesRole && searchableText.includes(normalizedSearch);
        });
    }, [users, roleFilter, searchTerm]);

    const handleRoleChange = async (managedUser, role) => {
        setSuccessMessage("");

        if (managedUser._id === currentUser?._id) {
            return;
        }

        if (role === managedUser.role) {
            return;
        }

        const result = await dispatch(
            updateManagedUserRole({
                userId: managedUser._id,
                role,
            })
        );

        if (updateManagedUserRole.fulfilled.match(result)) {
            setSuccessMessage("User role updated successfully.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Administration
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Users
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Review registered lab members and manage admin or
                        researcher roles.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => dispatch(fetchUsers())}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            <Card className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="relative">
                        <Input
                            label="Search users"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search by name or email"
                            className="pl-10"
                        />
                        <Search
                            size={16}
                            className="absolute left-4 top-11 text-[var(--color-text-muted)]"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {["all", ...roles].map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setRoleFilter(role)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${
                                    roleFilter === role
                                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                        : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
                                }`}
                            >
                                {formatLabel(role)}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {(error || actionError) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error || actionError}
                </div>
            )}

            {successMessage && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMessage}
                </div>
            )}

            {loading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading users...
                    </p>
                </Card>
            ) : filteredUsers.length === 0 ? (
                <Card className="text-center">
                    <Users
                        className="mx-auto text-[var(--color-accent)]"
                        size={36}
                    />
                    <h2 className="mt-4 text-lg font-semibold">
                        No users found
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Adjust the role filter or search term.
                    </p>
                </Card>
            ) : (
                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[var(--color-border)]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                                        Position
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                                        Role
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)] bg-white">
                                {filteredUsers.map((managedUser) => {
                                    const isCurrentUser =
                                        managedUser._id === currentUser?._id;

                                    return (
                                        <tr key={managedUser._id}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                                                        <ShieldCheck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[var(--color-text-primary)]">
                                                            {getFullName(
                                                                managedUser
                                                            ) || "Unnamed user"}
                                                        </p>
                                                        {isCurrentUser && (
                                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                                Current admin
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                                                {managedUser.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm capitalize text-[var(--color-text-secondary)]">
                                                {formatLabel(
                                                    managedUser.labPosition
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={managedUser.role}
                                                    onChange={(event) =>
                                                        handleRoleChange(
                                                            managedUser,
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ||
                                                        isCurrentUser
                                                    }
                                                    className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm capitalize outline-none transition disabled:bg-gray-50 disabled:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                                                >
                                                    {roles.map((role) => (
                                                        <option
                                                            key={role}
                                                            value={role}
                                                        >
                                                            {formatLabel(role)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default UsersPage;
