"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductGrid from "@/components/shop/product-grid"
import { Search, Filter, Heart, Users, Building2, Truck } from "lucide-react"
import Image from "next/image"

const categories = [
  { value: "all", label: "All Categories" },
  { value: "pain-relief", label: "Pain Relief" },
  { value: "vitamins", label: "Vitamins & Supplements" },
  { value: "diabetes", label: "Diabetes Care" },
  { value: "heart", label: "Heart Health" },
  { value: "antibiotics", label: "Antibiotics" },
  { value: "first-aid", label: "First Aid" },
]

const priceRanges = [
  { value: "0-25", label: "Under $25", range: [0, 25] as [number, number] },
  { value: "25-50", label: "$25 - $50", range: [25, 50] as [number, number] },
  { value: "50-100", label: "$50 - $100", range: [50, 100] as [number, number] },
  { value: "100+", label: "$100+", range: [100, 1000] as [number, number] },
]

const ngoPartners = [
  {
    name: "Doctors Without Borders",
    logo: "/doctors-without-borders-logo.png",
    description: "Providing medical aid where it's needed most",
    impact: "2.3M people helped",
    focus: "Emergency medical care",
  },
  {
    name: "Partners In Health",
    logo: "/partners-in-health-logo.png",
    description: "Strengthening health systems worldwide",
    impact: "15 countries served",
    focus: "Community health",
  },
  {
    name: "Red Cross",
    logo: "/red-cross-logo.png",
    description: "Humanitarian aid and disaster relief",
    impact: "190 countries active",
    focus: "Emergency response",
  },
]

const pharmacyPartners = [
  {
    name: "MediCare Pharmacy",
    logo: "/generic-pharmacy-logo.png",
    locations: "500+ locations",
    services: "24/7 Emergency supply",
    specialty: "Chronic disease management",
  },
  {
    name: "HealthFirst Pharmacy",
    logo: "/generic-pharmacy-logo.png",
    locations: "300+ locations",
    services: "Home delivery",
    specialty: "Pediatric medications",
  },
  {
    name: "Community Care Pharmacy",
    logo: "/generic-pharmacy-logo.png",
    locations: "200+ locations",
    services: "Senior discounts",
    specialty: "Geriatric care",
  },
]

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriceRange, setSelectedPriceRange] = useState<[number, number]>([0, 1000])

  const handlePriceRangeChange = (value: string) => {
    const range = priceRanges.find((r) => r.value === value)
    if (range) {
      setSelectedPriceRange(range.range)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">VitaMend Medicine Shop</h1>
        <p className="text-lg text-gray-600 mb-6">
          Access affordable medicines while supporting our donation network. Every purchase helps fund our mission.
        </p>
      </div>

      <Tabs defaultValue="shop" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="ngo-partners">NGO Partners</TabsTrigger>
          <TabsTrigger value="pharmacy-network">Pharmacy Network</TabsTrigger>
          <TabsTrigger value="medicine-journey">Medicine Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={handlePriceRangeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setSelectedPriceRange([0, 1000])
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          <ProductGrid searchQuery={searchQuery} selectedCategory={selectedCategory} priceRange={selectedPriceRange} />
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Availability Dashboard</CardTitle>
              <CardDescription>Real-time inventory of available medicines in our network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">2,847</div>
                  <div className="text-sm text-gray-600">Medicines Available</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
                  <div className="text-sm text-gray-600">Different Categories</div>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">89</div>
                  <div className="text-sm text-gray-600">Partner Locations</div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Most Requested Medicines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Paracetamol 500mg</div>
                      <div className="text-sm text-gray-600">Pain Relief</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Insulin Pens</div>
                      <div className="text-sm text-gray-600">Diabetes Care</div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Vitamin D3</div>
                      <div className="text-sm text-gray-600">Supplements</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ngo-partners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                NGO Partner Network
              </CardTitle>
              <CardDescription>Our trusted partners who distribute medicines to communities in need</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ngoPartners.map((partner, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4">
                        <Image
                          src={partner.logo || "/placeholder.svg"}
                          alt={`${partner.name} logo`}
                          width={80}
                          height={80}
                          className="rounded-full"
                        />
                      </div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <CardDescription>{partner.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Impact:</span>
                          <span className="text-sm font-medium">{partner.impact}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Focus:</span>
                          <span className="text-sm font-medium">{partner.focus}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-transparent" variant="outline">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pharmacy-network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Pharmacy Partnership Network
              </CardTitle>
              <CardDescription>Partnered pharmacies that support our medicine distribution network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pharmacyPartners.map((pharmacy, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4">
                        <Image
                          src={pharmacy.logo || "/placeholder.svg"}
                          alt={`${pharmacy.name} logo`}
                          width={60}
                          height={60}
                          className="rounded"
                        />
                      </div>
                      <CardTitle className="text-lg">{pharmacy.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{pharmacy.locations}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{pharmacy.services}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{pharmacy.specialty}</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-transparent" variant="outline">
                        Find Locations
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicine-journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Medicine Journey Tracker
              </CardTitle>
              <CardDescription>Follow the path of donated medicines from donor to recipient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="relative flex items-start space-x-4 pb-8">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Donation Received</h3>
                      <p className="text-gray-600">Medicine donated by generous individuals or organizations</p>
                      <div className="mt-2 text-sm text-gray-500">Average processing time: 24-48 hours</div>
                    </div>
                  </div>

                  <div className="relative flex items-start space-x-4 pb-8">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Quality Verification</h3>
                      <p className="text-gray-600">
                        AI-powered verification and manual inspection by certified pharmacists
                      </p>
                      <div className="mt-2 text-sm text-gray-500">Average processing time: 2-3 days</div>
                    </div>
                  </div>

                  <div className="relative flex items-start space-x-4 pb-8">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Inventory & Cataloging</h3>
                      <p className="text-gray-600">Medicines are cataloged and added to our distribution network</p>
                      <div className="mt-2 text-sm text-gray-500">Average processing time: 1-2 days</div>
                    </div>
                  </div>

                  <div className="relative flex items-start space-x-4 pb-8">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">NGO Matching</h3>
                      <p className="text-gray-600">Medicines matched with NGO requests based on need and location</p>
                      <div className="mt-2 text-sm text-gray-500">Average processing time: 1-3 days</div>
                    </div>
                  </div>

                  <div className="relative flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">5</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Distribution & Impact</h3>
                      <p className="text-gray-600">Medicines delivered to communities and patients in need</p>
                      <div className="mt-2 text-sm text-gray-500">Average delivery time: 3-7 days</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Track Your Donation Impact</h3>
                  <p className="text-gray-600 mb-4">
                    Enter your donation ID to see the real-time status and impact of your contributed medicines.
                  </p>
                  <div className="flex gap-2">
                    <Input placeholder="Enter donation ID (e.g., DON-2024-001234)" className="flex-1" />
                    <Button>Track</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
