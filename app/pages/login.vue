<script setup lang="ts">
const { user, login } = useAuth()

if (user.value) {
  await navigateTo('/dashboard')
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body p-5 text-center">
            <h1 class="h3 mb-3 fw-bold">Welcome</h1>
            <p class="text-muted mb-4">Sign in with your organization account</p>
            <button @click="login" class="btn btn-primary btn-lg w-100">
              🔐 Sign in with Keycloak SSO
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>