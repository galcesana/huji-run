
'use client'

import { motion } from 'framer-motion'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'google'
    isLoading?: boolean
    children: ReactNode
    className?: string
}

export function Button({
    variant = 'primary',
    isLoading,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {

    const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
        primary: "bg-[#e63946] text-white hover:bg-[#d62828] focus:ring-[#e63946]",
        secondary: "bg-[#1d3557] text-white hover:bg-[#162a45] focus:ring-[#1d3557]",
        outline: "border-2 border-[#e63946] text-[#e63946] hover:bg-[#e63946] hover:text-white",
        ghost: "bg-transparent text-[#1d3557] hover:bg-gray-100",
        google: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm"
    }

    return (
        <motion.button
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
            className={clsx(baseStyles, variants[variant], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {children}
        </motion.button>
    )
}
