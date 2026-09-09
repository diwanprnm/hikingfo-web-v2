/**
 * SVG→PNG export utility. Renders an SVG element to a canvas and exports as PNG blob.
 * T070: canvasExport.ts
 */

export interface ExportSize {
  label: string
  width: number
  height: number
}

export const EXPORT_SIZES: ExportSize[] = [
  { label: 'Instagram Feed', width: 1080, height: 1080 },
  { label: 'Instagram Story', width: 1080, height: 1920 },
  { label: 'Landscape', width: 1200, height: 630 },
]

/**
 * Renders an SVG element to PNG and triggers download.
 */
export async function exportSvgToPng(
  svgElement: SVGElement,
  width: number,
  height: number,
  filename: string = 'hikingfo-share.png',
): Promise<void> {
  // Wait for fonts
  await document.fonts.ready

  const svgData = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas context unavailable')); return }

      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Canvas toBlob failed')); return }
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = filename
        a.click()
        URL.revokeObjectURL(a.href)
        resolve()
      }, 'image/png')
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')) }
    img.src = url
  })
}

/**
 * Creates an SVG element string from a template's inner HTML.
 */
export function buildSvgString(innerHtml: string, width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${innerHtml}</svg>`
}
