"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X, Sparkles, Heart } from "lucide-react"
import { OCRService } from "@/lib/ai/ocr-service"
import { submitDonationToFirebase } from "@/lib/submitDonation"

export default function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    medicineName: "",
    brand: "",
    genericName: "",
    dosage: "",
    quantity: "",
    expiryDate: "",
    condition: "unopened",
    category: "tablet",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    donorAddress: "",
    notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (files.length > 0 && !formData.medicineName) {
      await processImageWithOCR(files[0])
    }
  }

  const processImageWithOCR = async (file: File) => {
    setIsProcessingOCR(true)

    try {
      const imageUrl = URL.createObjectURL(file)

      toast({
        title: "AI Processing Image",
        description: "Extracting medicine information...",
      })

      const [validation, expiryDate, medicineNames] = await Promise.all([
        OCRService.validateMedicineImage(imageUrl),
        OCRService.extractExpiryDate(imageUrl),
        OCRService.extractMedicineName(imageUrl),
      ])

      if (medicineNames.length > 0 && !formData.medicineName) {
        setFormData((prev) => ({ ...prev, medicineName: medicineNames[0] }))
      }

      if (expiryDate && !formData.expiryDate) {
        const formattedDate = expiryDate.toISOString().split("T")[0]
        setFormData((prev) => ({ ...prev, expiryDate: formattedDate }))
      }

      if (validation.isValid) {
        toast({
          title: "Medicine Verified",
          description: `AI confidence: ${Math.round(validation.confidence)}%`,
        })
      } else {
        toast({
          title: "Verification Issues",
          description: validation.issues.join(", "),
          variant: "destructive",
        })
      }

      URL.revokeObjectURL(imageUrl)
    } catch (error) {
      console.error("OCR error:", error)
      toast({
        title: "OCR Processing Failed",
        description: "Please enter medicine details manually",
        variant: "destructive",
      })
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (
        !formData.medicineName ||
        !formData.brand ||
        !formData.dosage ||
        !formData.quantity ||
        !formData.expiryDate ||
        !formData.condition ||
        !formData.category
      ) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required medicine fields",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!formData.donorName || !formData.donorEmail || !formData.donorPhone || !formData.donorAddress) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required donor information",
          variant: "destructive",
        })
        setIsSubmitting(false)
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
        setIsSubmitting(false)
        return
      }

      const result = await submitDonationToFirebase({
        donorName: formData.donorName,
        medicineName: formData.medicineName,
        brand: formData.brand,
        genericName: formData.genericName || undefined,
        dosage: formData.dosage,
        quantity: Number.parseInt(formData.quantity),
        expiryDate: formData.expiryDate,
        condition: formData.condition,
        category: formData.category,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        donorAddress: formData.donorAddress,
        notes: formData.notes || undefined,
        files: images,
      })

      if (result.success) {
        toast({
          title: "Donation Submitted!",
          description: result.message,
        })
        // Reset form
        setFormData({
          medicineName: "",
          brand: "",
          genericName: "",
          dosage: "",
          quantity: "",
          expiryDate: "",
          condition: "unopened",
          category: "tablet",
          donorName: "",
          donorEmail: "",
          donorPhone: "",
          donorAddress: "",
          notes: "",
        })
        setImages([])
      } else {
        throw new Error(result.message)
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
    <Card className="mx-auto max-w-2xl transition-smooth hover-lift">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-emerald-600" />
          <CardTitle className="text-2xl">Donate Medicines</CardTitle>
        </div>
        <CardDescription className="text-base">
          Upload photos and our AI will automatically extract medicine details. Help us reduce medical waste and make
          healthcare accessible!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <Sparkles className="h-5 w-5" />
              Medicine Photos (AI-Powered)
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Upload clear photos of your medicine packaging. Our AI will extract details automatically!
            </p>
            <div>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isProcessingOCR}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("images")?.click()}
                className="w-full border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                disabled={isProcessingOCR}
              >
                {isProcessingOCR ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select Images (Max 5)
                  </>
                )}
              </Button>
            </div>
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Medicine ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md border-2 border-emerald-200 dark:border-emerald-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medicine Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Medicine Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicineName">Medicine Name *</Label>
                <Input
                  id="medicineName"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleInputChange}
                  placeholder="e.g., Paracetamol"
                  className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Crocin"
                  className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 500mg"
                  className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Number of tablets/bottles"
                  className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 transition-smooth focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="syrup">Syrup</option>
                  <option value="injection">Injection</option>
                  <option value="cream">Cream/Ointment</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 transition-smooth focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="unopened">Unopened/Sealed</option>
                <option value="opened">Opened but unused</option>
                <option value="partial">Partially used</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information about the medicine"
                rows={3}
                className="transition-smooth focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your Information</h3>

            <div className="space-y-2">
              <Label htmlFor="donorName">Full Name *</Label>
              <Input
                id="donorName"
                name="donorName"
                value={formData.donorName}
                onChange={handleInputChange}
                placeholder="Your full name"
                className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donorEmail">Email *</Label>
                <Input
                  id="donorEmail"
                  name="donorEmail"
                  type="email"
                  value={formData.donorEmail}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="donorPhone">Phone *</Label>
                <Input
                  id="donorPhone"
                  name="donorPhone"
                  type="tel"
                  value={formData.donorPhone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donorAddress">Pickup Address *</Label>
              <Textarea
                id="donorAddress"
                name="donorAddress"
                value={formData.donorAddress}
                onChange={handleInputChange}
                placeholder="Complete address where we can collect the medicines"
                rows={3}
                className="transition-smooth focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-smooth"
            disabled={isSubmitting || images.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Submit Donation
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            By submitting, you agree to our terms of service and privacy policy.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
