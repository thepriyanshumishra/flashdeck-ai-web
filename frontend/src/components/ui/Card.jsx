import { cn } from "../../lib/utils";

export default function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "glass rounded-xl p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
