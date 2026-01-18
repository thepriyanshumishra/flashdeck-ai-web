import { cn } from "../../lib/utils";

export default function GradientText({ className, children, from = "from-orange-400", to = "to-purple-600" }) {
    return (
        <span className={cn(
            "bg-clip-text text-transparent bg-gradient-to-r font-bold",
            from,
            to,
            className
        )}>
            {children}
        </span>
    );
}
