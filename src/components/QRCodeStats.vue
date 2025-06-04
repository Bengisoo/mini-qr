<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { qrLogger } from '@/utils/qrLogger'

const { t } = useI18n()
const stats = ref({
  totalScans: 0,
  totalCreations: 0,
  successRate: 0,
  failureRate: 0
})

const updateStats = () => {
  stats.value = qrLogger.getStats()
}

onMounted(() => {
  qrLogger.loadLogs()
  updateStats()
  // Update stats every minute
  setInterval(updateStats, 60000)
})
</script>

<template>
  <div class="qr-stats rounded-lg bg-white p-4 shadow-md dark:bg-zinc-800">
    <h2 class="mb-4 text-xl font-semibold">{{ t('QR Code Statistics') }}</h2>
    <div class="grid grid-cols-2 gap-4">
      <div class="stat-item">
        <h3 class="text-sm text-gray-600 dark:text-gray-400">{{ t('Total Scans') }}</h3>
        <p class="text-2xl font-bold">{{ stats.totalScans }}</p>
      </div>
      <div class="stat-item">
        <h3 class="text-sm text-gray-600 dark:text-gray-400">{{ t('Total Creations') }}</h3>
        <p class="text-2xl font-bold">{{ stats.totalCreations }}</p>
      </div>
      <div class="stat-item">
        <h3 class="text-sm text-gray-600 dark:text-gray-400">{{ t('Success Rate') }}</h3>
        <p class="text-2xl font-bold">{{ stats.successRate.toFixed(1) }}%</p>
      </div>
      <div class="stat-item">
        <h3 class="text-sm text-gray-600 dark:text-gray-400">{{ t('Failure Rate') }}</h3>
        <p class="text-2xl font-bold">{{ stats.failureRate.toFixed(1) }}%</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dark .stat-item {
  border-color: #374151;
}
</style>
