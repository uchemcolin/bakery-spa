<script setup lang="ts">
// Protect this page with the `guest` middleware.
// Authenticated users will be redirected to the dashboard
// instead of being allowed to access the login page.
definePageMeta({
  middleware: 'guest',
})

// Get the login function from the shared authentication composable.
// This function handles redirecting the user to Keycloak SSO.
const { login } = useAuth()
</script>

<template>
  <div class="container">
    <!-- Center the login card horizontally on the page. -->
    <div class="row justify-content-center">
      <div class="col-md-6">

        <!-- Card containing the login form and information. -->
        <div class="card shadow-sm">
          <div class="card-body p-5 text-center">

            <!-- Page heading. -->
            <h1 class="h3 mb-3 fw-bold">Welcome</h1>

            <!-- Brief explanation of the available authentication method. -->
            <p class="text-muted mb-4">
              Sign in with your organization account
            </p>

            <!--
              Clicking the button calls the `login` function
              from the useAuth composable, which redirects the
              browser to the configured Keycloak login URL.
            -->
            <button
              @click="login"
              class="btn btn-primary btn-lg w-100"
            >
              🔐 Sign in with Keycloak SSO
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>