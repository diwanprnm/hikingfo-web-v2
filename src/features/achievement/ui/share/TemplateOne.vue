<script setup lang="ts">
/**
 * Share template one: Bold hero card with mountain name + badge.
 * T071: TemplateOne.vue
 */
defineProps<{
  mountainName: string
  badgeName?: string
  distinctCount: number
  hikeDate?: string
  bgColor?: string
}>()
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" class="w-full">
    <rect width="1080" height="1080" :fill="bgColor || '#1a1a2e'" />
    <!-- Mountain silhouette -->
    <path d="M0 700 L200 450 L400 600 L540 350 L680 550 L880 400 L1080 600 L1080 1080 L0 1080Z" fill="#16213e" opacity="0.6" />
    <path d="M0 800 L300 600 L540 500 L780 650 L1080 550 L1080 1080 L0 1080Z" fill="#0f3460" opacity="0.4" />
    <!-- Content -->
    <text x="540" y="200" text-anchor="middle" fill="#e94560" font-size="48" font-weight="bold" font-family="system-ui">
      hikingfo
    </text>
    <text x="540" y="400" text-anchor="middle" fill="white" font-size="72" font-weight="bold" font-family="system-ui">
      {{ mountainName }}
    </text>
    <text v-if="badgeName" x="540" y="500" text-anchor="middle" fill="#e94560" font-size="36" font-family="system-ui">
      🏅 {{ badgeName }}
    </text>
    <text x="540" y="900" text-anchor="middle" fill="white" font-size="28" opacity="0.7" font-family="system-ui">
      {{ distinctCount }} gunung ditaklukkan
    </text>
    <text v-if="hikeDate" x="540" y="960" text-anchor="middle" fill="white" font-size="24" opacity="0.5" font-family="system-ui">
      {{ hikeDate }}
    </text>
  </svg>
</template>
