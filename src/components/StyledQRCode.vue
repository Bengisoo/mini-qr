<template>
  <div class="flex items-center justify-center">
    <div ref="qrCodeContainer" class="flex items-center justify-center" />
  </div>
</template>

<script setup lang="ts">
import type {
  CornerDotType,
  CornerSquareType,
  DrawType,
  Options as StyledQRCodeProps
} from 'qr-code-styling'
import QRCodeStyling from 'qr-code-styling'
import { onMounted, ref, watch, toRefs } from 'vue'

const props = withDefaults(defineProps<StyledQRCodeProps>(), {
  data: undefined,
  width: 200,
  height: 200,
  type: 'svg' as DrawType,
  image: undefined,
  margin: 0,
  dotsOptions: () => ({
    color: 'black',
    type: 'rounded'
  }),

  // this is set to transparent by default so that we rely on the container's background
  backgroundOptions: () => ({
    color: 'transparent'
  }),
  imageOptions: () => ({
    margin: 0,
    crossOrigin: 'anonymous'
  }),
  cornersSquareOptions: () => ({
    color: 'black',
    type: 'extra-rounded' as CornerSquareType
  }),
  cornersDotOptions: () => ({
    color: 'black',
    type: 'dot' as CornerDotType
  }),
  qrOptions: () => ({
    errorCorrectionLevel: 'Q'
  })
})

const { data, width, height, type, image, margin, dotsOptions, backgroundOptions, imageOptions, cornersSquareOptions, cornersDotOptions, qrOptions } = toRefs(props)

const qrCodeContainer = ref<HTMLElement>()
let QRCodeCanvasContainer: QRCodeStyling | null = null

// Memoize QR code options to prevent unnecessary updates
const getQRCodeOptions = () => ({
  ...props,
  image: props.image === null ? undefined : props.image
})

onMounted(async () => {
  QRCodeCanvasContainer = new QRCodeStyling(getQRCodeOptions())
  if (qrCodeContainer.value) {
    qrCodeContainer.value.innerHTML = ''
    QRCodeCanvasContainer.append(qrCodeContainer.value)
  }
})

// Only watch for changes in specific props that affect QR code generation
watch(
  [data, width, height, type, image, margin, dotsOptions, backgroundOptions, imageOptions, cornersSquareOptions, cornersDotOptions, qrOptions],
  () => {
    if (QRCodeCanvasContainer) {
      const options = getQRCodeOptions()
      // Only update if options have actually changed
      if (JSON.stringify(options) !== JSON.stringify(QRCodeCanvasContainer._options)) {
        QRCodeCanvasContainer.update(options)
      }
    }
  },
  { deep: true }
)
</script>
