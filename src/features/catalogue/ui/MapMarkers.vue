<script setup lang="ts">
/**
 * T039: Leaflet map with the peak + basecamp markers for one mountain.
 * Peak marker uses the mountain coordinate; basecamp markers show when they
 * carry coordinates. Tiles come from OpenStreetMap (public, no key needed).
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Basecamp, MountainSummary } from '../domain/types'

const props = defineProps<{
  mountain: MountainSummary
  basecamps: Basecamp[]
}>()

const el = ref<HTMLElement | null>(null)
let map: L.Map | null = null

function markerIcon(kind: 'peak' | 'basecamp'): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<span style="display:inline-block;width:14px;height:14px;border-radius:9999px;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);background:${kind === 'peak' ? '#e11d48' : '#0ea5e9'}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function render() {
  if (!el.value || map) return
  map = L.Map ? L.map(el.value, { scrollWheelZoom: false }) : null
  if (!map) return
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 17,
  }).addTo(map)

  const points: [number, number][] = []
  L.marker([props.mountain.latitude, props.mountain.longitude], { icon: markerIcon('peak') })
    .addTo(map)
    .bindTooltip(`${props.mountain.name.id} — puncak`)
  points.push([props.mountain.latitude, props.mountain.longitude])

  for (const b of props.basecamps) {
    if (b.latitude == null || b.longitude == null) continue
    L.marker([b.latitude, b.longitude], { icon: markerIcon('basecamp') })
      .addTo(map)
      .bindTooltip(b.name.id)
    points.push([b.latitude, b.longitude])
  }
  if (points.length > 1) {
    map.fitBounds(L.latLngBounds(points).pad(0.25))
  } else {
    map.setView(points[0] ?? [-2.5, 118], 12)
  }
}

onMounted(render)
onUnmounted(() => { map?.remove(); map = null })
watch(() => props.mountain.id, () => { map?.remove(); map = null; render() })
</script>

<template>
  <div ref="el" class="h-64 w-full rounded-[var(--radius-card,12px)] border border-ink-900/10" role="img" aria-label="Peta gunung" />
</template>
