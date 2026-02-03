"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductGrid from "@/components/shop/product-grid"
import { Search, Filter, Users, Building2, Truck, Package } from "lucide-react"
import Link from "next/link"

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
    name: "Partner NGOs Coming Soon",
    logo: "/ngo.jpg",
    description: "We are onboarding verified NGO partners",
    impact: "Join us",
    focus: "Healthcare access",
  },
]

const pharmacyPartners = [
  {
    name: "Pharmacy Partners Coming Soon",
    logo: "/pharmacy-interior.png",
    locations: "Coming soon",
    services: "Medicine distribution",
    specialty: "Community healthcare",
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
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">VitaMend Medicine Shop</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
          Access affordable medicines while supporting our donation network. Every purchase helps fund our mission.
        </p>
      </div>

      <Tabs defaultValue="shop" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
          <TabsTrigger value="shop" className="transition-smooth text-xs sm:text-sm">
            Shop
          </TabsTrigger>
          <TabsTrigger value="availability" className="transition-smooth text-xs sm:text-sm">
            Availability
          </TabsTrigger>
          <TabsTrigger value="ngo-partners" className="transition-smooth text-xs sm:text-sm">
            NGO Partners
          </TabsTrigger>
          <TabsTrigger value="pharmacy-network" className="transition-smooth text-xs sm:text-sm">
            Pharmacies
          </TabsTrigger>
          <TabsTrigger
            value="medicine-journey"
            className="transition-smooth text-xs sm:text-sm col-span-2 sm:col-span-1"
          >
            Journey
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop" className="space-y-6 animate-fade-in-up">
          <Card className="transition-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 transition-smooth"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="transition-smooth">
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
                  <SelectTrigger className="transition-smooth">
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
                  className="transition-smooth hover-scale"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <ProductGrid searchQuery={searchQuery} selectedCategory={selectedCategory} priceRange={selectedPriceRange} />
        </TabsContent>

        <TabsContent value="availability" className="space-y-6 animate-fade-in-up">
          <Card className="transition-smooth">
            <CardHeader>
              <CardTitle>Medicine Availability Dashboard</CardTitle>
              <CardDescription>Real-time inventory of available medicines in our network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg transition-smooth hover-lift">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">0</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Medicines Available</div>
                </div>
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-smooth hover-lift">
                  <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Different Categories</div>
                </div>
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg transition-smooth hover-lift">
                  <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Partner Locations</div>
                </div>
              </div>

              <div className="mt-8 text-center py-12">
                <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  No Medicines Listed Yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Be the first to donate medicines and help build our inventory.
                </p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700 transition-smooth hover-lift">
                  <Link href="/donate">Donate Now</Link>
                </Button>
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
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  NGO Partners Coming Soon
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  We are actively onboarding verified NGO partners to ensure medicines reach those in need.
                </p>
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
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Pharmacy Partners Coming Soon
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  We are building partnerships with pharmacies to expand our distribution network.
                </p>
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
                {[
                  {
                    num: 1,
                    color: "blue",
                    title: "Donation Received",
                    desc: "Medicine donated by generous individuals or organizations",
                    time: "24-48 hours",
                  },
                  {
                    num: 2,
                    color: "green",
                    title: "Quality Verification",
                    desc: "AI-powered verification and manual inspection by certified pharmacists",
                    time: "2-3 days",
                  },
                  {
                    num: 3,
                    color: "yellow",
                    title: "Inventory & Cataloging",
                    desc: "Medicines are cataloged and added to our distribution network",
                    time: "1-2 days",
                  },
                  {
                    num: 4,
                    color: "purple",
                    title: "NGO Matching",
                    desc: "Medicines matched with NGO requests based on need and location",
                    time: "1-3 days",
                  },
                  {
                    num: 5,
                    color: "red",
                    title: "Distribution & Impact",
                    desc: "Medicines delivered to communities and patients in need",
                    time: "3-7 days",
                  },
                ].map((step, idx, arr) => (
                  <div
                    key={step.num}
                    className={`relative flex items-start space-x-4 ${idx < arr.length - 1 ? "pb-8" : ""}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 bg-${step.color}-500 rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white text-sm font-bold">{step.num}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-gray-600 dark:text-slate-400">{step.desc}</p>
                      <div className="mt-2 text-sm text-gray-500 dark:text-slate-500">
                        Average processing time: {step.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Track Your Donation Impact</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  Enter your donation ID to see the real-time status and impact of your contributed medicines.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Enter donation ID (e.g., DON-2024-001234)" className="flex-1" />
                  <Button>Track</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
