<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="mx-auto grid min-h-[50vh] max-w-xl place-items-center px-4 text-center">
    <div>
      <p class="font-display text-6xl font-bold text-brand-600">404</p>
      <h1 class="mt-4 font-display text-2xl font-semibold">{{ t('notFound.title') }}</h1>
      <p class="mt-2 text-ink-600">{{ t('notFound.body') }}</p>
      <RouterLink
        to="/"
        class="mt-6 inline-block btn-push text-sm"
      >
        {{ t('common.back') }}
      </RouterLink>
    </div>
  </section>
</template>