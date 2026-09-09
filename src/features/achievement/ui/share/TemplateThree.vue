<script setup lang="ts">
/**
 * Share template three: Landscape card with side-by-side layout.
 * T071: TemplateThree.vue
 */
defineProps<{
  mountainName: string
  badgeName?: string
  distinctCount: number
  hikeDate?: string
}>()
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" class="w-full">
    <rect width="1200" height="630" fill="#0d1117" />
    <!-- Left side: mountain silhouette -->
    <path d="M0 300 L150 180 L300 250 L450 120 L600 220 L700 150 L700 630 L0 630Z" fill="#161b22" />
    <path d="M0 400 L200 300 L400 350 L600 250 L700 320 L700 630 L0 630Z" fill="#21262d" />
    <!-- Right side: content -->
    <text x="950" y="120" text-anchor="middle" fill="#58a6ff" font-size="28" font-weight="bold" font-family="system-ui">
      hikingfo
    </text>
    <text x="950" y="230" text-anchor="middle" fill="white" font-size="44" font-weight="bold" font-family="system-ui">
      {{ mountainName }}
    </text>
    <text v-if="badgeName" x="950" y="300" text-anchor="middle" fill="#f0883e" font-size="24" font-family="system-ui">
      🏅 {{ badgeName }}
    </text>
    <text x="950" y="480" text-anchor="middle" fill="white" font-size="48" font-weight="bold" font-family="system-ui">
      {{ distinctCount }}
    </text>
    <text x="950" y="520" text-anchor="middle" fill="white" font-size="18" opacity="0.6" font-family="system-ui">
      gunung ditaklukkan
    </text>
    <text v-if="hikeDate" x="950" y="580" text-anchor="middle" fill="white" font-size="16" opacity="0.4" font-family="system-ui">
      {{ hikeDate }}
    </text>
  </svg>
</template>
