
'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'

interface InputProps extends HTMLMotionProps<"input"> {
    label?: string
    error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                    {label}
                </label>
            )}
            <motion.input
                whileFocus={{ scale: 1.01 }}
                className={clsx(
                    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white transition-all outline-none focus:ring-2 focus:ring-[#e63946]/20 focus:border-[#e63946]",
                    error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>
            )}
        </div>
    )
}
