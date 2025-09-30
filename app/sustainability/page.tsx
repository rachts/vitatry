"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Leaf, Droplets, Zap, TreePine, Trophy, Medal, Award } from "lucide-react"

interface SustainabilityData {
  userImpact: {
    co2Saved: number
    wasteReduced: number
    waterSaved: number
    energySaved: number
    treesEquivalent: number
    carbonFootprintReduction: number
  }
  globalImpact: {
    co2Saved: number
    wasteReduced: number
    waterSaved: number
    energySaved: number
    treesEquivalent: number
    carbonFootprintReduction: number
  }
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    unlockedAt: string
    category: string
  }>
  leaderboard: Array<{
    user: { id: string; name: string }
    impact: {
      co2Saved: number
      wasteReduced: number
    }
    rank: number
  }>
}

export default function SustainabilityPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<SustainabilityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchSustainabilityData()
    }
  }, [session])

  const fetchSustainabilityData = async () => {
    try {
      const response = await fetch("/api/sustainability")
      const sustainabilityData = await response.json()
      setData(sustainabilityData)
    } catch (error) {
      console.error("Failed to fetch sustainability data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen">Failed to load data</div>
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "environmental":
        return "🌱"
      case "social":
        return "🤝"
      case "milestone":
        return "🏆"
      default:
        return "⭐"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-[#f8faff]">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-[#1a472a] mb-8">Sustainability Impact</h1>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">My Impact</TabsTrigger>
            <TabsTrigger value="global">Global Impact</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                  <Leaf className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{data.userImpact.co2Saved.toFixed(1)} kg</div>
                  <p className="text-xs text-muted-foreground">
                    {data.userImpact.carbonFootprintReduction.toFixed(1)}% of annual footprint
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Water Saved</CardTitle>
                  <Droplets className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{data.userImpact.waterSaved.toFixed(1)} L</div>
                  <p className="text-xs text-muted-foreground">
                    Equivalent to {Math.ceil(data.userImpact.waterSaved / 8)} glasses
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Energy Saved</CardTitle>
                  <Zap className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{data.userImpact.energySaved.toFixed(1)} kWh</div>
                  <p className="text-xs text-muted-foreground">
                    Powers a home for {Math.ceil(data.userImpact.energySaved / 30)} days
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trees Equivalent</CardTitle>
                  <TreePine className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{data.userImpact.treesEquivalent}</div>
                  <p className="text-xs text-muted-foreground">Trees worth of CO₂ absorption</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Waste Reduced</CardTitle>
                  <Leaf className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{data.userImpact.wasteReduced.toFixed(2)} kg</div>
                  <p className="text-xs text-muted-foreground">Medical waste prevented</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1a472a]">Your Environmental Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CO₂ Reduction Goal</span>
                    <span>{data.userImpact.co2Saved.toFixed(1)} / 50 kg</span>
                  </div>
                  <Progress value={(data.userImpact.co2Saved / 50) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tree Planting Equivalent</span>
                    <span>{data.userImpact.treesEquivalent} / 5 trees</span>
                  </div>
                  <Progress value={(data.userImpact.treesEquivalent / 5) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="global" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-lg text-green-600">Global CO₂ Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{data.globalImpact.co2Saved.toFixed(0)} kg</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Equivalent to {Math.ceil(data.globalImpact.co2Saved / 2300)} cars off the road for a year
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-600">Global Water Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {(data.globalImpact.waterSaved / 1000).toFixed(1)}k L
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enough for {Math.ceil(data.globalImpact.waterSaved / 2000)} people for a day
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader>
                  <CardTitle className="text-lg text-emerald-600">Forest Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">{data.globalImpact.treesEquivalent}</div>
                  <p className="text-sm text-muted-foreground mt-2">Trees worth of CO₂ absorption globally</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1a472a]">Community Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">Waste Prevention</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Medical waste reduced:</span>
                        <span className="font-medium">{data.globalImpact.wasteReduced.toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Landfill diversion:</span>
                        <span className="font-medium">100%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Resource Conservation</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Energy saved:</span>
                        <span className="font-medium">{data.globalImpact.energySaved.toFixed(0)} kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Manufacturing avoided:</span>
                        <span className="font-medium">
                          {Math.ceil(data.globalImpact.energySaved / 100)} medicine batches
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.achievements.map((achievement) => (
                <Card key={achievement.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{achievement.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {data.achievements.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      No achievements yet. Start donating medicines to unlock your first achievement!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#1a472a]">Available Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Environmental Badges</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>🌱 Eco Warrior - Save 10kg CO₂</div>
                      <div>🌳 Tree Saver - Plant equivalent of 1 tree</div>
                      <div>💧 Water Guardian - Save 100L water</div>
                      <div>⚡ Energy Saver - Save 50 kWh</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Milestone Badges</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>💊 Generous Donor - 5 donations</div>
                      <div>⭐ Super Donor - 20 donations</div>
                      <div>🏆 Champion - 50 donations</div>
                      <div>👑 Legend - 100 donations</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#1a472a]">Environmental Impact Leaderboard</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Top contributors to our sustainability mission (only users who opted in are shown)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.leaderboard.map((entry) => (
                    <div key={entry.user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8">{getRankIcon(entry.rank)}</div>
                        <div>
                          <p className="font-medium">{entry.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.impact.co2Saved.toFixed(1)} kg CO₂ saved • {entry.impact.wasteReduced.toFixed(2)} kg
                            waste reduced
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {Math.ceil(entry.impact.co2Saved / 22)} 🌳
                        </div>
                        <div className="text-xs text-muted-foreground">tree equivalent</div>
                      </div>
                    </div>
                  ))}
                  {data.leaderboard.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No leaderboard data available yet. Be the first to make an impact!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
