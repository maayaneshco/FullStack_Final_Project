import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4 py-10">
            <section className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
                <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                    404
                </p>
                <h1 className="mt-3 text-3xl font-bold text-[var(--color-text-primary)]">
                    Page Not Found
                </h1>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    The page you requested does not exist in the LabHub portal.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                        to="/dashboard"
                        className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/login"
                        className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-primary)] transition hover:bg-gray-50"
                    >
                        Login
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default NotFoundPage;
