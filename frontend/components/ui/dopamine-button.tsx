import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface DopamineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'success' | 'warning' | 'magic';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children: React.ReactNode;
}

export const DopamineButton = React.forwardRef<HTMLButtonElement, DopamineButtonProps>(
    ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
        return (
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
            >
                <Button
                    ref={ref}
                    // @ts-ignore - custom variants not yet in Button type
                    variant={variant}
                    size={size}
                    className={cn(
                        "transition-all duration-200 font-semibold shadow-sm hover:shadow-md",
                        className
                    )}
                    {...props}
                >
                    {children}
                </Button>
            </motion.div>
        );
    }
);

DopamineButton.displayName = 'DopamineButton';
