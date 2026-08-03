import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../components/ui";
import { useAuth } from "../../context";
import authService from "../../services/authService";

const labPositions = [
    {
        value: "principal_investigator",
        label: "Principal Investigator",
    },
    {
        value: "lab_manager",
        label: "Lab Manager",
    },
    {
        value: "md_phd_student",
        label: "MD/PhD Student",
    },
    {
        value: "md_student",
        label: "MD Student",
    },
    {
        value: "undergraduate_research_assistant",
        label: "Undergraduate Research Assistant",
    },
    {
        value: "researcher",
        label: "Researcher",
    },
    {
        value: "lab_technician",
        label: "Lab Technician",
    },
    {
        value: "other",
        label: "Other",
    },
];

const RegisterPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            labPosition: "",
            labAccessCode: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            setServerError("");

            const payload = {
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                email: data.email.trim().toLowerCase(),
                password: data.password,
                labPosition: data.labPosition,
                labAccessCode: data.labAccessCode,
            };

            const { user, token } = await authService.register(payload);

            if (token) {
                login(user, token);
                navigate("/dashboard", { replace: true });
            }
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Registration failed. Please check the form and try again.";

            setServerError(message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F1E8] px-4 py-10">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-[#1A2F4D]">
                        Join LabHub
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Create your Kehat Lab portal account.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {serverError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {serverError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                First Name
                            </label>
                            <input
                                type="text"
                                placeholder="First name"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A2F4D] focus:ring-2 focus:ring-[#1A2F4D]/20"
                                {...register("firstName", {
                                    required: "First name is required",
                                })}
                            />
                            {errors.firstName && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                placeholder="Last name"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A2F4D] focus:ring-2 focus:ring-[#1A2F4D]/20"
                                {...register("lastName", {
                                    required: "Last name is required",
                                })}
                            />
                            {errors.lastName && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A2F4D] focus:ring-2 focus:ring-[#1A2F4D]/20"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: "Please enter a valid email",
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Create a password"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A2F4D] focus:ring-2 focus:ring-[#1A2F4D]/20"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message:
                                            "Password must be at least 6 characters",
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                placeholder="Confirm password"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A2F4D] focus:ring-2 focus:ring-[#1A2F4D]/20"
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === getValues("password") ||
                                        "Passwords do not match",
                                })}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Lab Position
                        </label>
                        <select
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A2F4D] focus:ring-2 focus:ring-[#1A2F4D]/20"
                            {...register("labPosition", {
                                required: "Lab position is required",
                            })}
                        >
                            <option value="">Select your lab position</option>
                            {labPositions.map((position) => (
                                <option
                                    key={position.value}
                                    value={position.value}
                                >
                                    {position.label}
                                </option>
                            ))}
                        </select>
                        {errors.labPosition && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.labPosition.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Lab Access Code
                        </label>
                        <input
                            type="password"
                            placeholder="Enter lab access code"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A2F4D] focus:ring-2 focus:ring-[#1A2F4D]/20"
                            {...register("labAccessCode", {
                                required: "Lab access code is required",
                            })}
                        />
                        {errors.labAccessCode && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.labAccessCode.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-[#1A2F4D] hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
