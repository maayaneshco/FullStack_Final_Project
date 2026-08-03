import { useState } from "react";
import { Link } from "react-router-dom";

import { Button, Card, Input } from "../components/ui";
import { useAuth } from "../context";
import userService from "../services/userService";

const emptyForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

const ChangePasswordPage = () => {
    const { user, login } = useAuth();

    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
        setError("");
        setSuccess("");
    };

    const validate = () => {
        if (!formData.currentPassword) {
            return "Current password is required.";
        }

        if (!formData.newPassword) {
            return "New password is required.";
        }

        if (formData.newPassword.length < 6) {
            return "New password must be at least 6 characters.";
        }

        if (formData.newPassword !== formData.confirmPassword) {
            return "New password and confirmation do not match.";
        }

        if (formData.currentPassword === formData.newPassword) {
            return "New password must be different from current password.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const result = await userService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            if (result.token && user) {
                login(user, result.token);
            }

            setFormData(emptyForm);
            setSuccess(result.message || "Password updated successfully.");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Failed to update password."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                        Account security
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Change Password
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        Update your password using the current-password check
                        required by the backend.
                    </p>
                </div>

                <Link
                    to="/profile"
                    className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-primary)] transition hover:bg-gray-50"
                >
                    Back to Profile
                </Link>
            </div>

            <Card className="max-w-2xl">
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                    />

                    <Input
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />

                    <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />

                    <div className="flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ChangePasswordPage;
