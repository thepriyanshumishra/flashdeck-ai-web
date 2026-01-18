import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    outline: "border border-white/10 bg-transparent hover:bg-white/5 text-gray-200",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
};

export default function Button({
    className,
    variant = "primary",
    size = "md",
    isLoading,
    children,
    ...props
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none gap-2",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </motion.button>
    );
}
