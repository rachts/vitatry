import { Loader2 } from "lucide-react"

interface LoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function Loading({ message = "Loading...", size = "md" }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`animate-spin text-[#2ea043] ${sizeClasses[size]}`} />
      <p className="mt-2 text-[#2d3748] text-sm">{message}</p>
    </div>
  )
}
