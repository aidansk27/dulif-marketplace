import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export const uploadListingImages = async (
  images: File[],
  listingId: string,
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const uploadPromises = images.map(async (image, index) => {
    const imageRef = ref(storage, `listings/${listingId}/image_${index}_${Date.now()}.jpg`)
    
    try {
      const snapshot = await uploadBytes(imageRef, image)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      if (onProgress) {
        onProgress(((index + 1) / images.length) * 100)
      }
      
      return downloadURL
    } catch (error) {
      console.error(`Error uploading image ${index}:`, error)
      throw error
    }
  })

  return Promise.all(uploadPromises)
}

export const deleteListingImages = async (imageURLs: string[]): Promise<void> => {
  const deletePromises = imageURLs.map(async (url) => {
    try {
      // Extract the path from the URL
      const urlParts = url.split('/o/')
      if (urlParts.length < 2) return
      
      const pathPart = urlParts[1].split('?')[0]
      const decodedPath = decodeURIComponent(pathPart)
      
      const imageRef = ref(storage, decodedPath)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Error deleting image:', error)
      // Don't throw error - continue with other deletions
    }
  })

  await Promise.allSettled(deletePromises)
}

export const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}