import { cn } from "@/lib/utils"; // Ensure this path is correct

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "bg-[#212121] text-[#E4E4E7] p-4 rounded-2xl shadow-md border border-[#404040]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, children, ...props }: CardContentProps) {
    return (
        <div className={cn("p-4", className)} {...props}>
            {children}
        </div>
    );
}
