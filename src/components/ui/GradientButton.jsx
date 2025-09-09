import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';

function GradientButton({
    children,
    loading = false,
    success = false,
    className = '',
    ...props
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                self-end px-2 py-1 border border-primary text-primary 
             font-medium rounded-lg hover:bg-primary/10 
             focus:ring-2 focus:ring-primary/80 focus:outline-none 
             transition-colors
                ${className}
            `}
            disabled={loading}
            {...props}
        >
            <motion.div
                initial={false}
                animate={{
                    opacity: loading || success ? 1 : 0,
                    scale: loading || success ? 1 : 0.8,
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/10"
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : success ? (
                    <Check className="h-5 w-5" />
                ) : null}
            </motion.div>

            <motion.span
                initial={false}
                animate={{
                    opacity: loading || success ? 0 : 1,
                    y: loading || success ? 10 : 0,
                }}
            >
                {children}
            </motion.span>
        </motion.button>
    );
}

export default GradientButton;
