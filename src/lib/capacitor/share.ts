/** Safe basename for downloaded / shared files (no path separators). */
function safeFileBasename(title: string): string {
  const t = title.trim().slice(0, 80) || 'image'
  const s = t.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_')
  return s || 'image'
}

function tryDataURLToBlob(dataURL: string): Blob | null {
  try {
    const arr = dataURL.split(',')
    if (arr.length < 2) return null
    const mimeMatch = arr[0].match(/:(.*?);/)
    if (!mimeMatch) return null
    const mime = mimeMatch[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n)
    return new Blob([u8arr], { type: mime })
  } catch {
    return null
  }
}

export async function shareImage(dataURL: string, title: string): Promise<void> {
  const base = safeFileBasename(title)

  if (navigator.share && navigator.canShare) {
    const blob = tryDataURLToBlob(dataURL)
    if (!blob) throw new Error('Invalid image data')
    const file = new File([blob], `${base}.png`, { type: 'image/png' })
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: base,
        files: [file],
      })
      return
    }
  }

  try {
    const blob = tryDataURLToBlob(dataURL)
    if (!blob) throw new Error('Invalid image data')
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
    return
  } catch {
    const a = document.createElement('a')
    a.href = dataURL
    a.download = `${base}.png`
    a.rel = 'noopener'
    a.click()
  }
}

export async function saveToDevice(dataURL: string, filename: string): Promise<void> {
  const base = safeFileBasename(filename)
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    const base64Data = dataURL.split(',')[1]
    if (!base64Data) throw new Error('Invalid data URL')
    await Filesystem.writeFile({
      path: `${base}.png`,
      data: base64Data,
      directory: Directory.Documents,
    })
    return
  } catch {
    /* Not in Capacitor environment */
  }

  const a = document.createElement('a')
  a.href = dataURL
  a.download = `${base}.png`
  a.rel = 'noopener'
  a.click()
}
