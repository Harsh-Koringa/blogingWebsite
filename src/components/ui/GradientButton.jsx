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
                relative overflow-hidden rounded-lg px-6 py-3 font-medium
                bg-gradient-to-r from-primary to-primary/80
                text-primary-foreground transition-all
                hover:shadow-lg hover:shadow-primary/25
                disabled:opacity-50 disabled:hover:scale-100
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
