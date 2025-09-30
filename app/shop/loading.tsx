import { ProductCardSkeleton } from "@/components/skeleton-loader"

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>

        {/* Dashboard Skeleton */}
        <div className="mb-8">
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Search and Filters Skeleton */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6">
          <div className="flex-1 max-w-full lg:max-w-md">
            <div className="h-10 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
            <div className="h-10 w-full sm:w-48 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-10 w-full sm:w-48 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-10 w-full sm:w-auto bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
