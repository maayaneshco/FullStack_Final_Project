const Input = ({
    label,
    error,
    className = "",
    ...props
}) => {
    return (
        <div className="flex w-full flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    {label}
                </label>
            )}

            <input
                className={`
                    w-full
                    rounded-xl
                    border
                    border-[var(--color-border)]
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition-all
                    duration-200
                    focus:border-[var(--color-primary)]
                    focus:ring-2
                    focus:ring-[var(--color-primary-light)]
                    ${className}
                `}
                {...props}
            />

            {error && (
                <span className="text-sm text-[var(--color-danger)]">
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;