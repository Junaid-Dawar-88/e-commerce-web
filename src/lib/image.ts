// Client-side image helpers shared by the admin upload forms.

// Downscale an uploaded image and return a compact data URL we can store
// directly in the DB (no external storage needed). Caps the longest side and
// re-encodes as JPEG to keep the string small.
export function fileToDataUrl(file: File, maxSide = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load image'))
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas unsupported'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Does this string point at a real image we can render in an <img>?
export const isImageSrc = (s: string) =>
  /^(data:image\/|https?:\/\/|\/)/.test(s)
