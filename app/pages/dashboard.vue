<script setup lang="ts">
// Protect this page with the `auth` route middleware.
// Users who are not authenticated will be redirected to the login page.
definePageMeta({
  middleware: 'auth',
})

// Get the authenticated user from the shared auth state.
const { user } = useAuth()
</script>

<template>
  <div class="container">
    <!--
      Show the authenticated user's information when
      a valid user is available.
    -->
    <div v-if="user">
      <!-- Display a success message to confirm authentication. -->
      <div class="alert alert-success">
        <strong>Authenticated!</strong>
      </div>

      <!--
        Display the user's details inside a Bootstrap card.
        <pre> preserves the formatting of the user object,
        making it easier to inspect during development.
      -->
      <div class="card">
        <div class="card-body">
          <pre>{{ user }}</pre>
        </div>
      </div>
    </div>

    <!--
      Fallback content shown when there is no authenticated user.
      The auth middleware should normally redirect unauthenticated
      users before they reach this section.
    -->
    <div v-else class="text-center py-5">
      <!-- Inform the user that they are not authenticated. -->
      <p class="text-danger fs-5">Not authenticated.</p>

      <!-- Provide a link to the login page. -->
      <NuxtLink to="/login" class="btn btn-primary">
        Go to Login
      </NuxtLink>
    </div>
  </div>
</template>
