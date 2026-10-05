<script setup lang="ts">
const route = useRoute()

const { exchangeCode } = useAuth()

const code = route.query.code

if (
  typeof code !== 'string' ||
  !code
) {
  await navigateTo(
    '/login?error=missing_auth_code',
    {
      replace: true,
    }
  )
}

const success = await exchangeCode(code)

if (!success) {
  await navigateTo(
    '/login?error=auth_exchange_failed',
    {
      replace: true,
    }
  )
}

await navigateTo('/dashboard', {
  replace: true,
})
</script>

<template>
  <div class="container py-5">
    <div class="text-center">
      <div
        class="spinner-border text-primary"
        role="status"
      >
        <span class="visually-hidden">
          Completing sign in…
        </span>
      </div>

      <p class="text-muted mt-3">
        Completing your sign in…
      </p>
    </div>
  </div>
</template>
