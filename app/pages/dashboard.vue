<script setup lang="ts">
const { user, fetchUser } = useAuth()

await fetchUser(true)
</script>

<template>
  <div class="container">
    <div v-if="user">
      <div class="alert alert-success">
        <strong>Authenticated!</strong>
      </div>
      <div class="card">
        <div class="card-body">
          <pre>{{ user }}</pre>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-5">
      <p class="text-danger fs-5">Not authenticated.</p>
      <NuxtLink to="/login" class="btn btn-primary">Go to Login</NuxtLink>
    </div>
  </div>
</template>