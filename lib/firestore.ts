"use client"

// Types
export interface Donation {
  id?: string
  medicineName: string
  quantity: number
  expiryDate: string
  condition: string
  description?: string
  imageUrl?: string
  userId: string
  userEmail: string
  userName: string
  status: "pending" | "verified" | "distributed" | "rejected"
  createdAt: Date
}

export interface Volunteer {
  id?: string
  name: string
  email: string
  phone: string
  city: string
  availability: string
  skills?: string
  userId?: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

export interface Contact {
  id?: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: Date
}

export interface Product {
  id?: string
  name: string
  description: string
  price: number
  category: string
  inStock: number
  imageUrl: string
  rating: number
  reviews: number
  tags: string[]
  createdAt: Date
}

export interface Medicine {
  id?: string
  name: string
  brand: string
  quantity: number
  expiry: string
  imageUrl: string
  donatedAt: Date
  verified: boolean
  donorId: string
}

async function getDb() {
  const { getFirestoreDb } = await import("@/firebase/config")
  return await getFirestoreDb()
}

async function getStorageInstance() {
  const { getFirebaseStorage } = await import("@/firebase/config")
  return await getFirebaseStorage()
}

// Upload file to Firebase Storage
export async function uploadFile(file: File, path: string): Promise<string> {
  const storage = await getStorageInstance()
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

// Donations
export async function submitDonation(data: Omit<Donation, "id" | "createdAt">, file?: File): Promise<string> {
  const db = await getDb()
  const { collection, addDoc, Timestamp } = await import("firebase/firestore")
  let imageUrl = data.imageUrl

  if (file) {
    imageUrl = await uploadFile(file, "donations")
  }

  const docRef = await addDoc(collection(db, "donations"), {
    ...data,
    imageUrl,
    createdAt: Timestamp.now(),
  })

  return docRef.id
}

export async function getUserDonations(userId: string): Promise<Donation[]> {
  const db = await getDb()
  const { collection, getDocs, query, where, orderBy } = await import("firebase/firestore")
  const q = query(collection(db, "donations"), where("userId", "==", userId), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Donation[]
}

export async function getActiveDonations(limitCount = 50): Promise<Donation[]> {
  const db = await getDb()
  const { collection, getDocs, query, where, orderBy, limit } = await import("firebase/firestore")
  const q = query(
    collection(db, "donations"),
    where("status", "in", ["pending", "verified"]),
    orderBy("createdAt", "desc"),
    limit(limitCount),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Donation[]
}

export async function getAllDonations(): Promise<Donation[]> {
  const db = await getDb()
  const { collection, getDocs, query, orderBy } = await import("firebase/firestore")
  const q = query(collection(db, "donations"), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Donation[]
}

export async function updateDonationStatus(id: string, status: Donation["status"]): Promise<void> {
  const db = await getDb()
  const { doc, updateDoc } = await import("firebase/firestore")
  await updateDoc(doc(db, "donations", id), { status })
}

// Volunteers
export async function submitVolunteer(data: Omit<Volunteer, "id" | "createdAt" | "status">): Promise<string> {
  const db = await getDb()
  const { collection, addDoc, Timestamp } = await import("firebase/firestore")
  const docRef = await addDoc(collection(db, "volunteers"), {
    ...data,
    status: "pending",
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getVolunteers(): Promise<Volunteer[]> {
  const db = await getDb()
  const { collection, getDocs, query, orderBy } = await import("firebase/firestore")
  const q = query(collection(db, "volunteers"), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Volunteer[]
}

// Contacts
export async function submitContact(data: Omit<Contact, "id" | "createdAt">): Promise<string> {
  const db = await getDb()
  const { collection, addDoc, Timestamp } = await import("firebase/firestore")
  const docRef = await addDoc(collection(db, "contact"), {
    ...data,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

// Products
export async function getProducts(): Promise<Product[]> {
  const db = await getDb()
  const { collection, getDocs, query, orderBy } = await import("firebase/firestore")
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Product[]
}

export async function addProduct(data: Omit<Product, "id" | "createdAt">, file?: File): Promise<string> {
  const db = await getDb()
  const { collection, addDoc, Timestamp } = await import("firebase/firestore")
  let imageUrl = data.imageUrl

  if (file) {
    imageUrl = await uploadFile(file, "products")
  }

  const docRef = await addDoc(collection(db, "products"), {
    ...data,
    imageUrl,
    createdAt: Timestamp.now(),
  })

  return docRef.id
}

// Medicines
export async function getMedicines(): Promise<Medicine[]> {
  const db = await getDb()
  const { collection, getDocs, query, orderBy } = await import("firebase/firestore")
  const q = query(collection(db, "medicines"), orderBy("donatedAt", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    donatedAt: doc.data().donatedAt?.toDate(),
  })) as Medicine[]
}

export async function addMedicine(data: Omit<Medicine, "id" | "donatedAt">, file?: File): Promise<string> {
  const db = await getDb()
  const { collection, addDoc, Timestamp } = await import("firebase/firestore")
  let imageUrl = data.imageUrl

  if (file) {
    imageUrl = await uploadFile(file, "medicines")
  }

  const docRef = await addDoc(collection(db, "medicines"), {
    ...data,
    imageUrl,
    donatedAt: Timestamp.now(),
  })

  return docRef.id
}

// Stats
export async function getStats(): Promise<{
  totalDonations: number
  medicinesVerified: number
  livesHelped: number
  activeVolunteers: number
}> {
  const db = await getDb()
  const { collection, getDocs, query, where } = await import("firebase/firestore")
  const donationsSnap = await getDocs(collection(db, "donations"))
  const volunteersSnap = await getDocs(query(collection(db, "volunteers"), where("status", "==", "approved")))

  const donations = donationsSnap.docs
  const verifiedCount = donations.filter(
    (d) => d.data().status === "verified" || d.data().status === "distributed",
  ).length
  const distributedCount = donations.filter((d) => d.data().status === "distributed").length

  return {
    totalDonations: donations.length,
    medicinesVerified: verifiedCount,
    livesHelped: distributedCount * 3,
    activeVolunteers: volunteersSnap.size,
  }
}
