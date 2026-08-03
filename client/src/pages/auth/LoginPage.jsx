import { Link } from "react-router-dom";

import LoginForm from "../../components/auth/LoginForm";

const LoginPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7F1E8] px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-[#1A2F4D]">
                        LabHub
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Kehat Lab Research Management System
                    </p>
                </div>

                <LoginForm />

                <p className="mt-6 text-center text-sm text-slate-600">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-[#1A2F4D] hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
