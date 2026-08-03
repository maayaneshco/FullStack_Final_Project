import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button, Card, Input } from "../../components/ui";
import { useAuth } from "../../context";
import userService from "../../services/userService";

const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
};

const formatLabel = (value) => {
    if (!value) {
        return "Not set";
    }

    return value.replaceAll("_", " ");
};

const ProfilePage = () => {
    const { token, login } = useAuth();

    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await userService.getProfile();

                if (!isMounted) {
                    return;
                }

                setProfile(data);
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                });
            } catch (requestError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    requestError.response?.data?.message ||
                        "Failed to load your profile."
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
        setSuccess("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
        };

        if (!payload.firstName || !payload.lastName || !payload.email) {
            setError("First name, last name, and email are required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updatedProfile = await userService.updateProfile(payload);

            setProfile(updatedProfile);
            setFormData({
                firstName: updatedProfile.firstName || "",
                lastName: updatedProfile.lastName || "",
                email: updatedProfile.email || "",
            });

            if (token) {
                login(updatedProfile, token);
            }

            setSuccess("Profile updated successfully.");
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Failed to update your profile."
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
                        Account settings
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
                        Profile
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
                        View your lab account details and update the editable
                        profile fields supported by the backend.
                    </p>
                </div>

                <Link
                    to="/change-password"
                    className="inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-primary)] transition hover:bg-gray-50"
                >
                    Change Password
                </Link>
            </div>

            {loading ? (
                <Card>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Loading profile...
                    </p>
                </Card>
            ) : !profile && !error ? (
                <Card className="text-center">
                    <h2 className="text-lg font-semibold">
                        Profile unavailable
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Your profile could not be found.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                Editable Details
                            </h2>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                Role and lab position are protected backend
                                fields and are shown for reference.
                            </p>
                        </div>

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
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Input
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                />

                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                />
                            </div>

                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                            />

                            <div className="flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Profile"}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                            Account Details
                        </h2>

                        <dl className="mt-5 space-y-4 text-sm">
                            <div>
                                <dt className="font-medium text-[var(--color-text-primary)]">
                                    Full Name
                                </dt>
                                <dd className="mt-1 text-[var(--color-text-secondary)]">
                                    {[profile?.firstName, profile?.lastName]
                                        .filter(Boolean)
                                        .join(" ") || "Not set"}
                                </dd>
                            </div>

                            <div>
                                <dt className="font-medium text-[var(--color-text-primary)]">
                                    Email
                                </dt>
                                <dd className="mt-1 break-all text-[var(--color-text-secondary)]">
                                    {profile?.email || "Not set"}
                                </dd>
                            </div>

                            <div>
                                <dt className="font-medium text-[var(--color-text-primary)]">
                                    Role
                                </dt>
                                <dd className="mt-1 capitalize text-[var(--color-text-secondary)]">
                                    {formatLabel(profile?.role)}
                                </dd>
                            </div>

                            <div>
                                <dt className="font-medium text-[var(--color-text-primary)]">
                                    Lab Position
                                </dt>
                                <dd className="mt-1 capitalize text-[var(--color-text-secondary)]">
                                    {formatLabel(profile?.labPosition)}
                                </dd>
                            </div>
                        </dl>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
