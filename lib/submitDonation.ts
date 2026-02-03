import { db, storage } from "@/firebase/firebaseConfig"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

interface DonationFormData {
  donorName: string
  medicineName: string
  brand: string
  genericName?: string
  dosage: string
  quantity: number
  expiryDate: string
  condition: string
  category: string
  donorEmail: string
  donorPhone: string
  donorAddress: string
  notes?: string
  files: File[]
}

interface SubmitResult {
  success: boolean
  message: string
  donationId?: string
}

export async function submitDonationToFirebase(formData: DonationFormData): Promise<SubmitResult> {
  try {
    const {
      donorName,
      medicineName,
      brand,
      genericName,
      dosage,
      quantity,
      expiryDate,
      condition,
      category,
      donorEmail,
      donorPhone,
      donorAddress,
      notes,
      files,
    } = formData

    // Upload all files to Firebase Storage
    const imageUrls: string[] = []

    for (const file of files) {
      if (file && file.size > 0) {
        const storageRef = ref(storage, `donations/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(storageRef)
        imageUrls.push(downloadURL)
      }
    }

    // Generate unique donation ID
    const donationId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Save form data + file URLs in Firestore
    const docRef = await addDoc(collection(db, "donations"), {
      donationId,
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      medicineName,
      brand,
      genericName: genericName || null,
      dosage,
      quantity,
      expiryDate,
      condition,
      category,
      notes: notes || null,
      images: imageUrls,
      status: "pending",
      isReserved: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return {
      success: true,
      message: "Donation submitted successfully! Our team will verify it shortly.",
      donationId: docRef.id,
    }
  } catch (error: any) {
    console.error("Error submitting donation to Firebase:", error)
    return {
      success: false,
      message: error.message || "Failed to submit donation. Please try again.",
    }
  }
}
