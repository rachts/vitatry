"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  fallback?: string
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fallback = "/placeholder.svg",
  ...props
}: ResponsiveImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md" />}
      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          fill ? "object-cover" : "",
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallback)
          setIsLoading(false)
        }}
        {...props}
      />
    </div>
  )
}
