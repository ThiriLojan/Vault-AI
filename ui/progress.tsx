"use client";

interface ProgressProps {
    value: number;  // Value should be a percentage directly
    className?: string; // Optional for custom styling
}

export default function Progress({ value, className }: ProgressProps) {
    const percentage = Math.min(value, 100); // Ensure percentage stays within 100%

    return (
        <div className={`w-full ${className}`}>
            <div className="w-full bg-[#212121] rounded-full h-4 overflow-hidden border border-[#454545]">
                <div
                    className="bg-green-500 h-full text-xs text-center text-white rounded-full"
                    style={{ width: `${percentage}%` }}
                >
                    {percentage.toFixed(0)}%
                </div>
            </div>
        </div>
    );
}
