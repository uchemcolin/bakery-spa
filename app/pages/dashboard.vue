<script setup lang="ts">
// Protect this page with the `auth` route middleware.
// Users who are not authenticated will be redirected to the login page.
definePageMeta({
  middleware: 'auth',
})

// Get the authenticated user + auth status from the shared state.
const { user, status, error, fetchUser } = useAuth()

// Ensure we have a fresh user object when landing on the dashboard.
// (Skip if we already know we're authenticated.)
if (import.meta.client && status.value !== 'authenticated') {
  await fetchUser()
}
</script>

<template>
  <div class="container py-4">
    <!-- Loading: still fetching the user profile. -->
    <div
      v-if="status === 'loading' || status === 'idle'"
      class="text-center py-5"
    >
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading your profile…</span>
      </div>
      <p class="text-muted mt-2 mb-0">Loading your profile…</p>
    </div>

    <!-- Error: could not load the profile. -->
    <div v-else-if="status === 'error'" class="text-center py-5">
      <p class="text-danger fs-5 mb-2">
        {{ error ?? 'Could not load your profile.' }}
      </p>
      <button class="btn btn-outline-primary" @click="fetchUser(true)">
        Retry
      </button>
    </div>

    <!-- Authenticated: show user info. -->
    <div v-else-if="status === 'authenticated' && user">
      <div class="alert alert-success">
        <strong>Authenticated!</strong>
      </div>

      <div class="card">
        <div class="card-body">
          <pre>{{ user }}</pre>
        </div>
      </div>
    </div>

    <!-- Fallback: no user, no error. Middleware should normally redirect. -->
    <div v-else class="text-center py-5">
      <p class="text-danger fs-5">Not authenticated.</p>
      <NuxtLink to="/login" class="btn btn-primary">
        Go to Login
      </NuxtLink>
    </div>
  </div>
</template>