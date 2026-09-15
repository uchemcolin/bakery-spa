<script setup lang="ts">
const { user, fetchUser } = useAuth()

if (import.meta.client) {
  await fetchUser()
}
</script>

<template>
  <div class="container">
    <div class="text-center py-5">
      <h1 class="display-4 mb-3">🥐 Bakery SSO</h1>
      <p class="lead mb-4">Single Sign-On with Nuxt 3 + Laravel 12 + Keycloak</p>
      <div v-if="user">
        <p class="fs-5">Welcome back, <strong>{{ user.name }}</strong></p>
        <NuxtLink to="/dashboard" class="btn btn-primary btn-lg">Go to Dashboard</NuxtLink>
      </div>
      <div v-else>
        <NuxtLink to="/login" class="btn btn-primary btn-lg">Sign In</NuxtLink>
      </div>
    </div>
  </div>
</template>