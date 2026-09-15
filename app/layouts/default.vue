<script setup lang="ts">
const { user, logout } = useAuth()
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <NuxtLink class="navbar-brand" to="/">🥐 Bakery SSO</NuxtLink>
        <div class="navbar-nav ms-auto">
          <template v-if="user">
            <NuxtLink class="nav-link" to="/dashboard">Dashboard</NuxtLink>
            <span class="nav-link disabled">{{ user.name }}</span>
            <button class="btn btn-link nav-link" @click="logout">Logout</button>
          </template>
          <template v-else>
            <NuxtLink class="nav-link" to="/login">Login</NuxtLink>
          </template>
        </div>
      </div>
    </nav>

    <main class="py-4 flex-grow-1">
      <slot />
    </main>

    <footer class="bg-light py-3 mt-auto text-center text-muted">
      <small>SSO Demo — Nuxt 3 + Laravel 12 + Keycloak</small>
    </footer>
  </div>
</template>