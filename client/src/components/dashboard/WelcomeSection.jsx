import { useAuth } from "../../context";

const WelcomeSection = () => {
    const { user } = useAuth();

    const displayName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Researcher";

    return (
        <section className="rounded-2xl bg-[#1A2F4D] p-8 text-white shadow-sm">
            <p className="text-sm font-medium text-[#D4A574]">
                Kehat Lab Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-bold">
                Welcome back, {displayName}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
                Manage research projects, lab responsibilities, inventory,
                equipment bookings, and protocols from one central workspace.
            </p>
        </section>
    );
};

export default WelcomeSection;