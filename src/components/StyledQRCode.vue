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
import { onMounted, ref, watch, toRefs, nextTick } from 'vue'
import debounce from 'lodash.debounce'

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

const QRCodeCanvasContainer = new QRCodeStyling({
  ...props,
  image: props.image === null ? undefined : props.image
})
const qrCodeContainer = ref<HTMLElement>()

const updateQRCode = debounce(() => {
  QRCodeCanvasContainer.update({
    ...props,
    image: props.image === null ? undefined : props.image
  })
}, 150)

onMounted(async () => {
  QRCodeCanvasContainer.append(qrCodeContainer.value)
})

watch([
  data, width, height, type, image, margin, dotsOptions, backgroundOptions, imageOptions, cornersSquareOptions, cornersDotOptions, qrOptions
], updateQRCode, { deep: true })
</script>
