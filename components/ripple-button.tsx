"use client"

import type React from "react"

import { type ButtonHTMLAttributes, forwardRef, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline"
}

export const RippleButton = forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ children, className, variant = "primary", onClick, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const button = buttonRef.current
        if (!button) return

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (!prefersReducedMotion) {
          const rect = button.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          const ripple = document.createElement("span")
          ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: ripple 0.6s ease-out;
        `

          button.appendChild(ripple)
          setTimeout(() => ripple.remove(), 600)
        }

        onClick?.(e)
      },
      [onClick],
    )

    const variants = {
      primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white",
      outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950",
    }

    return (
      <button
        ref={(node) => {
          ;(buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          "relative overflow-hidden px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
          variants[variant],
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  },
)

RippleButton.displayName = "RippleButton"
