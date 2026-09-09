<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useSessionStore } from '../../application/session'

// T025 — real login form (was T003 placeholder scaffold).
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const email = ref('')
const password = ref('')

async function submit() {
  try {
    await session.login({ email: email.value, password: password.value })
    router.push((route.query.redirect as string) || '/')
  } catch {
    // store.error already carries the API message; rendered below
  }
}
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-16">
    <div class="card p-6 sm:p-8">
      <p class="mono-label">{{ t('app.name') }}</p>
      <h1 class="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900">
        {{ t('auth.login') }}
      </h1>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
        <label class="block">
          <span class="font-label text-xs text-ink-600">{{ t('auth.email') }}</span>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="mt-1.5 min-h-11 w-full rounded-(--radius-input) border border-ink-900/15 bg-paper px-3.5 text-sm"
          />
        </label>
        <label class="block">
          <span class="font-label text-xs text-ink-600">{{ t('auth.password') }}</span>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="mt-1.5 min-h-11 w-full rounded-(--radius-input) border border-ink-900/15 bg-paper px-3.5 text-sm"
          />
        </label>

        <p v-if="session.error" class="rounded-(--radius-input) bg-coral/10 px-3 py-2 text-sm text-ink-900" role="alert">
          {{ session.error }}
        </p>

        <button type="submit" class="btn-push mt-1 w-full text-sm" :disabled="session.loading">
          {{ session.loading ? t('common.loading') : t('auth.login') }}
        </button>
      </form>

      <p class="mt-5 text-sm text-ink-600">
        {{ t('auth.no_account') }}
        <RouterLink to="/auth/register" class="font-semibold text-sky-cyan hover:underline">
          {{ t('auth.register') }}
        </RouterLink>
      </p>
    </div>
  </section>
</template>
