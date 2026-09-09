<script setup lang="ts">
/**
 * Share template two: Minimal card with gradient accent.
 * T071: TemplateTwo.vue
 */
defineProps<{
  mountainName: string
  badgeName?: string
  distinctCount: number
  hikeDate?: string
}>()
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" class="w-full">
    <defs>
      <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#667eea" />
        <stop offset="100%" stop-color="#764ba2" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1920" fill="url(#grad2)" />
    <!-- Top bar -->
    <rect width="1080" height="120" fill="rgba(0,0,0,0.2)" />
    <text x="540" y="78" text-anchor="middle" fill="white" font-size="32" font-weight="bold" font-family="system-ui">
      hikingfo
    </text>
    <!-- Mountain name -->
    <text x="540" y="700" text-anchor="middle" fill="white" font-size="80" font-weight="bold" font-family="system-ui">
      {{ mountainName }}
    </text>
    <!-- Divider -->
    <rect x="440" y="740" width="200" height="4" rx="2" fill="white" opacity="0.5" />
    <!-- Badge -->
    <text v-if="badgeName" x="540" y="830" text-anchor="middle" fill="white" font-size="40" font-family="system-ui">
      🏅 {{ badgeName }}
    </text>
    <!-- Stats -->
    <text x="540" y="1500" text-anchor="middle" fill="white" font-size="64" font-weight="bold" font-family="system-ui">
      {{ distinctCount }}
    </text>
    <text x="540" y="1560" text-anchor="middle" fill="white" font-size="28" opacity="0.8" font-family="system-ui">
      gunung ditaklukkan
    </text>
    <text v-if="hikeDate" x="540" y="1650" text-anchor="middle" fill="white" font-size="24" opacity="0.6" font-family="system-ui">
      {{ hikeDate }}
    </text>
  </svg>
</template>
