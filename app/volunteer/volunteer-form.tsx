"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const volunteerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  occupation: z.string().min(1, "Occupation is required"),
  experience: z.enum(["none", "some", "extensive"]),
  availability: z.array(z.string()).min(1, "Please select at least one availability option"),
  role: z.enum(["delivery", "sorting", "verification", "coordination", "fundraising"]),
  motivation: z.string().min(10, "Please provide your motivation (at least 10 characters)"),
  emergencyContact: z.string().min(1, "Emergency contact is required"),
  emergencyPhone: z.string().min(10, "Valid emergency phone is required"),
  hasTransport: z.boolean(),
  canLift: z.boolean(),
  medicalConditions: z.string().optional(),
  references: z.string().optional(),
})

type VolunteerFormData = z.infer<typeof volunteerSchema>

const availabilityOptions = [
  { id: "weekday-morning", label: "Weekday Mornings" },
  { id: "weekday-afternoon", label: "Weekday Afternoons" },
  { id: "weekday-evening", label: "Weekday Evenings" },
  { id: "weekend-morning", label: "Weekend Mornings" },
  { id: "weekend-afternoon", label: "Weekend Afternoons" },
  { id: "weekend-evening", label: "Weekend Evenings" },
]

export default function VolunteerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      availability: [],
      hasTransport: false,
      canLift: false,
    },
  })

  const handleAvailabilityChange = (optionId: string, checked: boolean) => {
    let newAvailability: string[]
    if (checked) {
      newAvailability = [...selectedAvailability, optionId]
    } else {
      newAvailability = selectedAvailability.filter((id) => id !== optionId)
    }
    setSelectedAvailability(newAvailability)
    setValue("availability", newAvailability)
  }

  const onSubmit = async (data: VolunteerFormData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/volunteer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      const result = await response.json()

      toast.success("Application submitted successfully!", {
        description: "Thank you for volunteering. We will contact you soon with next steps.",
      })

      reset()
      setSelectedAvailability([])
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Failed to submit application", {
        description: "Please try again later or contact support.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Volunteer Application</CardTitle>
        <CardDescription>
          Join our mission to help distribute medicines to those in need. Fill out this form to become a volunteer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" {...register("fullName")} placeholder="Your full name" />
                {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} placeholder="your.email@example.com" />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" {...register("phone")} placeholder="+1 (555) 123-4567" />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea id="address" {...register("address")} placeholder="Your full address" rows={3} />
              {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <Label htmlFor="occupation">Occupation *</Label>
              <Input id="occupation" {...register("occupation")} placeholder="Your current occupation" />
              {errors.occupation && <p className="text-sm text-red-600 mt-1">{errors.occupation.message}</p>}
            </div>
          </div>

          {/* Volunteer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Volunteer Information</h3>

            <div>
              <Label>Previous Volunteer Experience *</Label>
              <RadioGroup onValueChange={(value) => setValue("experience", value as any)} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="exp-none" />
                  <Label htmlFor="exp-none">No previous experience</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="some" id="exp-some" />
                  <Label htmlFor="exp-some">Some volunteer experience</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="extensive" id="exp-extensive" />
                  <Label htmlFor="exp-extensive">Extensive volunteer experience</Label>
                </div>
              </RadioGroup>
              {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience.message}</p>}
            </div>

            <div>
              <Label>Preferred Role *</Label>
              <Select onValueChange={(value) => setValue("role", value as any)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select your preferred role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Medicine Delivery</SelectItem>
                  <SelectItem value="sorting">Medicine Sorting & Packaging</SelectItem>
                  <SelectItem value="verification">Medicine Verification</SelectItem>
                  <SelectItem value="coordination">Event Coordination</SelectItem>
                  <SelectItem value="fundraising">Fundraising & Outreach</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>}
            </div>

            <div>
              <Label>Availability *</Label>
              <div className="mt-2 space-y-2">
                {availabilityOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={selectedAvailability.includes(option.id)}
                      onCheckedChange={(checked) => handleAvailabilityChange(option.id, checked as boolean)}
                    />
                    <Label htmlFor={option.id}>{option.label}</Label>
                  </div>
                ))}
              </div>
              {errors.availability && <p className="text-sm text-red-600 mt-1">{errors.availability.message}</p>}
            </div>

            <div>
              <Label htmlFor="motivation">Why do you want to volunteer? *</Label>
              <Textarea
                id="motivation"
                {...register("motivation")}
                placeholder="Tell us about your motivation to volunteer with us"
                rows={4}
              />
              {errors.motivation && <p className="text-sm text-red-600 mt-1">{errors.motivation.message}</p>}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emergency Contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                <Input
                  id="emergencyContact"
                  {...register("emergencyContact")}
                  placeholder="Full name of emergency contact"
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-red-600 mt-1">{errors.emergencyContact.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                <Input id="emergencyPhone" {...register("emergencyPhone")} placeholder="+1 (555) 123-4567" />
                {errors.emergencyPhone && <p className="text-sm text-red-600 mt-1">{errors.emergencyPhone.message}</p>}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasTransport"
                  {...register("hasTransport")}
                  onCheckedChange={(checked) => setValue("hasTransport", checked as boolean)}
                />
                <Label htmlFor="hasTransport">I have reliable transportation</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canLift"
                  {...register("canLift")}
                  onCheckedChange={(checked) => setValue("canLift", checked as boolean)}
                />
                <Label htmlFor="canLift">I can lift packages up to 25 lbs</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
              <Textarea
                id="medicalConditions"
                {...register("medicalConditions")}
                placeholder="Any medical conditions we should be aware of"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="references">References (Optional)</Label>
              <Textarea
                id="references"
                {...register("references")}
                placeholder="Names and contact information of references"
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Application...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
