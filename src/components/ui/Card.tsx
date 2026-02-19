
'use client'

import { motion } from 'framer-motion'
import clsx from 'clsx'
import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    delay?: number
}

export function Card({ children, className, delay = 0 }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
            className={clsx(
                "glass-panel rounded-2xl shadow-xl border border-white/50 bg-white/80 backdrop-blur-xl",
                className
            )}
        >
            {children}
        </motion.div>
    )
}
