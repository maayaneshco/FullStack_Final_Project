const Card = ({
    children,
    className = "",
}) => {
    return (
        <div
            className={`
                rounded-xl
                bg-white
                p-6
                shadow-[var(--shadow-card)]
                border
                border-[var(--color-border)]
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default Card;