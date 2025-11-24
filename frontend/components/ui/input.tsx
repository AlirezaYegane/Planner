import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900",
                    "placeholder:text-neutral-400",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent",
                    "transition-all duration-200",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50",
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    error && "border-error focus-visible:ring-error",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }

