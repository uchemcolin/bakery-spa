<script setup lang="ts">
// Access the shared authentication state and the function
// used to retrieve the currently authenticated user.
const { user, fetchUser } = useAuth()

// Only fetch the user on the client side.
// This avoids making the authentication request during SSR
// for this public landing page.
if (import.meta.client) {
  // Check whether the visitor is already authenticated.
  // If authenticated, `user` will contain their account details.
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

      <!--
        Show a personalized welcome message and dashboard
        link when the visitor is already authenticated.
      -->
      <div v-if="user">
        <!-- Display the authenticated user's name. -->
        <p class="fs-5">
          Welcome back, <strong>{{ user.name }}</strong>
        </p>

        <!-- Give authenticated users direct access to the dashboard. -->
        <NuxtLink
          to="/dashboard"
          class="btn btn-primary btn-lg"
        >
          Go to Dashboard
        </NuxtLink>
      </div>

      <!--
        Show the sign-in option when there is no authenticated user.
      -->
      <div v-else>
        <!-- Send unauthenticated users to the login page. -->
        <NuxtLink
          to="/login"
          class="btn btn-primary btn-lg"
        >
          Sign In
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
