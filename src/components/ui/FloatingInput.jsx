import React, { useState } from 'react';
import { motion } from 'framer-motion';

function FloatingInput({
    label,
    error,
    className = '',
    ...props
}) {
    const [focused, setFocused] = useState(false);
    const [value, setValue] = useState(props.value || '');
    
    const hasContent = focused || value.length > 0;

    return (
        <div className="space-y-2">
            <div className="relative">
                <input
                    className={`
                        peer h-14 w-full rounded-lg border bg-background/50 px-4 pt-4
                        transition-all duration-200 ease-in-out
                        ${error ? 'border-destructive' : 'border-border hover:border-primary/50 focus:border-primary'}
                        ${className}
                    `}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e) => setValue(e.target.value)}
                    {...props}
                />
                <motion.label
                    initial={false}
                    animate={{
                        y: hasContent ? -8 : 0,
                        scale: hasContent ? 0.75 : 1,
                        x: hasContent ? -4 : 0,
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 cursor-text text-muted-foreground transition-colors peer-focus:text-primary"
                >
                    {label}
                </motion.label>
            </div>
            
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
}

export default FloatingInput;
