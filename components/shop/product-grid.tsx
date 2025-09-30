"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "./cart-provider"
import { toast } from "sonner"
import { ShoppingCart, Heart, Star } from "lucide-react"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  inStock: number
  imageUrl: string
  rating: number
  reviews: number
  tags: string[]
}

interface ProductGridProps {
  searchQuery?: string
  selectedCategory?: string
  priceRange?: [number, number]
}

export default function ProductGrid({
  searchQuery = "",
  selectedCategory = "all",
  priceRange = [0, 1000],
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/shop/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

    return matchesSearch && matchesCategory && matchesPrice
  })

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product._id, 1)
      toast.success(`${product.name} added to cart!`)
    } catch (error) {
      toast.error("Failed to add item to cart")
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="w-full h-48 bg-gray-200 rounded-md"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProducts}>Try Again</Button>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
        <Button onClick={() => window.location.reload()}>Reset Filters</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="p-0">
            <div className="relative overflow-hidden rounded-t-lg">
              <Image
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {product.inStock < 10 && product.inStock > 0 && (
                <Badge className="absolute top-2 left-2 bg-orange-500">Low Stock</Badge>
              )}
              {product.inStock === 0 && <Badge className="absolute top-2 left-2 bg-red-500">Out of Stock</Badge>}
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <CardTitle className="text-lg mb-2 line-clamp-1">{product.name}</CardTitle>
            <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</CardDescription>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">${product.price.toFixed(2)}</div>
              <div className="text-sm text-gray-500">{product.inStock} in stock</div>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button className="w-full" onClick={() => handleAddToCart(product)} disabled={product.inStock === 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.inStock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
