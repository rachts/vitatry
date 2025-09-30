"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"

export default function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    medicineName: "",
    brand: "",
    expiryDate: "",
    quantity: "",
    conditionNotes: "",
    pickupAddress: "",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive",
      })
      return
    }
    setImages((prev) => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!formData.medicineName || !formData.expiryDate || !formData.quantity || !formData.pickupAddress) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Validate expiry date
      const expiryDate = new Date(formData.expiryDate)
      const sixMonthsFromNow = new Date()
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
      if (expiryDate < sixMonthsFromNow) {
        toast({
          title: "Invalid Expiry Date",
          description: "Medicine must have at least 6 months before expiry",
          variant: "destructive",
        })
        return
      }

      // Submit JSON (images are optional and not uploaded here to avoid extra deps)
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Donation Submitted!",
          description: "Thank you for your donation. We'll review it and contact you soon.",
        })
        setFormData({
          medicineName: "",
          brand: "",
          expiryDate: "",
          quantity: "",
          conditionNotes: "",
          pickupAddress: "",
          donorName: "",
          donorEmail: "",
          donorPhone: "",
        })
        setImages([])
      } else {
        throw new Error(result.message || "Failed to submit donation")
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Donate Medicines</CardTitle>
        <CardDescription>Help us reduce medical waste by donating your unused, unexpired medicines.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medicine Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medicine Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medicineName">Medicine Name *</Label>
                <Input
                  id="medicineName"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleInputChange}
                  placeholder="e.g., Paracetamol"
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand (Optional)</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Crocin"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Number of tablets/bottles"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="conditionNotes">Condition Notes</Label>
              <Textarea
                id="conditionNotes"
                name="conditionNotes"
                value={formData.conditionNotes}
                onChange={handleInputChange}
                placeholder="Describe the condition (e.g., unopened, stored properly)"
                rows={3}
              />
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Information</h3>

            <div>
              <Label htmlFor="donorName">Full Name</Label>
              <Input
                id="donorName"
                name="donorName"
                value={formData.donorName}
                onChange={handleInputChange}
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donorEmail">Email</Label>
                <Input
                  id="donorEmail"
                  name="donorEmail"
                  type="email"
                  value={formData.donorEmail}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="donorPhone">Phone</Label>
                <Input
                  id="donorPhone"
                  name="donorPhone"
                  type="tel"
                  value={formData.donorPhone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pickupAddress">Pickup Address *</Label>
              <Textarea
                id="pickupAddress"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleInputChange}
                placeholder="Complete address where we can collect the medicines"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Image Upload (client-only, not sent) */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Medicine Photos (Optional)</h3>
            <div>
              <Label htmlFor="images">Upload Photos</Label>
              <div className="mt-2">
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("images")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Images (Max 5)
                </Button>
              </div>
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={
                          URL.createObjectURL(image) || "/placeholder.svg?height=96&width=160&query=medicine-preview"
                        }
                        alt={`Medicine ${index + 1}`}
                        className="h-24 w-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Donation"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
