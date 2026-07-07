import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import authService from "../../services/authService";
import { useAuth } from "../../context";

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            setServerError("");

            const { user, token } = await authService.login(data);

            login(user, token);

            const redirectTo = location.state?.from?.pathname || "/dashboard";
            navigate(redirectTo, { replace: true });
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Login failed. Please check your email and password.";

            setServerError(message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {serverError}
                </div>
            )}

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

            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                </label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A2F4D] focus:ring-2 focus:ring-[#1A2F4D]/20"
                    {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                        },
                    })}
                />

                {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#1A2F4D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14243b] disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
        </form>
    );
};

export default LoginForm;