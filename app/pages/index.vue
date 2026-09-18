<script setup lang="ts">
// Access the shared authentication state and the fetch function.
const { user, status, error, fetchUser } = useAuth()

// Only fetch the user on the client side. This avoids making the
// authentication request during SSR for this public landing page.
if (import.meta.client) {
  await fetchUser()
}
</script>

<template>
  <div class="container">
    <div class="text-center py-5">
      <!-- Main heading for the application. -->
      <h1 class="display-4 mb-3">🥐 Bakery SSO</h1>

      <!-- Brief description of the authentication setup. -->
      <p class="lead mb-4">
        Single Sign-On with 4 + Laravel 12 + Keycloak
      </p>

      <!-- Loading: still checking whether the visitor is signed in. -->
      <div
        v-if="status === 'loading' || status === 'idle'"
        class="py-3"
      >
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Checking sign-in status…</span>
        </div>
        <p class="text-muted mt-2 mb-0">Checking sign-in status…</p>
      </div>

      <!-- Error: something went wrong while checking auth. -->
      <div v-else-if="status === 'error'" class="py-3">
        <p class="text-danger fs-5 mb-2">
          {{ error ?? 'Could not check your sign-in status.' }}
        </p>
        <button class="btn btn-outline-primary" @click="fetchUser(true)">
          Retry
        </button>
      </div>

      <!-- Authenticated: welcome message + dashboard link. -->
      <div v-else-if="status === 'authenticated' && user">
        <p class="fs-5">
          Welcome back, <strong>{{ user.name }}</strong>
        </p>
        <NuxtLink to="/dashboard" class="btn btn-primary btn-lg">
          Go to Dashboard
        </NuxtLink>
      </div>

      <!-- Unauthenticated: show the sign-in option. -->
      <div v-else>
        <NuxtLink to="/login" class="btn btn-primary btn-lg">
          Sign In
        </NuxtLink>
      </div>
    </div>
  </div>
</template>