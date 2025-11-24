import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-98",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md",
                destructive:
                    "bg-error text-white hover:bg-error/90 shadow-sm hover:shadow-md",
                outline:
                    "border-2 border-neutral-300 bg-transparent hover:bg-neutral-50 text-neutral-700",
                secondary:
                    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200",
                ghost: "hover:bg-neutral-100 text-neutral-700",
                link: "text-primary underline-offset-4 hover:underline hover:text-primary-dark",
                success: "bg-accent text-white hover:bg-accent-dark shadow-sm hover:shadow-md",
            },
            size: {
                default: "h-11 px-6 py-3 text-sm",
                sm: "h-9 px-4 py-2 text-sm rounded-md",
                lg: "h-12 px-8 py-3 text-base rounded-lg",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {children}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }

