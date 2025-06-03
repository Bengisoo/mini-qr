import domtoimage, { type Options } from 'dom-to-image'
import { elementToSVG, inlineResources } from 'dom-to-svg'
import html2canvas from 'html2canvas'

const defaultOptions: Options = {
  width: 400,
  height: 400
}

const getFormattedOptions = (
  element: HTMLElement,
  options: Options,
  borderRadius?: string
): Options => {
  if (options.width && options.height) {
    const scale = getResizeScaleToFit(element, options.width, options.height)
    return {
      style: { scale, transformOrigin: 'left top', borderRadius: borderRadius ?? '48px' },
      quality: 100,
      ...options,
    }
  }

  return defaultOptions
}

const getResizeScaleToFit = (child: HTMLElement, width: number, height: number): number => {
  child.style.transformOrigin = 'center'

  const scaleX = width / child.offsetWidth
  const scaleY = height / child.offsetHeight

  const maxScale = Math.min(scaleX, scaleY)
  return maxScale
}

export const IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED =
  navigator.clipboard && navigator.clipboard.write != undefined

// Memoize canvas creation to avoid recreating it for each operation
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

const getCanvas = () => {
  if (!canvas) {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d')
  }
  return { canvas, ctx }
}

// Optimize image export functions
export async function copyImageToClipboard(
  element: HTMLElement,
  options: { width: number; height: number }
): Promise<void> {
  if (!IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED) {
    throw new Error('Copy to clipboard is not supported in this browser')
  }

  const { canvas, ctx } = getCanvas()
  if (!ctx) throw new Error('Could not get canvas context')

  // Set canvas size
  canvas.width = options.width
  canvas.height = options.height

  // Draw element to canvas
  const data = await html2canvas(element, {
    width: options.width,
    height: options.height,
    scale: 1,
    useCORS: true,
    allowTaint: true
  })

  ctx.drawImage(data, 0, 0)

  // Convert to blob and copy
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/png'))
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob
    })
  ])
}

export function downloadPngElement(
  element: HTMLElement,
  fileName: string,
  options: { width: number; height: number },
  borderRadius?: string
): void {
  const { canvas, ctx } = getCanvas()
  if (!ctx) throw new Error('Could not get canvas context')

  // Set canvas size
  canvas.width = options.width
  canvas.height = options.height

  // Draw element to canvas
  html2canvas(element, {
    width: options.width,
    height: options.height,
    scale: 1,
    useCORS: true,
    allowTaint: true
  }).then((data) => {
    ctx.drawImage(data, 0, 0)

    // Apply border radius if specified
    if (borderRadius) {
      ctx.globalCompositeOperation = 'destination-in'
      ctx.beginPath()
      ctx.roundRect(0, 0, options.width, options.height, parseInt(borderRadius))
      ctx.fill()
    }

    // Download
    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
  })
}

export async function getPngElement(element: HTMLElement, options: Options, borderRadius?: string) {
  const formattedOptions = getFormattedOptions(element, options, borderRadius)
  return domtoimage.toPng(element, formattedOptions)
}

export function downloadJpgElement(
  element: HTMLElement,
  filename: string,
  options: Options,
  borderRadius?: string
) {
  getJpgElement(element, options, borderRadius)
    .then((dataUrl: string) => {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename
      link.click()
    })
    .catch((error: Error) => {
      console.error('Error converting element to JPG:', error)
    })
}

export async function getJpgElement(element: HTMLElement, options: { width: number; height: number }, borderRadius?: string) {
  const { canvas, ctx } = getCanvas()
  if (!ctx) throw new Error('Could not get canvas context')

  // Set canvas size
  canvas.width = options.width
  canvas.height = options.height

  // Draw element to canvas
  const data = await html2canvas(element, {
    width: options.width,
    height: options.height,
    scale: 1,
    useCORS: true,
    allowTaint: true
  })

  ctx.drawImage(data, 0, 0)

  // Apply border radius if specified
  if (borderRadius) {
    ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath()
    ctx.roundRect(0, 0, options.width, options.height, parseInt(borderRadius))
    ctx.fill()
  }

  return canvas.toDataURL('image/jpeg', 0.9)
}

function applySvgOptions(svgDocument: Document, options: Options) {
  const svgElement = svgDocument.documentElement
  if (options.width) svgElement.setAttribute('width', options.width.toString())
  if (options.height) svgElement.setAttribute('height', options.height.toString())
  if (options.style) {
    for (const [key, value] of Object.entries(options.style)) {
      svgElement.style[key as any] = value as any
    }
  }
}

// Optimize SVG export
export function getSvgString(element: HTMLElement): string {
  const svg = element.querySelector('svg')
  if (!svg) throw new Error('No SVG element found')
  return svg.outerHTML
}

export function downloadSvgElement(element: HTMLElement, fileName: string): void {
  const svgString = getSvgString(element)
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
