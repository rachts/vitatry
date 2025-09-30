import { z } from "zod"

export const donationSchema = z.object({
  medicines: z.array(
    z.object({
      name: z.string().min(1, "Medicine name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      expiryDate: z.string().min(1, "Expiry date is required"),
      batchNumber: z.string().optional(),
      manufacturer: z.string().optional(),
    }),
  ),
  donorInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(6, "Valid pincode is required"),
  }),
  images: z.array(z.string()).min(1, "At least one image is required"),
  notes: z.string().optional(),
})

export const volunteerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  age: z.number().min(18, "Must be at least 18 years old"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  availability: z.array(z.string()).min(1, "Select at least one availability"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
  experience: z.string().optional(),
  motivation: z.string().min(10, "Please share your motivation"),
})

export const medicineVerificationSchema = z.object({
  imageUrl: z.string().url("Valid image URL is required"),
  medicineName: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
})

export const notificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["donation_status", "verification_complete", "system_alert", "achievement"]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  data: z.record(z.any()).optional(),
  expiresAt: z.date().optional(),
})
