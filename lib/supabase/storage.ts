import { createClient } from "./client"

const BUCKET_NAME = "medicine-images"

export async function uploadImage(file: File, folder = "donations"): Promise<string | null> {
  const supabase = createClient()

  const fileExt = file.name.split(".").pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Error uploading image:", error)
    return null
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

  return urlData.publicUrl
}

export async function uploadMultipleImages(files: File[], folder = "donations"): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder))
  const results = await Promise.all(uploadPromises)
  return results.filter((url): url is string => url !== null)
}

export async function deleteImage(imageUrl: string): Promise<boolean> {
  const supabase = createClient()

  // Extract the path from the URL
  const urlParts = imageUrl.split(`${BUCKET_NAME}/`)
  if (urlParts.length < 2) return false

  const path = urlParts[1]

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    console.error("Error deleting image:", error)
    return false
  }

  return true
}
