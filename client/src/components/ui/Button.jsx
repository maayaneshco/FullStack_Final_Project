const Button = ({
    children,
    type = "button",
    variant = "primary",
    className = "",
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium transition-all duration-200";

    const variants = {
        primary:
            "bg-[var(--color-primary)] text-white hover:opacity-90",

        secondary:
            "border border-[var(--color-border)] bg-white text-[var(--color-primary)] hover:bg-gray-50",
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;