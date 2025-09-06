import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';

function ImageUpload({ value, onChange, error, className = '' }) {
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState(value ? URL.createObjectURL(value) : null);
    const inputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileChange(file);
        }
    };

    const handleFileChange = (file) => {
        setPreview(URL.createObjectURL(file));
        onChange(file);
        
        // Simulate upload progress
        let prog = 0;
        const interval = setInterval(() => {
            prog += 10;
            setProgress(prog);
            if (prog >= 100) clearInterval(interval);
        }, 100);
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setPreview(null);
        onChange(null);
        setProgress(0);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <motion.div
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative overflow-hidden rounded-xl border-2 border-dashed
                    transition-colors cursor-pointer min-h-[200px]
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                />
                
                <AnimatePresence>
                    {preview ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                        >
                            <img
                                src={preview}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            
                            {progress < 100 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-1/2 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-primary/80"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <p className="text-sm font-medium">
                                {isDragging ? (
                                    "Drop your image here"
                                ) : (
                                    <>
                                        Drag & drop an image or{" "}
                                        <span className="text-primary">browse</span>
                                    </>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supports JPG, PNG and GIF
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            
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

export default ImageUpload;
